// =====================================
// Login Page
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    const username = document.getElementById("username");

    const password = document.getElementById("password");

    const toggle = document.getElementById("togglePassword");

    const submit = document.getElementById("loginBtn");

    // =====================================
    // Show / Hide Password
    // =====================================

    if (toggle) {

        toggle.addEventListener("click", () => {

            if (password.type === "password") {

                password.type = "text";

                toggle.classList.remove("fa-eye");

                toggle.classList.add("fa-eye-slash");

            } else {

                password.type = "password";

                toggle.classList.remove("fa-eye-slash");

                toggle.classList.add("fa-eye");

            }

        });

    }

    // =====================================
    // Validation
    // =====================================

    if (form) {

        form.addEventListener("submit", (e) => {

            if (username.value.trim() === "") {

                e.preventDefault();

                alert("Enter Username");

                username.focus();

                return;

            }

            if (password.value.trim() === "") {

                e.preventDefault();

                alert("Enter Password");

                password.focus();

                return;

            }

            submit.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Logging in...";

            submit.disabled = true;

        });

    }

    // =====================================
    // Enter Key
    // =====================================

    document.addEventListener("keypress", (e) => {

        if (e.key === "Enter") {

            form.requestSubmit();

        }

    });

    // =====================================
    // Auto Focus
    // =====================================

    username.focus();

});