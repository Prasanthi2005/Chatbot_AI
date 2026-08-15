// =================================
// VERIFY OTP JS
// AI CHATBOT PRO
// =================================



const inputs =
    document.querySelectorAll(".otp-input");



const form =
    document.getElementById("otpForm");


const verifyBtn =
    document.getElementById("verifyBtn");



const timer =
    document.getElementById("timer");



let time = 60;





// Auto Focus

inputs[0].focus();






// OTP Move

inputs.forEach((input, index) => {


    input.addEventListener("input", () => {


        if (input.value.length === 1) {


            if (index < inputs.length - 1) {

                inputs[index + 1].focus();

            }


        }


    });





    // Backspace


    input.addEventListener("keydown", (e) => {


        if (e.key === "Backspace" && input.value === "") {


            if (index > 0) {

                inputs[index - 1].focus();

            }


        }


    });





});









// Paste OTP

document.addEventListener("paste", (e) => {


    let paste =
        e.clipboardData.getData("text");



    if (paste.length === 6) {


        inputs.forEach((input, index) => {


            input.value = paste[index];


        });


        inputs[5].focus();


    }



});








// Timer


let countdown = setInterval(() => {


    time--;


    timer.innerHTML = time;



    if (time <= 0) {


        clearInterval(countdown);


        timer.innerHTML = "Expired";


    }


}, 1000);









// Submit Validation


form.addEventListener("submit", (e) => {


    let otp = "";


    inputs.forEach(input => {


        otp += input.value;


    });



    if (otp.length !== 6) {


        e.preventDefault();


        showToast(
            "Enter complete OTP"
        );


        return;


    }



    verifyBtn.disabled = true;


    verifyBtn.innerHTML =
        `
<span class="spinner"></span>
Verifying...
`;



});








// Toast

function showToast(message) {


    let toast = document.createElement("div");


    toast.className = "toast";


    toast.innerHTML = message;


    document.body.appendChild(toast);



    setTimeout(() => {


        toast.remove();


    }, 3000);



}