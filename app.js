require('dotenv').config()
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const http = require("http").createServer(app);
const io = require("socket.io")(http)
const mongoose = require("mongoose");
const { join } = require("path");
const { count } = require("console");
const { constants } = require("buffer");
const parah = require(__dirname+"/RandomParah.ejs");
const gen_Room_id = require(__dirname+"/randomRoom_id.ejs");


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
        memberCount:Number,
        isLeader:Boolean
    }]
});

const memberSchema = new mongoose.Schema({
    member:String,
    memberCount:Number
})

const Room = new mongoose.model("Room",roomSchema);
const Member = new mongoose.model("Member",memberSchema)


var generatedRoom_id;
var message="";
var roomAndPlayers = [];
var passCarNo=0;
var passRoomId = "";
var passName="";


app.get("/",(req,res)=>{
    res.render("home",{msg:message})
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
    res.render("createRoom",{room_id:"ROOM ID : "+generatedRoom_id,msg:message});
    message = "";
});

app.post("/createRoom",(req,res)=>{

    if(req.body.username===""){
        //if name box is empty
        message = "Type Your Name"
        res.redirect("/createRoom");
    }else{
        //if name box is not empty
        Room.findOne({room_id:generatedRoom_id},function(err,foundRoom){
            if(foundRoom !== null){
                //room if already present with that id
                message="room already present please refresh page"
                // console.log(foundRoom)
                res.redirect("/createRoom")
            }else{
                //no room is already present in db creating one and redirecting to main game page
                const room = new Room({
                    room_id:generatedRoom_id,
                    members:[{member:req.body.username,memberCount:1,isLeader:true}]
                        });
                    room.save();

                    res.redirect("/"+generatedRoom_id+"-"+req.body.username+"/carno/"+"1"+"/isLeader/"+"true/");
            }
        });
    }

});


app.get("/joinRoom",(req,res)=>{
    res.render("joinRoom",{msg:message});
    message="";
});

app.post("/joinRoom",(req,res)=>{
    if(req.body.username===""||req.body.id === ""){
        message="Please fill everything!"
        res.redirect("/joinRoom");
    }else{
        // check if room is present or not
        Room.findOne({room_id:req.body.id},function(err,foundRoom){
            if(foundRoom !== null){
                // console.log(foundRoom)
                // room is present
                // join player into index
                var memberCount = 0 //to count the number of members already present in room
    
                foundRoom.members.forEach(member => {
                    memberCount++;
                });

                if(memberCount === 3){
                    // check if the room is full or not
                    message="Room full"
                    res.redirect("joinRoom");
                }else{
                    // room not full 
                    // push new member into db and redirect to index
                    foundRoom.members.push({member:req.body.username,memberCount:memberCount+1,isLeader:false})
                    foundRoom.save();
                    memberCount++;
                    res.redirect("/"+req.body.id+"-"+req.body.username+"/carno/"+memberCount+"/isLeader/"+"false/");
                }
                
            }else{
                //room not present
                message="Room not present"
                res.redirect("/joinRoom");
            }
        });
    }
});

app.get("/:room_id-:name/carno/:carno/isLeader/:isLeader/",(req,res)=>{
    //1. get room_id and name and pass it to js to make his car
    const carNo = parseInt(req.params.carno);
    passCarNo = carNo;
    const room_id = req.params.room_id;
    passRoomId = room_id;
    const name = req.params.name;
    passName = name;
    const isLeader = req.params.isLeader;

    //storing every active room and its players details in an array "roomAndPlayers"

    //structure of roomAndPlayers = [  {room_id , players[{array of objects}]  } ]

    if(req.params.isLeader==="true"){
        //this will create a new object inside main roomAndPlayers array with a new room_id
        roomAndPlayers.push({room_id:req.params.room_id,players:[{name:req.params.name,carNo:carNo,isLeader:isLeader,room_id:req.params.room_id}]});
        res.render("index",{startButton:"display:block;"});
    }else{
        roomAndPlayers.forEach((room,pos)=>{
            if(room.room_id === passRoomId){
                //this will push the details of new player inside already created players array
                roomAndPlayers[pos].players.push({name:req.params.name,carNo:carNo,isLeader:isLeader,room_id:req.params.room_id})
                res.render("index",{startButton:"display:none;"});
            }
            
        })
        
    }
    
}); 

//////////////////////////////////////When a player joins a game///////////////////////////////
io.on("connection",(socket)=>{

    
    socket.join(passRoomId);
    
            allPlayers = [];
            roomAndPlayers.forEach((room,pos)=>{
                        if(room.room_id === passRoomId){
                            allPlayers = roomAndPlayers[pos].players
                            io.to(passRoomId).emit("new member",allPlayers);
                        }
                    });

/////////////////////// When start button is clicked /////////////////////////////////////
socket.on("start game",msg=>{
    io.to(passRoomId).emit("parah",parah.getParah());
});

socket.on("car1_pos",pos=>{
    io.to(passRoomId).emit("car1_moved",pos);
});
socket.on("car2_pos",pos=>{
    io.to(passRoomId).emit("car2_moved",pos);
});
socket.on("car3_pos",pos=>{
    io.to(passRoomId).emit("car3_moved",pos);
});

var positions = 1;

socket.on("finished",car=>{
    if(positions === 1){
        io.to(passRoomId).emit("first",car)
        positions++;
    }else if(positions === 2){
        io.to(passRoomId).emit("second",car)
    }
})

/////////////////////////////////When a player leaves the game//////////////////////////

        //called when a player leaves the page
    socket.on("leaving",(playerDetails)=>{
        io.to(passRoomId).emit("player left",playerDetails);
        console.log ("left: "+playerDetails.room_id+" "+playerDetails.name);

        roomAndPlayers.forEach((room,pos1)=>{
            if(room.room_id === playerDetails.room_id){

                if(roomAndPlayers[pos1].players.length === 1){
                    //if their is only one player left in the room 
                    //this will delete the whole room
                    roomAndPlayers.splice(pos1,1); //delete from server
                    Room.findOneAndDelete({room_id:playerDetails.room_id},function(err,deletedRoom){
                        console.log(deletedRoom);
                    }) //delete from db.
                }else{
                    //this will delete the player who has left

                    //delete player from db
                    Room.findOne({room_id:playerDetails.room_id},function(err,foundRoom){
                        if(foundRoom !== null){
                            foundRoom.members.forEach((member,posDb)=>{
                                if(member.member === playerDetails.name){
                                    foundRoom.members.splice(posDb,1);
                                    foundRoom.save();
                                }
                            });    
                        }
                    });

                    //delete player from server
                    roomAndPlayers[pos1].players.forEach((player,pos2)=>{
                        if(player.name === playerDetails.name){
                            roomAndPlayers[pos1].players.splice(pos2,1);
                        }
                        
                    })
                }   
            }
        });
    });
///////////////////////////////////////////////////////////////////////////////////////////////
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
// app.listen(port);

http.listen(port,()=>{
    console.log("server started on successfully")
});