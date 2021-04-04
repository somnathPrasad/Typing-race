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
var car = "";
var positions = 0;
var isGameRunning = true;
var previousCar = "";
var isCarReached = false;


   
//whenever a new member enter the room this is trigirred
socket.on("new member",(members)=>{
    //raceTrack is the div containing car image and name element.
    //evey time a new member enter the room , raceTrack div is emptied and filled with cars and names again.
        var raceTrack = document.getElementById("raceTrack");

        room_id = members[0].room_id;//assigning roomId to variable in the client
        
        //this will set the car no of each player once and for all
        if(!isCarNoSet){
            carNo = members[members.length-1].carNo;
            playerName = members[members.length-1].name;
            isCarNoSet = true;
        }

        raceTrack.innerHTML = "";//deleting every car and name present inside raceTrack
        
        //refilling raceTrack with all the cars and names.
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

    //interval and timeout to show the cursor effect
    setInterval(() => {
        spanLetters[cursorCount].classList.add("typing");
        setTimeout(() => {
            spanLetters[cursorCount].classList.remove("typing")
        }, 500);
    }, 1000);

    

    //every time a key is pressed it checks if the key pressed is in the array spanLetters in the position where cursor is 
    //if the key pressed is correct moveCar() function is trigrred and car is moved and cursor is passed to next letter.
    //else the letter is colored in red.
    document.addEventListener("keydown",(event)=>{
        if(event.key === typedLetter){  
            spanLetters[cursorCount].classList.remove("typing")
            if(typedLetter === spanLetters[cursorCount].innerHTML){
                spanLetters[cursorCount].classList.add("done")//changes typedLetter to next letter on correct typing
        }
        if(isGameRunning){
            if(!isCarReached){
                moveCar();   
            }
        }
            cursorCount++;
            typedLetter = spanLetters[cursorCount].innerHTML;
        }else if(event.shiftKey === false && event.ctrlKey === false && event.altKey === false) {
            spanLetters[cursorCount].classList.add("wrong")
    }
    })
}


//function for moving own car
function moveCar(){
        car = document.getElementById("car"+carNo);
        if(parseInt(car.style.left)<1009){
            car.style.left = parseInt(car.style.left)+9+'px';
            socket.emit("car"+carNo+"_pos",car.style.left);
    
            checkPositions("car"+carNo,car.style.left);
        }
}

function checkPositions(car,pos){

    if(parseInt(pos)>=1000){
        //previous car variable is added to stop the position increment every time the same car trigerrs it
        if(previousCar !== car){
            positions++;
            console.log(car+" is "+positions)

            if(positions === 1){
                var winner = document.getElementById("winner");
                var name = document.getElementById("name"+car.substring(3,4)).innerHTML;
                winner.innerHTML = name;
            }else if(positions === 2){
                var runnerUp = document.getElementById("runnerUp");
                var name = document.getElementById("name"+car.substring(3,4)).innerHTML;
                runnerUp.innerHTML = name;
            }else if(positions > 2){
                var last = document.getElementById("last");
                var name = document.getElementById("name"+car.substring(3,4)).innerHTML;
                last.innerHTML = name;
            }

        }
        previousCar = car;
    }
    if(positions === 2){
        isGameRunning = false;
        // createRanking(3,car.substing(3,4));
    }

    


}

//sockets for moving other cars
socket.on("car1_moved",pos=>{
    if(carNo !== 1){
        var car1 = document.getElementById("car1");
        if(isGameRunning){
            car1.style.left = pos;
            checkPositions("car1",pos)
        }
    }
});
socket.on("car2_moved",pos=>{
    if(carNo !== 2){
        var car2 = document.getElementById("car2");
        if(isGameRunning){
            car2.style.left = pos;
            checkPositions("car2",pos)
        }
    }
});
socket.on("car3_moved",pos=>{
    if(carNo !== 3){
        var car3 = document.getElementById("car3");
        if(isGameRunning){
            car3.style.left = pos;
            checkPositions("car3",pos)
        }
    }
});


function createCar(carNo){
    var newCar = document.createElement("img");
    newCar.classList.add("car");
    newCar.classList.add("shadow");
    newCar.src = "/images/plane"+carNo+".png";
    newCar.style = "left:100px"
    newCar.id = "car"+carNo;
    raceTrack.appendChild(newCar);
}
function createName(name,carNo){
    var newName = document.createElement("p");
    newName.classList.add("name");
    newName.classList.add("arcade-font");
    newName.innerHTML = name;
    newName.style="left:0px";
    newName.id = "name"+carNo;
    raceTrack.appendChild(newName);
}
function createRanking(ranking,car){
    console.log(ranking)
    console.log(car)
    var newRanking = document.createElement("p");

    newRanking.classList.add("ranking");

    if(ranking === 1){
        newRanking.innerHTML = "Winner";
    }else if(ranking === 2){
        newRanking.innerHTML = "Runner Up"
    }else{
        newRanking.innerHTML = "2nd Runner Up"
    }
    newRanking.style="left:800px";
    newRanking.id = "rank"+car;
    raceTrack.appendChild(newRanking);
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

