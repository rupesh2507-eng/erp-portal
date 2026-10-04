const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}


/* ========================= */
/* GET LOGGED-IN STUDENT */
/* ========================= */

const student = JSON.parse(localStorage.getItem("student"));
const feeBreakdownBody = document.querySelector("#feeBreakdownBody");
const paymentHistoryBody = document.querySelector("#paymentHistoryBody");

if (!student) {
    window.location.href = "index.html";
}


/* ========================= */
/* FEES DATA */
/* ========================= */

let totalFees = 0;
let paidFees = 0;
let pendingFees = 0;


/* ========================= */
/* SELECT ELEMENTS */
/* ========================= */

const totalAmount = document.querySelector("#totalAmount");

const paidAmount = document.querySelector("#paidAmount");

const pendingAmount = document.querySelector("#pendingAmount");

const progressPercentage =
    document.querySelector("#progressPercentage");

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

const nextPaymentAmount =
    document.querySelector(".next-details h2");

/* ========================= */
/* LOAD FEES FROM DATABASE */
/* ========================= */

async function loadFees() {

    try {

        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/fees/${student.id}`,
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const data = await response.json();

        if (!data.success || !data.fees) {

            alert("Unable to load fee details.");

            return;
        }


        /* Get values from MySQL */

        totalFees = Number(data.fees.total_fee) || 0;

        pendingFees = Number(data.fees.due_fee) || 0;

        paidFees = Math.max(totalFees - pendingFees, 0);


        /* Update page */

        updateFees();

    } catch (error) {

        console.error("Fee loading error:", error);

        alert("Unable to connect to the server.");

    }
}


/* ========================= */
/* UPDATE FEES */
/* ========================= */

function updateFees() {

    /* Calculate percentage */

    let percentage = 0;

    if (totalFees > 0) {

        percentage =
            (paidFees / totalFees) * 100;

    }

    /* Display values */

    totalAmount.innerText =
        "₹" + totalFees.toLocaleString("en-IN");

    paidAmount.innerText =
        "₹" + paidFees.toLocaleString("en-IN");

    pendingAmount.innerText =
        "₹" + pendingFees.toLocaleString("en-IN");

    nextPaymentAmount.innerText =
        "₹" + pendingFees.toLocaleString("en-IN");

    /* Percentage */

    paymentPercentage.innerText =
        percentage.toFixed(2) + "%";

    progressPercentage.innerText =
        percentage.toFixed(2) + "%";


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

    if (pendingFees <= 0) {

        alert("Your fees are already paid.");

        return;

    }

    window.location.href = "payment.html";

});


/* ========================= */
/* LOAD FEES */
/* ========================= */

loadFees();

async function loadFeeBreakdown() {
    try {
        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/fee-breakdown/${student.id}`,
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const data = await response.json();

        if (!data.success) return;

        feeBreakdownBody.innerHTML = "";

        data.breakdown.forEach((fee) => {
            const pending = Number(fee.pending_amount);

            let icon = "fa-book";

            if (fee.fee_type === "Tuition Fees") {
                icon = "fa-graduation-cap";
            } else if (fee.fee_type === "Hostel Fees") {
                icon = "fa-building";
            }

            const statusClass =
                pending <= 0 ? "paid-status" : "pending-status";

            const statusText =
                pending <= 0 ? "Paid" : "Pending";

            feeBreakdownBody.innerHTML += `
                <tr>
                    <td>
                        <i class="fa-solid ${icon}"></i>
                        ${fee.fee_type}
                    </td>

                    <td>₹${Number(fee.total_amount).toLocaleString("en-IN")}</td>

                    <td>₹${Number(fee.paid_amount).toLocaleString("en-IN")}</td>

                    <td>₹${pending.toLocaleString("en-IN")}</td>

                    <td>
                        <span class="status ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Fee breakdown error:", error);
    }
}


async function loadPaymentHistory() {
    try {
        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/payment-history/${student.id}`,
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const data = await response.json();

        if (!data.success) return;

        paymentHistoryBody.innerHTML = "";

        data.payments.forEach((payment) => {
            const statusClass =
                payment.status === "Paid"
                    ? "paid-status"
                    : "pending-status";

            paymentHistoryBody.innerHTML += `
                <tr>
                    <td>#${payment.transaction_id}</td>

                    <td>${payment.payment_date}</td>

                    <td>${payment.fee_type}</td>

                    <td>₹${Number(payment.amount).toLocaleString("en-IN")}</td>

                    <td>
                        <span class="status ${statusClass}">
                            ${payment.status}
                        </span>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Payment history error:", error);
    }
}


loadFeeBreakdown();
loadPaymentHistory();

/* ========================= */
/* SIDEBAR */
/* ========================= */

const icon = document.querySelector(".heading i");

const panel = document.querySelector(".panel");

const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {

    panel.classList.toggle("collapsed");

    dashboard.classList.toggle("reverse");

});