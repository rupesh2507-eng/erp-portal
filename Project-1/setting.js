const noticeNotification =
    document.querySelector("#noticeNotification");

const attendanceNotification =
    document.querySelector("#attendanceNotification");

const feeNotification =
    document.querySelector("#feeNotification");

const twoFactor =
    document.querySelector("#twoFactor");

const themeSelect =
    document.querySelector("#themeSelect");

const saveBtn =
    document.querySelector("#saveBtn");

const resetBtn =
    document.querySelector("#resetBtn");

const profileBtn =
    document.querySelector("#profileBtn");

const passwordBtn =
    document.querySelector("#passwordBtn");

const loginActivityBtn =
    document.querySelector("#loginActivityBtn");


// SAVE SETTINGS

saveBtn.addEventListener("click", () => {

    localStorage.setItem(
        "noticeNotification",
        noticeNotification.checked
    );

    localStorage.setItem(
        "attendanceNotification",
        attendanceNotification.checked
    );

    localStorage.setItem(
        "feeNotification",
        feeNotification.checked
    );

    localStorage.setItem(
        "twoFactor",
        twoFactor.checked
    );

    localStorage.setItem(
        "theme",
        themeSelect.value
    );

    alert("Settings saved successfully.");

});


// LOAD SETTINGS

function loadSettings() {

    let notice =
        localStorage.getItem("noticeNotification");

    let attendance =
        localStorage.getItem("attendanceNotification");

    let fee =
        localStorage.getItem("feeNotification");

    let security =
        localStorage.getItem("twoFactor");

    let theme =
        localStorage.getItem("theme");


    if (notice !== null) {
        noticeNotification.checked = notice === "true";
    }

    if (attendance !== null) {
        attendanceNotification.checked = attendance === "true";
    }

    if (fee !== null) {
        feeNotification.checked = fee === "true";
    }

    if (security !== null) {
        twoFactor.checked = security === "true";
    }

    if (theme !== null) {
        themeSelect.value = theme;
    }
}


// RESET SETTINGS

resetBtn.addEventListener("click", () => {

    noticeNotification.checked = true;
    attendanceNotification.checked = true;
    feeNotification.checked = true;
    twoFactor.checked = false;

    themeSelect.value = "light";

    localStorage.removeItem("noticeNotification");
    localStorage.removeItem("attendanceNotification");
    localStorage.removeItem("feeNotification");
    localStorage.removeItem("twoFactor");
    localStorage.removeItem("theme");

    alert("Settings have been reset.");

});


// PROFILE BUTTON

profileBtn.addEventListener("click", () => {
    window.location.href = "profile.html";
});


// CHANGE PASSWORD

passwordBtn.addEventListener("click", () => {
    alert("Change Password section will be connected here.");
});


// LOGIN ACTIVITY

loginActivityBtn.addEventListener("click", () => {
    alert("Recent login activity will be displayed here.");
});


loadSettings();

const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});