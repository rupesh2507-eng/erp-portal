console.log("LOGIN JS IS WORKING");

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const role =
        document.getElementById("role").value;

    try {

        const response = await fetch(
            "https://erp-portal-xgjf.onrender.com/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password,
                    role: role
                })
            }
        );

        const data = await response.json();

        console.log("LOGIN RESPONSE:", data);

        if (data.success) {

            // Save JWT token
            localStorage.setItem(
                "token",
                data.token
            );

            // Save logged-in student information
            localStorage.setItem(
                "student",
                JSON.stringify(data.student)
            );

            console.log(
                "JWT token saved successfully"
            );

            window.location.href =
                "dashboard.html";

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );

    }

}); 