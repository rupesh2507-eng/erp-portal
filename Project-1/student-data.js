// =====================================================
// STUDENT ERP - COMMON DATA SYSTEM
// One system for every logged-in student
// =====================================================

const ERP_API = "https://erp-portal-xgjf.onrender.com";


// =====================================================
// FIND JWT TOKEN AUTOMATICALLY
// =====================================================

function getStudentToken() {

    // First check common names
    const commonKeys = [
        "token",
        "authToken",
        "jwtToken",
        "accessToken"
    ];

    for (const key of commonKeys) {

        const value = localStorage.getItem(key);

        if (
            value &&
            typeof value === "string" &&
            value.split(".").length === 3
        ) {
            return value;
        }

    }


    // If token uses another key,
    // automatically find a JWT in localStorage

    for (let i = 0; i < localStorage.length; i++) {

        const key = localStorage.key(i);

        const value = localStorage.getItem(key);

        if (
            value &&
            typeof value === "string" &&
            value.split(".").length === 3
        ) {
            return value;
        }

    }

    return null;
}


const studentToken = getStudentToken();


// =====================================================
// AUTOMATIC AUTHORIZATION FOR ALL BACKEND REQUESTS
// =====================================================

const originalFetch = window.fetch.bind(window);

window.fetch = function (input, options = {}) {

    const url =
        typeof input === "string"
            ? input
            : input.url;


    // Only add token to our backend requests

    if (
        url.startsWith(ERP_API) &&
        studentToken
    ) {

        const headers = new Headers(
            options.headers || {}
        );

        headers.set(
            "Authorization",
            `Bearer ${studentToken}`
        );

        options.headers = headers;

    }


    return originalFetch(
        input,
        options
    );

};


// =====================================================
// SAVE DATA LOCALLY
// =====================================================

function saveStudentData(data) {

    if (!data) {
        return;
    }


    if (data.student) {

        localStorage.setItem(
            "student",
            JSON.stringify(data.student)
        );

    }


    localStorage.setItem(
        "erpData",
        JSON.stringify(data)
    );

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    return dateValue;

}


// =====================================================
// UPDATE PROFILE PAGE
// =====================================================

function updateProfile(data) {

    const student = data.student;

    if (!student) {
        return;
    }


    // Header

    const displayName =
        document.getElementById("displayName");

    if (displayName) {
        displayName.textContent =
            student.name || "";
    }


    const displayRoll =
        document.getElementById("displayRoll");

    if (displayRoll) {
        displayRoll.textContent =
            student.roll_no || "";
    }


    // All information boxes

    const informationBoxes =
        document.querySelectorAll(
            ".information-box"
        );


    informationBoxes.forEach(box => {

        const label =
            box.querySelector("p");

        const input =
            box.querySelector("input");

        if (!label || !input) {
            return;
        }


        const title =
            label.textContent
                .trim()
                .toLowerCase();


        if (title === "full name") {

            input.value =
                student.name || "";

        }


        else if (title === "student id") {

            input.value =
                student.roll_no || "";

        }


        else if (title === "date of birth") {

            input.value =
                formatDate(student.dob);

        }


        else if (title === "gender") {

            input.value =
                student.gender || "";

        }


        else if (
            title === "mobile number"
        ) {

            input.value =
                student.phone || "";

        }


        else if (title === "email") {

            input.value =
                student.email || "";

        }


        else if (title === "course") {

            input.value =
                student.course || "";

        }


        else if (title === "semester") {

            input.value =
                student.semester
                    ? `${student.semester}th Semester`
                    : "";

        }


        else if (title === "section") {

            input.value =
                student.section || "";

        }


        else if (title === "session") {

            input.value =
                student.session || "";

        }


        else if (title === "department") {

            input.value =
                student.department || "";

        }

    });


    // Contact information

    const phone =
        document.getElementById("contactPhone");

    if (phone) {
        phone.value =
            student.phone || "";
    }


    const email =
        document.getElementById("contactEmail");

    if (email) {
        email.value =
            student.email || "";
    }


    // Keep address unchanged because
    // the students table currently has
    // no address column.

}


// =====================================================
// CALCULATE ATTENDANCE
// =====================================================

function getAttendanceSummary(attendance) {

    let attended = 0;

    let total = 0;


    attendance.forEach(item => {

        attended +=
            Number(item.attended) || 0;

        total +=
            Number(item.total) || 0;

    });


    const percentage =
        total > 0
            ? Math.round(
                (attended / total) * 100
            )
            : null;


    return {

        attended,
        total,
        percentage

    };

}


// =====================================================
// UPDATE DASHBOARD
// =====================================================

function updateDashboard(data) {

    const student =
        data.student;

    const attendance =
        data.attendance || [];

    const courses =
        data.courses || [];

    const results =
        data.results || [];

    const fees =
        data.fees;


    // -------------------------------------
    // STUDENT NAME
    // -------------------------------------

    const possibleNameElements = [

        document.getElementById(
            "displayName"
        ),

        document.querySelector(
            ".student-name h2"
        )

    ];


    possibleNameElements.forEach(element => {

        if (element && student) {

            element.textContent =
                student.name || "";

        }

    });


    // -------------------------------------
    // ATTENDANCE
    // -------------------------------------

    const attendanceSummary =
        getAttendanceSummary(
            attendance
        );


    const attendanceCards =
        document.querySelectorAll(
            ".attandance p"
        );


    attendanceCards.forEach(element => {

        element.textContent =
            attendanceSummary.percentage === null
                ? "N/A"
                : `${attendanceSummary.percentage}%`;

    });


    // -------------------------------------
    // COURSES
    // -------------------------------------

    const courseElements =
        document.querySelectorAll(
            ".courses p"
        );


    courseElements.forEach(element => {

        element.textContent =
            `${courses.length} Subjects`;

    });


    // -------------------------------------
    // FEES
    // -------------------------------------

    const dueElements =
        document.querySelectorAll(
            ".dues p"
        );


    dueElements.forEach(element => {

        const due =
            fees
                ? Number(fees.due_fee) || 0
                : 0;


        element.textContent =
            `₹ ${due}`;

    });


    // -------------------------------------
    // RESULTS
    // -------------------------------------

    const resultElements =
        document.querySelectorAll(
            ".result p"
        );


    if (results.length === 0) {

        resultElements.forEach(element => {

            element.textContent =
                "N/A";

        });

    }

    else {

        let totalMarks = 0;

        let maxMarks = 0;


        results.forEach(result => {

            totalMarks +=
                Number(result.marks) || 0;

            maxMarks +=
                Number(result.max_marks) || 0;

        });


        const percentage =
            maxMarks > 0
                ? Math.round(
                    (totalMarks / maxMarks) * 100
                )
                : null;


        resultElements.forEach(element => {

            element.textContent =
                percentage === null
                    ? "N/A"
                    : `${percentage}%`;

        });

    }

}


// =====================================================
// UPDATE ATTENDANCE PAGE
// =====================================================

function updateAttendancePage(data) {

    const attendance =
        data.attendance || [];


    const summary =
        getAttendanceSummary(
            attendance
        );


    const overall =
        document.querySelector(
            ".overall p"
        );

    if (overall) {

        overall.textContent =
            summary.percentage === null
                ? "N/A"
                : `${summary.percentage}%`;

    }


    const total =
        document.querySelector(
            ".total p"
        );

    if (total) {

        total.textContent =
            summary.total;

    }


    const present =
        document.querySelector(
            ".present p"
        );

    if (present) {

        present.textContent =
            summary.attended;

    }


    const absent =
        document.querySelector(
            ".absent p"
        );

    if (absent) {

        absent.textContent =
            summary.total -
            summary.attended;

    }


    // Subject-wise attendance

    const subjects =
        document.querySelectorAll(
            ".subject"
        );


    subjects.forEach(subjectElement => {

        const nameElement =
            subjectElement.querySelector(
                ".subject-name"
            );


        if (!nameElement) {
            return;
        }


        const subjectName =
            nameElement.textContent
                .trim()
                .toLowerCase();


        const record =
            attendance.find(item =>
                item.subject
                    .toLowerCase()
                    .includes(subjectName) ||
                subjectName.includes(
                    item.subject.toLowerCase()
                )
            );


        if (!record) {
            return;
        }


        const percentage =
            Number(record.total) > 0
                ? Math.round(
                    (
                        Number(record.attended) /
                        Number(record.total)
                    ) * 100
                )
                : 0;


        const bar =
            subjectElement.querySelector(
                ".progress-bar"
            );


        if (bar) {

            bar.style.width =
                `${percentage}%`;

        }


        const percent =
            subjectElement.querySelector(
                "strong"
            );


        if (percent) {

            percent.textContent =
                `${percentage}%`;

        }

    });

}


// =====================================================
// MAIN DATA LOADER
// =====================================================

async function loadStudentERPData() {

    if (!studentToken) {

        console.warn(
            "Student ERP: JWT token not found."
        );

        return;

    }


    try {

        const response =
            await originalFetch(
                `${ERP_API}/student-data`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${studentToken}`
                    }
                }
            );


        if (!response.ok) {

            console.error(
                "Student data request failed:",
                response.status
            );

            return;

        }


        const data =
            await response.json();


        if (!data.success) {

            console.error(
                "Student data error:",
                data.message
            );

            return;

        }


        // Save everything

        saveStudentData(data);


        // Make globally available

        window.studentERP =
            data;


        // Update pages

        updateProfile(data);

        updateDashboard(data);

        updateAttendancePage(data);


        console.log(
            "Student ERP data loaded:",
            data.student.name
        );


    } catch (error) {

        console.error(
            "Student ERP data loading error:",
            error
        );

    }

}


// =====================================================
// RUN AFTER HTML LOAD
// =====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        loadStudentERPData
    );

}

else {

    loadStudentERPData();

}