const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});


const subjects = [
    {
        name: "DBMS",
        present: 14.1,
        total: 20
    },
    {
        name: "Operating System",
        present: 15,
        total: 20
    },
    {
        name: "Computer System Architecture",
        present: 17,
        total: 22
    },
    {
        name: "Web Designing Fundamental",
        present: 16,
        total: 20
    },
    {
        name: "Data Communication & Networking",
        present: 18,
        total: 20
    },
    {
        name: "NCC",
        present: 14,
        total: 20
    },
    {
        name: "Project Lab",
        present: 17,
        total: 20
    }
];


const subjectBoxes = document.querySelectorAll(".subject");


subjectBoxes.forEach((box, index) => {

    const subject = subjects[index];

    if (!subject) return;

    const percentage = Math.round(
        (subject.present / subject.total) * 100
    );

    const progressBar = box.querySelector(".progress-bar");
    const percentageText = box.querySelector("strong");


    progressBar.style.width = percentage + "%";

    percentageText.innerText = percentage + "%";

});