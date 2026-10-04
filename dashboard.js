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

const classList = document.querySelector("#classList");
const today = document.querySelector("#today");


async function showClasses() {

    const student = JSON.parse(
        localStorage.getItem("student")
    );

    if (!student) {
        window.location.href = "index.html";
        return;
    }

    const day = new Date().toLocaleDateString("en-US", {
        weekday: "long"
    });

    today.innerText = day + " Schedule";

    classList.innerHTML = "";

    if (day === "Saturday" || day === "Sunday") {

        classList.innerHTML = `
            <p class="no-class">
                No classes scheduled today
            </p>
        `;

        return;
    }

    try {

        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/timetable/${student.id}`
        );

        const data = await response.json();

        if (!data.success) {
            return;
        }

        const classes = data.timetable.filter(
            item => item.day === day
        );

        if (classes.length === 0) {

            classList.innerHTML = `
                <p class="no-class">
                    No classes scheduled today
                </p>
            `;

            return;
        }

        classes.forEach((item) => {

            classList.innerHTML += `
                <div class="class-item">

                    <div class="class-time">
                        ${item.start_time} - ${item.end_time}
                    </div>

                    <div class="class-info">
                        <h4>${item.subject}</h4>
                        <p>Today's Class</p>
                    </div>

                    <div class="class-room">
                        ${item.room}
                    </div>

                </div>
            `;

        });

    } catch (error) {

        console.error(
            "Dashboard timetable error:",
            error
        );

        classList.innerHTML = `
            <p class="no-class">
                Unable to load today's classes
            </p>
        `;

    }

}

showClasses();

const noticeItems =
    document.querySelectorAll(".notice-item");

noticeItems.forEach((notice) => {

    notice.addEventListener("click", () => {

        window.location.href = "notices.html";

    });

});


async function loadAttendance() {

    const student = JSON.parse(
        localStorage.getItem("student")
    );

    if (!student) {
        return;
    }

    try {

        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/attendance/${student.id}`
        );

        const data = await response.json();

        const attendanceElement =
            document.querySelector(".attandance p");

        if (!attendanceElement) {
            return;
        }

        if (!data.success || data.attendance.length === 0) {

            attendanceElement.innerText = "N/A";

            return;
        }

        let attended = 0;
        let total = 0;

        data.attendance.forEach((item) => {

            attended += Number(item.attended);
            total += Number(item.total);

        });

        const percentage =
            total > 0
                ? (attended / total) * 100
                : 0;

        attendanceElement.innerText =
            percentage.toFixed(1) + "%";

    } catch (error) {

        console.error(
            "Dashboard attendance error:",
            error
        );

    }

}

loadAttendance();

async function loadCourseCount() {

    const student = JSON.parse(
        localStorage.getItem("student")
    );

    if (!student) {
        return;
    }

    try {

        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/courses/${student.id}`
        );

        const data = await response.json();

        if (!data.success) {
            return;
        }

        const courseElement =
            document.querySelector(".courses p");

        if (courseElement) {

            courseElement.innerText =
                data.courses.length + " Subjects";

        }

    } catch (error) {

        console.error(
            "Dashboard courses error:",
            error
        );

    }

}

loadCourseCount();

async function loadResult() {

    const student = JSON.parse(
        localStorage.getItem("student")
    );

    if (!student) {
        return;
    }

    try {

        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/results/${student.id}`
        );

        const data = await response.json();

        const resultElement =
            document.querySelector(".result p");

        if (!resultElement) {
            return;
        }

        // No result records
        if (!data.success || data.results.length === 0) {

            resultElement.innerText = "N/A";

            return;
        }

        let totalMarks = 0;
        let obtainedMarks = 0;

        data.results.forEach((result) => {

            totalMarks += Number(result.max_marks);
            obtainedMarks += Number(result.marks);

        });

        const percentage =
            (obtainedMarks / totalMarks) * 100;

        resultElement.innerText =
            percentage.toFixed(1) + "%";

    } catch (error) {

        console.error(
            "Dashboard result error:",
            error
        );

    }

}

loadResult();

async function loadStudentDues() {

    const student = JSON.parse(
        localStorage.getItem("student")
    );

    if (!student) {
        return;
    }

    try {

        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/fees/${student.id}`
        );

        const data = await response.json();

        if (!data.success || !data.fees) {
            return;
        }

        const duesElement =
            document.querySelector(".dues p");

        if (duesElement) {

            duesElement.innerText =
                "₹ " +
                Number(data.fees.due_fee)
                    .toLocaleString("en-IN");

        }

    } catch (error) {

        console.error(
            "Dashboard fees error:",
            error
        );

    }

}

loadStudentDues();

async function loadRecentNotices() {

    const noticeContainer =
        document.querySelector(".notices");

    if (!noticeContainer) return;

    try {

        const response =
            await fetch("https://erp-portal-xgjf.onrender.com/notices");

        const data = await response.json();

        if (!data.success) return;

        const noticeItems =
            noticeContainer.querySelectorAll(".notice-item");

        noticeItems.forEach(item => item.remove());


        const latestNotices =
            data.notices.slice(0, 3);


        latestNotices.forEach((notice) => {

            const noticeItem =
                document.createElement("div");

            noticeItem.className = "notice-item";

            noticeItem.innerHTML = `

                <div class="notice-icon exam">

                    <i class="fa-solid fa-bullhorn"></i>

                </div>

                <div class="notice-text">

                    <h4>${notice.title}</h4>

                    <p>
                        ${notice.message}
                    </p>

                    <span>

                        <i class="fa-regular fa-calendar"></i>

                        ${new Date(notice.created_at).toLocaleDateString(
                            "en-GB",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        )}

                    </span>

                </div>

                <i class="fa-solid fa-chevron-right notice-arrow"></i>

            `;

            noticeContainer.appendChild(noticeItem);

        });

    } catch (error) {

        console.error(
            "Dashboard notices error:",
            error
        );

    }

}

loadRecentNotices();