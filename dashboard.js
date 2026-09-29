const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});

const classList = document.querySelector("#classList");
const today = document.querySelector("#today");

const timetable = {

    Monday: [
        ["10:25 - 11:20", "CSA (Tutorial)", "R-307"],
        ["11:20 - 12:15", "DBMS", "R-304"],
        ["12:15 - 01:10", "CSA", "R-304"],
        ["01:10 - 02:00", "LUNCH"],
        ["02:00 - 02:50", "DCN", "R-304"],
        ["02:50 - 03:40", "OS", "R-304"]
    ],

    Tuesday: [
        ["10:25 - 11:20", "CSA", "R-304"],
        ["11:20 - 12:15", "DCN", "R-304"],
        ["12:15 - 01:10", "NCC", "R-304"],
        ["01:10 - 02:00", "LUNCH"],
        ["02:00 - 02:50", "DBMS", "R-204"]
        ["02:50 - 03:40", "OS", "R-204"],
    ],

    Wednesday: [
        ["10:25 - 11:20", "WD", "R-204"],
        ["11:20 - 12:15", "OS", "R-204"],
        ["12:15 - 01:00", "LUNCH"],
        ["01:10 - 02:00", "Project (Lab)", "L-C8"],
        ["02:00 - 03:40", "DBMS (Lab)", "L-C7"],
    ],

    Thursday: [
        ["10:25 - 11:20", "DCN", "R-204"],
        ["11:20 - 12:15", "WD", "R-204"],
        ["12:15 - 01:00", "LUNCH"],
        ["01:10 - 02:00", "CSA", "R-204"],
        ["02:00 - 03:40", "WD (Lab)", "L-C8"],
    ],

    Friday: [
        ["10:25 - 11:20", "OS (Tutorial)", "R-307"],
        ["11:20 - 12:15", "DBMS", "R-204"],
        ["12:15 - 01:00", "LUNCH"],
        ["01:10 - 02:00", "Project (lab)", "L-C3"],
        ["02:00 - 02:50", "DCN", "R-204"],
        ["02:50 - 03:40", "WD", "R-204"],
    ],

    Saturday: [],

    Sunday: []

};


function showClasses() {

    const day = new Date().toLocaleDateString("en-US", {
        weekday: "long"
    });

    today.innerText = day + " Schedule";

    const classes = timetable[day];

    classList.innerHTML = "";

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
                    ${item[0]}
                </div>

                <div class="class-info">
                    <h4>${item[1]}</h4>
                    <p>Today's Class</p>
                </div>

                <div class="class-room">
                    ${item[2]}
                </div>

            </div>
        `;

    });

}

showClasses();

const noticeItems =
    document.querySelectorAll(".notice-item");

noticeItems.forEach((notice) => {

    notice.addEventListener("click", () => {

        window.location.href = "notices.html";

    });

});