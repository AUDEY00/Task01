
# Task 2: Refactor to AngularJS (MVC Pattern)

## Overview

This task refactors the Staff Directory from Task 1, which was built using Vanilla JavaScript and direct DOM manipulation, into an **AngularJS 1.x application** using the MVC pattern.

The application uses an AngularJS controller, Controller-As syntax, and AngularJS directives to manage the staff directory and user interactions.

---

## Objective

The goal of this task is to:

* Refactor the existing Staff Directory into AngularJS.
* Use an AngularJS module and controller.
* Use Controller-As syntax to manage application data.
* Use AngularJS directives for rendering and user interactions.
* Implement two-way data binding for the staff form.
* Dynamically display staff members using `ng-repeat`.
* Show and hide inactive staff using `ng-show`.
* Allow staff status to be changed using `ng-click`.

---

## Technologies Used

* HTML5
* CSS3
* JavaScript
* AngularJS 1.8.2

---

## Project Structure

```text
Task2/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

### File Description

| File         | Description                                                                       |
| ------------ | --------------------------------------------------------------------------------- |
| `index.html` | Contains the Staff Directory interface and AngularJS directives.                  |
| `style.css`  | Contains the styling and visual design of the application.                        |
| `script.js`  | Contains the AngularJS module, controller, staff data, and application functions. |
| `README.md`  | Documentation for Task 2.                                                         |

---

## AngularJS App and Controller Setup

The application defines an AngularJS module named `app`:

```javascript
var app = angular.module("app", []);
```

The main controller is defined as `StaffController`:

```javascript
app.controller("StaffController", function () {
    var vm = this;
});
```

The controller uses **Controller-As syntax** in the HTML:

```html
<body ng-controller="StaffController as vm">
```

This allows the application to access controller properties and functions using `vm`.

---

## Staff List

The staff list is stored inside the controller using `vm.staffList`.

Example:

```javascript
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
```

This replaces the local DOM-based rendering approach used in Task 1.

---

## AngularJS Directives Used

### `ng-repeat`

`ng-repeat` is used to dynamically generate a table row for every staff member in `vm.staffList`.

```html
<tr ng-repeat="staff in vm.staffList">
```

This allows AngularJS to automatically render the staff records without manually creating table elements with JavaScript.

---

### `ng-model`

`ng-model` is used for two-way data binding between the form inputs and the controller.

```html
<input
    type="text"
    placeholder="Full Name"
    ng-model="vm.newStaff.name"
>

<input
    type="text"
    placeholder="Role"
    ng-model="vm.newStaff.role"
>
```

The values entered by the user are automatically stored in:

```javascript
vm.newStaff.name
vm.newStaff.role
```

---

### `ng-show`

`ng-show` is used to control the visibility of inactive staff members and status badges.

For the staff list:

```html
ng-show="vm.showInactive || staff.status === 'Active'"
```

For the Active badge:

```html
ng-show="staff.status === 'Active'"
```

For the Inactive badge:

```html
ng-show="staff.status === 'Inactive'"
```

---

### `ng-click`

`ng-click` is used to trigger controller functions when buttons are clicked.

Show/hide inactive staff:

```html
<button ng-click="vm.toggleInactive()">
```

Change staff status:

```html
<button ng-click="vm.toggleStatus(staff)">
```

---

### `ng-submit`

`ng-submit` is used to handle the staff form submission:

```html
<form ng-submit="vm.addStaff()">
```

This calls the `addStaff()` function in the controller when the form is submitted.

---

## Core Functions

### `vm.addStaff()`

The `addStaff()` function validates the form inputs and adds a new staff member to `vm.staffList`.

```javascript
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
```

New staff members are automatically assigned an `Active` status.

---

### `vm.toggleInactive()`

This function controls whether inactive staff members are displayed.

```javascript
vm.toggleInactive = function () {
    vm.showInactive = !vm.showInactive;
};
```

The value changes between:

```text
true → show inactive staff
false → hide inactive staff
```

---

### `vm.toggleStatus(staff)`

This function changes an individual staff member's status between Active and Inactive.

```javascript
vm.toggleStatus = function (staff) {

    if (staff.status === "Active") {
        staff.status = "Inactive";
    } else {
        staff.status = "Active";
    }

};
```

---

## Conditional Logic

Conditional logic is used to determine the status of each staff member.

```javascript
if (staff.status === "Active") {
    staff.status = "Inactive";
} else {
    staff.status = "Active";
}
```

AngularJS expressions are also used to conditionally display elements.

For example:

```html
ng-show="staff.status === 'Active'"
```

and:

```html
ng-show="staff.status === 'Inactive'"
```

This allows the application to display different status badges depending on the staff member's current status.

---

## MVC Pattern

The application follows the basic AngularJS MVC structure:

```text
             AngularJS App
                  │
                  ▼
          StaffController
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   Staff Data           Functions
   vm.staffList         vm.addStaff()
                        vm.toggleInactive()
                        vm.toggleStatus()
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
                View
             index.html
                  │
        AngularJS Directives
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    ng-repeat  ng-model  ng-show
                            │
                         ng-click
```

The **View** is represented by `index.html`, while `StaffController` manages the application data and behavior.

---

## Features

The completed AngularJS Staff Directory provides the following features:

* Displays a list of IT staff members.
* Displays each staff member's name, role, and status.
* Uses Active and Inactive status badges.
* Allows users to add new staff members.
* Validates required form fields.
* Allows inactive staff members to be shown or hidden.
* Allows individual staff members to be switched between Active and Inactive.
* Uses AngularJS data binding instead of manual DOM manipulation.

---

## Task 2 Requirements Checklist

* [x] Define an AngularJS module.
* [x] Define a `StaffController`.
* [x] Use Controller-As syntax.
* [x] Store the staff list in `vm.staffList`.
* [x] Use `ng-repeat` to render staff dynamically.
* [x] Use `ng-model` for the add-staff form.
* [x] Use two-way data binding.
* [x] Use `ng-show` for conditional visibility.
* [x] Use `ng-click` for action buttons.
* [x] Use `ng-submit` for form submission.
* [x] Implement Active/Inactive status handling.
* [x] Implement show/hide functionality for inactive staff.

---

## Task 1 vs Task 2

### Task 1

The Staff Directory used Vanilla JavaScript and direct DOM manipulation:

```javascript
document.getElementById()
document.createElement()
appendChild()
addEventListener()
```

### Task 2

The application was refactored to use AngularJS:

```text
ng-repeat
ng-model
ng-show
ng-click
ng-submit
```

This reduces the need for manually manipulating the DOM and allows AngularJS to automatically synchronize the application data with the HTML view.