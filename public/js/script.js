var socket = io();
var startBtn = document.getElementById("startBtn");
var parah = document.getElementById("parah");
var spanLetters = [];
var cursorCount = 0;
var typedLetter = "";
var carNo = 0;
var isCarNoSet = false;
var playerName = "";
var room_id="";
var socketCalls = 0;
var car = ""


   


//whenever a new member enter the room this is trigirred
socket.on("new member",(members)=>{
    //raceTrack is the div containing car image and name element.
    //evey time a new member enter the room , raceTrack div is emptied and filled with cars and names again.
        var raceTrack = document.getElementById("raceTrack");

        room_id = members[0].room_id;
        
        //this will set the car no of each player once and for all
        if(!isCarNoSet){
            carNo = members[members.length-1].carNo;
            playerName = members[members.length-1].name;
            isCarNoSet = true;
        }

        raceTrack.innerHTML = "";
        
        for(var x=0;x<members.length;x++){
            createCar(members[x].carNo)
            createName(members[x].name,members[x].carNo);
        }
});

//delete every player who leaves the game
socket.on("player left",leftPlayer=>{
    var leftCarNo = document.getElementById("car"+leftPlayer.carNo);
    leftCarNo.remove();
    var leftPlayerName = document.getElementById("name"+leftPlayer.carNo);
    leftPlayerName.remove();
    console.log(leftCarNo);
});

startBtn.style.cursor = "pointer";


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

//function for moving own car
function moveCar(){
        car = document.getElementById("car"+carNo);
        car.style.left = parseInt(car.style.left)+9+'px';
        socket.emit("car"+carNo+"_pos",car.style.left);
        if(car.style.left === 1153){
            socket.emit("car"+carNo+"_finished","finished")
        }
}

//sockets for moving other cars
socket.on("car1_moved",pos=>{
    if(carNo !== 1){
        var car1 = document.getElementById("car1");
        car1.style.left = pos;
    }
});
socket.on("car2_moved",pos=>{
    if(carNo !== 2){
        var car2 = document.getElementById("car2");
        car2.style.left = pos;
    }
});
socket.on("car3_moved",pos=>{
    if(carNo !== 3){
        var car3 = document.getElementById("car3");
        car3.style.left = pos;
    }
});



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
    
});
window.addEventListener("beforeunload",function(e){
  socket.emit("leaving",{name:playerName,room_id:room_id,carNo:carNo}) 
});
