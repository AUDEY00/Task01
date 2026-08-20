var app = angular.module("app", ["ngMaterial"]);

app.controller("StaffController", function ($scope, $mdToast, $mdDialog) {

    var vm = this;

    // -----------------------------------
    // Authentication State
    // -----------------------------------

    firebase.auth().onAuthStateChanged(function (user) {

        if (user) {

            console.log(
                "Authenticated user:",
                user.email

            );
            vm.currentUser = user;

        } else {

            console.log(
                "No authenticated user."
            );

            vm.currentUser = null;

            window.location.href = "View/login.html";
            return;

        }

        $scope.$applyAsync();

    });

    // -----------------------------------
    // Generate Unque Id
    // ----------------------------------

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


    // Read staff data from Firebase
    db.collection("staff").onSnapshot(function (snapshot) {

        console.log("Firestore staff snapshot received.");

        vm.staffList = [];

        snapshot.forEach(function (doc) {

            var staff = doc.data();

            // Get staff data from Firestore
            console.log("Document ID:", doc.id);
            console.log("Staff Data:", staff);

            vm.staffList.push(staff);

        });

        $scope.$applyAsync();

    }, function (error) {

        console.error("Firestore read error:", error);

    });

    vm.showInactiveOnly = false;

    vm.newStaff = {
        name: "",
        role: ""
    };

    vm.addStaff = function () {

        var name = vm.newStaff.name.trim();
        var role = vm.newStaff.role.trim();

        // Validate required fields
        if (name === "" || role === "") {

            Swal.fire({
                icon: "error",
                title: "Missing Information",
                text: "Please enter both the Full Name and Role."
            });

            return;
        }

        var staffId = generateStaffId();

        // Create new staff record
        // New staff members start as Inactive.
        var newStaff = {
            id: staffId,
            name: name,
            role: role,
            status: "Inactive"
        };

        // Save to Firestore
        db.collection("staff")
            .doc(String(staffId))
            .set(newStaff)

            .then(function () {

                console.log(
                    "Staff added to Firestore:",
                    staffId
                );

                // Clear the form
                vm.newStaff.name = "";
                vm.newStaff.role = "";

                $scope.$applyAsync();

                // Show success notification
                showToast(
                    name + " added successfully."
                );

            })

            .catch(function (error) {

                console.error(
                    "Firestore write error:",
                    error
                );

                Swal.fire({
                    icon: "error",
                    title: "Add Staff Failed",
                    text: "The staff member could not be added."
                });

            });
    };

    vm.toggleInactive = function () {
        vm.showInactiveOnly = !vm.showInactiveOnly;
    };

    vm.toggleStatus = function (staff) {

        var newStatus;

        if (staff.status === "Active") {
            newStatus = "Inactive";
        } else {
            newStatus = "Active";
        }
        console.log("Staff ID:", staff.id);
        console.log("New Status:", newStatus);

        db.collection("staff")
            .doc(String(staff.id))
            .update({
                status: newStatus
            })
            .then(function () {

                console.log(
                    "Firestore status updated:",
                    staff.id,
                    newStatus
                );

                showToast(staff.name + " is now " + newStatus);

            })

            .catch(function (error) {
                console.error("Firestore update error:", error);

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update staff status. Please try again.'
                });
            });

    };

    vm.editStaff = function (staff) {
        $mdDialog.show({
            templateUrl: "View/staff-details.html",
            controller: function ($scope, $mdDialog) {
                $scope.staff = angular.copy(staff);

                $scope.closeDialog = function () {
                    $mdDialog.cancel();
                };

                $scope.saveChanges = function () {

                    var name = $scope.staff.name.trim();
                    var role = $scope.staff.role.trim();

                    if (name === "" || role === "") {
                        Swal.fire({
                            icon: "error",
                            title: "Missing Information",
                            text: "Please enter both the Full Name and Role."
                        });
                        return;
                    }

                    db.collection("staff")
                        .doc(String(staff.id))
                        .update({
                            name: name,
                            role: role
                        })
                        .then(function () {
                            console.log(
                                "Staff updated in Firestore:",
                                staff.id
                            );

                            $mdDialog.hide();
                            showToast(staff.name + "'s details updated successfully.");
                        })

                        .catch(function (error) {
                            console.error("Firestore update error:", error);
                            Swal.fire({
                                icon: 'error',
                                title: 'Update Failed',
                                text: 'Failed to update staff member. Please try again.'
                            });
                        });

                };
            }
        });
    };

    vm.deleteStaff = function (staff) {
        Swal.fire({

            icon: 'warning',
            title: 'Delete Staff',
            text: "Are you sure you want to delete " + staff.name + "?",
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel'

        }).then(function (result) {

            if (!result.isConfirmed) {
                return;
            }

            console.log(
                "Deleting staff:",
                staff.id
            );

            db.collection("staff")
                .doc(String(staff.id))
                .delete()

                .then(function () {

                    console.log(
                        "Staff deleted from Firestore:",
                        staff.id
                    );

                    showToast(staff.name + " has been deleted.");
                })
                .catch(function (error) {
                    console.error("Firestore delete error:", error);

                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete staff member. Please try again.'
                    });
                });
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

                // Convert the worksheet into an array of rows.
                // This allows the program to search for the header row
                // even if the headers are not on the first row.
                var rows = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: ""
                });

                var headerRowIndex = -1;

                var nameColumnIndex = -1;
                var roleColumnIndex = -1;

                var foundFullName = false;
                var foundRole = false;
                var foundName = false;


                // -----------------------------------
                // Search for Header Row
                // -----------------------------------

                for (var i = 0; i < rows.length; i++) {

                    var currentRow = rows[i];

                    var rowFullNameIndex = -1;
                    var rowRoleIndex = -1;
                    var rowNameIndex = -1;

                    for (var j = 0; j < currentRow.length; j++) {

                        var cellValue = String(currentRow[j])
                            .trim()
                            .toLowerCase();

                        if (cellValue === "full name") {
                            rowFullNameIndex = j;
                        }

                        if (cellValue === "role") {
                            rowRoleIndex = j;
                        }

                        if (cellValue === "name") {
                            rowNameIndex = j;
                        }
                    }


                    // Check if the required headers are
                    // located on this row.
                    if (rowFullNameIndex !== -1) {
                        foundFullName = true;
                    }

                    if (rowRoleIndex !== -1) {
                        foundRole = true;
                    }

                    if (rowNameIndex !== -1) {
                        foundName = true;
                    }


                    // If both required headers are on
                    // the same row, this is the header row.
                    if (
                        rowFullNameIndex !== -1 &&
                        rowRoleIndex !== -1
                    ) {

                        headerRowIndex = i;

                        nameColumnIndex = rowFullNameIndex;
                        roleColumnIndex = rowRoleIndex;

                        break;
                    }
                }


                // -----------------------------------
                // Header Validation
                // -----------------------------------

                if (!foundFullName && !foundRole) {

                    if (foundName) {

                        Swal.fire({
                            icon: "warning",
                            title: "Cannot Import File",
                            text: "The file contains 'Name' and 'Role', but the system requires 'Full Name' and 'Role'."
                        });

                    } else {

                        Swal.fire({
                            icon: "warning",
                            title: "Invalid File",
                            text: "The required 'Full Name' and 'Role' headers were not found."
                        });

                    }

                    return;
                }


                // Full Name is missing
                if (!foundFullName) {

                    if (foundName) {

                        Swal.fire({
                            icon: "warning",
                            title: "Cannot Import File",
                            text: "The 'Role' header was found, but 'Full Name' was not found. The file contains 'Name' instead. Please rename 'Name' to 'Full Name'."
                        });

                    } else {

                        Swal.fire({
                            icon: "warning",
                            title: "Cannot Import File",
                            text: "The 'Role' header was found, but the required 'Full Name' header is missing."
                        });

                    }

                    return;
                }


                // Role is missing
                if (!foundRole) {

                    Swal.fire({
                        icon: "warning",
                        title: "Cannot Import File",
                        text: "The 'Full Name' header was found, but the required 'Role' header is missing."
                    });

                    return;
                }


                // Both headers were found,
                // but not on the same row.
                if (headerRowIndex === -1) {

                    Swal.fire({
                        icon: "warning",
                        title: "Invalid Header Row",
                        text: "The 'Full Name' and 'Role' headers were found, but they are not on the same row."
                    });

                    return;
                }


                // -----------------------------------
                // Import Staff Records
                // -----------------------------------

                var importedCount = 0;

                var importPromises = [];

                // Start reading immediately after the header row.
                for (
                    var rowIndex = headerRowIndex + 1;
                    rowIndex < rows.length;
                    rowIndex++
                ) {

                    var row = rows[rowIndex];

                    var name = String(
                        row[nameColumnIndex] || ""
                    ).trim();

                    var role = String(
                        row[roleColumnIndex] || ""
                    ).trim();


                    // Skip incomplete rows.
                    if (name === "" || role === "") {
                        continue;
                    }


                    // Create a new staff member.
                    // ID is generated automatically.
                    // Status is always Inactive.
                    var newStaff = {

                        id: generateStaffId(),

                        name: name,

                        role: role,

                        status: "Inactive"

                    };


                    // Save the staff member to Firebase.
                    var importPromise = db.collection("staff")
                        .doc(String(newStaff.id))
                        .set(newStaff);

                    importPromises.push(importPromise);

                    importedCount++;
                }


                // -----------------------------------
                // Import Result
                // -----------------------------------

                if (importedCount === 0) {
                    document.getElementById("staffFile").value = "";

                    Swal.fire({
                        icon: "warning",
                        title: "No Staff Records",
                        text: "The required headers were found, but no valid staff records were found in the file."
                    });

                    return;
                }


                // Wait until all Firebase writes are complete.
                Promise.all(importPromises)

                    .then(function () {

                        $scope.$applyAsync();

                        showToast(
                            importedCount +
                            " staff record(s) imported successfully."
                        );
                        document.getElementById("staffFile").value = "";

                    })

                    .catch(function (error) {

                        console.error(
                            "Firebase import error:",
                            error
                        );

                        Swal.fire({
                            icon: "error",
                            title: "Import Failed",
                            text: "The staff records were found, but an error occurred while saving them to Firebase."
                        });

                    });


            } catch (error) {

                console.error(
                    "Import error:",
                    error
                );

                document.getElementById("staffFile").value = "";

                Swal.fire({
                    icon: "error",
                    title: "Import Failed",
                    text: "The selected file could not be read. Please make sure you are importing a valid Excel or CSV file."
                });

            }



        };

        reader.readAsArrayBuffer(file);
    };

    vm.logout = function () {

        firebase.auth()
            .signOut()

            .then(function () {

                console.log("Logout successful.");

                window.location.href = "View/login.html";

            })

            .catch(function (error) {

                console.error("Logout error:", error);

                Swal.fire({
                    icon: "error",
                    title: "Logout Failed",
                    text: "Unable to log out. Please try again."
                });

            });

    };

});