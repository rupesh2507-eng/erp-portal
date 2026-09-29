const date = document.querySelector("#date");

const punchTable = document.querySelector("#punchTable");

const holiday = document.querySelector("#holiday");

const selectedDate = document.querySelector("#selectedDate");

const dayStatus = document.querySelector("#dayStatus");

const presentCount = document.querySelector("#presentCount");

const absentCount = document.querySelector("#absentCount");

const totalClasses = document.querySelector("#totalClasses");

const percentage = document.querySelector("#percentage");


/* HOLIDAYS */

const holidays = [
    "2026-09-05",
    "2026-09-06",
    "2026-09-12",
    "2026-09-13",
    "2026-09-19",
    "2026-09-20",
    "2026-09-26",
    "2026-09-27",
    "2026-10-03",
    "2026-10-04"
];


/* SUBJECT DATA */

const subjects = [

    {
        subject: "CSA",
        time: "10:25 - 11:20",
        room: "R-307",
        punch: "10:18 AM",
        status: "Present"
    },

    {
        subject: "DBMS",
        time: "11:20 - 12:15",
        room: "R-204",
        punch: "11:12 AM",
        status: "Present"
    },

    {
        subject: "CSA",
        time: "12:15 - 01:10",
        room: "R-204",
        punch: "12:20 PM",
        status: "Present"
    },

    {
        subject: "DCN",
        time: "02:00 - 02:50",
        room: "R-204",
        punch: "--",
        status: "Absent"
    },

    {
        subject: "OS",
        time: "02:50 - 03:40",
        room: "R-204",
        punch: "02:45 PM",
        status: "Present"
    }

];


/* DATE CHANGE */

date.addEventListener("change", () => {

    const selected = date.value;

    if (selected === "") {
        return;
    }


    /* HOLIDAY */

    if (holidays.includes(selected)) {

        holiday.style.display = "flex";

        punchTable.innerHTML = "";

        selectedDate.innerText =
            "No classes on this date";

        dayStatus.innerText = "Holiday";

        presentCount.innerText = "0";

        absentCount.innerText = "0";

        totalClasses.innerText = "0";

        percentage.innerText = "0%";

        return;
    }


    /* NORMAL DAY */

    holiday.style.display = "none";

    showPunchRecord(selected);

});


/* SHOW RECORD */

function showPunchRecord(selected) {

    punchTable.innerHTML = "";

    const newDate = new Date(selected);

    const options = {
        day: "2-digit",
        month: "short",
        year: "numeric"
    };

    selectedDate.innerText =
        newDate.toLocaleDateString("en-IN", options);

    dayStatus.innerText = "Class Day";


    let present = 0;

    let absent = 0;


    subjects.forEach((item) => {

        if (item.status === "Present") {

            present++;

        } else {

            absent++;

        }


        const row = document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>${item.subject}</strong>
            </td>

            <td>
                ${item.time}
            </td>

            <td>
                ${item.room}
            </td>

            <td>
                ${item.punch}
            </td>

            <td>

                <span class="status ${item.status.toLowerCase()}">

                    ${item.status}

                </span>

            </td>

        `;


        punchTable.appendChild(row);

    });


    const total = subjects.length;

    const percent = Math.round(
        (present / total) * 100
    );


    presentCount.innerText = present;

    absentCount.innerText = absent;

    totalClasses.innerText = total;

    percentage.innerText = percent + "%";

}

const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});
