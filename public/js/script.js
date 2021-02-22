var socket = io();
var raceTrack = document.getElementById("raceTrack");
var startBtn = document.getElementById("startBtn");
var parah = document.getElementById("parah");
var spanLetters = [];
var cursorCount = 0;
var typedLetter = "";
var carNo = 0;
var isCarNoSet = false;

socket.on("first member",(member)=>{
    carNo = member.carNo;
    isCarNoSet = true;
    createCar(member.carNo)
    createName(member.name,member.carNo);
});
socket.on("new member",(members)=>{
    if(!isCarNoSet){
        carNo = members[members.length-1].carNo;
        isCarNoSet = true;
    }
    var allCars = document.getElementsByClassName("car");
    console.log(allCars);
    var allnames = document.getElementsByClassName("name");
    for(var x=0;x<allCars.length;x++){
        allCars[x].remove();
        allnames[x].remove();
    }
    for(var x=0;x<members.length;x++){
        createCar(members[x].carNo)
        createName(members[x].name,members[x].carNo);
    }
    console.log(allCars)
});

socket.on("parah",(parah)=>{
    createRandomParah(parah);
    setTimeout(() => {
        spanLetters = document.getElementsByClassName("letter");
        typedLetter = spanLetters[cursorCount].innerHTML;
        startgame();
    }, 5000);
})

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

function createCar(carNo){
    var newCar = document.createElement("img");
    newCar.classList.add("car");
    newCar.src = "/images/car1.png";
    newCar.style = "left:100px"
    newCar.id = "car"+carNo;
    raceTrack.appendChild(newCar);
}
function createName(name,carNo){
    var newName = document.createElement("p");
    newName.classList.add("name");
    newName.innerHTML = name;
    newName.style="left:0px";
    newName.id = "name"+carNo;
    raceTrack.appendChild(newName);
}
function createRandomParah(randomParah){
    var letters = randomParah.split("",150);
    letters.map((letter,index)=>{
        var parahLetter = document.createElement("SPAN");
        parahLetter.innerHTML = letter;
        parahLetter.classList.add("letter")
        parah.appendChild(parahLetter)
    })
}


startBtn.addEventListener("click",()=>{
    var allCars = document.getElementsByClassName("car");
    if(allCars.length>1){
        socket.emit("start game","new parah")
    }
})
