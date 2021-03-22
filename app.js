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
const gen_Room_id = require(__dirname+"/RandomRoom_id.ejs");


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


var generatedRoom_id;


app.get("/",(req,res)=>{
    res.render("home",{msg:""})
});

app.post("/",(req,res)=>{
    if(req.body.joinRoom === undefined){
        // wants to create a room
        res.redirect("/createRoom");
    }else{
        // wants to join a room
        res.redirect("/joinRoom");
    }
});

app.get("/createRoom",(req,res)=>{
    generatedRoom_id = gen_Room_id.getRoom_id();
    res.render("createRoom",{room_id:"ROOM ID : "+generatedRoom_id,msg:""});
});

app.post("/createRoom",(req,res)=>{

    if(req.body.username===""){
        //if name box is empty
        res.render("createRoom",{room_id:"ROOM ID : "+generatedRoom_id,msg:"Type Your Name"});
    }else{
        //if name box is not empty
        Room.findOne({room_id:generatedRoom_id},function(err,foundRoom){
            if(foundRoom !== null){
                //room if already present with that id
                res.render("createRoom",{room_id:"ROOM ID : "+generatedRoom_id,msg:"room already present please refresh page"})
            }else{
                //no room is already present in db creating one and redirecting to main game page
                const room = new Room({
                    room_id:generatedRoom_id,
                    members:[{member:req.body.username,memberCount:1}]
                        });
                    room.save();

                    res.redirect("/"+generatedRoom_id+"-"+req.body.username+"/carno/"+1);
            }
        });
    }

});


app.get("/joinRoom",(req,res)=>{
    res.render("joinRoom",{msg:""});
});

app.post("/joinRoom",(req,res)=>{
    if(req.body.username===""||req.body.id === ""){
        res.render("joinRoom",{msg:"Please fill everything!"});
    }else{
        // check if room is present or not
        Room.findOne({room_id:req.body.id},function(err,foundRoom){
            if(foundRoom !== null){
                // room is present
                // join player into index

                var memberCount = 0 //to count the number of members already present in room
    
                foundRoom.members.forEach(member => {
                    memberCount++;
                });

                if(memberCount === 3){
                    // check if the room is full or not
                    res.render("joinRoom",{msg:"Room full"});
                }else{
                    // room not full 
                    // push new member into db and redirect to index
                    foundRoom.members.push({member:req.body.username,memberCount:memberCount+1})
                    foundRoom.save();
                    res.redirect("/"+req.body.id+"-"+req.body.username+"/carno/"+memberCount);
                }
                
            }else{
                //room not present
                res.render("joinRoom",{msg:"Room not present"});
            }
        });
    }
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

http.listen(3000,()=>{
    console.log("server started on port 3000")
});