const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}

const noticeFilter = document.querySelector("#noticeFilter");
const totalNotices = document.querySelector("#totalNotices");

const noticeSection =
    document.querySelector(".notices-section");


/* =========================
   SIDEBAR
========================= */

const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {

    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");

});


/* =========================
   LOAD NOTICES
========================= */

async function loadNotices() {

    try {

        const response =
            await fetch("https://erp-portal-xgjf.onrender.com/notices", {
                headers: {
                    "Authorization":
                        `Bearer ${localStorage.getItem("token")}`
                }
            });

        const data = await response.json();

        if (!data.success) {
            console.error("Failed to load notices");
            return;
        }

        displayNotices(data.notices);

    } catch (error) {

        console.error(
            "Notices error:",
            error
        );

    }

}


/* =========================
   DISPLAY NOTICES
========================= */

function displayNotices(notices) {

    const oldNotices =
        noticeSection.querySelectorAll(".notice-item");

    oldNotices.forEach((notice) => {
        notice.remove();
    });


    notices.forEach((notice) => {

        const category = notice.category;

        const noticeItem =
            document.createElement("div");

        noticeItem.className = "notice-item";

        noticeItem.dataset.category = category;


        noticeItem.innerHTML = `

            <div class="notice-left">

                <div class="notice-main-icon ${category}">

                    <i class="fa-solid ${getIcon(notice.title)}"></i>

                </div>

                <div class="notice-content">

                    <div class="notice-title">

                        <h3>${notice.title}</h3>

                        <span class="notice-tag ${category}-tag">
                            ${getCategoryName(category)}
                        </span>

                    </div>

                    <p>
                        ${notice.message}
                    </p>

                    <span class="notice-time">

                        <i class="fa-regular fa-clock"></i>

                        ${formatDate(notice.created_at)}

                    </span>

                </div>

            </div>

            <button class="view-btn">
                View
            </button>

        `;

        noticeSection.appendChild(noticeItem);

    });


    updateSummaryCounts(notices);
    updateCount();

}

function updateSummaryCounts(notices) {

    const summaryCounts =
        document.querySelectorAll(".notice-card h2");

    const importantCount =
        notices.filter(notice => notice.category === "important").length;

    const academicCount =
        notices.filter(notice => notice.category === "academic").length;

    const eventCount =
        notices.filter(notice => notice.category === "event").length;

    summaryCounts[0].innerText = importantCount;
    summaryCounts[1].innerText = academicCount;
    summaryCounts[2].innerText = eventCount;
    summaryCounts[3].innerText = notices.length;
}


/* =========================
   CATEGORY
========================= */




function getCategoryName(category) {

    if (category === "important") {
        return "Important";
    }

    if (category === "event") {
        return "Event";
    }

    return "Academic";

}


/* =========================
   ICON
========================= */

function getIcon(title) {

    if (title.includes("Examination")) {
        return "fa-triangle-exclamation";
    }

    if (title.includes("Assignment")) {
        return "fa-book-open";
    }

    if (title.includes("Fest")) {
        return "fa-calendar-days";
    }

    if (title.includes("Attendance")) {
        return "fa-graduation-cap";
    }

    return "fa-bell";

}


/* =========================
   DATE
========================= */

function formatDate(date) {

    return new Date(date).toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================
   FILTER
========================= */

noticeFilter.addEventListener("change", () => {

    updateCount();

});


function updateCount() {

    const selectedCategory =
        noticeFilter.value;

    const notices =
        noticeSection.querySelectorAll(".notice-item");

    let count = 0;


    notices.forEach((notice) => {

        if (
            selectedCategory === "all" ||
            notice.dataset.category === selectedCategory
        ) {

            notice.style.display = "flex";
            count++;

        } else {

            notice.style.display = "none";

        }

    });


}


/* =========================
   START
========================= */

loadNotices();