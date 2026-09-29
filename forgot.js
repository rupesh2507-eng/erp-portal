const form = document.querySelector("form");
const change = document.querySelector("#change");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    change.innerText = "Reset link had been sent to your given Gmail";
});