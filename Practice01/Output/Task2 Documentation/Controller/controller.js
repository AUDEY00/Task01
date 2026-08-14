var app = angular.module("app", ["ngMaterial"]);

app.controller("StaffController", function ($scope, $mdToast, $mdDialog) {

    var vm = this;

    function generateStaffId() {
        return Date.now() + Math.floor(Math.random() * 100000);
    }
    function showToast(message) {
        $mdToast.show(
            $mdToast.simple()
                .textContent(message)
                .position("bottom right")
                .hideDelay(2000)
        );
    }

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

            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Please enter both the Full Name and Role.'
            });

            return;
        }

        var newStaff = {
            id: generateStaffId(),
            name: name,
            role: role,
            status: "Active"
        };

        vm.staffList.push(newStaff);

        // Clear the form
        vm.newStaff.name = "";
        vm.newStaff.role = "";

        // Show success notification
        showToast(name + " added successfully.");
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

        showToast(staff.name + " is now " + staff.status);

    };

    vm.viewStaff = function (staff) {

        $mdDialog.show({
            templateUrl: "View/staff-details.html",

            controller: function ($scope, $mdDialog) {

                $scope.staff = staff;

                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };

            }
        });

    };
    vm.exportExcel = function () {

        var exportData = vm.staffList.map(function (staff) {

            return {
                "Staff ID": staff.id,
                "Full Name": staff.name,
                "Role": staff.role,
                "Status": staff.status
            };

        });

        var worksheet = XLSX.utils.json_to_sheet(exportData);

        var workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Staff Directory"
        );

        XLSX.writeFile(
            workbook,
            "staff-directory.xlsx"
        );

        showToast("Staff directory exported to Excel.");
    };

    vm.exportCSV = function () {

        var exportData = vm.staffList.map(function (staff) {

            return {
                "Staff ID": staff.id,
                "Full Name": staff.name,
                "Role": staff.role,
                "Status": staff.status
            };

        });

        var worksheet = XLSX.utils.json_to_sheet(exportData);

        var csv = XLSX.utils.sheet_to_csv(worksheet);

        var blob = new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        var link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.download = "staff-directory.csv";

        link.click();

        URL.revokeObjectURL(link.href);

        showToast("Staff directory exported to CSV.");
    };

    vm.exportPDF = function () {

        var jsPDF = window.jspdf.jsPDF;

        var doc = new jsPDF();

        doc.text(
            "IT Unit Directory",
            14,
            15
        );

        var tableData = vm.staffList.map(function (staff) {

            return [
                staff.id,
                staff.name,
                staff.role,
                staff.status
            ];

        });

        doc.autoTable({

            head: [
                [
                    "Staff ID",
                    "Full Name",
                    "Role",
                    "Status"
                ]
            ],

            body: tableData,

            startY: 25

        });

        doc.save("staff-directory.pdf");

        showToast("Staff directory exported to PDF.");
    };

    vm.importStaff = function (file) {

        if (!file) {
            return;
        }

        var reader = new FileReader();

        reader.onload = function (event) {

            try {

                var data = new Uint8Array(event.target.result);

                var workbook = XLSX.read(data, {
                    type: "array"
                });

                var sheetName = workbook.SheetNames[0];

                var worksheet = workbook.Sheets[sheetName];

                var importedData = XLSX.utils.sheet_to_json(worksheet);

                var importedCount = 0;

                importedData.forEach(function (row) {

                    if (!row["Full Name"] || !row["Role"]) {
                        return;
                    }

                    vm.staffList.push({
                        id: generateStaffId(),
                        name: String(row["Full Name"]).trim(),
                        role: String(row["Role"]).trim(),
                        status: row["Status"] === "Inactive"
                            ? "Inactive"
                            : "Active"
                    });

                    importedCount++;
                });

                $scope.$applyAsync();

                if (importedCount === 0) {

                    Swal.fire({
                        icon: "warning",
                        title: "No Staff Records",
                        text: "No valid staff records were found in the selected file."
                    });

                    return;
                }

                showToast(
                    importedCount + " staff record(s) imported successfully."
                );
            } catch (error) {

                console.error("Import error:", error);

                Swal.fire({
                    icon: "error",
                    title: "Import Failed",
                    text: "The selected file could not be imported."
                });

            }

        };

        reader.readAsArrayBuffer(file);
    };





});