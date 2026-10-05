var app = angular.module("app", ["ngMaterial"]);

app.controller("StaffController", function ($scope) {

    var vm = this;


    // -----------------------------------
    // Login Data
    // -----------------------------------

    vm.loginData = {
        email: "",
        password: ""
    };


    // -----------------------------------
    // Login
    // -----------------------------------

    vm.login = function () {

        var email = vm.loginData.email.trim();
        var password = vm.loginData.password;


        // Validate fields
        if (email === "" || password === "") {

            Swal.fire({
                icon: "warning",
                title: "Missing Information",
                text: "Please enter your email and password."
            });

            return;
        }


        // Firebase Authentication
        firebase.auth()
            .signInWithEmailAndPassword(email, password)

            .then(function (userCredential) {

                console.log(
                    "Login successful:",
                    userCredential.user.email
                );

                vm.loginData.email = "";
                vm.loginData.password = "";

                window.location.href = "../Main.html";

                $scope.$applyAsync();

            })

            .catch(function (error) {

                console.error(
                    "Login error:",
                    error
                );

                Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text: "Invalid email or password."
                });

            });

    };


   

});