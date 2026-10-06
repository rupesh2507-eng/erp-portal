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




async function loadStudents() {

    if (!tableBody) {
        return;
    }

    try {

        const response = await fetch(
            "https://erp-portal-xgjf.onrender.com/student/all",
            {
                method: "GET",
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();

        console.log(
            "STUDENTS RESPONSE:",
            data
        );

        if (!data.success) {
            alert(
                data.message ||
                "Unable to load students"
            );
            return;
        }

        tableBody.innerHTML = "";

        data.students.forEach(
            (student) => {

                const row =
                    document.createElement("tr");

                row.innerHTML = `
                    <td>${student.id}</td>

                    <td>${student.name || "-"}</td>

                    <td>${student.email || "-"}</td>

                    <td>${student.roll_no || "-"}</td>

                    <td>${student.course || "-"}</td>

                    <td>${student.semester || "-"}</td>

                    <td>${student.role || "-"}</td>

                    <td class="action-buttons">

                        <button
                            class="edit-btn"
                            title="Edit Student"
                            aria-label="Edit Student"
                        >
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>

                        <button
                            class="delete-btn"
                            title="Delete Student"
                            aria-label="Delete Student"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </td>
                `;

                tableBody.appendChild(row);
            }
        );

    } catch (error) {

        console.error(
            "Load students error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );
    }
}

loadStudents();