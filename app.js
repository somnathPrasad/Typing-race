const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const http = require("http").createServer(app);
const io = require("socket.io")(http)
const mongoose = require("mongoose");


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
    
                    var count = 0;//to count no of members present in that room
    
                    Room.findOne({room_id:room_id},{'members': {$elemMatch: {member: name}}}, function(err, foundMember) {
                        if (err) {
                            console.log(err);
                        }else{
                            if(foundMember.members[0]===undefined){
                                //player not found
                                //push player name to db
                                //then redirect it to index page
    
                                //counting the no of members already present and push new member
                                Room.findOne({room_id:room_id},function(err,foundRoom){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        console.log("1");
                                        console.log(foundRoom)
                                        foundRoom.members.forEach(member=>{
                                            count = member.memberCount;
                                        })
                                    }
                                    foundRoom.members.push({member:name,memberCount:count+1})
                                    foundRoom.save();
                                    res.redirect("/"+room_id+"-"+name);
                                });
                                
                            }else{
                                //player found
                                //then redirect it to index page
    
                                res.redirect("/"+room_id+"-"+name);
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
                        res.redirect("/"+room_id+"-"+name);
                    }else{
                        //room already present, show message
                        res.render("home",{msg:"room already present"});
                    }
                }
            });
    
        }   
    }
});


app.get("/:room_id-:name",(req,res)=>{
    res.render("index");
});




http.listen(3000,()=>{
    console.log("server started on port 3000")
});