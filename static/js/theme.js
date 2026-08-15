// ==========================================
// THEME JS
// AI CHATBOT PRO
// ==========================================



const themeBoxes =
    document.querySelectorAll(".theme-box");


const saveBtn =
    document.getElementById("saveTheme");



let selectedTheme =
    localStorage.getItem("chatbotTheme") || "dark";






// Load Theme


applyTheme(selectedTheme);






themeBoxes.forEach(box => {


    if (box.dataset.theme === selectedTheme) {

        box.classList.add("active");

    }



    box.addEventListener("click", () => {


        themeBoxes.forEach(item => {

            item.classList.remove("active");

        });


        box.classList.add("active");


        selectedTheme =
            box.dataset.theme;



        previewTheme(selectedTheme);



    });


});








// Save Theme


saveBtn.addEventListener("click", () => {


    localStorage.setItem(
        "chatbotTheme",
        selectedTheme
    );



    applyTheme(selectedTheme);


    showToast(
        "Theme saved successfully"
    );



});








// Preview


function previewTheme(theme) {


    if (theme === "light") {


        document.body.classList.add("light");


    } else {


        document.body.classList.remove("light");


    }



}







// Apply Theme


function applyTheme(theme) {


    if (theme === "system") {


        let system =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;


        if (system) {

            document.body.classList.remove("light");

        } else {

            document.body.classList.add("light");

        }


    } else {


        previewTheme(theme);


    }



}








// Toast


function showToast(message) {


    let toast =
        document.createElement("div");


    toast.className = "toast";


    toast.innerHTML = message;


    document.body.appendChild(toast);



    setTimeout(() => {


        toast.remove();


    }, 3000);



}