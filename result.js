const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}

const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

const semesterSelect = document.querySelector("#semester");
const resultTable = document.querySelector(".result-table");


/* SIDEBAR */

icon.addEventListener("click", () => {

    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");

});


/* SUBJECT ICON */

function getSubjectIcon(subject) {

    if (subject.includes("Database")) {
        return "fa-database";
    }

    if (subject.includes("Operating System")) {
        return "fa-desktop";
    }

    if (subject.includes("Computer System Architecture")) {
        return "fa-microchip";
    }

    if (subject.includes("Data Communication")) {
        return "fa-network-wired";
    }

    if (subject.includes("Web Designing")) {
        return "fa-globe";
    }

    if (subject.includes("Project")) {
        return "fa-flask";
    }

    if (subject.includes("NSS") || subject.includes("NCC")) {
        return "fa-flag";
    }

    return "fa-book";
}


/* LOAD RESULTS */

async function loadResults() {

    const student = JSON.parse(
        localStorage.getItem("student")
    );

    if (!student) {
        window.location.href = "index.html";
        return;
    }


    try {

        const token = localStorage.getItem("token");

        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/results/${student.id}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!data.success) {
            console.error("Failed to load results");
            return;
        }


        displayResults(data.results);

    } catch (error) {

        console.error("Results error:", error);

    }

}


/* DISPLAY RESULTS */

function displayResults(results) {

    const tableHeading = document.querySelector(".table-heading");

    resultTable.innerHTML = "";

    resultTable.appendChild(tableHeading);


    results.forEach((result) => {

        const row = document.createElement("div");

        row.classList.add("result-row");


        row.innerHTML = `

            <div>

                <i class="fa-solid ${getSubjectIcon(result.subject)}"></i>

                ${result.subject}

            </div>

            <span>${result.max_marks}</span>

            <span>${result.marks}</span>

            <strong>${result.grade}</strong>

        `;


        resultTable.appendChild(row);

    });


    updateSummary(results);

}


/* UPDATE SUMMARY */

function updateSummary(results) {

    if (results.length === 0) {
        return;
    }


    let totalMarks = 0;
    let obtainedMarks = 0;


    results.forEach((result) => {

        totalMarks += Number(result.max_marks);
        obtainedMarks += Number(result.marks);

    });


    const percentage =
        (obtainedMarks / totalMarks) * 100;


    const percentageElement =
        document.querySelector(
            ".result-card:nth-child(2) h2"
        );


    if (percentageElement) {

        percentageElement.innerText =
            percentage.toFixed(1) + "%";

    }


    const statusElement =
        document.querySelector(
            ".result-card:nth-child(4) h2"
        );


    if (statusElement) {

        statusElement.innerText = "Pass";

    }

}


/* SEMESTER */

semesterSelect.addEventListener("change", () => {

    loadResults();

});


/* START */

loadResults();