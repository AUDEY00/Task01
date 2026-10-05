// ============================================
// DOCUMENT EDITOR CONTROLLER
// ============================================

app.controller("DocumentEditorController", function ($scope, $timeout, $sce) {

    var vm = this;

    console.log("DocumentEditorController loaded.");

    // ============================================
    // AUTHENTICATION CHECK
    // ============================================

    firebase.auth().onAuthStateChanged(function (user) {

        if (!user) {

            window.location.href = "login.html";

            return;

        }

        console.log(
            "Authenticated user:",
            user.email
        );

    });

    // ============================================
    // LOGOUT
    // ============================================

    vm.logout = function () {

        firebase.auth().signOut()

            .then(function () {

                console.log("User logged out successfully.");

                window.location.href = "login.html";

            })

            .catch(function (error) {

                console.error(
                    "Logout failed:",
                    error
                );

            });

    };

    // ============================================
    // DOCUMENT CONTENT
    // ============================================

    vm.documentContent = "";


    // ============================================
    // PREVIEW STATE
    // ============================================

    vm.showPreview = false;

    vm.previewContent = "";


    // ============================================
    // AUTO-SAVE
    // ============================================

    vm.documentId = null;

    vm.isAutoSaving = false;

    var autoSaveTimer = null;


    // ============================================
    // GENERATE DOCUMENT ID
    // ============================================

    function generateDocumentId() {

        return "doc_" +
            Date.now() +
            Math.floor(Math.random() * 100000);

    }


    // ============================================
    // INITIALIZE QUILL EDITOR
    // ============================================

    $timeout(function () {

        console.log("Starting Quill initialization...");


        var toolbarOptions = [

            // Bold, Italic, Underline
            [
                "bold",
                "italic",
                "underline"
            ],

            // Headers
            [
                {
                    header: [1, 2, 3, false]
                }
            ],

            // Lists
            [
                {
                    list: "ordered"
                },
                {
                    list: "bullet"
                }
            ],

            // Text Color
            [
                {
                    color: []
                }
            ],

            // Text Alignment
            [
                {
                    align: ["", "center", "right", "justify"]
                }
            ]

        ];


        vm.quill = new Quill("#document-editor", {

            theme: "snow",

            placeholder: "Start writing your document...",

            modules: {
                toolbar: toolbarOptions
            }

        });


        // ============================================
        // DETECT DOCUMENT CHANGES
        // ============================================

        vm.quill.on("text-change", function () {

            $scope.$applyAsync(function () {

                vm.documentContent =
                    vm.quill.root.innerHTML;


                // ============================================
                // RESET AUTO-SAVE TIMER
                // ============================================

                if (autoSaveTimer) {

                    $timeout.cancel(autoSaveTimer);

                    autoSaveTimer = null;

                }


                // ============================================
                // START 10-SECOND AUTO-SAVE TIMER
                // ============================================

                autoSaveTimer = $timeout(function () {

                    vm.autoSaveDocument();

                    autoSaveTimer = null;

                }, 10000);

            });

        });


        console.log("Quill editor initialized successfully.");

    }, 0);


    // ============================================
    // SAVE DOCUMENT TO FIRESTORE
    // ============================================

    vm.saveDocument = function () {

        // ============================================
        // CHECK EMPTY DOCUMENT
        // ============================================

        if (!vm.documentContent ||
            vm.documentContent.trim() === "" ||
            vm.documentContent === "<p><br></p>") {

            Swal.fire({
                icon: "warning",
                title: "Empty Document",
                text: "Please enter some content before saving."
            });

            return;
        }


        // ============================================
        // DOCUMENT DATA
        // ============================================

        var documentData = {

            content: vm.documentContent,

            dateModified:
                firebase.firestore.FieldValue.serverTimestamp()

        };


        // ============================================
        // UPDATE EXISTING DOCUMENT
        // ============================================

        if (vm.documentId) {

            db.collection("documents")
                .doc(vm.documentId)
                .update(documentData)

                .then(function () {

                    console.log(
                        "Document updated successfully:",
                        vm.documentId
                    );


                    Swal.fire({
                        icon: "success",
                        title: "Document Saved",
                        text: "Your document has been updated successfully."
                    });

                })

                .catch(function (error) {

                    console.error(
                        "Error updating document:",
                        error
                    );


                    Swal.fire({
                        icon: "error",
                        title: "Save Failed",
                        text: "Unable to update the document."
                    });

                });


            return;
        }


        // ============================================
        // CREATE NEW DOCUMENT
        // ============================================

        documentData.dateCreated =
            firebase.firestore.FieldValue.serverTimestamp();


        var documentId = generateDocumentId();


        db.collection("documents")
            .doc(documentId)
            .set(documentData)

            .then(function () {

                vm.documentId = documentId;


                console.log(
                    "Document created successfully:",
                    vm.documentId
                );


                Swal.fire({
                    icon: "success",
                    title: "Document Saved",
                    text: "Your document has been saved successfully."
                });

            })

            .catch(function (error) {

                console.error(
                    "Error saving document:",
                    error
                );


                Swal.fire({
                    icon: "error",
                    title: "Save Failed",
                    text: "Unable to save the document."
                });

            });

    };


    // ============================================
    // CREATE NEW DOCUMENT
    // ============================================

    vm.newDocument = function () {

        // ============================================
        // CHECK IF CURRENT DOCUMENT HAS CONTENT
        // ============================================

        if (vm.documentContent &&
            vm.documentContent.trim() !== "" &&
            vm.documentContent !== "<p><br></p>") {

            Swal.fire({

                icon: "question",

                title: "Start a New Document?",

                text: "Your current document will remain saved, but any unsaved changes will be cleared.",

                showCancelButton: true,

                confirmButtonText: "New Document",

                cancelButtonText: "Cancel"

            }).then(function (result) {

                if (result.isConfirmed) {

                    vm.resetDocument();

                }

            });

            return;
        }


        // ============================================
        // START NEW DOCUMENT DIRECTLY
        // ============================================

        vm.resetDocument();

    };


    // ============================================
    // RESET DOCUMENT
    // ============================================

    vm.resetDocument = function () {

        // ============================================
        // CANCEL AUTO-SAVE TIMER
        // ============================================

        if (autoSaveTimer) {

            $timeout.cancel(autoSaveTimer);

            autoSaveTimer = null;

        }


        // ============================================
        // RESET DOCUMENT ID
        // ============================================

        vm.documentId = null;


        // ============================================
        // RESET DOCUMENT CONTENT
        // ============================================

        vm.documentContent = "";


        // ============================================
        // CLEAR QUILL EDITOR
        // ============================================

        if (vm.quill) {

            vm.quill.setContents([]);

        }


        // ============================================
        // RESET AUTO-SAVE STATUS
        // ============================================

        vm.isAutoSaving = false;


        // ============================================
        // RESET PREVIEW
        // ============================================

        vm.previewContent = "";

        vm.showPreview = false;


        console.log("New document started.");

    };


    // ============================================
    // PREVIEW DOCUMENT
    // ============================================

    vm.previewDocument = function () {

        if (!vm.documentContent ||
            vm.documentContent.trim() === "" ||
            vm.documentContent === "<p><br></p>") {

            Swal.fire({
                icon: "warning",
                title: "Empty Document",
                text: "Please enter some content before previewing."
            });

            return;
        }


        vm.previewContent =
            $sce.trustAsHtml(vm.documentContent);

        vm.showPreview = true;

    };


    // ============================================
    // CLOSE PREVIEW
    // ============================================

    vm.closePreview = function () {

        vm.showPreview = false;

    };


    // ============================================
    // AUTO-SAVE DOCUMENT
    // ============================================

    vm.autoSaveDocument = function () {

        // ============================================
        // CHECK EMPTY DOCUMENT
        // ============================================

        if (!vm.documentContent ||
            vm.documentContent.trim() === "" ||
            vm.documentContent === "<p><br></p>") {

            vm.isAutoSaving = false;

            return;
        }


        // ============================================
        // SHOW AUTO-SAVE STATUS
        // ============================================

        vm.isAutoSaving = true;


        // ============================================
        // DOCUMENT DATA
        // ============================================

        var documentData = {

            content: vm.documentContent,

            dateModified:
                firebase.firestore.FieldValue.serverTimestamp()

        };


        // ============================================
        // UPDATE EXISTING DOCUMENT
        // ============================================

        if (vm.documentId) {

            db.collection("documents")
                .doc(vm.documentId)
                .update(documentData)

                .then(function () {

                    console.log(
                        "Draft auto-saved successfully."
                    );


                    $scope.$applyAsync(function () {

                        vm.isAutoSaving = false;

                    });

                })

                .catch(function (error) {

                    console.error(
                        "Error auto-saving document:",
                        error
                    );


                    $scope.$applyAsync(function () {

                        vm.isAutoSaving = false;

                    });

                });


            return;
        }


        // ============================================
        // CREATE NEW DOCUMENT FOR FIRST AUTO-SAVE
        // ============================================

        var documentId = generateDocumentId();


        db.collection("documents")
            .doc(documentId)
            .set(documentData)

            .then(function () {

                vm.documentId = documentId;


                console.log(
                    "Draft created:",
                    vm.documentId
                );


                $scope.$applyAsync(function () {

                    vm.isAutoSaving = false;

                });

            })

            .catch(function (error) {

                console.error(
                    "Error creating draft:",
                    error
                );


                $scope.$applyAsync(function () {

                    vm.isAutoSaving = false;

                });

            });

    };

});