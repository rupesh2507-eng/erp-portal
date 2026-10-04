const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}

const today = document.querySelector("#today");
const timeTable = document.querySelector("#timeTable");
const noClass = document.querySelector("#noClass");

const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const day = new Date().getDay();
const todayName = days[day];

today.innerText = todayName;


/* ICON FOR EACH SUBJECT */

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

    if (subject.includes("National Cadet")) {
        return "fa-flag";
    }

    return "fa-book";
}


/* LOAD TIMETABLE */

async function loadTimetable() {

    const student = JSON.parse(localStorage.getItem("student"));

    if (!student) {
        window.location.href = "index.html";
        return;
    }

    /* WEEKEND */

    if (day === 0 || day === 6) {

        noClass.style.display = "block";
        timeTable.innerHTML = "";

        return;
    }


    try {

        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/timetable/${student.id}`,
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const data = await response.json();

        if (!data.success) {
            console.error("Failed to load timetable");
            return;
        }


        /* ONLY TODAY'S CLASSES */

        const classes = data.timetable.filter(
            item => item.day === todayName
        );


        if (classes.length === 0) {

            noClass.style.display = "block";
            return;

        }


        /* SORT BY START TIME */

        classes.sort((a, b) => {

            return convertTime(a.start_time) -
                   convertTime(b.start_time);

        });


        /* ADD LUNCH */

        const finalClasses = [];

        classes.forEach((item) => {

            finalClasses.push(item);


            const endTime = item.end_time;

            if (
                (todayName === "Monday" ||
                 todayName === "Tuesday") &&
                endTime === "01:10 PM"
            ) {

                finalClasses.push({
                    start_time: "01:10 PM",
                    end_time: "02:00 PM",
                    subject: "Lunch",
                    room: "",
                    lunch: true
                });

            }


            if (
                (todayName === "Wednesday" ||
                 todayName === "Thursday" ||
                 todayName === "Friday") &&
                endTime === "12:15 PM"
            ) {

                finalClasses.push({
                    start_time: "12:15 PM",
                    end_time: "01:10 PM",
                    subject: "Lunch",
                    room: "",
                    lunch: true
                });

            }

        });


        /* DISPLAY */

        timeTable.innerHTML = "";

        finalClasses.forEach((item) => {

            const classBox =
                document.createElement("div");

            classBox.classList.add("class-box");


            if (item.lunch) {
                classBox.classList.add("lunch");
            }


            const icon =
                item.lunch
                    ? "fa-utensils"
                    : getSubjectIcon(item.subject);


            classBox.innerHTML = `

                <div class="class-time">

                    <i class="fa-regular fa-clock"></i>

                    ${item.start_time} - ${item.end_time}

                </div>


                <div class="class-icon">

                    <i class="fa-solid ${icon}"></i>

                </div>


                <div class="class-info">

                    <h3>${item.subject}</h3>

                    <p>
                        ${item.lunch ? "Break Time" : "Today's Class"}
                    </p>

                </div>


                ${
                    item.room
                    ?
                    `
                    <div class="room">
                        ${item.room}
                    </div>
                    `
                    :
                    ""
                }

            `;


            timeTable.appendChild(classBox);

        });


    } catch (error) {

        console.error("Timetable error:", error);

    }

}


/* CONVERT TIME TO MINUTES */

function convertTime(time) {

    const [clock, modifier] = time.split(" ");

    let [hours, minutes] = clock.split(":");

    hours = parseInt(hours);

    if (modifier === "PM" && hours !== 12) {
        hours += 12;
    }

    if (modifier === "AM" && hours === 12) {
        hours = 0;
    }

    return hours * 60 + parseInt(minutes);

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

loadTimetable();