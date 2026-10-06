console.log("ADMIN DASHBOARD JS IS WORKING");


// ==============================
// CHECK LOGIN
// ==============================

const token =
    localStorage.getItem("token");

const studentData =
    localStorage.getItem("student");

if (!token || !studentData) {

    window.location.href = "index.html";

}

const admin =
    JSON.parse(studentData);


// ==============================
// ROLE SECURITY
// ==============================

if (admin.role !== "Admin") {

    alert("Access denied.");

    window.location.href =
        "dashboard.html";

}


// ==============================
// ADMIN INFORMATION
// ==============================

const adminName =
    document.getElementById("adminName");

const adminDisplayName =
    document.getElementById("adminDisplayName");

const infoName =
    document.getElementById("infoName");

const infoEmail =
    document.getElementById("infoEmail");


if (adminName) {

    adminName.innerText =
        admin.name || "Admin";

}

if (adminDisplayName) {

    adminDisplayName.innerText =
        admin.name || "ERP Admin";

}

if (infoName) {

    infoName.innerText =
        admin.name || "ERP Admin";

}

if (infoEmail) {

    infoEmail.innerText =
        admin.email || "admin@studenterp.com";

}


// ==============================
// SIDEBAR
// ==============================

const panel =
    document.querySelector(".panel");

const dashboard =
    document.querySelector(".dashboard");

const menuIcon =
    document.querySelector(".heading i");


if (menuIcon) {

    menuIcon.addEventListener(
        "click",
        () => {

            panel.classList.toggle(
                "collapsed"
            );

            dashboard.classList.toggle(
                "reverse"
            );

        }
    );

}


// ==============================
// LOGOUT
// ==============================

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "student"
            );

            window.location.href =
                "index.html";

        }
    );

}


// ==============================
// DASHBOARD COUNTS
// ==============================
//
// These are temporary values.
// We will connect them to the
// database when we build the
// Admin management APIs.
//

const totalStudents =
    document.getElementById(
        "totalStudents"
    );

const totalTeachers =
    document.getElementById(
        "totalTeachers"
    );

const totalCourses =
    document.getElementById(
        "totalCourses"
    );

const totalNotices =
    document.getElementById(
        "totalNotices"
    );


if (totalStudents) {

    totalStudents.innerText = "5";

}

if (totalTeachers) {

    totalTeachers.innerText = "0";

}

if (totalCourses) {

    totalCourses.innerText = "7";

}

if (totalNotices) {

    totalNotices.innerText = "0";

}