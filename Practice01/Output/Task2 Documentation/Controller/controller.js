var app = angular.module("app", []);

app.controller("StaffController", function () {

    var vm = this;

    vm.staffList = staffData;

    vm.showInactiveOnly = false;

    vm.newStaff = {
        name: "",
        role: ""
    };

    vm.addStaff = function () {

        var name = vm.newStaff.name.trim();
        var role = vm.newStaff.role.trim();

        if (name === "" || role === "") {
            alert("Please enter both the Full Name and Role.");
            return;
        }

        vm.staffList.push({
            id: Date.now(),
            name: name,
            role: role,
            status: "Active"
        });

        vm.newStaff.name = "";
        vm.newStaff.role = "";
    };

    vm.toggleInactive = function () {
        vm.showInactiveOnly = !vm.showInactiveOnly;
    };

    vm.toggleStatus = function (staff) {

        if (staff.status === "Active") {
            staff.status = "Inactive";
        } else {
            staff.status = "Active";
        }

    };

});