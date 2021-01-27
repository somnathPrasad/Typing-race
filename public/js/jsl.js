var car = document.getElementById("car1");
var parah = document.getElementById("parah");
var spanLetters = [];
var count = 0;
var typedLetter = "";


document.addEventListener("keydown",(event)=>{
    if(event.key === typedLetter){
        spanLetters[count].classList.remove("typing")
        if(typedLetter === spanLetters[count].innerHTML){
            spanLetters[count].classList.add("done")//changes typedLetter to next letter on correct typing
    }
        moveCar();
        count++;
        typedLetter = spanLetters[count].innerHTML;
    }else if(event.shiftKey === false && event.ctrlKey === false && event.altKey === false) {
        spanLetters[count].classList.add("wrong")
}
})

function moveCar(){
    car.style.left = parseInt(car.style.left)+9+'px';
}

function createRandomParah(){
    var letters = randomParah.split("",150);
    letters.map((letter,index)=>{
        var parahLetter = document.createElement("SPAN");
        parahLetter.innerHTML = letter;
        parahLetter.classList.add("letter")
        parah.appendChild(parahLetter)
    })
}

window.addEventListener("load",()=>{

    createRandomParah();

    spanLetters = document.getElementsByClassName("letter");

    //sets first letter of parah to active on load of website
    typedLetter = spanLetters[count].innerHTML;

//interval is for showing cursor in every second, this is done by adding a class "typing" that sets the background color of the letter to be typed in white
setInterval(() => {
    spanLetters[count].classList.add("typing");
    setTimeout(() => {
        spanLetters[count].classList.remove("typing")
    }, 500);
}, 1000);
})
