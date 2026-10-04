const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}


/* =========================
   GET LOGGED-IN STUDENT
========================= */

const student =
    JSON.parse(localStorage.getItem("student"));

if (!student) {
    window.location.href = "index.html";
}


/* =========================
   PAYMENT ELEMENTS
========================= */

const payBtn =
    document.querySelector("#payBtn");

const amountElement =
    document.querySelector(".amount");

const studentNameElement =
    document.querySelector(
        ".payment-info div:nth-child(1) strong"
    );

const studentIdElement =
    document.querySelector(
        ".payment-info div:nth-child(2) strong"
    );


/* =========================
   PAYMENT VARIABLES
========================= */

let pendingAmount = 0;
let selectedAmount = 0;


/* =========================
   CREATE CUSTOM AMOUNT BUTTON
========================= */

const customPaymentBox =
    document.createElement("div");

customPaymentBox.className =
    "custom-payment-box";

customPaymentBox.innerHTML = `
    <button
        type="button"
        id="chooseCustomBtn"
    >
        Choose Custom Amount
    </button>
`;


/*
   Put Choose Custom Amount
   above the main Pay button
*/

payBtn.parentNode.insertBefore(
    customPaymentBox,
    payBtn
);


const chooseCustomBtn =
    document.querySelector("#chooseCustomBtn");


/* =========================
   LOAD REAL FEE DATA
========================= */

async function loadFees() {

    try {

        const response =
            await fetch(
                `https://erp-portal-xgjf.onrender.com/fees/${student.id}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );


        const data =
            await response.json();


        if (!data.success || !data.fees) {

            alert(
                "Unable to load fee details."
            );

            return;
        }


        const fees =
            data.fees;


        pendingAmount =
            Number(fees.due_fee) || 0;


        /* =========================
           SHOW REAL PENDING AMOUNT
        ========================= */

        amountElement.innerText =
            `₹${pendingAmount.toLocaleString("en-IN")}`;


        amountElement.style.display =
            "block";


        /* =========================
           STUDENT INFORMATION
        ========================= */

        studentNameElement.innerText =
            student.name;

        studentIdElement.innerText =
            student.roll_no;


        /* =========================
           DEFAULT PAYMENT
        ========================= */

        selectedAmount =
            pendingAmount;


        updatePayButton();


        /* =========================
           NO PENDING FEES
        ========================= */

        if (pendingAmount <= 0) {

            payBtn.disabled = true;

            payBtn.innerHTML = `
                <i class="fa-solid fa-check"></i>
                No Pending Fees
            `;


            customPaymentBox.style.display =
                "none";
        }

    } catch (error) {

        console.error(
            "Fee loading error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );
    }
}


loadFees();


/* =========================
   UPDATE MAIN PAY BUTTON
========================= */

function updatePayButton() {

    if (selectedAmount <= 0) {

        payBtn.innerHTML = `
            <i class="fa-solid fa-credit-card"></i>
            Pay Fees
        `;

        return;
    }


    payBtn.innerHTML = `
        <i class="fa-solid fa-credit-card"></i>
        Pay ₹${selectedAmount.toLocaleString("en-IN")}
    `;
}


/* =========================
   VALIDATE AMOUNT
========================= */

function validateAmount(amount) {

    amount =
        Number(amount);


    if (!Number.isFinite(amount)) {

        return {
            valid: false,
            message:
                "Please enter a valid amount."
        };
    }


    if (!Number.isInteger(amount)) {

        return {
            valid: false,
            message:
                "Please enter a whole amount."
        };
    }


    if (amount <= 0) {

        return {
            valid: false,
            message:
                "Payment amount must be greater than ₹0."
        };
    }


    /*
       Pending >= ₹1,000
    */

    if (pendingAmount >= 1000) {

        if (amount < 1000) {

            return {
                valid: false,
                message:
                    "Minimum payment amount is ₹1,000."
            };
        }

    } else {

        /*
        Pending below ₹1,000.
        Student can pay any amount
        from ₹1 up to the pending amount.
        */

        if (amount < 1) {

            return {
                valid: false,
                message: "Minimum payment amount is ₹1."
            };
        }

        if (amount > pendingAmount) {

            return {
                valid: false,
                message:
                    `You cannot pay more than ₹${pendingAmount.toLocaleString("en-IN")}.`
            };
        }
    }


    /*
       Cannot pay more than pending
    */

    if (amount > pendingAmount) {

        return {
            valid: false,
            message:
                `You cannot pay more than the pending amount of ₹${pendingAmount.toLocaleString("en-IN")}.`
        };
    }


    return {
        valid: true
    };
}


/* =========================
   CHOOSE CUSTOM AMOUNT
========================= */

chooseCustomBtn.addEventListener(
    "click",
    () => {

        /*
           Replace the existing
           green pending amount.

           IMPORTANT:
           The input appears INSIDE
           the original .amount element.
        */

        amountElement.innerHTML = `
            <div class="custom-amount-input">

                <span>₹</span>

                <input
                    type="number"
                    id="customAmount"
                    placeholder="0"
                    min="1"
                    step="1"
                    autocomplete="off"
                >

            </div>

            <p id="amountMessage"></p>
        `;


        const customAmountInput =
            document.querySelector(
                "#customAmount"
            );


        const amountMessage =
            document.querySelector(
                "#amountMessage"
            );


        /*
           Hide Choose Custom Amount
        */

        chooseCustomBtn.style.display =
            "none";


        /*
           Focus input
        */

        customAmountInput.focus();


        /*
           Initially disable payment
           until a valid custom amount
           is entered.
        */

        payBtn.disabled = true;


        payBtn.innerHTML = `
            <i class="fa-solid fa-credit-card"></i>
            Enter Amount
        `;


        /* =========================
           CUSTOM AMOUNT INPUT
        ========================= */

        customAmountInput.addEventListener(
            "input",
            () => {

                const value =
                    customAmountInput.value;


                const amount =
                    Number(value);


                /*
                   Clear previous message
                */

                amountMessage.innerText =
                    "";


                /*
                   Empty input
                */

                if (!value) {

                    selectedAmount = 0;

                    payBtn.disabled = true;

                    payBtn.innerHTML = `
                        <i class="fa-solid fa-credit-card"></i>
                        Enter Amount
                    `;

                    return;
                }


                /*
                   Whole number
                */

                if (!Number.isInteger(amount)) {

                    selectedAmount = 0;

                    payBtn.disabled = true;

                    amountMessage.innerText =
                        "Please enter a whole amount.";

                    return;
                }


                /*
                   Greater than pending
                */

                if (amount > pendingAmount) {

                    selectedAmount = 0;

                    payBtn.disabled = true;

                    amountMessage.innerText =
                        `Cannot pay more than ₹${pendingAmount.toLocaleString("en-IN")}.`;

                    return;
                }


                /*
                   Minimum ₹1,000
                */

                if (
                    pendingAmount >= 1000 &&
                    amount < 1000
                ) {

                    selectedAmount = 0;

                    payBtn.disabled = true;

                    amountMessage.innerText =
                        "Minimum payment amount is ₹1,000.";

                    return;
                }


                /*
                   Pending below ₹1,000
                */

                if (amount < 1) {
                    amountMessage.textContent = "Minimum payment amount is ₹1";
                    selectedAmount = 0;
                    payBtn.disabled = true;
                    return;
                }

                if (amount > pendingAmount) {
                    amountMessage.textContent =
                        `You cannot pay more than ₹${pendingAmount.toLocaleString("en-IN")}`;
                    selectedAmount = 0;
                    payBtn.disabled = true;
                    return;
                }

                if (pendingAmount >= 1000 && amount < 1000) {
                    amountMessage.textContent = "Minimum payment amount is ₹1,000";
                    selectedAmount = 0;
                    payBtn.disabled = true;
                    return;
                }


                /*
                   VALID AMOUNT
                */

                selectedAmount =
                    amount;


                /*
                   Keep amount green
                */

                customAmountInput.style.color =
                    "#12A866";


                /*
                   Enable payment button
                */

                payBtn.disabled =
                    false;


                /*
                   Change bottom button
                */

                payBtn.innerHTML = `
                    <i class="fa-solid fa-credit-card"></i>
                    Pay ₹${amount.toLocaleString("en-IN")}
                `;

            }
        );

    }
);


/* =========================
   PAY BUTTON
========================= */

payBtn.addEventListener(
    "click",
    async () => {

        if (!student) {

            alert(
                "Student information not found."
            );

            return;
        }


        /*
           Re-check current selected amount
        */

        const validation =
            validateAmount(
                selectedAmount
            );


        /*
           For custom amount errors,
           do NOT show an alert.
        */

        if (!validation.valid) {

            const amountMessage =
                document.querySelector(
                    "#amountMessage"
                );


            if (amountMessage) {

                amountMessage.innerText =
                    validation.message;

            }

            return;
        }


        const amount =
            selectedAmount;


        payBtn.disabled =
            true;


        payBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Opening Payment...
        `;


        try {

            /* =========================
               CREATE RAZORPAY ORDER
            ========================= */

            const orderResponse =
                await fetch(
                    "https://erp-portal-xgjf.onrender.com/payment/create-order",
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${localStorage.getItem("token")}`
                        },

                        body:
                            JSON.stringify({

                                /*
                                   Send selected amount
                                */

                                amount:
                                    amount

                            })
                    }
                );


            const orderData =
                await orderResponse.json();


            if (!orderData.success) {

                throw new Error(
                    orderData.message ||
                    "Unable to create payment order"
                );
            }


            /* =========================
               RAZORPAY OPTIONS
            ========================= */

            const options = {

                key:
                    orderData.key_id,

                amount:
                    orderData.amount,

                currency:
                    orderData.currency,

                name:
                    "Student ERP Portal",

                description:
                    "Student Fee Payment",

                order_id:
                    orderData.order_id,


                prefill: {

                    name:
                        student.name,

                    email:
                        student.email,

                    contact:
                        student.phone

                },


                theme: {

                    color:
                        "#12355B"

                },


                /* =========================
                   PAYMENT SUCCESS
                ========================= */

                handler:
                    async function (response) {

                        console.log(
                            "RAZORPAY PAYMENT RESPONSE:",
                            response
                        );


                        try {

                            const verifyResponse =
                                await fetch(
                                    "https://erp-portal-xgjf.onrender.com/payment/verify",
                                    {
                                        method: "POST",

                                        headers: {

                                            "Content-Type":
                                                "application/json",

                                            "Authorization":
                                                `Bearer ${localStorage.getItem("token")}`

                                        },

                                        body:
                                            JSON.stringify({

                                                razorpay_order_id:
                                                    response.razorpay_order_id,

                                                razorpay_payment_id:
                                                    response.razorpay_payment_id,

                                                razorpay_signature:
                                                    response.razorpay_signature

                                            })

                                    }
                                );


                            const verifyData =
                                await verifyResponse.json();


                            console.log(
                                "PAYMENT VERIFICATION:",
                                verifyData
                            );


                            if (verifyData.success) {

                                alert(
                                    "Payment verified successfully!\n\n" +
                                    "Payment ID: " +
                                    response.razorpay_payment_id
                                );


                                window.location.href =
                                    "fees.html";

                            } else {

                                alert(
                                    verifyData.message ||
                                    "Payment verification failed."
                                );


                                payBtn.disabled =
                                    false;


                                updatePayButton();

                            }

                        } catch (error) {

                            console.error(
                                "Verification error:",
                                error
                            );


                            alert(
                                "Unable to verify the payment."
                            );


                            payBtn.disabled =
                                false;


                            updatePayButton();

                        }

                    },


                /* =========================
                   RAZORPAY CLOSED
                ========================= */

                modal: {

                    ondismiss:
                        function () {

                            payBtn.disabled =
                                false;


                            updatePayButton();

                        }

                }

            };


            const razorpay =
                new Razorpay(options);


            razorpay.open();


        } catch (error) {

            console.error(
                "Razorpay payment error:",
                error
            );


            alert(
                error.message ||
                "Unable to open Razorpay payment."
            );


            payBtn.disabled =
                false;


            updatePayButton();

        }

    }
);


/* =========================
   SIDEBAR
========================= */

const icon =
    document.querySelector(
        ".heading i"
    );

const panel =
    document.querySelector(
        ".panel"
    );

const dashboard =
    document.querySelector(
        ".dashboard"
    );


icon.addEventListener(
    "click",
    () => {

        panel.classList.toggle(
            "collapsed"
        );

        dashboard.classList.toggle(
            "reverse"
        );

    }
);