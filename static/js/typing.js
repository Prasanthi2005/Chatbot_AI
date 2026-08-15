// ==========================================
// AI CHATBOT PRO
// Typing Animation JS
// ==========================================


const typingText =
    document.getElementById("typingText");


const indicator =
    document.getElementById("typingIndicator");


const startBtn =
    document.getElementById("startBtn");


const stopBtn =
    document.getElementById("stopBtn");




let typingTimer;

let index = 0;



let message =
    "Artificial Intelligence is a technology that enables machines to learn, understand data, and make intelligent decisions like humans.";







// Start Typing

startBtn.addEventListener("click", () => {


    typingText.innerHTML = "";

    index = 0;


    indicator.style.display = "flex";


    typingTimer = setInterval(() => {


        if (index < message.length) {


            typingText.innerHTML +=
                message.charAt(index);


            index++;


        } else {


            clearInterval(typingTimer);


            indicator.style.display = "none";


        }



    }, 50);



});








// Stop Typing


stopBtn.addEventListener("click", () => {


    clearInterval(typingTimer);


    indicator.style.display = "none";


});