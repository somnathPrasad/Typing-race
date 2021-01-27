var socket = io();
var raceTrack = document.getElementById("raceTrack");
var racerCount = 0;
var allCars =[];
var socketCallsCount = 0;

function createCar(){
       var newCar = document.createElement("img");
        newCar.classList.add("car");
        newCar.src = "images/car1.png";
        newCar.style="left:0";
        newCar.id = "car"+racerCount;
        raceTrack.appendChild(newCar);
        allCars.push(newCar);
        console.log(allCars)
}

socket.on("new member",(member)=>{
    socketCallsCount++;
    racerCount=0;
    var members ="";
    members = document.getElementsByClassName("car");
    for(var x=0;x<members.length;x++){
        members[x].remove();
    }
    console.log(members[0])
    if(socketCallsCount === 3){
        members[0].remove();
    }else if(socketCallsCount === 2 && member.memberCount === 3){
        members[0].remove();
    }
    for(var x=0;x<member.memberCount;x++){
        racerCount++;
        createCar();
    }
    racerCount=0;
    console.log(allCars)
})

