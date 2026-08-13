var app = angular.module("app", []);

app.controller("StaffController", function () {
    var vm = this;

    vm.staffList = [
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

    vm.showInactive = true;

    vm.newStaff = {
        name: "",
        role: "",
    };

    vm.addStaff = function () {

        var name = vm.newStaff.name.trim();
        var role = vm.newStaff.role.trim();

        if (name === "" || role === "") {
            alert("Please enter both the Full Name and Role.");
            return;
        }

        vm.staffList.push({
            name: name,
            role: role,
            status: "Active"
        });

        vm.newStaff.name = "";
        vm.newStaff.role = "";
    };

    vm.toggleInactive = function () {
        vm.showInactive = !vm.showInactive;
    };

    vm.toggleStatus = function (staff) {
        if (staff.status === "Active") {
            staff.status = "Inactive";
        } else {
            staff.status = "Active";
        }
    };
});