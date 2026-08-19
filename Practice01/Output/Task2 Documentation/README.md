# Task 2: Refactor to AngularJS (MVC Pattern)

## Overview

This task refactors the Staff Directory from Task 1, which was built using Vanilla JavaScript, into an **AngularJS 1.x application** using a basic **Model-View-Controller (MVC)** structure.

The application uses Controller-As syntax, AngularJS directives, two-way data binding, and separated staff data and controller logic.

---

## Objective

The main objectives of this task are to:

* Refactor the Staff Directory into AngularJS.
* Use Controller-As syntax.
* Separate staff data from controller logic.
* Use AngularJS directives for dynamic rendering.
* Use two-way data binding for the staff form.
* Implement Active/Inactive staff filtering.
* Allow staff status to be changed.
* Generate unique Epoch-based staff IDs.
* Organize the project using Model, View, and Controller folders.

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
├── Main_2.html
├── style.css
│
├── Model/
│   └── staff.js
│
├── View/
│
├── Controller/
│   └── controller.js
│
└── README.md
```

### File Description

| File/Folder                | Description                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| `Main_2.html`              | Main Staff Directory interface and AngularJS View.                |
| `style.css`                | Application styling and visual design.                            |
| `Model/staff.js`           | Contains the temporary staff data.                                |
| `View/`                    | Contains additional view or dialog files.                         |
| `Controller/controller.js` | Contains the AngularJS module, controller, and application logic. |
| `README.md`                | Task 2 documentation.                                             |

---

## MVC Structure

### Model

The Model contains the temporary staff data used by the application.

```text
Model/staff.js
```

Example:

```javascript
var staffData = [
    {
        id: 1755144300001,
        name: "Juan Dela Cruz",
        role: "IT Administrator",
        status: "Active"
    },
    {
        id: 1755144300002,
        name: "Maria Santos",
        role: "System Analyst",
        status: "Active"
    },
    {
        id: 1755144300003,
        name: "Pedro Reyes",
        role: "IT Support",
        status: "Inactive"
    }
];
```

The data is currently stored locally because database integration is part of Task 3.

### View

The View is contained in:

```text
Main_2.html
```

AngularJS directives are used to connect the HTML interface with the Controller.

The main directives used are:

```text
ng-repeat
ng-model
ng-if
ng-show
ng-click
ng-submit
```

### Controller

The Controller is located at:

```text
Controller/controller.js
```

It manages the application logic, including:

* Adding staff members
* Form validation
* Staff visibility filtering
* Changing staff status
* Displaying staff details

---

## AngularJS Setup

The AngularJS module is defined using:

```javascript
var app = angular.module("app", []);
```

The Staff Controller uses Controller-As syntax:

```javascript
app.controller("StaffController", function () {

    var vm = this;

});
```

The View connects to the Controller using:

```html
<body ng-controller="StaffController as vm">
```

The `vm` variable is used to access Controller properties and functions from the HTML.

---

## Main AngularJS Features

### Staff List

The temporary staff data from the Model is assigned to the Controller:

```javascript
vm.staffList = angular.copy(staffData);
```

This allows AngularJS to manage the staff list displayed in the View.

### Two-Way Data Binding

`ng-model` connects the form inputs to the Controller:

```html
<input
    type="text"
    ng-model="vm.newStaff.name"
>
```

```html
<input
    type="text"
    ng-model="vm.newStaff.role"
>
```

The entered values are available through:

```javascript
vm.newStaff.name
vm.newStaff.role
```

### Dynamic Rendering

`ng-repeat` generates the staff table rows:

```html
<tr ng-repeat="staff in vm.staffList track by staff.id">
```

`ng-show` is used for the Active and Inactive status badges.

`ng-if` controls which staff members are displayed when the visibility toggle is used.

### Staff Status

The `toggleStatus()` function switches a staff member between Active and Inactive:

```javascript
vm.toggleStatus = function (staff) {

    if (staff.status === "Active") {
        staff.status = "Inactive";
    } else {
        staff.status = "Active";
    }

};
```

### Staff Visibility Toggle

The visibility toggle changes the displayed staff category:

```javascript
vm.toggleInactive = function () {
    vm.showInactiveOnly = !vm.showInactiveOnly;
};
```

When the toggle is OFF, Active staff are displayed.

When the toggle is ON, Inactive staff are displayed.

### Staff ID

New staff members receive a unique Epoch-based ID:

```javascript
id: Date.now()
```

The ID is also used by AngularJS to track individual records:

```html
ng-repeat="staff in vm.staffList track by staff.id"
```

---

## Features

The Task 2 Staff Directory includes:

* AngularJS Controller-As syntax
* MVC folder organization
* Staff data stored separately in the Model
* Add Staff form
* Form validation
* Two-way data binding
* Active/Inactive status badges
* Active/Inactive visibility toggle
* Staff status switching
* Staff details dialog
* Unique Epoch-based staff IDs
* Dynamic table rendering using AngularJS directives

---

## Task 2 Requirements Checklist

* [x] Create AngularJS module.
* [x] Create `StaffController`.
* [x] Use Controller-As syntax.
* [x] Separate staff data into the Model.
* [x] Use `ng-repeat` for staff records.
* [x] Use `ng-model` for form inputs.
* [x] Use two-way data binding.
* [x] Use `ng-show` and `ng-if`.
* [x] Use `ng-click` for actions.
* [x] Use `ng-submit` for the staff form.
* [x] Implement Active/Inactive status handling.
* [x] Implement Active/Inactive staff filtering.
* [x] Generate Epoch-based staff IDs.
* [x] Organize the project using MVC folders.

---

## Task 1 to Task 2

Task 1 used **Vanilla JavaScript and direct DOM manipulation**.

Task 2 refactors the application to **AngularJS**, allowing the framework to handle data binding and dynamic rendering through directives such as:

```text
ng-repeat
ng-model
ng-show
ng-if
ng-click
ng-submit
```

The application is now structured using a basic MVC organization, preparing it for database integration in Task 3.

---

## Current Limitation

The staff data is still stored locally in `Model/staff.js`.

There is no persistent database in Task 2.

**Firebase/Firestore integration and CRUD operations are implemented in Task 3.**
