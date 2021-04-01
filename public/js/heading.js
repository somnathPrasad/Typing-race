var heading = document.getElementById("heading");
    var title = "Typing Race"
    var first = 0;
    var second= 1;

    setInterval(() => {
        createHeadingLetters()
        if(first === 10){
            setTimeout(() => {
            first = 0;
            second= 1;
            heading.innerHTML = "";
            }, 3000);
        }
    }, 200);

    function createHeadingLetters(){
        var newLetter = document.createElement("span");
        newLetter.innerHTML = title.substring(first,second);
        newLetter.classList.add("bold")
        heading.appendChild(newLetter);
        first++;
        second++;
    }
