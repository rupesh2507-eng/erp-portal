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

// =========================
// ADD STUDENT FORM
// =========================

const addStudentForm =
    document.getElementById("addStudentForm");

const studentForm =
    document.getElementById("studentForm");

const closeStudentForm =
    document.getElementById("closeStudentForm");

const cancelStudentForm =
    document.getElementById("cancelStudentForm");


// OPEN FORM

if (addStudentBtn && addStudentForm) {

    addStudentBtn.addEventListener(
        "click",
        () => {

            addStudentForm.classList.add(
                "active"
            );

            addStudentForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    );
}


// CLOSE FORM

function closeAddStudentForm() {

    if (addStudentForm) {
        addStudentForm.classList.remove(
            "active"
        );
    }

    if (studentForm) {
        studentForm.reset();
    }
}


if (closeStudentForm) {

    closeStudentForm.addEventListener(
        "click",
        closeAddStudentForm
    );
}


if (cancelStudentForm) {

    cancelStudentForm.addEventListener(
        "click",
        closeAddStudentForm
    );
}


// =========================
// SAVE NEW STUDENT
// =========================

if (studentForm) {

    studentForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const saveButton =
                studentForm.querySelector(
                    ".save-student-btn"
                );

            saveButton.disabled = true;
            saveButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';

            const student = {

                name:
                    document.getElementById(
                        "studentName"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "studentEmail"
                    ).value.trim(),

                password:
                    document.getElementById(
                        "studentPassword"
                    ).value,

                roll_no:
                    document.getElementById(
                        "studentRollNo"
                    ).value.trim(),

                course:
                    document.getElementById(
                        "studentCourse"
                    ).value.trim(),

                semester:
                    document.getElementById(
                        "studentSemester"
                    ).value.trim(),

                phone:
                    document.getElementById(
                        "studentPhone"
                    ).value.trim(),

                gender:
                    document.getElementById(
                        "studentGender"
                    ).value,

                section:
                    document.getElementById(
                        "studentSection"
                    ).value.trim(),

                department:
                    document.getElementById(
                        "studentDepartment"
                    ).value.trim(),

                session:
                    document.getElementById(
                        "studentSession"
                    ).value.trim(),

                address:
                    document.getElementById(
                        "studentAddress"
                    ).value.trim()
            };

            try {

                const response =
                    await fetch(
                        "https://erp-portal-xgjf.onrender.com/student/add",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body:
                                JSON.stringify(
                                    student
                                )
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    "ADD STUDENT RESPONSE:",
                    data
                );

                if (!response.ok || !data.success) {

                    alert(
                        data.message ||
                        "Unable to add student"
                    );

                    return;
                }

                alert(
                    "Student added successfully!"
                );

                closeAddStudentForm();

                await loadStudents();

            } catch (error) {

                console.error(
                    "Add student error:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );

            } finally {

                saveButton.disabled = false;

                saveButton.innerHTML =
                    '<i class="fa-solid fa-user-plus"></i> Add Student';
            }
        }
    );
}