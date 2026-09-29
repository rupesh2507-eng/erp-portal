const icon = document.querySelector(".heading i");
const panel = document.querySelector(".panel");
const dashboard = document.querySelector(".dashboard");

icon.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    dashboard.classList.toggle("reverse");
});

const editBtn = document.querySelector("#editBtn");

const saveBtn = document.querySelector("#saveBtn");

const cancelBtn = document.querySelector("#cancelBtn");

const saveArea = document.querySelector("#saveArea");

const imageUpload = document.querySelector("#imageUpload");

const profileImage = document.querySelector("#profileImage");

const defaultIcon = document.querySelector("#defaultIcon");


/* EDITABLE INPUTS */

const editableInputs = [
    document.querySelector("#name"),
    document.querySelector("#phone"),
    document.querySelector("#email"),
    document.querySelector("#contactPhone"),
    document.querySelector("#contactEmail"),
    document.querySelector("#address")
];


/* EDIT PROFILE */

editBtn.addEventListener("click", () => {

    editableInputs.forEach((input) => {

        input.disabled = false;

    });

    imageUpload.disabled = false;

    saveArea.style.display = "flex";

    editBtn.style.display = "none";

});


/* PROFILE IMAGE */

imageUpload.addEventListener("change", () => {

    const file = imageUpload.files[0];

    if (!file) {
        return;
    }


    const reader = new FileReader();


    reader.onload = function () {

        profileImage.src = reader.result;

        profileImage.style.display = "block";

        defaultIcon.style.display = "none";


        localStorage.setItem(
            "profilePicture",
            reader.result
        );

    };


    reader.readAsDataURL(file);

});


/* SAVE */

saveBtn.addEventListener("click", () => {

    editableInputs.forEach((input) => {

        input.disabled = true;

    });


    document.querySelector("#displayName").innerText =
        document.querySelector("#name").value;


    editBtn.style.display = "block";

    saveArea.style.display = "none";


    /* SAVE INFORMATION */

    localStorage.setItem(
        "studentName",
        document.querySelector("#name").value
    );

    localStorage.setItem(
        "phone",
        document.querySelector("#phone").value
    );

    localStorage.setItem(
        "email",
        document.querySelector("#email").value
    );

    localStorage.setItem(
        "address",
        document.querySelector("#address").value
    );

});


/* CANCEL */

cancelBtn.addEventListener("click", () => {

    editableInputs.forEach((input) => {

        input.disabled = true;

    });

    editBtn.style.display = "block";

    saveArea.style.display = "none";

});


/* LOAD SAVED DATA */

const savedName = localStorage.getItem("studentName");

const savedPhone = localStorage.getItem("phone");

const savedEmail = localStorage.getItem("email");

const savedAddress = localStorage.getItem("address");

const savedPicture = localStorage.getItem("profilePicture");


if (savedName) {

    document.querySelector("#name").value = savedName;

    document.querySelector("#displayName").innerText =
        savedName;

}


if (savedPhone) {

    document.querySelector("#phone").value = savedPhone;

    document.querySelector("#contactPhone").value =
        savedPhone;

}


if (savedEmail) {

    document.querySelector("#email").value = savedEmail;

    document.querySelector("#contactEmail").value =
        savedEmail;

}


if (savedAddress) {

    document.querySelector("#address").value =
        savedAddress;

}


/* LOAD PROFILE PICTURE */

if (savedPicture) {

    profileImage.src = savedPicture;

    profileImage.style.display = "block";

    defaultIcon.style.display = "none";

}
