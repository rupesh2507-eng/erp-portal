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

    applyTheme(themeSelect.value);

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
        applyTheme(theme);
    }
}

function applyTheme(theme) {

    if (theme === "dark") {
        document.body.classList.add("dark-theme");
    } else {
        document.body.classList.remove("dark-theme");
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
    applyTheme("light");

    alert("Settings have been reset.");

});


// PROFILE BUTTON

profileBtn.addEventListener("click", () => {
    window.location.href = "profile.html";
});


// CHANGE PASSWORD

// CHANGE PASSWORD

passwordBtn.addEventListener("click", async () => {

    const student = JSON.parse(
        localStorage.getItem("student")
    );

    const token =
        localStorage.getItem("token");

    if (!student || !token) {
        alert("Please login again.");
        window.location.href = "index.html";
        return;
    }

    const currentPassword =
        prompt("Enter your current password:");

    if (currentPassword === null) {
        return;
    }

    if (currentPassword.trim() === "") {
        alert("Current password is required.");
        return;
    }

    const newPassword =
        prompt("Enter your new password:");

    if (newPassword === null) {
        return;
    }

    if (newPassword.trim() === "") {
        alert("New password is required.");
        return;
    }

    const confirmPassword =
        prompt("Confirm your new password:");

    if (confirmPassword === null) {
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match.");
        return;
    }

    try {

        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/change-password/${student.id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            }
        );

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        alert("Password changed successfully.");

    } catch (error) {

        console.error(
            "Change password error:",
            error
        );

        alert(
            "Unable to change password."
        );
    }

});


// LOGIN ACTIVITY

loginActivityBtn.addEventListener("click", async () => {

    const student = JSON.parse(
        localStorage.getItem("student")
    );

    if (!student) {
        alert("Please login again.");
        window.location.href = "index.html";
        return;
    }

    try {

        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/login-activity/${student.id}`,
            {
                headers: {
                    "Authorization":
                        `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        if (data.activities.length === 0) {
            alert("No login activity found.");
            return;
        }

        let activityMessage =
            "Recent Login Activity\n\n";

        data.activities.forEach((activity, index) => {

            const date = new Date(
                activity.login_time
            );

            activityMessage +=
                `${index + 1}. ${date.toLocaleString("en-IN")}\n`;

        });

        alert(activityMessage);

    } catch (error) {

        console.error(
            "Login activity error:",
            error
        );

        alert(
            "Unable to load login activity."
        );

    }

});


loadSettings();

const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});