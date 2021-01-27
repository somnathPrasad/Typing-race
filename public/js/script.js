var socket = io();
var raceTrack = document.getElementById("raceTrack");
var racerCount = 0;
var allCars =[];
var socketCallsCount = 0;

function createCar(){
       var newCar = document.createElement("img");
        newCar.classList.add("car");
        newCar.src = "images/car1.png";
        newCar.style="left:100px";
        newCar.id = "car"+racerCount;
        raceTrack.appendChild(newCar);
        allCars.push(newCar);
        console.log(allCars)
}

function createName(name){
        var newName = document.createElement("p");
        newName.classList.add("name");
        newName.innerHTML = name;
        newName.style="left:0px";
        newName.id = "name"+racerCount;
        raceTrack.appendChild(newName);
}

socket.on("new member",(member)=>{
    socketCallsCount++;
    racerCount=0;
    var members ="";
    members = document.getElementsByClassName("car");
    names = document.getElementsByClassName("name");
    for(var x=0;x<members.length;x++){
        members[x].remove();
        names[x].remove();
    }
    if(socketCallsCount === 3){
        members[0].remove();
        names[0].remove();
    }else if(socketCallsCount === 2 && member.memberCount === 3){
        members[0].remove();
        names[0].remove();
    }
    for(var x=0;x<member.memberCount;x++){
        racerCount++;
        createCar();
        createName(member.names[x])
        // console.log(member.names)
    }
    racerCount=0;
    console.log(allCars)
})

