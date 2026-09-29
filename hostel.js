const hostelRequestBtn =
    document.querySelector("#hostelRequestBtn");


hostelRequestBtn.addEventListener("click", () => {

    let request = confirm(
        "Do you want to submit a hostel change request?"
    );

    if (request) {

        hostelRequestBtn.innerText = "Request Submitted";

        hostelRequestBtn.disabled = true;

        hostelRequestBtn.style.opacity = "0.7";

        alert("Your hostel change request has been submitted.");

    }

});

const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});
