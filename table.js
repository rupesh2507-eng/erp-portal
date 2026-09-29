const today = document.querySelector("#today");

const timeTable = document.querySelector("#timeTable");

const noClass = document.querySelector("#noClass");



const day = new Date().getDay();



const days = [

    "Sunday",

    "Monday",

    "Tuesday",

    "Wednesday",

    "Thursday",

    "Friday",

    "Saturday"

];



today.innerText = days[day];



const timetable = {


    Monday: [

        {
            time: "10:25 - 11:20",
            subject: "Computer System Architecture (Tutorial)",
            room: "R-307",
            icon: "fa-microchip"
        },

        {
            time: "11:20 - 12:15",
            subject: "Database Management System",
            room: "R-304",
            icon: "fa-database"
        },

        {
            time: "12:15 - 01:10",
            subject: "Computer System Architecture",
            room: "R-304",
            icon: "fa-microchip"
        },

        {
            time: "01:10 - 02:00",
            subject: "Lunch",
            room: "",
            icon: "fa-utensils",
            lunch: true
        },

        {
            time: "02:00 - 02:50",
            subject: "Data Communication & Networking",
            room: "R-304",
            icon: "fa-network-wired"
        },

        {
            time: "02:50 - 03:40",
            subject: "Operating System",
            room: "R-304",
            icon: "fa-desktop"
        }

    ],



    Tuesday: [

        {
            time: "10:25 - 11:20",
            subject: "Computer System Architecture",
            room: "R-304",
            icon: "fa-microchip"
        },

        {
            time: "11:20 - 12:15",
            subject: "Data Communication & Networking",
            room: "R-304",
            icon: "fa-network-wired"
        },

        {
            time: "12:15 - 01:10",
            subject: "NCC",
            room: "R-304",
            icon: "fa-flag"
        },

        {
            time: "01:10 - 02:00",
            subject: "Lunch",
            room: "",
            icon: "fa-utensils",
            lunch: true
        },

        {
            time: "02:00 - 02:50",
            subject: "Database Management System",
            room: "R-204",
            icon: "fa-database"
        },

        {
            time: "02:50 - 03:40",
            subject: "Operating System",
            room: "R-204",
            icon: "fa-desktop"
        }

    ],



    Wednesday: [

        {
            time: "10:25 - 11:20",
            subject: "Web Designing Fundamentals",
            room: "R-204",
            icon: "fa-globe"
        },

        {
            time: "11:20 - 12:15",
            subject: "Operating System",
            room: "R-204",
            icon: "fa-desktop"
        },

        {
            time: "01:10 - 02:00",
            subject: "Lunch",
            room: "",
            icon: "fa-utensils",
            lunch: true
        },

        {
            time: "12:15 - 01:10",
            subject: "Project (Lab)",
            room: "L-C8",
            icon: "fa-flask"
        },

        {
            time: "02:00 - 03:40",
            subject: "Database Management System (Lab)",
            room: "L-C7",
            icon: "fa-database"
        }

    ],



    Thursday: [

        {
            time: "10:25 - 11:20",
            subject: "Data Communication & Networking",
            room: "R-204",
            icon: "fa-network-wired"
        },

        {
            time: "11:20 - 12:15",
            subject: "Web Designing Fundamentals",
            room: "R-204",
            icon: "fa-globe"
        },

        {
            time: "12:15 - 01:10",
            subject: "Lunch",
            room: "",
            icon: "fa-utensils",
            lunch: true
        },

        {
            time: "01:10 - 02:00",
            subject: "Computer System Architecture",
            room: "R-204",
            icon: "fa-microchip"
        },

        {
            time: "02:00 - 03:40",
            subject: "Web Designing (Lab)",
            room: "L-C8",
            icon: "fa-globe"
        }

    ],



    Friday: [

        {
            time: "10:25 - 11:20",
            subject: "Operating System (Tutorial)",
            room: "R-307",
            icon: "fa-desktop"
        },

        {
            time: "11:20 - 12:15",
            subject: "Database Management System",
            room: "R-204",
            icon: "fa-database"
        },

        {
            time: "12:15 - 01:10",
            subject: "Lunch",
            room: "",
            icon: "fa-utensils",
            lunch: true
        },

        {
            time: "01:10 - 02:00",
            subject: "Project (Lab)",
            room: "L-C3",
            icon: "fa-flask"
        },

        {
            time: "02:00 - 02:50",
            subject: "Data Communication & Networking",
            room: "R-204",
            icon: "fa-network-wired"
        },

        {
            time: "02:50 - 03:40",
            subject: "Web Designing Fundamentals",
            room: "R-204",
            icon: "fa-globe"
        }

    ]

};



const todayName = days[day];

const classes = timetable[todayName];



if(classes){

    classes.forEach((item) => {


        const classBox = document.createElement("div");


        classBox.classList.add("class-box");


        if(item.lunch){

            classBox.classList.add("lunch");

        }


        classBox.innerHTML = `

            <div class="class-time">

                <i class="fa-regular fa-clock"></i>

                ${item.time}

            </div>


            <div class="class-icon">

                <i class="fa-solid ${item.icon}"></i>

            </div>


            <div class="class-info">

                <h3>${item.subject}</h3>

                <p>Today's Class</p>

            </div>


            ${
                item.room

                ?

                `<div class="room">

                    ${item.room}

                </div>`

                :

                ""

            }

        `;


        timeTable.appendChild(classBox);


    });

}


else{

    noClass.style.display = "block";

}

const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});
