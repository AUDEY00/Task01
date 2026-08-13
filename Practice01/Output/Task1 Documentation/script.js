let staffList = [
    {
        name: "Juan Dela Cruz",
        role: "IT Administrator",
        status: "Active"
    },

    {
        name: "Maria Santos",
        role: "System Analyst",
        status: "Active"
    },

    {
        name: "Pedro Reyes",
        role: "IT Support",
        status: "Inactive"
    },

    {
        name: "Ana Garcia",
        role: "Network Administrator",
        status: "Inactive"
    }
];


const staffForm = document.getElementById("staffForm");
const nameInput = document.getElementById("nameInput");
const roleInput = document.getElementById("roleInput");
const staffTableBody = document.getElementById("staffTableBody");
const toggleInactiveBtn = document.getElementById("toggleInactiveBtn");


let showInactive = true;


function displayStaff() {

    staffTableBody.innerHTML = "";

    staffList.forEach(function(staff, index) {

        if (staff.status === "Inactive" && !showInactive) {
            return;
        }

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = staff.name;

        const roleCell = document.createElement("td");
        roleCell.textContent = staff.role;

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        statusBadge.textContent = staff.status;


        // Conditional logic
        if (staff.status === "Active") {

            statusBadge.classList.add("badge", "active");

        } else {

            statusBadge.classList.add("badge", "inactive");

        }


        statusCell.appendChild(statusBadge);


        // Actions
        const actionsCell = document.createElement("td");
        const toggleButton = document.createElement("button");

        
        toggleButton.textContent =
            staff.status === "Active"
                ? "Set Inactive"
                : "Set Active";


        toggleButton.addEventListener("click", function() {

            if (staff.status === "Active") {

                staff.status = "Inactive";

            } else {

                staff.status = "Active";

            }

            displayStaff();

        });


        actionsCell.appendChild(toggleButton);


        row.appendChild(nameCell);
        row.appendChild(roleCell);
        row.appendChild(statusCell);
        row.appendChild(actionsCell);


        staffTableBody.appendChild(row);

    });
}


// Add New Staff

staffForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = nameInput.value.trim();
    const role = roleInput.value.trim();


    if (name === "" || role === "") {

        alert("Please enter both the Full Name and Role.");

        return;
    }


    const newStaff = {
        name: name,
        role: role,
        status: "Active"
    };


    staffList.push(newStaff);

    displayStaff();


    nameInput.value = "";
    roleInput.value = "";

});


toggleInactiveBtn.addEventListener("click", function () {

    showInactive = !showInactive;

    toggleInactiveBtn.classList.toggle(
        "active",
        showInactive
    );

    displayStaff();

});


// Initial Display

displayStaff();

toggleInactiveBtn.classList.toggle(
    "active",
    showInactive
);

