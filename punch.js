const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}

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


/* SHOW RECORD FROM DATABASE */

async function showPunchRecord(selected) {

    punchTable.innerHTML = "";

    const newDate = new Date(selected + "T00:00:00");

    const selectedDay = newDate.toLocaleDateString("en-US", {
        weekday: "long"
    });

let lunchTime = "";

if (selectedDay === "Monday" || selectedDay === "Tuesday") {
    lunchTime = "02:00 PM";
} else {
    lunchTime = "01:10 PM";
}

    const options = {
        day: "2-digit",
        month: "short",
        year: "numeric"
    };

    selectedDate.innerText =
        newDate.toLocaleDateString("en-IN", options);

    dayStatus.innerText = "Class Day";

    const student = JSON.parse(localStorage.getItem("student"));

    if (!student) {
        window.location.href = "index.html";
        return;
    }

    try {

        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/punch/${student.id}?date=${selected}`,
            {
                headers: {
                    "Authorization":
                        `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        const data = await response.json();

        if (!data.success) {
            console.error("Failed to load punch record");
            return;
        }

        const records = data.punch;

        let present = 0;
        let absent = 0;

        records.forEach((item) => {

    /* SHOW LUNCH */

    if (
        (selectedDay === "Monday" || selectedDay === "Tuesday") &&
        item.start_time === "02:00 PM"
    ) {
        const lunchRow = document.createElement("tr");

        lunchRow.innerHTML = `
            <td>
                <strong>🍴 LUNCH</strong>
            </td>

            <td>
                ${
                    selectedDay === "Monday" || selectedDay === "Tuesday"
                        ? "01:10 PM - 02:00 PM"
                        : "12:15 PM - 01:10 PM"
                }
            </td>

            <td>
                —
            </td>

            <td>
                —
            </td>

            <td>
                <span class="status lunch">
                    Lunch
                </span>
            </td>
        `;

        punchTable.appendChild(lunchRow);
    }

    if (
        (selectedDay === "Wednesday" ||
         selectedDay === "Thursday" ||
         selectedDay === "Friday") &&
        item.start_time === "01:10 PM"
    ) {
        const lunchRow = document.createElement("tr");

        lunchRow.innerHTML = `
            <td>
                <strong>🍴 LUNCH</strong>
            </td>

            <td>
                ${
                    selectedDay === "Monday" || selectedDay === "Tuesday"
                        ? "01:10 PM - 02:00 PM"
                        : "12:15 PM - 01:10 PM"
                }
            </td>

            <td>
                —
            </td>

            <td>
                —
            </td>

            <td>
                <span class="status lunch">
                    Lunch
                </span>
            </td>
        `;

        punchTable.appendChild(lunchRow);
    }


    /* ATTENDANCE COUNT */

    if (item.status === "Present") {
        present++;
    } else if (item.status === "Absent") {
        absent++;
    }


    /* SUBJECT ROW */

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>
            <strong>${item.subject}</strong>
        </td>

        <td>
            ${item.start_time} - ${item.end_time}
        </td>

        <td>
            ${item.room}
        </td>

        <td>
            ${item.punch_in}
        </td>

        <td>
            <span class="status ${item.status.toLowerCase().replace(" ", "-")}">
                ${item.status}
            </span>
        </td>
    `;

    punchTable.appendChild(row);

});

        const total = records.length;

        const percent = total > 0
            ? Math.round((present / total) * 100)
            : 0;

        presentCount.innerText = present;
        absentCount.innerText = absent;
        totalClasses.innerText = total;
        percentage.innerText = percent + "%";

    } catch (error) {

        console.error("Punch error:", error);

    }
}


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


const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});
