// ==========================================
// 404.js
// AI Chatbot Pro
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("404 Page Loaded");

    // ==========================================
    // Countdown Redirect
    // ==========================================

    const counter = document.getElementById("countdown");

    let seconds = 10;

    if (counter) {

        counter.innerText = seconds;

        const timer = setInterval(() => {

            seconds--;

            counter.innerText = seconds;

            if (seconds <= 0) {

                clearInterval(timer);

                window.location.href = "/";

            }

        }, 1000);

    }

    // ==========================================
    // Floating Animation
    // ==========================================

    const image = document.querySelector(".card img");

    if (image) {

        let up = true;

        setInterval(() => {

            image.style.transform = up ?
                "translateY(-10px)" :
                "translateY(0px)";

            up = !up;

        }, 1000);

    }

    // ==========================================
    // Keyboard Shortcut
    // Press H → Home
    // ==========================================

    document.addEventListener("keydown", (e) => {

        if (e.key.toLowerCase() === "h") {

            window.location.href = "/";

        }

    });

    // ==========================================
    // Go Back Button
    // ==========================================

    const backBtn = document.getElementById("backBtn");

    if (backBtn) {

        backBtn.addEventListener("click", () => {

            history.back();

        });

    }

});