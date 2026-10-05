// ============================================
// GENERAL LIST CONTROLLER
// ============================================

app.controller("GeneralListController", function ($scope, $mdDialog) {

    var vm = this;

    // ============================================
    // AUTHENTICATION CHECK
    // ============================================

    firebase.auth().onAuthStateChanged(function (user) {

        if (!user) {

            window.location.href = "login.html";

            return;
        }

        console.log("Authenticated user:", user.email);

    });


    // ============================================
    // LOAD GENERAL LISTS FROM FIRESTORE
    // ============================================

    vm.lists = [];

    db.collection("generalLists")
        .onSnapshot(function (snapshot) {

            var updatedLists = [];


            snapshot.forEach(function (doc) {

                var data = doc.data();

                var list = new GeneralList(
                    doc.id,
                    data.name,
                    data.columns || [],
                    data.records || []
                );

                updatedLists.push(list);

            });


            // ============================================
            // UPDATE ANGULARJS UI
            // ============================================

            $scope.$evalAsync(function () {

                vm.lists = updatedLists;


                // ============================================
                // KEEP SELECTED LIST UPDATED
                // ============================================

                if (vm.selectedList) {

                    var updatedSelectedList = null;

                    updatedLists.forEach(function (list) {

                        if (list.id === vm.selectedList.id) {

                            updatedSelectedList = list;

                        }

                    });


                    if (updatedSelectedList) {

                        vm.selectedList = updatedSelectedList;

                    } else {

                        // Selected list was deleted

                        vm.selectedList = null;

                    }

                }

            });


            console.log(
                "General Lists loaded:",
                updatedLists
            );

        }, function (error) {


            console.error(
                "Error loading General Lists:",
                error
            );


            $scope.$evalAsync(function () {

                Swal.fire({

                    icon: "error",

                    title: "Unable to Load Lists",

                    text:
                        "There was a problem loading the General Lists."

                });

            });

        });

    // ============================================
    // LOGOUT
    // ============================================

    vm.logout = function () {

        Swal.fire({

            title: "Logout?",

            text: "Are you sure you want to logout?",

            icon: "question",

            showCancelButton: true,

            confirmButtonText: "Yes, logout",

            cancelButtonText: "Cancel"

        }).then(function (result) {

            if (!result.isConfirmed) {

                return;

            }


            // ============================================
            // SIGN OUT FROM FIREBASE
            // ============================================

            firebase.auth()
                .signOut()

                .then(function () {

                    console.log(
                        "User successfully logged out."
                    );


                    // ============================================
                    // REDIRECT TO LOGIN
                    // ============================================

                    window.location.href =
                        "login.html";

                })

                .catch(function (error) {

                    console.error(
                        "Logout error:",
                        error
                    );


                    Swal.fire({

                        icon: "error",

                        title: "Logout Failed",

                        text:
                            "Unable to logout. Please try again."

                    });

                });

        });

    };



    // ============================================
    // SELECTED LIST
    // ============================================

    vm.selectedList = null;


    // ============================================
    // SELECT LIST
    // ============================================

    vm.selectList = function (list) {

        vm.selectedList = list;

    };


    // ============================================
    // OPEN ADD RECORD DIALOG
    // ============================================

    vm.openAddRecordDialog = function () {

        if (!vm.selectedList) {

            Swal.fire({
                icon: "warning",
                title: "No List Selected",
                text: "Please select a list first."
            });

            return;
        }


        $mdDialog.show({

            templateUrl: "add-record-dialog.html",

            controller: function ($mdDialog, selectedList) {

                var dialogVm = this;


                // ============================================
                // SELECTED LIST
                // ============================================

                dialogVm.selectedList = selectedList;


                // ============================================
                // NEW RECORD
                // ============================================

                dialogVm.record = {};


                // ============================================
                // ADD RECORD
                // ============================================

                dialogVm.addRecord = function () {


                    // ============================================
                    // VALIDATE FIELDS
                    // ============================================

                    for (
                        var i = 0;
                        i < dialogVm.selectedList.columns.length;
                        i++
                    ) {

                        var column =
                            dialogVm.selectedList.columns[i];

                        var value =
                            dialogVm.record[column.name];


                        if (
                            value === undefined ||
                            value === null ||
                            value === ""
                        ) {

                            Swal.fire({

                                icon: "warning",

                                title: "Incomplete Record",

                                text:
                                    "Please enter " +
                                    column.name +
                                    "."

                            });

                            return;
                        }

                    }


                    // ============================================
                    // CREATE NEW RECORD
                    // ============================================

                    var newRecord =
                        angular.copy(dialogVm.record);


                    console.log(
                        "New Record:",
                        newRecord
                    );


                    // ============================================
                    // CREATE UPDATED RECORD ARRAY
                    // ============================================

                    var updatedRecords =
                        angular.copy(
                            dialogVm.selectedList.records || []
                        );


                    updatedRecords.push(newRecord);


                    console.log(
                        "Records to save:",
                        updatedRecords
                    );


                    console.log(
                        "Saving to list:",
                        dialogVm.selectedList.id
                    );


                    // ============================================
                    // SAVE TO FIRESTORE
                    // ============================================

                    db.collection("generalLists")
                        .doc(dialogVm.selectedList.id)
                        .update({

                            records: updatedRecords

                        })

                        .then(function () {


                            console.log(
                                "Record successfully saved to Firestore."
                            );


                            // ============================================
                            // SUCCESS
                            // ============================================

                            Swal.fire({

                                icon: "success",

                                title: "Record Added",

                                text:
                                    "The record was added successfully.",

                                timer: 1200,

                                showConfirmButton: false

                            });


                            $mdDialog.hide();

                        })

                        .catch(function (error) {


                            console.error(
                                "FIRESTORE ADD RECORD ERROR:",
                                error
                            );


                            Swal.fire({

                                icon: "error",

                                title: "Add Failed",

                                text:
                                    error.message ||
                                    "Unable to save the record."

                            });

                        });

                };


                // ============================================
                // CANCEL
                // ============================================

                dialogVm.cancel = function () {

                    $mdDialog.cancel();

                };

            },

            controllerAs: "vm",

            locals: {

                selectedList: vm.selectedList

            },

            clickOutsideToClose: true

        });

    };


    // ============================================
    // CREATE NEW LIST DIALOG
    // ============================================

    vm.openCreateListDialog = function () {

        $mdDialog.show({

            templateUrl: "create-list-dialog.html",

            controller: "CreateListDialogController",

            controllerAs: "vm",

            clickOutsideToClose: true

        });

    };


    // ============================================
    // OPEN EDIT RECORD DIALOG
    // ============================================

    vm.openEditRecordDialog = function (record) {

        if (!vm.selectedList) {

            return;
        }


        // ============================================
        // FIND ORIGINAL RECORD INDEX
        // ============================================

        var recordIndex =
            vm.selectedList.records.indexOf(record);


        if (recordIndex === -1) {

            Swal.fire({

                icon: "error",

                title: "Record Not Found",

                text:
                    "The record could not be found."

            });

            return;
        }


        $mdDialog.show({

            templateUrl: "edit-record-dialog.html",

            controller: function (
                $mdDialog,
                selectedList,
                recordToEdit,
                recordIndex
            ) {

                var dialogVm = this;


                // ============================================
                // SELECTED LIST
                // ============================================

                dialogVm.selectedList = selectedList;


                // ============================================
                // COPY RECORD FOR EDITING
                // ============================================

                dialogVm.record =
                    angular.copy(recordToEdit);


                // ============================================
                // UPDATE RECORD
                // ============================================

                dialogVm.updateRecord = function () {


                    // ============================================
                    // VALIDATE FIELDS
                    // ============================================

                    for (
                        var i = 0;
                        i < dialogVm.selectedList.columns.length;
                        i++
                    ) {

                        var column =
                            dialogVm.selectedList.columns[i];

                        var value =
                            dialogVm.record[column.name];


                        if (
                            value === undefined ||
                            value === null ||
                            value === ""
                        ) {

                            Swal.fire({

                                icon: "warning",

                                title: "Incomplete Record",

                                text:
                                    "Please enter " +
                                    column.name +
                                    "."

                            });

                            return;
                        }

                    }


                    // ============================================
                    // COPY CURRENT RECORDS
                    // ============================================

                    var updatedRecords =
                        angular.copy(
                            dialogVm.selectedList.records || []
                        );


                    // ============================================
                    // REPLACE RECORD
                    // ============================================

                    updatedRecords[recordIndex] =
                        angular.copy(dialogVm.record);


                    console.log(
                        "Updated Record:",
                        updatedRecords[recordIndex]
                    );


                    console.log(
                        "Records to save:",
                        updatedRecords
                    );


                    // ============================================
                    // SAVE TO FIRESTORE
                    // ============================================

                    db.collection("generalLists")
                        .doc(dialogVm.selectedList.id)
                        .update({

                            records: updatedRecords

                        })

                        .then(function () {


                            console.log(
                                "Record successfully updated in Firestore."
                            );


                            // ============================================
                            // SUCCESS
                            // ============================================

                            Swal.fire({

                                icon: "success",

                                title: "Record Updated",

                                text:
                                    "The record was updated successfully.",

                                timer: 1200,

                                showConfirmButton: false

                            });


                            $mdDialog.hide();

                        })

                        .catch(function (error) {


                            console.error(
                                "FIRESTORE UPDATE RECORD ERROR:",
                                error
                            );


                            Swal.fire({

                                icon: "error",

                                title: "Update Failed",

                                text:
                                    error.message ||
                                    "Unable to update the record."

                            });

                        });

                };


                // ============================================
                // CANCEL
                // ============================================

                dialogVm.cancel = function () {

                    $mdDialog.cancel();

                };

            },

            controllerAs: "vm",

            locals: {

                selectedList: vm.selectedList,

                recordToEdit: record,

                recordIndex: recordIndex

            },

            clickOutsideToClose: true

        });

    };

    // ============================================
    // OPEN EDIT LIST DIALOG
    // ============================================

    vm.openEditListDialog = function () {

        if (!vm.selectedList) {

            Swal.fire({

                icon: "warning",

                title: "No List Selected",

                text: "Please select a list first."

            });

            return;

        }


        $mdDialog.show({

            templateUrl: "edit-list-dialog.html",

            controller: "EditListDialogController",

            controllerAs: "vm",

            locals: {

                selectedList: vm.selectedList

            },

            clickOutsideToClose: true

        });

    };

    // ============================================
    // DELETE RECORD
    // ============================================

    vm.deleteRecord = function (record) {

        // Make sure a list is selected
        if (!vm.selectedList) {
            Swal.fire({
                icon: "warning",
                title: "No List Selected",
                text: "Please select a list first."
            });
            return;
        }

        // Find the record inside the selected list
        var recordIndex = vm.selectedList.records.indexOf(record);

        if (recordIndex === -1) {
            Swal.fire({
                icon: "error",
                title: "Record Not Found",
                text: "The record could not be found."
            });
            return;
        }

        // Show confirmation dialog
        Swal.fire({
            title: "Delete Record?",
            text: "Are you sure you want to delete this record?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel"

        }).then(function (result) {

            if (!result.isConfirmed) {
                return;
            }

            // Copy existing records
            var updatedRecords = angular.copy(
                vm.selectedList.records || []
            );

            // Remove the selected record
            updatedRecords.splice(recordIndex, 1);

            console.log("Deleting record:", record);
            console.log("Records after deletion:", updatedRecords);

            // Update Firestore
            db.collection("generalLists")
                .doc(vm.selectedList.id)
                .update({
                    records: updatedRecords
                })

                .then(function () {

                    console.log(
                        "Record successfully deleted from Firestore."
                    );

                    Swal.fire({
                        icon: "success",
                        title: "Record Deleted",
                        text: "The record was deleted successfully.",
                        timer: 1200,
                        showConfirmButton: false
                    });

                })

                .catch(function (error) {

                    console.error(
                        "FIRESTORE DELETE RECORD ERROR:",
                        error
                    );

                    Swal.fire({
                        icon: "error",
                        title: "Delete Failed",
                        text: error.message ||
                            "Unable to delete the record."
                    });

                });

        });
    };

    // ============================================
    // DELETE LIST
    // ============================================

    vm.deleteList = function () {

        if (!vm.selectedList) {

            Swal.fire({

                icon: "warning",

                title: "No List Selected",

                text: "Please select a list first."

            });

            return;

        }


        var listId = vm.selectedList.id;

        var listName = vm.selectedList.name;


        // ============================================
        // DELETE CONFIRMATION
        // ============================================

        Swal.fire({

            title: "Delete List?",

            text:
                "Are you sure you want to delete " +
                listName +
                "? All records inside this list will also be removed.",

            icon: "warning",

            showCancelButton: true,

            confirmButtonText: "Yes, delete it",

            cancelButtonText: "Cancel"

        }).then(function (result) {


            if (!result.isConfirmed) {

                return;

            }


            // ============================================
            // DELETE FROM FIRESTORE
            // ============================================

            db.collection("generalLists")
                .doc(listId)
                .delete()

                .then(function () {


                    // ============================================
                    // SUCCESS
                    // ============================================

                    Swal.fire({

                        icon: "success",

                        title: "List Deleted",

                        text:
                            listName +
                            " was deleted successfully.",

                        timer: 1500,

                        showConfirmButton: false

                    });



                    vm.selectedList = null;

                })

                .catch(function (error) {


                    // ============================================
                    // ERROR
                    // ============================================

                    console.error(
                        "Error deleting General List:",
                        error
                    );


                    Swal.fire({

                        icon: "error",

                        title: "Delete Failed",

                        text: "Unable to delete the list."

                    });

                });

        });

    };

    vm.startTour = function () {

        var driver = window.driver.js.driver;

        var tour = driver({

            showProgress: true,

            steps: [

                {
                    element: "#tour-navigation",
                    popover: {
                        title: "Navigation",
                        description: "Use the sidebar to move between the Dashboard, Location Map, and General Lists."
                    }
                },

                {
                    element: "#tour-list-panel",
                    popover: {
                        title: "Existing Lists",
                        description: "This section contains the general lists currently stored in the system."
                    }
                },

                {
                    element: "#tour-create-list",
                    popover: {
                        title: "Create New List",
                        description: "Create a new general list by defining its name, columns, and column types."
                    }
                },
                {
                    element: "#tour-edit-list",
                    popover: {
                        title: "Edit List",
                        description: "Use this button to modify the selected list, including its name, columns, and column types."
                    }
                },

                {
                    element: "#tour-delete-list",
                    popover: {
                        title: "Delete List",
                        description: "Use this button to delete the selected list. Deleting a list also removes all records stored inside it."
                    }
                },

                {
                    element: "#tour-list-table",
                    popover: {
                        title: "List Records",
                        description: "View the records belonging to the selected general list."
                    }
                },

                {
                    element: "#tour-add-record",
                    popover: {
                        title: "Add Record",
                        description: "Add a new record using the columns defined for the selected list."
                    }
                },

                {
                    element: "#tour-logout",
                    popover: {
                        title: "Logout",
                        description: "Use this button to securely sign out of the system."
                    }
                }

            ]

        });

        tour.drive();
    };

});

// ============================================
// CREATE LIST DIALOG CONTROLLER
// ============================================

app.controller("CreateListDialogController", function ($mdDialog) {

    var vm = this;


    // ============================================
    // NEW LIST
    // ============================================

    vm.newList = {

        name: "",

        columns: []

    };


    // ============================================
    // ADD COLUMN
    // ============================================

    vm.addColumn = function () {

        vm.newList.columns.push({

            name: "",

            type: "text"

        });

    };


    // ============================================
    // REMOVE COLUMN
    // ============================================

    vm.removeColumn = function (index) {

        vm.newList.columns.splice(
            index,
            1
        );

    };


    // ============================================
    // CREATE LIST
    // ============================================

    vm.createList = function () {

        // ========================================
        // CHECK LIST NAME
        // ========================================

        if (!vm.newList.name.trim()) {

            Swal.fire({

                icon: "warning",

                title: "List Name Required",

                text: "Please enter a name for the list."

            });

            return;

        }


        // ========================================
        // CHECK COLUMNS
        // ========================================

        if (vm.newList.columns.length === 0) {

            Swal.fire({

                icon: "warning",

                title: "Column Required",

                text: "Please add at least one column."

            });

            return;

        }


        // ========================================
        // CHECK COLUMN NAMES
        // ========================================

        for (
            var i = 0;
            i < vm.newList.columns.length;
            i++
        ) {

            if (
                !vm.newList.columns[i].name.trim()
            ) {

                Swal.fire({

                    icon: "warning",

                    title: "Column Name Required",

                    text: "Please enter a name for every column."

                });

                return;

            }

        }


        // ========================================
        // CREATE GENERAL LIST
        // ========================================

        var id = "list_" + Date.now();

        var newList = new GeneralList(
            id,
            vm.newList.name.trim(),
            angular.copy(vm.newList.columns),
            []
        );

        // ============================================
        // SAVE LIST TO FIRESTORE
        // ============================================

        db.collection("generalLists")
            .doc(id)
            .set({
                name: newList.name,
                columns: newList.columns,
                records: newList.records
            })
            .then(function () {

                Swal.fire({
                    icon: "success",
                    title: "List Created",
                    text: newList.name + " was created successfully.",
                    timer: 1500,
                    showConfirmButton: false
                });

                $mdDialog.hide();

            })
            .catch(function (error) {

                console.error("Error creating list:", error);

                Swal.fire({
                    icon: "error",
                    title: "Create Failed",
                    text: "Unable to create the list."
                });

            });


    };


    // ============================================
    // CANCEL
    // ============================================

    vm.cancel = function () {

        $mdDialog.cancel();

    };

});

// ============================================
// EDIT LIST DIALOG CONTROLLER
// ============================================

app.controller("EditListDialogController", function ($mdDialog, selectedList) {

    var vm = this;


    // ============================================
    // COPY SELECTED LIST
    // ============================================


    vm.originalList = angular.copy(selectedList);

    vm.editList = angular.copy(selectedList);


    // ============================================
    // ADD COLUMN
    // ============================================

    vm.addColumn = function () {

        vm.editList.columns.push({

            name: "",

            type: "text"

        });

    };


    // ============================================
    // REMOVE COLUMN
    // ============================================

    vm.removeColumn = function (index) {

        vm.editList.columns.splice(index, 1);

    };


    // ============================================
    // SAVE CHANGES
    // ============================================

    vm.saveChanges = function () {


        // ============================================
        // VALIDATE LIST NAME
        // ============================================

        if (!vm.editList.name || !vm.editList.name.trim()) {

            Swal.fire({

                icon: "warning",

                title: "List Name Required",

                text: "Please enter a list name."

            });

            return;

        }


        // ============================================
        // VALIDATE COLUMNS
        // ============================================

        if (vm.editList.columns.length === 0) {

            Swal.fire({

                icon: "warning",

                title: "No Columns",

                text: "Please add at least one column."

            });

            return;

        }


        // ============================================
        // VALIDATE COLUMN NAMES
        // ============================================

        for (var i = 0; i < vm.editList.columns.length; i++) {

            if (
                !vm.editList.columns[i].name ||
                !vm.editList.columns[i].name.trim()
            ) {

                Swal.fire({

                    icon: "warning",

                    title: "Column Name Required",

                    text: "Please enter a name for every column."

                });

                return;

            }

        }


        // ============================================
        // CHECK FOR DUPLICATE COLUMN NAMES
        // ============================================

        var columnNames = {};

        for (var j = 0; j < vm.editList.columns.length; j++) {

            var columnName =
                vm.editList.columns[j].name.trim().toLowerCase();


            if (columnNames[columnName]) {

                Swal.fire({

                    icon: "warning",

                    title: "Duplicate Column",

                    text: "Column names must be unique."

                });

                return;

            }


            columnNames[columnName] = true;

        }


        // ============================================
        // CLEAN COLUMN NAMES
        // ============================================

        vm.editList.columns.forEach(function (column) {

            column.name = column.name.trim();

        });


        // ============================================
        // UPDATE RECORD DATA
        // ============================================

        var originalColumns = vm.originalList.columns || [];

        var updatedColumns = vm.editList.columns || [];

        var records = vm.editList.records || [];


        originalColumns.forEach(function (oldColumn, index) {

            var oldName = oldColumn.name;

            var newColumn = updatedColumns[index];


            if (!newColumn) {

                return;

            }


            var newName = newColumn.name;


            // Column was renamed

            if (oldName !== newName) {

                records.forEach(function (record) {

                    if (
                        Object.prototype.hasOwnProperty.call(
                            record,
                            oldName
                        )
                    ) {

                        record[newName] = record[oldName];

                        delete record[oldName];

                    }

                });

            }

        });


        // ============================================
        // REMOVE DATA FOR DELETED COLUMNS
        // ============================================

        var validColumnNames = {};

        updatedColumns.forEach(function (column) {

            validColumnNames[column.name] = true;

        });


        records.forEach(function (record) {

            Object.keys(record).forEach(function (key) {

                if (!validColumnNames[key]) {

                    delete record[key];

                }

            });

        });


        // ============================================
        // UPDATE FIRESTORE
        // ============================================

        db.collection("generalLists")
            .doc(vm.editList.id)
            .update({

                name: vm.editList.name.trim(),

                columns: updatedColumns,

                records: records

            })

            .then(function () {


                // ============================================
                // SUCCESS
                // ============================================

                Swal.fire({

                    icon: "success",

                    title: "List Updated",

                    text:
                        vm.editList.name.trim() +
                        " was updated successfully.",

                    timer: 1500,

                    showConfirmButton: false

                });


                $mdDialog.hide();

            })

            .catch(function (error) {


                // ============================================
                // ERROR
                // ============================================

                console.error(
                    "Error updating General List:",
                    error
                );


                Swal.fire({

                    icon: "error",

                    title: "Update Failed",

                    text: "Unable to update the list."

                });

            });

    };


    // ============================================
    // CANCEL
    // ============================================

    vm.cancel = function () {

        $mdDialog.cancel();

    };

});
