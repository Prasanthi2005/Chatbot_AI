// ==========================================
// AI CHATBOT PROJECT
// register.js
// Complete Registration JavaScript
// ==========================================


// ================================
// DOM ELEMENTS
// ================================

const registerForm = document.getElementById("registerForm");

const fullname = document.getElementById("fullname");
const username = document.getElementById("username");
const email = document.getElementById("email");
const phone = document.getElementById("phone");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm_password");

const profileImage = document.getElementById("profile_image");
const previewImage = document.getElementById("previewImage");

const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

const terms = document.getElementById("terms");

const registerBtn = document.getElementById("registerBtn");




// ================================
// AUTO FOCUS
// ================================

window.onload = function() {

    if (fullname) {
        fullname.focus();
    }

};




// ================================
// IMAGE PREVIEW
// ================================

if (profileImage) {

    profileImage.addEventListener("change", function() {

        const file = this.files[0];


        if (file) {

            const reader = new FileReader();


            reader.onload = function(e) {

                previewImage.src = e.target.result;

            };


            reader.readAsDataURL(file);

        }


    });

}




// ================================
// SHOW / HIDE PASSWORD
// ================================

document.querySelectorAll(".toggle-password")
    .forEach(icon => {


        icon.addEventListener("click", function() {


            const target = this.getAttribute("data-target");


            const input = document.getElementById(target);



            if (input.type === "password") {


                input.type = "text";


                this.classList.remove("fa-eye");

                this.classList.add("fa-eye-slash");


            } else {


                input.type = "password";


                this.classList.remove("fa-eye-slash");

                this.classList.add("fa-eye");


            }


        });


    });






// ================================
// USERNAME VALIDATION
// ================================

if (username) {

    username.addEventListener("input", () => {


        let pattern = /^[a-zA-Z0-9_]{4,15}$/;


        if (pattern.test(username.value)) {


            username.style.border =
                "2px solid #22c55e";


        } else {


            username.style.border =
                "2px solid #ef4444";


        }


    });


}






// ================================
// EMAIL VALIDATION
// ================================

if (email) {


    email.addEventListener("input", () => {


        let pattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



        if (pattern.test(email.value)) {


            email.style.border =
                "2px solid #22c55e";


        } else {


            email.style.border =
                "2px solid #ef4444";


        }


    });


}






// ================================
// PASSWORD STRENGTH
// ================================

if (password) {


    password.addEventListener("input", () => {


        let value = password.value;

        let score = 0;



        if (value.length >= 8)
            score++;


        if (/[A-Z]/.test(value))
            score++;


        if (/[a-z]/.test(value))
            score++;


        if (/[0-9]/.test(value))
            score++;


        if (/[!@#$%^&*]/.test(value))
            score++;





        if (score <= 2) {


            strengthBar.style.width = "30%";

            strengthBar.style.background = "red";


            strengthText.innerHTML =
                "Password Strength : Weak";


        } else if (score <= 4) {


            strengthBar.style.width = "65%";

            strengthBar.style.background = "orange";


            strengthText.innerHTML =
                "Password Strength : Medium";


        } else {


            strengthBar.style.width = "100%";

            strengthBar.style.background = "green";


            strengthText.innerHTML =
                "Password Strength : Strong";


        }



    });


}







// ================================
// CONFIRM PASSWORD
// ================================

if (confirmPassword) {


    confirmPassword.addEventListener("input", () => {


        if (password.value === confirmPassword.value) {


            confirmPassword.style.border =
                "2px solid #22c55e";


        } else {


            confirmPassword.style.border =
                "2px solid #ef4444";


        }


    });


}








// ================================
// TOAST MESSAGE
// ================================

function showToast(message, type = "success") {


    const toast = document.createElement("div");


    toast.className = "toast show";


    toast.innerHTML = message;



    if (type === "error") {


        toast.style.background = "#dc2626";


    }


    document.body.appendChild(toast);



    setTimeout(() => {


        toast.remove();


    }, 3000);



}








// ================================
// FORM VALIDATION
// ================================

if (registerForm) {


    registerForm.addEventListener("submit", (e) => {


        let valid = true;



        // fullname


        if (fullname.value.trim() === "") {


            showToast(
                "Please enter full name",
                "error"
            );


            valid = false;


        }



        // username


        if (username.value.trim() === "") {


            showToast(
                "Please enter username",
                "error"
            );


            valid = false;


        }





        // email


        let emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



        if (!emailPattern.test(email.value)) {


            showToast(
                "Invalid email address",
                "error"
            );


            valid = false;


        }






        // password


        if (password.value.length < 8) {


            showToast(
                "Password minimum 8 characters",
                "error"
            );


            valid = false;


        }





        // confirm password


        if (password.value !== confirmPassword.value) {


            showToast(
                "Passwords do not match",
                "error"
            );


            valid = false;


        }





        // terms


        if (!terms.checked) {


            showToast(
                "Please accept Terms & Conditions",
                "error"
            );


            valid = false;


        }





        if (!valid) {


            e.preventDefault();


            return;


        }




        // Loading animation


        registerBtn.disabled = true;


        registerBtn.innerHTML =
            `
<span class="spinner"></span>
Creating Account...
`;



    });


}








// ================================
// KEYBOARD SHORTCUTS
// ================================


document.addEventListener("keydown", (e) => {


    // ENTER SUBMIT

    if (e.key === "Enter") {


        if (document.activeElement.tagName === "INPUT") {


            registerForm.requestSubmit();


        }


    }




    // ESC RESET

    if (e.key === "Escape") {


        registerForm.reset();


        showToast(
            "Form cleared"
        );


    }



});








// ================================
// PREVENT DOUBLE SUBMIT
// ================================

let submitted = false;



if (registerForm) {


    registerForm.addEventListener("submit", (e) => {


        if (submitted) {


            e.preventDefault();

            return;


        }


        submitted = true;


    });


}




// ================================
// INPUT ANIMATION
// ================================

document.querySelectorAll(".input-group")
    .forEach((item, index) => {


        setTimeout(() => {


            item.style.opacity = "1";

            item.style.transform = "translateY(0)";


        }, index * 100);



    });