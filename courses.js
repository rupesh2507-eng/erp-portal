const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}


const courseContainer = document.querySelector(".course-container");

const student = JSON.parse(localStorage.getItem("student"));

if (!student) {
    window.location.href = "index.html";
}

/* COURSE ICONS */

function getCourseIcon(code) {

    if (code === "BCA-301") {
        return "fa-database";
    }

    if (code === "BCA-302" || code === "BCA-307") {
        return "fa-code";
    }

    if (code === "BCA-303") {
        return "fa-microchip";
    }

    if (code === "BCA-304") {
        return "fa-desktop";
    }

    if (code === "BCA-305") {
        return "fa-network-wired";
    }

    if (code === "BCA-306") {
        return "fa-database";
    }

    if (code === "BCA-308") {
        return "fa-laptop-code";
    }

    if (code === "NSS-001 / NCC-001") {
        return "fa-people-group";
    }

    return "fa-book";
}


/* LOAD COURSES */

async function loadCourses() {

    try {

        const token = localStorage.getItem("token");

            const response = await fetch(
                `https://erp-portal-xgjf.onrender.com/courses/${student.id}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

        const data = await response.json();

        if (!data.success) {
            console.error("Failed to load courses");
            return;
        }

        courseContainer.innerHTML = "";

        data.courses.forEach((course) => {

            const courseBox = document.createElement("div");

            courseBox.className = "course-box";

            courseBox.innerHTML = `
                <div class="course-icon">
                    <i class="fa-solid ${getCourseIcon(course.subject_code)}"></i>
                </div>

                <div class="course-content">
                    <h2>${course.subject_name}</h2>
                    <p>Code : ${course.subject_code}</p>
                    <p>Credits : ${course.credits}</p>
                </div>

                <div class="course-button">
                    <button>View Details</button>
                </div>
            `;

            courseContainer.appendChild(courseBox);

        });

        /* VIEW DETAILS BUTTON */

        const buttons =
            document.querySelectorAll(".course-button button");

        buttons.forEach((button) => {

            button.addEventListener("click", () => {

                const course =
                    button.parentElement.parentElement;

                const name =
                    course.querySelector("h2").innerText;

                alert("You selected : " + name);

            });

        });

    } catch (error) {

        console.error("Courses error:", error);

    }
}


/* SIDEBAR */

const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {

    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");

});


/* START */

loadCourses();