// ===============================
// Theme
// ===============================

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}


// ===============================
// Load Hostel Details
// ===============================

async function loadHostel() {

    const student = JSON.parse(localStorage.getItem("student"));
    const token = localStorage.getItem("token");

    if (!student || !token) {
        console.error("Student or token not found.");
        return;
    }

    try {

        const response = await fetch(
            `https://erp-portal-xgjf.onrender.com/hostel/${student.id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!data.success) {
            console.error(data.message);
            return;
        }


        // ===============================
        // No Hostel Allocation
        // ===============================

        if (!data.allocated) {

            document.querySelector(".status").innerText =
                "Not Allocated";

            return;
        }


        const hostel = data.hostel;


        // ===============================
        // Summary Cards
        // ===============================

        const summaryValues =
            document.querySelectorAll(".hostel-card h2");

        if (summaryValues.length >= 4) {

            summaryValues[0].innerText =
                hostel.room_number;

            summaryValues[1].innerText =
                hostel.block;

            summaryValues[2].innerText =
                hostel.bed_number;

            summaryValues[3].innerText =
                hostel.floor;
        }


        // ===============================
        // Room Details
        // ===============================

        // ===============================
        // Room Details
        // ===============================

        const roomDetails =
            document.querySelectorAll(".room-details .detail-item strong");

        if (roomDetails.length >= 6) {

            roomDetails[0].innerText =
                hostel.hostel_name || "";

            roomDetails[1].innerText =
                hostel.room_number || "";

            roomDetails[2].innerText =
                hostel.room_type || "";

            roomDetails[3].innerText =
                hostel.floor || "";

            roomDetails[4].innerText =
                hostel.session || "";

            roomDetails[5].innerText =
                hostel.allocation_date || "";
        }


        // ===============================
        // Hostel Status
        // ===============================

        const status =
            document.querySelector(".status");

        if (status) {
            status.innerText = hostel.status;
        }


        // ===============================
        // Roommates
        // ===============================

        const roommateContainer =
            document.querySelector(".roommates");

        if (roommateContainer) {

            const roommates = data.roommates;

            roommateContainer.innerHTML = "";

            roommates.forEach(roommate => {

                const roommateCard =
                    document.createElement("div");

                roommateCard.className =
                    "roommate-card";

                roommateCard.innerHTML = `
                    <div class="roommate-info">
                        <h3>${roommate.student_name}</h3>
                        <p>Department: ${roommate.department}</p>
                    </div>

                    <div class="bed">
                        ${roommate.bed_number}
                    </div>
                `;

                roommateContainer.appendChild(roommateCard);

            });

        }

    } catch (error) {

        console.error(
            "Hostel loading error:",
            error
        );

    }

}


// ===============================
// Hostel Change Request
// ===============================

const hostelRequestBtn =
    document.querySelector("#hostelRequestBtn");

if (hostelRequestBtn) {

    hostelRequestBtn.addEventListener("click", () => {

        let request = confirm(
            "Do you want to submit a hostel change request?"
        );

        if (request) {

            hostelRequestBtn.innerText =
                "Request Submitted";

            hostelRequestBtn.disabled = true;

            hostelRequestBtn.style.opacity = "0.7";

            alert(
                "Your hostel change request has been submitted."
            );

        }

    });

}


// ===============================
// Sidebar Toggle
// ===============================

const icon =
    document.querySelector(".heading i");

const panel =
    document.querySelector(".panel");

const dashboard =
    document.querySelector(".dashboard");

if (icon && panel && dashboard) {

    icon.addEventListener("click", () => {

        panel.classList.toggle("collapsed");

        dashboard.classList.toggle("reverse");

    });

}


// ===============================
// Start
// ===============================

loadHostel();