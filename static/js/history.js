// ==========================================
// AI CHATBOT PRO
// history.js
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("History Page Loaded");

    // ==========================================
    // Elements
    // ==========================================

    const searchInput = document.getElementById("searchInput");
    const chatCards = document.querySelectorAll(".chat-card");
    const deleteBtn = document.getElementById("deleteHistory");
    const loading = document.getElementById("loadingOverlay");

    // ==========================================
    // Loading
    // ==========================================

    function showLoading() {

        if (loading) {

            loading.style.display = "flex";

        }

    }

    function hideLoading() {

        if (loading) {

            loading.style.display = "none";

        }

    }

    // ==========================================
    // Search Chats
    // ==========================================

    if (searchInput) {

        searchInput.addEventListener("keyup", function() {

            const value = this.value.toLowerCase();

            chatCards.forEach(card => {

                const text = card.innerText.toLowerCase();

                card.style.display =
                    text.includes(value) ? "block" : "none";

            });

        });

    }

    // ==========================================
    // Delete Confirmation
    // ==========================================

    if (deleteBtn) {

        deleteBtn.addEventListener("click", function(e) {

            const confirmDelete = confirm(
                "Are you sure you want to delete all chat history?"
            );

            if (!confirmDelete) {

                e.preventDefault();

                return;

            }

            showLoading();

        });

    }

    // ==========================================
    // Copy Chat
    // ==========================================

    document.querySelectorAll(".copy-chat").forEach(button => {

        button.addEventListener("click", async() => {

            const text =
                button.closest(".chat-card").innerText;

            try {

                await navigator.clipboard.writeText(text);

                showToast("Chat copied successfully.");

            } catch {

                showToast("Copy failed.");

            }

        });

    });

    // ==========================================
    // Toast
    // ==========================================

    function showToast(message) {

        const toast = document.createElement("div");

        toast.className = "toast";

        toast.innerText = message;

        document.body.appendChild(toast);

        setTimeout(() => {

            toast.classList.add("show");

        }, 100);

        setTimeout(() => {

            toast.classList.remove("show");

            setTimeout(() => {

                toast.remove();

            }, 300);

        }, 2500);

    }

    // ==========================================
    // Keyboard Shortcut
    // Ctrl + F
    // ==========================================

    document.addEventListener("keydown", (e) => {

        if (e.ctrlKey && e.key.toLowerCase() === "f") {

            e.preventDefault();

            if (searchInput) {

                searchInput.focus();

            }

        }

    });

    // ==========================================
    // Scroll To Top
    // ==========================================

    const topBtn = document.getElementById("topBtn");

    window.addEventListener("scroll", () => {

        if (!topBtn) return;

        if (window.scrollY > 300) {

            topBtn.style.display = "block";

        } else {

            topBtn.style.display = "none";

        }

    });

    if (topBtn) {

        topBtn.addEventListener("click", () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        });

    }

    // ==========================================
    // Online / Offline
    // ==========================================

    window.addEventListener("online", () => {

        showToast("🟢 Internet Connected");

    });

    window.addEventListener("offline", () => {

        showToast("🔴 Internet Disconnected");

    });

    // ==========================================
    // Finished
    // ==========================================

    hideLoading();

});