var socket = io();
var raceTrack = document.getElementById("raceTrack");
var racerCount = 0;
var allCars =[];
var socketCallsCount = 0;
var spanLetters = [];
var cursorCount = 0;
var typedLetter = "";
var car = "";
var otherCar="";
var carNo = 0;
isCarNoSet = false;

function createCar(){
       var newCar = document.createElement("img");
        newCar.classList.add("car");
        newCar.src = "images/car1.png";
        newCar.style="left:100px";
        newCar.id = "car"+racerCount;
        raceTrack.appendChild(newCar);
        allCars.push(newCar);
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
    if(!isCarNoSet){
        carNo = member.memberCount;
        isCarNoSet = true;
    }
    sameRoom = member.rooms;
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
    }
    racerCount=0;
})

socket.on("parah",(parah)=>{
    console.log(carNo)
    createRandomParah(parah);
    setTimeout(() => {
        spanLetters = document.getElementsByClassName("letter");
        typedLetter = spanLetters[cursorCount].innerHTML;
        startgame();
    }, 5000);
})

function createRandomParah(randomParah){
    var letters = randomParah.split("",150);
    letters.map((letter,index)=>{
        var parahLetter = document.createElement("SPAN");
        parahLetter.innerHTML = letter;
        parahLetter.classList.add("letter")
        parah.appendChild(parahLetter)
    })
}
function moveCar(){
    if(carNo == 1){
        car = document.getElementById("car1");
    }else if(carNo === 2){
        car = document.getElementById("car2");
    }else{
        car = document.getElementById("car3");
    }
    car.style.left = parseInt(car.style.left)+9+'px';
    socket.emit("car"+carNo+" position",parseInt(car.style.left));
}
function startgame(){
    setInterval(() => {
        spanLetters[cursorCount].classList.add("typing");
        setTimeout(() => {
            spanLetters[cursorCount].classList.remove("typing")
        }, 500);
    }, 1000);

    document.addEventListener("keydown",(event)=>{
        if(event.key === typedLetter){
            spanLetters[cursorCount].classList.remove("typing")
            if(typedLetter === spanLetters[cursorCount].innerHTML){
                spanLetters[cursorCount].classList.add("done")//changes typedLetter to next letter on correct typing
        }
            moveCar();
            cursorCount++;
            typedLetter = spanLetters[cursorCount].innerHTML;
        }else if(event.shiftKey === false && event.ctrlKey === false && event.altKey === false) {
            spanLetters[cursorCount].classList.add("wrong")
    }
    })
}
socket.on("allCarsPos",pos=>{
    moveOtherCars(pos);
})

function moveOtherCars(position){

    if(carNo===1){
        position.forEach((pos,index) => {
            otherCar = document.getElementById("car"+(parseInt(index)+2));
            otherCar.style.left = pos+'px';
        });
    }else if(carNo===2){
        position.forEach((pos,index) => {
            if(index === 0){
                otherCar = document.getElementById("car1");
                otherCar.style.left = pos+'px';
            }else{
                otherCar = document.getElementById("car3");
                otherCar.style.left = pos+'px';
            }
            
        });
    }else{
        position.forEach((pos,index) => {
            otherCar = document.getElementById("car"+(parseInt(index)+1));
            otherCar.style.left = pos+'px';
        });
    }
}