/* ==============================
   THEME
============================== */

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}



/* ==============================
   SIDEBAR
============================== */

const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");


if (icon && panel && dashboard) {

    icon.addEventListener("click", () => {

        panel.classList.toggle("collapsed");

        dashboard.classList.toggle("reverse");

    });

}



/* ==============================
   ELEMENTS
============================== */

const editBtn =
    document.querySelector("#editBtn");

const saveBtn =
    document.querySelector("#saveBtn");

const cancelBtn =
    document.querySelector("#cancelBtn");

const saveArea =
    document.querySelector("#saveArea");


const imageUpload =
    document.querySelector("#imageUpload");

const profileImage =
    document.querySelector("#profileImage");

const defaultIcon =
    document.querySelector("#defaultIcon");



/* ==============================
   PROFILE INPUTS
============================== */

const nameInput =
    document.querySelector("#name");

const phoneInput =
    document.querySelector("#phone");

const emailInput =
    document.querySelector("#email");


const contactPhone =
    document.querySelector("#contactPhone");

const contactEmail =
    document.querySelector("#contactEmail");

const addressInput =
    document.querySelector("#address");



/* ==============================
   DISPLAY INFORMATION
============================== */

const displayName =
    document.querySelector("#displayName");

const displayRoll =
    document.querySelector("#displayRoll");

const displayCourseSemester =
    document.querySelector("#displayCourseSemester");



/* ==============================
   DYNAMIC PROFILE FIELDS
============================== */

const rollNoInput =
    document.querySelector("#rollNo");

const dobInput =
    document.querySelector("#dob");

const genderInput =
    document.querySelector("#gender");

const courseInput =
    document.querySelector("#course");

const semesterInput =
    document.querySelector("#semester");

const sectionInput =
    document.querySelector("#section");

const sessionInput =
    document.querySelector("#session");

const departmentInput =
    document.querySelector("#department");



/* ==============================
   EDITABLE INPUTS
============================== */

const editableInputs = [

    nameInput,
    phoneInput,
    emailInput,
    contactPhone,
    contactEmail,
    addressInput

].filter(Boolean);



/* ==============================
   GET LOGGED-IN STUDENT
============================== */

const studentData =
    localStorage.getItem("student");


let student = null;


if (studentData) {

    try {

        student =
            JSON.parse(studentData);

    } catch (error) {

        console.error(
            "Student data error:",
            error
        );

    }

}



/* ==============================
   ORIGINAL VALUES
   Used for CANCEL
============================== */

let originalValues = {};



/* ==============================
   FORMAT DOB
============================== */

function formatDOB(dob) {

    if (!dob) {

        return "";

    }


    /*
       Handles:

       2006-03-10
       2006-03-10T00:00:00.000Z
       10/03/2006
    */

    if (
        typeof dob === "string" &&
        dob.includes("-")
    ) {

        const parts =
            dob.substring(0, 10).split("-");


        if (parts.length === 3) {

            const year =
                parts[0];

            const month =
                parts[1];

            const day =
                parts[2];


            const months = [

                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"

            ];


            return (
                day +
                " " +
                months[
                    parseInt(month) - 1
                ] +
                " " +
                year
            );

        }

    }


    return dob;

}



/* ==============================
   COURSE NAME
============================== */

function getCourseName(course) {

    if (course === "BCA") {

        return "Bachelor of Computer Applications";

    }


    if (course === "BBA") {

        return "Bachelor of Business Administration";

    }


    return course || "";

}



/* ==============================
   SEMESTER NAME
============================== */

function getSemesterName(semester) {

    const number =
        parseInt(semester);


    if (number === 1) {

        return "1st Semester";

    }


    if (number === 2) {

        return "2nd Semester";

    }


    if (number === 3) {

        return "3rd Semester";

    }


    if (number === 4) {

        return "4th Semester";

    }


    if (number === 5) {

        return "5th Semester";

    }


    if (number === 6) {

        return "6th Semester";

    }


    return semester
        ? semester + " Semester"
        : "";

}



/* ==============================
   SAVE ORIGINAL VALUES
============================== */

function saveOriginalValues() {

    originalValues = {

        name:
            nameInput ? nameInput.value : "",

        phone:
            phoneInput ? phoneInput.value : "",

        email:
            emailInput ? emailInput.value : "",

        contactPhone:
            contactPhone ? contactPhone.value : "",

        contactEmail:
            contactEmail ? contactEmail.value : "",

        address:
            addressInput ? addressInput.value : ""

    };

}



/* ==============================
   RESTORE ORIGINAL VALUES
============================== */

function restoreOriginalValues() {

    if (nameInput) {

        nameInput.value =
            originalValues.name || "";

    }


    if (phoneInput) {

        phoneInput.value =
            originalValues.phone || "";

    }


    if (emailInput) {

        emailInput.value =
            originalValues.email || "";

    }


    if (contactPhone) {

        contactPhone.value =
            originalValues.contactPhone || "";

    }


    if (contactEmail) {

        contactEmail.value =
            originalValues.contactEmail || "";

    }


    if (addressInput) {

        addressInput.value =
            originalValues.address || "";

    }

}



/* ==============================
   LOAD STUDENT DATA
============================== */

async function loadStudentProfile() {

    try {

        const token =
            localStorage.getItem("token");


        if (!token || !student || !student.id) {

            console.error(
                "Student or token not found"
            );

            return;

        }


        const response =
            await fetch(
                "https://erp-portal-xgjf.onrender.com/student-data",
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


        if (!response.ok || !data.success) {

            console.error(
                data.message ||
                "Failed to load profile"
            );

            return;

        }


        /*
           Get the currently logged-in
           student's information
        */

        student =
            data.student;


        /*
           Update localStorage
        */

        localStorage.setItem(
            "student",
            JSON.stringify(student)
        );



        /* ==============================
           DISPLAY INFORMATION
        ============================== */

        if (displayName) {

            displayName.textContent =
                student.name || "N/A";

        }


        if (displayRoll) {

            displayRoll.textContent =
                student.roll_no || "N/A";

        }


        if (displayCourseSemester) {

            displayCourseSemester.textContent =
                `${getCourseName(student.course)} • ${getSemesterName(student.semester)}`;

        }



        /* ==============================
           PROFILE INFORMATION
        ============================== */

        if (nameInput) {

            nameInput.value =
                student.name || "";

        }


        if (rollNoInput) {

            rollNoInput.value =
                student.roll_no || "";

        }


        if (dobInput) {

            dobInput.value =
                formatDOB(student.dob);

        }


        if (genderInput) {

            genderInput.value =
                student.gender || "";

        }


        if (phoneInput) {

            phoneInput.value =
                student.phone || "";

        }


        if (emailInput) {

            emailInput.value =
                student.email || "";

        }


        if (courseInput) {

            courseInput.value =
                getCourseName(student.course);

        }


        if (semesterInput) {

            semesterInput.value =
                getSemesterName(student.semester);

        }


        if (sectionInput) {

            sectionInput.value =
                student.section || "";

        }


        if (sessionInput) {

            sessionInput.value =
                student.session || "";

        }


        if (departmentInput) {

            departmentInput.value =
                student.department || "";

        }



        /* ==============================
           CONTACT INFORMATION
        ============================== */

        if (contactPhone) {

            contactPhone.value =
                student.phone || "";

        }


        if (contactEmail) {

            contactEmail.value =
                student.email || "";

        }


        /*
           Address is not currently
           stored in the database.
        */

        if (addressInput) {

            addressInput.value =
                student.address || "";

        }



        /*
           Save values for CANCEL
        */

        saveOriginalValues();


    } catch (error) {

        console.error(
            "Error loading student profile:",
            error
        );

    }

}



/* ==============================
   LOAD PROFILE
============================== */

loadStudentProfile();



/* ==============================
   EDIT PROFILE
============================== */

if (editBtn) {

    editBtn.addEventListener(
        "click",
        () => {

            /*
               Save current values before
               allowing the user to edit.
            */

            saveOriginalValues();


            editableInputs.forEach(
                (input) => {

                    input.disabled = false;

                }
            );


            if (imageUpload) {

                imageUpload.disabled = false;

            }


            if (saveArea) {

                saveArea.style.display =
                    "flex";

            }


            editBtn.style.display =
                "none";

        }
    );

}



/* ==============================
   PROFILE IMAGE
============================== */

if (imageUpload) {

    imageUpload.addEventListener(
        "change",
        () => {

            const file =
                imageUpload.files[0];


            if (!file) {

                return;

            }


            const reader =
                new FileReader();


            reader.onload = function () {

                if (profileImage) {

                    profileImage.src =
                        reader.result;

                    profileImage.style.display =
                        "block";

                }


                if (defaultIcon) {

                    defaultIcon.style.display =
                        "none";

                }


                localStorage.setItem(
                    "profilePicture",
                    reader.result
                );

            };


            reader.readAsDataURL(file);

        }
    );

}



/* ==============================
   SAVE PROFILE
============================== */

if (saveBtn) {

    saveBtn.addEventListener(
        "click",
        async () => {

            if (!student) {

                alert(
                    "Student data not found."
                );

                return;

            }


            const token =
                localStorage.getItem("token");


            if (!token) {

                alert(
                    "Login session expired. Please login again."
                );

                return;

            }


            const updatedName =
                nameInput.value.trim();

            const updatedEmail =
                emailInput.value.trim();

            const updatedPhone =
                phoneInput.value.trim();



            /* ==============================
               BASIC VALIDATION
            ============================== */

            if (!updatedName) {

                alert(
                    "Name cannot be empty."
                );

                return;

            }


            if (!updatedEmail) {

                alert(
                    "Email cannot be empty."
                );

                return;

            }


            if (!updatedPhone) {

                alert(
                    "Phone number cannot be empty."
                );

                return;

            }



            try {

                const response =
                    await fetch(
                        `https://erp-portal-xgjf.onrender.com/student/${student.id}`,
                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        updatedName,

                                    email:
                                        updatedEmail,

                                    phone:
                                        updatedPhone,

                                    address:
                                        addressInput
                                            ? addressInput.value.trim()
                                            : ""

                                })

                        }
                    );


                const data =
                    await response.json();



                if (!response.ok || !data.success) {

                    alert(
                        data.message ||
                        "Failed to update profile."
                    );

                    return;

                }



                /*
                   Use the fresh student data
                   returned by the backend.
                */

                student =
                    data.student;


                /*
                   Update localStorage.
                */

                localStorage.setItem(
                    "student",
                    JSON.stringify(student)
                );



                /* ==============================
                   UPDATE DISPLAY
                ============================== */

                if (displayName) {

                    displayName.textContent =
                        student.name || "N/A";

                }


                if (displayRoll) {

                    displayRoll.textContent =
                        student.roll_no || "N/A";

                }


                if (displayCourseSemester) {

                    displayCourseSemester.textContent =
                        `${getCourseName(student.course)} • ${getSemesterName(student.semester)}`;

                }



                /* ==============================
                   UPDATE CONTACT
                ============================== */

                if (contactPhone) {

                    contactPhone.value =
                        student.phone || "";

                }


                if (contactEmail) {

                    contactEmail.value =
                        student.email || "";

                }



                /*
                   Disable editing
                */

                editableInputs.forEach(
                    (input) => {

                        input.disabled = true;

                    }
                );


                if (imageUpload) {

                    imageUpload.disabled = true;

                }


                if (editBtn) {

                    editBtn.style.display =
                        "block";

                }


                if (saveArea) {

                    saveArea.style.display =
                        "none";

                }


                /*
                   Save new values for future
                   Cancel operations.
                */

                saveOriginalValues();


                alert(
                    "Profile updated successfully!"
                );


            } catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );


                alert(
                    "Unable to connect to the server."
                );

            }

        }
    );

}



/* ==============================
   CANCEL
============================== */

if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        () => {

            /*
               Restore the values that existed
               before Edit was clicked.
            */

            restoreOriginalValues();


            editableInputs.forEach(
                (input) => {

                    input.disabled = true;

                }
            );


            if (imageUpload) {

                imageUpload.disabled = true;

            }


            if (editBtn) {

                editBtn.style.display =
                    "block";

            }


            if (saveArea) {

                saveArea.style.display =
                    "none";

            }

        }
    );

}



/* ==============================
   LOAD PROFILE PICTURE
============================== */

if (
    student &&
    student.profile_picture &&
    profileImage
) {

    profileImage.src =
        student.profile_picture;

    profileImage.style.display =
        "block";


    if (defaultIcon) {

        defaultIcon.style.display =
            "none";

    }

}