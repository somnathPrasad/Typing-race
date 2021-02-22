const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const http = require("http").createServer(app);
const io = require("socket.io")(http)
const mongoose = require("mongoose");
const { join } = require("path");
const { count } = require("console");
const parah = require(__dirname+"/RandomParah.ejs");


app.use(express.static("public"))
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://admin-somnath:hn8qM0QtxRoeZlkN@cluster0.vc3ep.mongodb.net/typingPracticeDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex:true
});


//Mongoose Schemas
const roomSchema = new mongoose.Schema({
    room_id:String,
    members:[{
        member:String,
        memberCount:Number
    }]
});

const memberSchema = new mongoose.Schema({
    member:String,
    memberCount:Number
})

const Room = new mongoose.model("Room",roomSchema);
const Member = new mongoose.model("Member",memberSchema)

//these are global variables to pass to client through socket
var passName = "";
var passRoomId = "";
var passCarNo = "";

app.get("/",(req,res)=>{
    res.render("home",{msg:""})
});

app.post("/",(req,res)=>{
    //check that no input fields are blank

    const room_id = req.body.id;
    const name = req.body.username;
    

    if (room_id===""||name==="") {
        res.render("home",{msg:"Please fill everything"});  
    } else {
        if(req.body.createRoom === undefined){
            //player wants to join a room
            
            var count = 0;//to count no of members present in that room
            Room.findOne({room_id:room_id},function(err,foundRoom){
            if(err){
                console.log(err)
            }else{
                if(foundRoom === null){
                    //room not found, show msg on screen
                    res.render("home",{msg:"No such room is active"});
                }else{
                    // 1. room found
                    // 2. check the name typed is registered on the collection of that room
                   
                    Room.findOne({room_id:room_id},{'members': {$elemMatch: {member: name}}}, function(err, foundMember) {
                        if (err) {
                            console.log(err);
                        }else{
                            if(foundMember.members[0]===undefined){
                                //player not found
                                //push player name to db                   
                                pushNewMember(room_id,name,count,res);
                            }else{
                                //player found
                                pushExsistingMember(room_id,name,res);
                            }
                        }
                      });
                }
            }
        });
        }else{
            //player wants to create a room
            //first check room with that name is already present or not
                //if present show message
                //else create a new room
            //then redirect it to index page
            Room.findOne({room_id:room_id},function(err,foundRoom){
                if(err){
                    console.log(err);
                }else{
                    if(foundRoom === null){
                        //no such room present, make one and redirect to next page
                        const room = new Room({
                        room_id:room_id,
                        members:[{member:name,memberCount:1}]
                            });
                        room.save();
                        res.redirect("/"+room_id+"-"+name+"/carno/"+0);
                    }else{
                        //room already present, show message
                        res.render("home",{msg:"room already present"});
                    }
                }
            });
    
        }   
    }
});

app.post("/leave",(req,res)=>{
    removeMember(passName,passRoomId,res);
});


app.get("/:room_id-:name/carno/:carno",(req,res)=>{
    //1. get room_id and name and pass it to js to make his car
    const carNo = parseInt(req.params.carno)+1;
    passCarNo = carNo;
    const room_id = req.params.room_id;
    passRoomId = room_id;
    const name = req.params.name;
    passName = name;
    res.render("index");
});


io.on("connection", (socket) => {

    //finding the member is first or new and creating their cars
    socket.join(passRoomId);
    var roomMembers = [];
    var noOfMembers = 0;
    Room.findOne({room_id:passRoomId},function(err,foundRoom){
        console.log(foundRoom);
        foundRoom.members.forEach(member=>{
            roomMembers.push({name:member.member,carNo:member.memberCount})
            noOfMembers++;
        })
        if(noOfMembers >1){
            io.to(passRoomId).emit("new member",roomMembers);
        }else{
            io.to(passRoomId).emit("first member",{name:passName,room_id:passRoomId,carNo:passCarNo});
        }
    });
    ///////
    socket.on("start game",(message)=>{
        io.to(passRoomId).emit("parah",parah.getParah());
    })
});

io.on("disconnection", (socket) => {
    socket.leave(passRoomId);
    var passRoomId = "";
  });


function pushNewMember(room_id,name,count,res){
    //counting the no of members already present and push new member
    //then redirect it to index page
    Room.findOne({room_id:room_id},function(err,foundRoom){
        if(err){
            console.log(err);
        }else{
            foundRoom.members.forEach(member=>{
                count = member.memberCount;
            })
        }
        //check if room is full or not
        if(count === 3){
            res.render("home",{msg:"Room full"});
        }else{
            foundRoom.members.push({member:name,memberCount:count+1})
            foundRoom.save();
            res.redirect("/"+room_id+"-"+name+"/carno/"+count);
        }
        
    });
}

function pushExsistingMember(room_id,name,res){
    //then redirect it to index page
    var carNo = "";
    Room.findOne({room_id:room_id},{'members': {$elemMatch: {member: name}}},function(err,foundMember){
        carNo = foundMember.members[0].memberCount;
       carNo--;
       res.redirect("/"+room_id+"-"+name+"/carno/"+carNo);
     })
}

function removeMember(name,room_id,res){
//remove player
//once all player have left room the room is removed
    Room.updateOne({room_id:room_id}, { "$pull": { "members": { "member": name } }}, { safe: true, multi:true }, function(err, obj) {
        console.log("Player removed");
        res.redirect("/")
        Room.findOne({room_id:room_id},function(err,foundRoom){
            if(foundRoom.members.length === 0){
                Room.findOneAndRemove({room_id:room_id},{'members':{$pull:{member:name}}},function(err,foundMember){
                    passRoomId ="";
        })
            }
        });
    });
}


http.listen(3000,()=>{
    console.log("server started on port 3000")
});