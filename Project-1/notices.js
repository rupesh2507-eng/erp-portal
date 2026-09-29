const noticeFilter = document.querySelector("#noticeFilter");
const notices = document.querySelectorAll(".notice-item");
const totalNotices = document.querySelector("#totalNotices");

noticeFilter.addEventListener("change", () => {

    let selectedCategory = noticeFilter.value;
    let count = 0;

    notices.forEach((notice) => {

        let category = notice.dataset.category;

        if (selectedCategory === "all" || category === selectedCategory) {

            notice.style.display = "flex";
            count++;

        } else {

            notice.style.display = "none";

        }

    });

    totalNotices.innerText = count;

});

const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});
