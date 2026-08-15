// ==========================================
// AI Chatbot Pro
// profile.js
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Profile Page Loaded");

    // ==========================================
    // Elements
    // ==========================================

    const profileImage = document.getElementById("profileImage");
    const profilePreview = document.getElementById("profilePreview");

    const form = document.getElementById("profileForm");

    const fullname = document.getElementById("fullname");
    const email = document.getElementById("email");

    const currentPassword =
        document.getElementById("current_password");

    const newPassword =
        document.getElementById("new_password");

    const confirmPassword =
        document.getElementById("confirm_password");

    const saveButton =
        document.querySelector(".save-btn");

    // ==========================================
    // Image Preview
    // ==========================================

    if (profileImage) {

        profileImage.addEventListener("change", function() {

            const file = this.files[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {

                alert("Please select an image.");

                this.value = "";

                return;

            }

            const reader = new FileReader();

            reader.onload = function(e) {

                profilePreview.src = e.target.result;

            };

            reader.readAsDataURL(file);

        });

    }

    // ==========================================
    // Email Validation
    // ==========================================

    function validEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    }

    // ==========================================
    // Toast
    // ==========================================

    function toast(message, color = "#2563eb") {

        const div = document.createElement("div");

        div.className = "toast";

        div.innerHTML = message;

        div.style.background = color;

        document.body.appendChild(div);

        setTimeout(() => {

            div.classList.add("show");

        }, 100);

        setTimeout(() => {

            div.classList.remove("show");

            setTimeout(() => {

                div.remove();

            }, 400);

        }, 3000);

    }

    // ==========================================
    // Form Validation
    // ==========================================

    if (form) {

        form.addEventListener("submit", function(e) {

            if (fullname.value.trim() === "") {

                e.preventDefault();

                toast("Enter Full Name", "#dc2626");

                fullname.focus();

                return;

            }

            if (!validEmail(email.value.trim())) {

                e.preventDefault();

                toast("Invalid Email Address", "#dc2626");

                email.focus();

                return;

            }

            if (newPassword.value !== "" ||
                confirmPassword.value !== "") {

                if (currentPassword.value === "") {

                    e.preventDefault();

                    toast(
                        "Enter Current Password",
                        "#dc2626"
                    );

                    currentPassword.focus();

                    return;

                }

                if (newPassword.value.length < 6) {

                    e.preventDefault();

                    toast(
                        "Password should be at least 6 characters",
                        "#dc2626"
                    );

                    newPassword.focus();

                    return;

                }

                if (newPassword.value !==
                    confirmPassword.value) {

                    e.preventDefault();

                    toast(
                        "Passwords do not match",
                        "#dc2626"
                    );

                    confirmPassword.focus();

                    return;

                }

            }

            saveButton.disabled = true;

            saveButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        });

    }

    // ==========================================
    // Password Strength
    // ==========================================

    if (newPassword) {

        newPassword.addEventListener("keyup", () => {

            const value = newPassword.value;

            if (value.length >= 10) {

                newPassword.style.border =
                    "2px solid #22c55e";

            } else if (value.length >= 6) {

                newPassword.style.border =
                    "2px solid orange";

            } else {

                newPassword.style.border =
                    "2px solid red";

            }

        });

    }

    // ==========================================
    // Auto Focus
    // ==========================================

    if (fullname) {

        fullname.focus();

    }

    // ==========================================
    // Ctrl + S
    // ==========================================

    document.addEventListener("keydown", function(e) {

        if (e.ctrlKey && e.key.toLowerCase() === "s") {

            e.preventDefault();

            form.requestSubmit();

        }

    });

});
// ==========================================
// profile.js - Part 2 (Advanced Features)
// ==========================================

// Show / Hide Password

document.querySelectorAll(".toggle-password").forEach(icon => {

    icon.addEventListener("click", () => {

        const input = document.getElementById(icon.dataset.target);

        if (!input) return;

        if (input.type === "password") {

            input.type = "text";

            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");

        } else {

            input.type = "password";

            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");

        }

    });

});

// ==========================================
// Unsaved Changes Warning
// ==========================================

let changed = false;

document.querySelectorAll("input").forEach(input => {

    input.addEventListener("input", () => {

        changed = true;

    });

});

window.addEventListener("beforeunload", function(e) {

    if (changed) {

        e.preventDefault();

        e.returnValue = "";

    }

});

if (document.getElementById("profileForm")) {

    document.getElementById("profileForm")
        .addEventListener("submit", () => {

            changed = false;

        });

}

// ==========================================
// Drag & Drop Profile Image
// ==========================================

const preview = document.getElementById("profilePreview");
const upload = document.getElementById("profileImage");

if (preview && upload) {

    preview.addEventListener("dragover", e => {

        e.preventDefault();

    });

    preview.addEventListener("drop", e => {

        e.preventDefault();

        const file = e.dataTransfer.files[0];

        if (!file) return;

        upload.files = e.dataTransfer.files;

        const reader = new FileReader();

        reader.onload = function(event) {

            preview.src = event.target.result;

        };

        reader.readAsDataURL(file);

    });

}

// ==========================================
// Live Clock
// ==========================================

const clock = document.getElementById("clock");

function updateClock() {

    if (!clock) return;

    clock.innerHTML = new Date().toLocaleTimeString();

}

setInterval(updateClock, 1000);

updateClock();

// ==========================================
// Online / Offline
// ==========================================

window.addEventListener("online", () => {

    console.log("Internet Connected");

});

window.addEventListener("offline", () => {

    console.log("Internet Disconnected");

});

// ==========================================
// ESC Key Clears Password Fields
// ==========================================

document.addEventListener("keydown", e => {

    if (e.key === "Escape") {

        const ids = [

            "current_password",
            "new_password",
            "confirm_password"

        ];

        ids.forEach(id => {

            const input = document.getElementById(id);

            if (input) input.value = "";

        });

    }

});

// ==========================================
// Character Counter (Full Name)
// ==========================================

const fullname = document.getElementById("fullname");

if (fullname) {

    const counter = document.createElement("small");

    fullname.parentNode.appendChild(counter);

    const updateCounter = () => {

        counter.innerHTML =

            fullname.value.length + " / 50 Characters";

    };

    fullname.addEventListener("input", updateCounter);

    updateCounter();

}