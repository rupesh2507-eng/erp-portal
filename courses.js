const buttons = document.querySelectorAll(".course-button button");


buttons.forEach((button) => {

    button.addEventListener("click", () => {

        const course = button.parentElement.parentElement;

        const name = course.querySelector("h2").innerText;

        alert("You selected : " + name);

    });

});

const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});
