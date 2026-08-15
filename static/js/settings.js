// ==========================================
// SETTINGS JS
// AI CHATBOT PRO
// ==========================================


// ================================
// DOM ELEMENTS
// ================================

const settingsForm =
    document.getElementById("settingsForm");


const saveBtn =
    document.getElementById("saveBtn");


const theme =
    document.getElementById("theme");


const deleteBtn =
    document.getElementById("deleteAccount");




// ================================
// LOAD SAVED THEME
// ================================

if (theme) {

    let savedTheme =
        localStorage.getItem("theme");


    if (savedTheme === "true") {

        theme.checked = true;

        document.body.style.background =
            "linear-gradient(135deg,#020617,#000)";

    }

}






// ================================
// DARK / LIGHT MODE
// ================================

if (theme) {


    theme.addEventListener("change", () => {


        if (theme.checked) {


            document.body.style.background =
                "linear-gradient(135deg,#020617,#000)";


            localStorage.setItem(
                "theme",
                "true"
            );


            showToast(
                "Dark mode enabled"
            );


        } else {


            document.body.style.background =
                "linear-gradient(135deg,#2563eb,#1e3a8a)";


            localStorage.setItem(
                "theme",
                "false"
            );


            showToast(
                "Light mode enabled"
            );


        }



    });


}








// ================================
// SAVE SETTINGS
// ================================

if (settingsForm) {


    settingsForm.addEventListener(
        "submit",
        () => {


            if (saveBtn) {


                saveBtn.disabled = true;


                saveBtn.innerHTML =
                    `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Saving...
        `;


            }


        });


}








// ================================
// DELETE ACCOUNT
// ================================


if (deleteBtn) {


    deleteBtn.addEventListener(
        "click",
        () => {


            let confirmDelete =
                confirm(
                    "Are you sure you want to delete account?"
                );



            if (confirmDelete) {


                showToast(
                    "Account deletion request sent"
                );


            }



        });


}








// ================================
// TOAST MESSAGE
// ================================


function showToast(message) {


    const toast =
        document.createElement("div");


    toast.className = "toast";


    toast.innerHTML = message;



    document.body.appendChild(toast);




    setTimeout(() => {


        toast.remove();


    }, 3000);



}