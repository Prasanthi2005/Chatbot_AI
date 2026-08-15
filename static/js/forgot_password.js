// ==========================================
// AI Chatbot Pro
// forgot_password.js
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Forgot Password Page Loaded");

    // ==========================================
    // DOM Elements
    // ==========================================

    const form = document.getElementById("forgotForm");
    const email = document.getElementById("email");
    const submitBtn = document.getElementById("submitBtn");
    const spinner = document.getElementById("spinner");

    // ==========================================
    // Email Validation
    // ==========================================

    function validateEmail(mail) {

        const pattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return pattern.test(mail);

    }

    // ==========================================
    // Toast Message
    // ==========================================

    function showToast(message, color = "#2563eb") {

        const toast = document.createElement("div");

        toast.innerText = message;

        toast.style.position = "fixed";
        toast.style.top = "20px";
        toast.style.right = "20px";
        toast.style.background = color;
        toast.style.color = "white";
        toast.style.padding = "15px 25px";
        toast.style.borderRadius = "10px";
        toast.style.boxShadow = "0 10px 20px rgba(0,0,0,.3)";
        toast.style.zIndex = "9999";

        document.body.appendChild(toast);

        setTimeout(() => {

            toast.remove();

        }, 3000);

    }

    // ==========================================
    // Form Submit
    // ==========================================

    if (form) {

        form.addEventListener("submit", (e) => {

            const value = email.value.trim();

            if (value === "") {

                e.preventDefault();

                showToast("Email is required.", "#ef4444");

                email.focus();

                return;

            }

            if (!validateEmail(value)) {

                e.preventDefault();

                showToast("Enter a valid email.", "#ef4444");

                email.focus();

                return;

            }

            if (spinner) {

                spinner.style.display = "inline-block";

            }

            submitBtn.disabled = true;

            submitBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Sending OTP...';

        });

    }

    // ==========================================
    // Enter Key Focus
    // ==========================================

    if (email) {

        email.addEventListener("keypress", (e) => {

            if (e.key === "Enter") {

                form.requestSubmit();

            }

        });

    }

    // ==========================================
    // Auto Focus
    // ==========================================

    if (email) {

        email.focus();

    }

});