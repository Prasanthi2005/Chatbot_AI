// ==========================================
// 500.js
// AI Chatbot Pro
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("500 Error Page Loaded");

    // ==========================================
    // Countdown Redirect
    // ==========================================

    const countdown = document.getElementById("countdown");

    let seconds = 15;

    if (countdown) {

        countdown.innerText = seconds;

        const timer = setInterval(() => {

            seconds--;

            countdown.innerText = seconds;

            if (seconds <= 0) {

                clearInterval(timer);

                window.location.href = "/";

            }

        }, 1000);

    }

    // ==========================================
    // Floating Image Animation
    // ==========================================

    const image = document.querySelector(".card img");

    if (image) {

        let position = 0;

        setInterval(() => {

            position = position === 0 ? -12 : 0;

            image.style.transform = `translateY(${position}px)`;

        }, 1000);

    }

    // ==========================================
    // Reload Button
    // ==========================================

    const reloadBtn = document.getElementById("reloadBtn");

    if (reloadBtn) {

        reloadBtn.addEventListener("click", () => {

            location.reload();

        });

    }

    // ==========================================
    // Home Button
    // ==========================================

    const homeBtn = document.getElementById("homeBtn");

    if (homeBtn) {

        homeBtn.addEventListener("click", () => {

            window.location.href = "/";

        });

    }

    // ==========================================
    // Keyboard Shortcuts
    // R = Reload
    // H = Home
    // ==========================================

    document.addEventListener("keydown", (e) => {

        switch (e.key.toLowerCase()) {

            case "r":

                location.reload();

                break;

            case "h":

                window.location.href = "/";

                break;

        }

    });

    // ==========================================
    // Online / Offline Status
    // ==========================================

    window.addEventListener("offline", () => {

        console.log("Internet Connection Lost");

    });

    window.addEventListener("online", () => {

        console.log("Internet Connected");

    });

});