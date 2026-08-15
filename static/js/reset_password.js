// =================================
// RESET PASSWORD JS
// =================================


const password =
    document.getElementById("password");


const confirmPassword =
    document.getElementById("confirm_password");


const strengthBar =
    document.getElementById("strengthBar");


const strengthText =
    document.getElementById("strengthText");


const resetForm =
    document.getElementById("resetForm");


const resetBtn =
    document.getElementById("resetBtn");




// Show Hide Password

document.querySelectorAll(".toggle-password")
    .forEach(icon => {


        icon.onclick = function() {


            let target = this.dataset.target;


            let input = document.getElementById(target);



            if (input.type === "password") {


                input.type = "text";


                this.classList.replace(
                    "fa-eye",
                    "fa-eye-slash"
                );


            } else {


                input.type = "password";


                this.classList.replace(
                    "fa-eye-slash",
                    "fa-eye"
                );


            }



        }


    });






// Password Strength


password.addEventListener("input", () => {


    let score = 0;

    let value = password.value;


    if (value.length >= 8)
        score++;


    if (/[A-Z]/.test(value))
        score++;


    if (/[0-9]/.test(value))
        score++;


    if (/[!@#$%^&*]/.test(value))
        score++;




    if (score <= 1) {

        strengthBar.style.width = "30%";
        strengthBar.style.background = "red";

        strengthText.innerHTML =
            "Weak Password";


    } else if (score <= 3) {


        strengthBar.style.width = "70%";
        strengthBar.style.background = "orange";


        strengthText.innerHTML =
            "Medium Password";


    } else {


        strengthBar.style.width = "100%";
        strengthBar.style.background = "green";


        strengthText.innerHTML =
            "Strong Password";


    }



});






// Confirm Password


confirmPassword.addEventListener("input", () => {


    if (password.value === confirmPassword.value) {


        confirmPassword.style.border =
            "2px solid green";


    } else {


        confirmPassword.style.border =
            "2px solid red";


    }


});







function toast(msg) {


    let div = document.createElement("div");


    div.className = "toast";


    div.innerHTML = msg;


    document.body.appendChild(div);


    setTimeout(() => {

        div.remove();

    }, 3000);


}







// Form Submit


resetForm.addEventListener("submit", (e) => {


    if (password.value.length < 8) {


        e.preventDefault();


        toast(
            "Password must be 8 characters"
        );


        return;


    }




    if (password.value !== confirmPassword.value) {


        e.preventDefault();


        toast(
            "Passwords do not match"
        );


        return;


    }



    resetBtn.disabled = true;


    resetBtn.innerHTML =
        `
<span class="spinner"></span>
Updating Password...
`;


});