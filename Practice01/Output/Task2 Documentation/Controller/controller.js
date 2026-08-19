// Create the AngularJS application module.
// "app" is the name of the AngularJS module.
// "ngMaterial" is a dependency used for Angular Material components.
var app = angular.module("app", ["ngMaterial"]);

// Create the StaffController.
// $scope is used to communicate with the AngularJS view.
// $mdToast is used to display small notification messages.
// $mdDialog is used to display dialog/modal windows.
app.controller("StaffController", function ($scope, $mdToast, $mdDialog) {

    // "vm" stands for ViewModel.
    // "this" represents the StaffController instance.
    // Using vm allows the HTML to access controller data through vm.
    var vm = this;

    // Generate a unique ID for a staff member.
    // Date.now() provides the current timestamp.
    // Math.random() adds an additional random number
    // to reduce the possibility of duplicate IDs.

    function generateStaffId() {
        return Date.now() + Math.floor(Math.random() * 100000);
    }

    // Display a small notification message using Angular Material Toast.
    // The message appears at the bottom-right of the screen.
    // The notification automatically disappears after 2 seconds.
    function showToast(message) {
        $mdToast.show(
            $mdToast.simple()
                .textContent(message)
                .position("bottom right")
                .hideDelay(2000)
        );
    }

    // Clear the current staff list before loading the latest data.
    var vm = this;

    // Load staff data from the model
    vm.staffList = angular.copy(staffData);

    // Controls whether only inactive staff are shown
    vm.showInactiveOnly = false;

    // New staff form
    vm.newStaff = {
        name: "",
        role: ""
    };


    // Controls whether the application should show only inactive staff.
    // false means the normal view is displayed initially.
    vm.showInactiveOnly = false;

    // Object used to store the values entered in the Add Staff form.
    vm.newStaff = {
        name: "",
        role: ""
    };

    // Function used to add a new staff member.
    vm.addStaff = function () {

        // Get the entered name and remove unnecessary spaces
        // from the beginning and end of the value.
        var name = vm.newStaff.name.trim();

        // Get the entered role and remove unnecessary spaces.
        var role = vm.newStaff.role.trim();

        // Validate the form.
        // If either the name or role is empty,
        // stop the function and show an error message.
        if (name === "" || role === "") {

            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Please enter both the Full Name and Role.'
            });

            return;
        }

        // Create a new staff object.
        // Newly added staff members are automatically set to Active.
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

    // Function used to switch between showing
    // all staff and showing only inactive staff.
    vm.toggleInactive = function () {
        vm.showInactiveOnly = !vm.showInactiveOnly;
    };

    // Function used to change a staff member's status.
    vm.toggleStatus = function (staff) {

        if (staff.status === "Active") {
            staff.status = "Inactive";
        } else {
            staff.status = "Active";
        }

        showToast(staff.name + " is now " + staff.status);

    };

    // Function used to display the selected staff member's details.
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

    // Function used to export the staff list to an Excel file.
    vm.exportExcel = function () {

        // Convert every staff object into an export-friendly object.
        // The property names become the Excel column headers.
        var exportData = vm.staffList.map(function (staff) {

            return {
                "Staff ID": staff.id,
                "Full Name": staff.name,
                "Role": staff.role,
                "Status": staff.status
            };

        });

        // Convert the JavaScript array into an Excel worksheet.
        var worksheet = XLSX.utils.json_to_sheet(exportData);

        // Create a new Excel workbook.
        var workbook = XLSX.utils.book_new();

        // Add the worksheet to the workbook.
        // "Staff Directory" is the name of the worksheet.
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

    // Function used to export the staff list as a CSV file.
    vm.exportCSV = function () {

        // Convert the staff list into objects containing
        // only the fields that should appear in the CSV file.
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

        // Create a temporary HTML link.
        // The link will be used to trigger the file download.

        var link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.download = "staff-directory.csv";

        link.click();

        URL.revokeObjectURL(link.href);

        showToast("Staff directory exported to CSV.");
    };

    // Function used to export the staff list as a PDF file.
    vm.exportPDF = function () {

        var jsPDF = window.jspdf.jsPDF;

        var doc = new jsPDF();

        doc.text(
            "IT Unit Directory",
            14,
            15
        );

        // Convert each staff object into an array.
        // Each array represents one row in the PDF table.
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

    // Function used when a user imports a file containing staff records.
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

                // Tell AngularJS to update the view asynchronously.
                // This is useful because FileReader works outside
                // of AngularJS's normal event handling.
                $scope.$applyAsync();

                // If no valid records were imported,
                // display a warning message.
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