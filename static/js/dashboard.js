// ==========================================
// AI CHATBOT PRO
// dashboard.js
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Dashboard Loaded");

    // ==========================================
    // Welcome Animation
    // ==========================================

    const cards = document.querySelectorAll(".card");

    cards.forEach((card, index) => {

        card.style.opacity = "0";
        card.style.transform = "translateY(40px)";

        setTimeout(() => {

            card.style.transition = "0.6s";

            card.style.opacity = "1";
            card.style.transform = "translateY(0px)";

        }, index * 150);

    });

    // ==========================================
    // Statistics Counter
    // ==========================================

    const stats = document.querySelectorAll(".counter");

    stats.forEach(counter => {

        const target = Number(counter.dataset.target);

        let count = 0;

        const speed = Math.ceil(target / 60);

        const update = () => {

            if (count < target) {

                count += speed;

                counter.innerText = count;

                requestAnimationFrame(update);

            } else {

                counter.innerText = target;

            }

        };

        update();

    });

    // ==========================================
    // Current Time
    // ==========================================

    const clock = document.getElementById("clock");

    function updateClock() {

        if (!clock) return;

        const now = new Date();

        clock.innerHTML = now.toLocaleTimeString();

    }

    updateClock();

    setInterval(updateClock, 1000);

    // ==========================================
    // Greeting
    // ==========================================

    const greeting = document.getElementById("greeting");

    if (greeting) {

        const hour = new Date().getHours();

        let text = "Welcome";

        if (hour < 12) {

            text = "Good Morning ☀️";

        } else if (hour < 17) {

            text = "Good Afternoon 🌤️";

        } else {

            text = "Good Evening 🌙";

        }

        greeting.innerHTML = text;

    }

    // ==========================================
    // Card Hover
    // ==========================================

    cards.forEach(card => {

        card.addEventListener("mouseenter", () => {

            card.style.transform = "translateY(-8px)";

        });

        card.addEventListener("mouseleave", () => {

            card.style.transform = "translateY(0px)";

        });

    });

    // ==========================================
    // Notification
    // ==========================================

    function showNotification(message) {

        const toast = document.createElement("div");

        toast.className = "toast";

        toast.innerHTML = message;

        document.body.appendChild(toast);

        setTimeout(() => {

            toast.classList.add("show");

        }, 100);

        setTimeout(() => {

            toast.classList.remove("show");

            setTimeout(() => {

                toast.remove();

            }, 500);

        }, 3000);

    }

    // ==========================================
    // Online Status
    // ==========================================

    window.addEventListener("online", () => {

        showNotification("🟢 Internet Connected");

    });

    window.addEventListener("offline", () => {

        showNotification("🔴 Internet Disconnected");

    });

    // ==========================================
    // Keyboard Shortcuts
    // ==========================================

    document.addEventListener("keydown", (e) => {

        if (e.altKey && e.key === "1") {

            window.location.href = "/chat";

        }

        if (e.altKey && e.key === "2") {

            window.location.href = "/history";

        }

        if (e.altKey && e.key === "3") {

            window.location.href = "/profile";

        }

        if (e.altKey && e.key === "4") {

            window.location.href = "/settings";

        }

    });

});