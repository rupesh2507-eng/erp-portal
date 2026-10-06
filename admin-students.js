console.log("ADMIN STUDENTS JS IS WORKING");


// ==============================
// CHECK LOGIN
// ==============================

const token =
    localStorage.getItem("token");

const studentData =
    localStorage.getItem("student");

if (!token || !studentData) {

    window.location.href =
        "index.html";

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
// ADMIN NAME
// ==============================

const adminDisplayName =
    document.getElementById(
        "adminDisplayName"
    );

if (adminDisplayName) {

    adminDisplayName.innerText =
        admin.name || "ERP Admin";

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
    document.getElementById(
        "logoutBtn"
    );

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
// STUDENT SEARCH
// ==============================

const searchInput =
    document.getElementById(
        "studentSearch"
    );

const tableBody =
    document.getElementById(
        "studentTableBody"
    );

if (searchInput && tableBody) {

    searchInput.addEventListener(
        "input",
        () => {

            const searchValue =
                searchInput.value
                    .toLowerCase()
                    .trim();

            const rows =
                tableBody.querySelectorAll(
                    "tr"
                );

            rows.forEach(
                (row) => {

                    const rowText =
                        row.innerText
                            .toLowerCase();

                    if (
                        rowText.includes(
                            searchValue
                        )
                    ) {

                        row.style.display =
                            "";

                    } else {

                        row.style.display =
                            "none";

                    }

                }
            );

        }
    );

}


// ==============================
// ADD STUDENT
// ==============================

const addStudentBtn =
    document.getElementById(
        "addStudentBtn"
    );

if (addStudentBtn) {

    addStudentBtn.addEventListener(
        "click",
        () => {

            alert(
                "Add Student form will be connected soon."
            );

        }
    );

}


// ==============================
// EDIT BUTTONS
// ==============================

const editButtons =
    document.querySelectorAll(
        ".edit-btn"
    );

editButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                alert(
                    "Edit Student will be connected to the database soon."
                );

            }
        );

    }
);


// ==============================
// DELETE BUTTONS
// ==============================

const deleteButtons =
    document.querySelectorAll(
        ".delete-btn"
    );

deleteButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "Are you sure you want to delete this student?"
                    );

                if (confirmed) {

                    alert(
                        "Delete Student will be connected to the database soon."
                    );

                }

            }
        );

    }
);