/* ========================= */
/* FEES DATA */
/* ========================= */

let totalFees = 85000;

let paidFees = 50000;


/* ========================= */
/* SELECT ELEMENTS */
/* ========================= */

const totalAmount = document.querySelector("#totalAmount");

const paidAmount = document.querySelector("#paidAmount");

const pendingAmount = document.querySelector("#pendingAmount");

const progressPercentage = document.querySelector("#progressPercentage");

const paymentPercentage =
    document.querySelector("#paymentPercentage");

const progressFill =
    document.querySelector("#progressFill");

const progressPaid =
    document.querySelector("#progressPaid");

const progressRemaining =
    document.querySelector("#progressRemaining");

const payBtn =
    document.querySelector(".pay-btn");


/* ========================= */
/* UPDATE FEES */
/* ========================= */

function updateFees() {

    /* Calculate pending */

    let pendingFees = totalFees - paidFees;


    /* Calculate percentage */

    let percentage =
        Math.round((paidFees / totalFees) * 100);


    /* Display values */

    totalAmount.innerText =
        "₹" + totalFees.toLocaleString("en-IN");

    paidAmount.innerText =
        "₹" + paidFees.toLocaleString("en-IN");

    pendingAmount.innerText =
        "₹" + pendingFees.toLocaleString("en-IN");

    paymentPercentage.innerText =
        percentage + "%";

    progressPercentage.innerText = percentage + "%";

    /* Progress bar */

    progressFill.style.width =
        percentage + "%";


    /* Progress information */

    progressPaid.innerText =
        "Paid: ₹" +
        paidFees.toLocaleString("en-IN");

    progressRemaining.innerText =
        "Remaining: ₹" +
        pendingFees.toLocaleString("en-IN");


    /* Button */

    if (pendingFees <= 0) {

        payBtn.innerText = "Fees Paid";

        payBtn.disabled = true;

    } else {

        payBtn.innerHTML =
            `<i class="fa-solid fa-credit-card"></i>
             Pay Fees`;

        payBtn.disabled = false;

    }

}


/* ========================= */
/* PAY BUTTON */
/* ========================= */

payBtn.addEventListener("click", () => {

    let pendingFees = totalFees - paidFees;


    if (pendingFees <= 0) {

        alert("Your fees are already paid.");

        return;

    }else{
        window.location.href = "payment.html";
    }

});


/* ========================= */
/* RUN FUNCTION */
/* ========================= */

updateFees();

const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});

