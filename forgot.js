const form = document.querySelector("#forgotForm");

const emailSection = document.querySelector("#emailSection");
const otpSection = document.querySelector("#otpSection");
const passwordSection = document.querySelector("#passwordSection");

const emailInput = document.querySelector("#email");
const otpInputs = document.querySelectorAll(".otp-input");

const newPasswordInput = document.querySelector("#newPassword");
const confirmPasswordInput = document.querySelector("#confirmPassword");

const change = document.querySelector("#change");
const otpMessage = document.querySelector("#otpMessage");
const passwordMessage = document.querySelector("#passwordMessage");

const verifyOtpBtn = document.querySelector("#verifyOtpBtn");
const resetPasswordBtn = document.querySelector("#resetPasswordBtn");

const resendOtpBtn = document.querySelector("#resendOtpBtn");

// ===============================
// OTP BOX FUNCTIONALITY
// ===============================

otpInputs.forEach((input, index) => {

    input.addEventListener("input", () => {

        input.value = input.value.replace(/\D/g, "");

        if (input.value && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }

    });

    input.addEventListener("keydown", (event) => {

        if (
            event.key === "Backspace" &&
            !input.value &&
            index > 0
        ) {
            otpInputs[index - 1].focus();
        }

    });

    input.addEventListener("paste", (event) => {

        event.preventDefault();

        const pastedData =
            event.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 6);

        pastedData.split("").forEach((digit, i) => {

            if (otpInputs[i]) {
                otpInputs[i].value = digit;
            }

        });

        const nextIndex =
            Math.min(pastedData.length, 5);

        otpInputs[nextIndex].focus();

    });

});
// ===============================
// SEND OTP
// ===============================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
        change.innerText = "Please enter your registered email.";
        return;
    }

    change.innerText = "Checking email...";

    try {

        const response = await fetch(
            "https://erp-portal-xgjf.onrender.com/forgot-password/send-otp",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email
                })
            }
        );

        const data = await response.json();

        if (!data.success) {
            change.innerText = data.message;
            return;
        }

        change.innerText =
            "OTP has been sent to your registered email.";

        emailSection.style.display = "none";
        otpSection.style.display = "block";

    } catch (error) {

        console.error("Send OTP error:", error);

        change.innerText =
            "Unable to connect to the server.";
    }
});


// ===============================
// VERIFY OTP
// ===============================

verifyOtpBtn.addEventListener("click", async () => {

    const email = emailInput.value.trim();
    const otp = Array.from(otpInputs)
    .map(input => input.value)
    .join("");

    if (!otp) {
        otpMessage.innerText = "Please enter the OTP.";
        return;
    }

    try {

        const response = await fetch(
            "https://erp-portal-xgjf.onrender.com/forgot-password/verify-otp",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    otp: otp
                })
            }
        );

        const data = await response.json();

        if (!data.success) {
            otpMessage.innerText = data.message;
            return;
        }

        otpMessage.innerText = "OTP verified successfully.";

        otpSection.style.display = "none";
        passwordSection.style.display = "block";

    } catch (error) {

        console.error("OTP verification error:", error);

        otpMessage.innerText =
            "Unable to connect to the server.";
    }
});


// ===============================
// RESET PASSWORD
// ===============================

resetPasswordBtn.addEventListener("click", async () => {

    const email = emailInput.value.trim();
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!newPassword || !confirmPassword) {
        passwordMessage.innerText =
            "Please enter both password fields.";
        return;
    }

    if (newPassword !== confirmPassword) {
        passwordMessage.innerText =
            "Passwords do not match.";
        return;
    }

    try {

        const response = await fetch(
            "https://erp-portal-xgjf.onrender.com/forgot-password/reset-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    newPassword: newPassword
                })
            }
        );

        const data = await response.json();

        if (!data.success) {
            passwordMessage.innerText = data.message;
            return;
        }

        alert("Password reset successfully.");

        window.location.href = "index.html";

    } catch (error) {

        console.error("Password reset error:", error);

        passwordMessage.innerText =
            "Unable to connect to the server.";
    }
});