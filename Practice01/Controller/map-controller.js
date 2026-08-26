var app = angular.module("app", ["ngMaterial"]);


app.controller("MapController", function ($scope, $mdDialog) {

    var vm = this;



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


    // -----------------------------------
    // Mapbox Configuration
    // -----------------------------------

    mapboxgl.accessToken =
        "pk.eyJ1Ijoiam9uZzY5ODkiLCJhIjoiY2p5NjBkdnA5MDNneDNmcGt0eHVva2ZvZyJ9.jZwx_NUnKowJ4faIafJTew";

    // -----------------------------------
    // Initialize Map
    //

    vm.locations = [];
    var markers = [];
    var selectedMarker = null;

    vm.selectedLatitude = "";
    vm.selectedLongitude = "";

    // -----------------------------------
    // New Location
    // -----------------------------------

    vm.newLocation = {

        name: "",

        latitude: "",

        longitude: ""

    };

    // -----------------------------------
    // Initialize Map
    // -----------------------------------

    var map = new mapboxgl.Map({

        container: "map",

        style: "mapbox://styles/mapbox/standard",

        // Initial view of Palawan
        center: [
            118.7384,
            9.8349
        ],

        zoom: 7

    });

    map.on("click", function (event) {

        vm.newLocation.latitude = event.lngLat.lat;
        vm.newLocation.longitude = event.lngLat.lng;

        console.log(
            "Selected coordinates:",
            vm.newLocation.latitude,
            vm.newLocation.longitude
        );

        // Remove previous temporary marker
        if (selectedMarker) {
            selectedMarker.remove();
        }

        // Create temporary marker
        selectedMarker = new mapboxgl.Marker()
            .setLngLat([
                event.lngLat.lng,
                event.lngLat.lat
            ])
            .addTo(map);

        $scope.$applyAsync();

    });


    // -----------------------------------
    // Map Navigation Controls
    // -----------------------------------

    map.addControl(
        new mapboxgl.NavigationControl()
    );

    // -----------------------------------
    // Add Location
    // -----------------------------------

    vm.addLocation = function () {

        var name = vm.newLocation.name.trim();

        var latitude = Number(
            vm.newLocation.latitude
        );

        var longitude = Number(
            vm.newLocation.longitude
        );


        // -----------------------------------
        // Validate Location Name
        // -----------------------------------

        if (name === "") {

            Swal.fire({
                icon: "warning",
                title: "Missing Information",
                text: "Please enter a location name."
            });

            return;
        }


        // -----------------------------------
        // Validate Coordinates
        // -----------------------------------

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            Swal.fire({
                icon: "warning",
                title: "Invalid Coordinates",
                text: "Please enter valid latitude and longitude values."
            });

            return;
        }


        // -----------------------------------
        // Validate Latitude Range
        // -----------------------------------

        if (
            latitude < -90 ||
            latitude > 90
        ) {

            Swal.fire({
                icon: "warning",
                title: "Invalid Latitude",
                text: "Latitude must be between -90 and 90."
            });

            return;
        }


        // -----------------------------------
        // Validate Longitude Range
        // -----------------------------------

        if (
            longitude < -180 ||
            longitude > 180
        ) {

            Swal.fire({
                icon: "warning",
                title: "Invalid Longitude",
                text: "Longitude must be between -180 and 180."
            });

            return;
        }


        // -----------------------------------
        // Generate Location ID
        // -----------------------------------

        var locationId =
            "loc_" +
            Date.now();


        // -----------------------------------
        // Create Timestamp
        // -----------------------------------

        var timestamp =
            firebase.firestore.Timestamp.now();


        // -----------------------------------
        // Create Location Object
        // -----------------------------------

        var newLocation = {

            id: locationId,

            name: name,

            latitude: latitude,

            longitude: longitude,

            dateCreated: timestamp,

            dateModified: timestamp

        };


        console.log(
            "Saving location:",
            newLocation
        );


        // -----------------------------------
        // Save to Firestore
        // -----------------------------------

        db.collection("locations")
            .doc(locationId)
            .set(newLocation)

            .then(function () {

                console.log(
                    "Location added successfully:",
                    newLocation
                );

                // Remove temporary marker
                if (selectedMarker) {
                    selectedMarker.remove();
                    selectedMarker = null;
                }


                // -----------------------------------
                // Clear Form
                // -----------------------------------

                vm.newLocation.name = "";

                vm.newLocation.latitude = null;

                vm.newLocation.longitude = null;


                $scope.$applyAsync();


                // -----------------------------------
                // Success Message
                // -----------------------------------

                Swal.fire({
                    icon: "success",
                    title: "Location Added",
                    text: name + " was added successfully.",
                    timer: 1500,
                    showConfirmButton: false
                });

            })

            .catch(function (error) {

                console.error(
                    "Firestore location error:",
                    error
                );


                Swal.fire({
                    icon: "error",
                    title: "Add Location Failed",
                    text: "The location could not be saved."
                });

            });

    };

    // -----------------------------------
    // Edit Location
    // -----------------------------------

    vm.editLocation = function (location) {

        $mdDialog.show({

            templateUrl: "location-details.html",

            controller: function ($scope, $mdDialog) {

    
                $scope.location =
                    angular.copy(location);


                // -----------------------------------
                // Close Dialog
                // -----------------------------------

                $scope.closeDialog = function () {

                    $mdDialog.cancel();

                };


                // -----------------------------------
                // Save Changes
                // -----------------------------------

                $scope.saveChanges = function () {

                    var name =
                        $scope.location.name.trim();

                    var latitude =
                        Number($scope.location.latitude);

                    var longitude =
                        Number($scope.location.longitude);


                    // -----------------------------------
                    // Validate Name
                    // -----------------------------------

                    if (name === "") {

                        Swal.fire({
                            icon: "warning",
                            title: "Missing Information",
                            text: "Please enter a location name."
                        });

                        return;
                    }


                    // -----------------------------------
                    // Validate Coordinates
                    // -----------------------------------

                    if (
                        !Number.isFinite(latitude) ||
                        !Number.isFinite(longitude)
                    ) {

                        Swal.fire({
                            icon: "warning",
                            title: "Invalid Coordinates",
                            text: "Please enter valid coordinates."
                        });

                        return;
                    }


                    // -----------------------------------
                    // Validate Latitude
                    // -----------------------------------

                    if (
                        latitude < -90 ||
                        latitude > 90
                    ) {

                        Swal.fire({
                            icon: "warning",
                            title: "Invalid Latitude",
                            text: "Latitude must be between -90 and 90."
                        });

                        return;
                    }


                    // -----------------------------------
                    // Validate Longitude
                    // -----------------------------------

                    if (
                        longitude < -180 ||
                        longitude > 180
                    ) {

                        Swal.fire({
                            icon: "warning",
                            title: "Invalid Longitude",
                            text: "Longitude must be between -180 and 180."
                        });

                        return;
                    }


                    // -----------------------------------
                    // Update Firestore
                    // -----------------------------------

                    db.collection("locations")
                        .doc(String(location.id))
                        .update({

                            name: name,

                            latitude: latitude,

                            longitude: longitude,

                            dateModified:
                                firebase.firestore.Timestamp.now()

                        })

                        .then(function () {

                            console.log(
                                "Location updated:",
                                location.id
                            );


                            $mdDialog.hide();


                            Swal.fire({
                                icon: "success",
                                title: "Location Updated",
                                text: name + " was updated successfully.",
                                timer: 1500,
                                showConfirmButton: false
                            });

                        })

                        .catch(function (error) {

                            console.error(
                                "Location update error:",
                                error
                            );


                            Swal.fire({
                                icon: "error",
                                title: "Update Failed",
                                text: "The location could not be updated."
                            });

                        });

                };

            }

        });

    };

    vm.deleteLocation = function (location) {

        Swal.fire({
            icon: "warning",
            title: "Delete Location?",
            text: "Are you sure you want to delete " + location.name + "?",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel"
        }).then(function (result) {

            if (!result.isConfirmed) {
                return;
            }

            db.collection("locations")
                .doc(String(location.id))
                .delete()

                .then(function () {

                    console.log(
                        "Location deleted from Firestore:",
                        location.id
                    );

                    Swal.fire({
                        icon: "success",
                        title: "Deleted",
                        text: location.name +
                            " was deleted successfully.",
                        timer: 1500,
                        showConfirmButton: false
                    });

                })

                .catch(function (error) {

                    console.error(
                        "Firestore delete error:",
                        error
                    );

                    Swal.fire({
                        icon: "error",
                        title: "Delete Failed",
                        text: "Failed to delete the location."
                    });

                });

        });

    };

    vm.focusLocation = function (location) {

        // Convert coordinates to numbers
        var longitude = Number(location.longitude);
        var latitude = Number(location.latitude);

        // Center the map on the selected location
        map.flyTo({
            center: [
                longitude,
                latitude
            ],
            zoom: 12
        });

        // Find the marker belonging to this location
        markers.forEach(function (marker) {

            var markerPosition = marker.getLngLat();

            if (
                markerPosition.lng === longitude &&
                markerPosition.lat === latitude
            ) {

                // Open the marker popup
                marker.togglePopup();

            }

        });

    };

    // -----------------------------------
    // Read Locations from Firestore
    // -----------------------------------

    function loadLocations() {

        db.collection("locations")

            .onSnapshot(

                // -----------------------------------
                // Success Callback
                // -----------------------------------

                function (snapshot) {

                    console.log(
                        "Locations snapshot received."
                    );


                    // Remove existing markers
                    markers.forEach(function (marker) {

                        marker.remove();

                    });

                    markers = [];

                    vm.locations = [];

                    // Read every location
                    snapshot.forEach(function (doc) {

                        var location = doc.data();

                        console.log(
                            "Location:",
                            location
                        );


                        vm.locations.push(location);


                        // -----------------------------------
                        // Create Popup
                        // -----------------------------------

                        var popup = new mapboxgl.Popup({
                            offset: 25
                        })

                            .setHTML(
                                "<strong>" +
                                location.name +
                                "</strong><br>" +

                                "Latitude: " +
                                location.latitude +
                                "<br>" +

                                "Longitude: " +
                                location.longitude
                            );


                        // -----------------------------------
                        // Create Marker
                        // -----------------------------------

                        var marker = new mapboxgl.Marker()

                            .setLngLat([
                                Number(location.longitude),
                                Number(location.latitude)
                            ])

                            .setPopup(popup)

                            .addTo(map);


                        markers.push(marker);


                        // -----------------------------------
                        // Temporary Test
                        // -----------------------------------

                        map.flyTo({

                            center: [
                                Number(location.longitude),
                                Number(location.latitude)
                            ],

                            zoom: 12

                        });

                    });


                    // Update AngularJS
                    $scope.$applyAsync();

                },


                // -----------------------------------
                // Error Callback
                // -----------------------------------

                function (error) {

                    console.error(
                        "Firestore location error:",
                        error
                    );

                }


            );

    }

    vm.logout = function () {

        firebase.auth().signOut()
            .then(function () {

                window.location.href = "login.html";

            })
            .catch(function (error) {

                console.error(
                    "Logout error:",
                    error
                );

            });

    };



    // -----------------------------------
    // Return to Dashboard
    // -----------------------------------

    vm.goToDashboard = function () {

        window.location.href =
            "../Main.html";

    };

    loadLocations();


});