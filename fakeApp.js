const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { platform } = require("os");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http)
const parah = require(__dirname+"/RandomParah.ejs");

//variables
const roomAndMembers= []; //stores key value paires of room_id and socket_id
var room_ids=[];
var joinOrCreate = "";
var sockets = [];
var room_id = "";
var nickname = "";
var isRoomFull = false;
var nameAndRoom = [];
var palyerCount = 1;


//MiddleWares
app.use(express.static("public"))
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    res.render("home")
    // console.log(parah.getParah());
});

app.post("/",(req,res)=>{
    var count = 0;

    if(req.body.createRoom==="Create Room" && room_ids.length===0){
        joinOrCreate = req.body.createRoom;
        room_ids.push(req.body.id);
        res.redirect("/"+req.body.id+"-"+req.body.username);
    }else if(req.body.createRoom==="Create Room" && room_ids.length!==0){

        for(var x=0;x<room_ids.length;x++){
            if(room_ids[x] === req.body.id){
                count++;
                //if room id typed matches with room id stored count         increases so that i can see if there is a room with that id
            }
        }
        if(count>=1){
            //if count is greater than 0 
            //that means room with id that is typed is already present
            console.log("room already present")
            res.redirect("/");
        }else{
            room_ids.push(req.body.id);
            res.redirect("/"+req.body.id+"-"+req.body.username);
        }
    }else if(req.body.joinRoom==="Join Room"){
        for(var x=0;x<room_ids.length;x++){
            if(room_ids[x] === req.body.id){
                count++;
                //if room id typed matches with room id stored count         increases so that i can see if there is a room with that id
            }
        }
        if(count>=1){
            //if count is greater than 0 
            //that means room with id that is typed is already present
            res.redirect("/"+req.body.id+"-"+req.body.username);
        }else{
            console.log("room not present")
            res.redirect("/");
        }
    }
    
});

app.get("/:room_id-:name",(req,res)=>{
    var count = 0;
    var roomCount = 0;
    room_id = req.params.room_id;
    nickname = req.params.name;
    if(isRoomFull){
        console.log("room full")
    }else{
        res.render("index");
    }
});

io.on("connection",socket=>{
    var names = [];
    var memberCount = 0;
    socket.join(room_id);
    roomAndMembers.push({room_id:room_id,id:socket.id,name:nickname,palyerCount:palyerCount});
    palyerCount++;
    roomAndMembers.forEach(roomAndMember=>{
        if(roomAndMember.room_id === room_id){
            memberCount++;
            if(memberCount === 3){
                io.to(room_id).emit("parah",parah.getParah());
            }
            names.push(roomAndMember.name)
        }
    })
    if(memberCount === 3){
        isRoomFull = true;
    }
    if(memberCount>3){
        console.log("room full")
    }else{
        io.to(room_id).emit("new member",{
            names:names,
            memberCount:memberCount,
        })
    }
    console.log(roomAndMembers);
    console.log(memberCount);
    memberCount=0;
})
var car1Pos=100;
var car2Pos=100;
var car3Pos=100;
io.on("connection",(socket)=>{
    socket.on("car1 position",(position)=>{
         car1Pos=position;
        console.log("Position of car1: "+position);
        io.to(room_id).emit("allCarsPos",[car2Pos,car3Pos]);
    });
    socket.on("car2 position",(position)=>{
         car2Pos=position;
        console.log("Position of car2: "+position);
        io.to(room_id).emit("allCarsPos",[car1Pos,car3Pos]);
    });
    socket.on("car3 position",(position)=>{
         car3Pos=position;
        console.log("Position of car3: "+position);
        io.to(room_id).emit("allCarsPos",[car1Pos,car2Pos]);
    });
})


http.listen(3000,()=>{
    console.log("server started on port 3000")
})