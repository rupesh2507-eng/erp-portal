const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}


const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");


icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});


const student = JSON.parse(localStorage.getItem("student"));

if (!student) {
    window.location.href = "index.html";
}


const token = localStorage.getItem("token");


// =====================================================
// LOAD ATTENDANCE
// =====================================================

async function loadAttendance() {

    try {

        const attendanceResponse =
            await fetch(
                `https://erp-portal-xgjf.onrender.com/attendance/${student.id}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


        const attendanceData =
            await attendanceResponse.json();


        if (!attendanceData.success) {
            console.error("Attendance failed");
            return;
        }


        const attendance =
            attendanceData.attendance || [];


        // =============================================
        // LOAD COURSES
        // =============================================

        const coursesResponse =
            await fetch(
                `https://erp-portal-xgjf.onrender.com/courses/${student.id}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


        const coursesData =
            await coursesResponse.json();


        if (!coursesData.success) {
            console.error("Courses failed");
            return;
        }


        const courses =
            coursesData.courses || [];


        // =============================================
        // OVERALL ATTENDANCE
        // =============================================

        let totalAttended = 0;
        let totalClasses = 0;


        attendance.forEach(item => {

            totalAttended +=
                Number(item.attended) || 0;

            totalClasses +=
                Number(item.total) || 0;

        });


        const overallPercentage =
            totalClasses > 0
                ? Math.round(
                    (totalAttended / totalClasses) * 100
                )
                : 0;


        const absentDays =
            totalClasses - totalAttended;


        document.querySelector(
            ".overall-text h1"
        ).innerText =
            overallPercentage + "%";


        document.querySelector(
            ".overall-text span"
        ).innerText =
            `${totalAttended} Present out of ${totalClasses} Days`;


        document.querySelector(
            ".circle span"
        ).innerText =
            overallPercentage + "%";


        const cards =
            document.querySelectorAll(
                ".attendance-card"
            );


        cards[0]
            .querySelector("h2")
            .innerText =
            totalClasses;


        cards[1]
            .querySelector("h2")
            .innerText =
            totalAttended;


        cards[2]
            .querySelector("h2")
            .innerText =
            absentDays;


        // =============================================
        // SUBJECT SECTION
        // =============================================

        const subjectSection =
            document.querySelector(
                ".subject-section"
            );


        const oldSubjects =
            subjectSection.querySelectorAll(
                ".subject"
            );


        if (oldSubjects.length === 0) {
            return;
        }


        // First BCA box is used only as a template
        const template =
            oldSubjects[0].cloneNode(true);


        // Remove all fixed BCA subjects
        oldSubjects.forEach(box => {
            box.remove();
        });


        // =============================================
        // CREATE SUBJECTS FROM COURSES
        // =============================================

        courses.forEach(course => {

            const box =
                template.cloneNode(true);


            const name =
                course.subject_name;


            const subjectName =
                box.querySelector(
                    ".subject-name span"
                );


            const percentageText =
                box.querySelector(
                    "strong"
                );


            const progressBar =
                box.querySelector(
                    ".progress-bar"
                );


            const subjectIcon =
                box.querySelector(
                    ".subject-name i"
                );


            // -----------------------------------------
            // SUBJECT NAME
            // -----------------------------------------

            subjectName.innerText =
                name;


            // -----------------------------------------
            // FIND ATTENDANCE
            // -----------------------------------------

            const record =
                attendance.find(item =>
                    Number(item.course_id) ===
                    Number(course.id)
                );


            let percentage = 0;


            if (
                record &&
                Number(record.total) > 0
            ) {

                percentage =
                    Math.round(
                        (
                            Number(record.attended) /
                            Number(record.total)
                        ) * 100
                    );

            }


            // -----------------------------------------
            // SHOW PERCENTAGE
            // -----------------------------------------

            percentageText.innerText =
                percentage + "%";


            // -----------------------------------------
            // MOVE PROGRESS BAR
            // -----------------------------------------

            progressBar.style.width =
                percentage + "%";


            // -----------------------------------------
            // ICONS
            // -----------------------------------------

            const lowerName =
                name.toLowerCase();


            subjectIcon.className =
                "fa-solid fa-book";


            if (
                lowerName.includes("management accounting")
            ) {

                subjectIcon.className =
                    "fa-solid fa-calculator";

            }

            else if (
                lowerName.includes("business ethics")
            ) {

                subjectIcon.className =
                    "fa-solid fa-scale-balanced";

            }

            else if (
                lowerName.includes("human resource")
            ) {

                subjectIcon.className =
                    "fa-solid fa-users";

            }

            else if (
                lowerName.includes("information system")
            ) {

                subjectIcon.className =
                    "fa-solid fa-computer";

            }

            else if (
                lowerName.includes("universal human")
            ) {

                subjectIcon.className =
                    "fa-solid fa-heart";

            }

            else if (
                lowerName.includes("yoga") ||
                lowerName.includes("sports")
            ) {

                subjectIcon.className =
                    "fa-solid fa-person-running";

            }

            else if (
                lowerName.includes("database") ||
                lowerName.includes("dbms")
            ) {

                subjectIcon.className =
                    "fa-solid fa-database";

            }

            else if (
                lowerName.includes("operating")
            ) {

                subjectIcon.className =
                    "fa-solid fa-desktop";

            }

            else if (
                lowerName.includes("architecture")
            ) {

                subjectIcon.className =
                    "fa-solid fa-microchip";

            }

            else if (
                lowerName.includes("network")
            ) {

                subjectIcon.className =
                    "fa-solid fa-network-wired";

            }

            else if (
                lowerName.includes("web")
            ) {

                subjectIcon.className =
                    "fa-solid fa-globe";

            }


            subjectSection.appendChild(box);

        });

    }

    catch (error) {

        console.error(
            "Attendance error:",
            error
        );

    }

}


loadAttendance();