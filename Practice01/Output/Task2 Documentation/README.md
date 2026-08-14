# Task 2: Refactor to AngularJS (MVC Pattern)

## Overview

This task refactors the Staff Directory from Task 1, which was built using Vanilla JavaScript, into an AngularJS 1.x application using the MVC pattern.

The application uses AngularJS Controller-As syntax, AngularJS directives, two-way data binding, and a separated Model, View, and Controller structure.

---

## Objective

The goal of this task is to:

- Refactor the Staff Directory into AngularJS.
- Define an AngularJS module and controller.
- Use Controller-As syntax.
- Separate staff data from controller logic.
- Use AngularJS directives for dynamic rendering.
- Use two-way data binding for the staff form.
- Display staff members using `ng-repeat`.
- Show only inactive staff when the visibility toggle is enabled.
- Allow staff status to be changed.
- Use unique Epoch-based IDs for staff members.
- Organize the project using MVC folders.

---

## Technologies Used

- HTML5
- CSS3
- JavaScript
- AngularJS 1.8.2

---

## Project Structure

```text
Task2/
│
├── Main_2.html
├── style.css
│
├── model/
│   └── staff.js
│
├── view/
│
├── controller/
│   └── controller.js
│
└── README.md
```

### File Description

| File/Folder | Description |
|---|---|
| `Main_2.html` | Main Staff Directory interface and AngularJS View. |
| `style.css` | Styling and visual design of the application. |
| `model/` | Contains model/data-related files. |
| `model/staff.js` | Contains the temporary staff data. |
| `view/` | Contains additional pages or modal-related files when needed. |
| `controller/` | Contains controller scripts. |
| `controller/controller.js` | Contains the AngularJS module, controller, and application logic. |
| `README.md` | Documentation for Task 2. |

---

## MVC Structure

The application follows a basic Model-View-Controller structure.

### Model

The Model contains the temporary staff data.

```text
model/staff.js
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
    },
    {
        id: 1755144300004,
        name: "Ana Garcia",
        role: "Network Administrator",
        status: "Inactive"
    }
];
```

There is currently no database, so `staff.js` is being used as the temporary data source.

---

### View

The View is represented by:

```text
Main_2.html
```

The HTML contains the Staff Directory interface and AngularJS directives.

Examples of AngularJS directives used in the View include:

```text
ng-repeat
ng-model
ng-show
ng-if
ng-click
ng-submit
```

---

### Controller

The Controller is located at:

```text
controller/controller.js
```

The Controller contains the AngularJS application logic, including:

- Adding staff
- Form validation
- Toggling Active/Inactive staff visibility
- Changing staff status
- Managing the staff list

---

## AngularJS App and Controller Setup

The AngularJS module is defined using:

```javascript
var app = angular.module("app", []);
```

The main controller is defined as:

```javascript
app.controller("StaffController", function () {

    var vm = this;

});
```

The HTML uses Controller-As syntax:

```html
<body ng-controller="StaffController as vm">
```

The `vm` variable is used to access controller properties and functions.

---

## Staff List

The staff data is stored separately in the Model and assigned to the Controller.

```javascript
vm.staffList = staffData;
```

This keeps the temporary data separate from the controller logic.

---

## Unique Staff ID

Each staff member has a unique ID using the Epoch timestamp format.

Example:

```javascript
{
    id: 1755144300001,
    name: "Juan Dela Cruz",
    role: "IT Administrator",
    status: "Active"
}
```

When a new staff member is added, an Epoch-based ID is generated using:

```javascript
id: Date.now()
```

Example:

```javascript
vm.staffList.push({
    id: Date.now(),
    name: name,
    role: role,
    status: "Active"
});
```

The ID is used internally to uniquely identify each staff member.

It does not need to be displayed in the Staff Directory table.

AngularJS can use the ID with `track by`:

```html
<tr ng-repeat="staff in vm.staffList track by staff.id">
```

This allows AngularJS to uniquely track each staff member.

---

## AngularJS Directives Used

### `ng-repeat`

`ng-repeat` dynamically creates a table row for every staff member.

```html
<tr ng-repeat="staff in vm.staffList track by staff.id">
```

This replaces manually creating table rows with JavaScript.

---

### `ng-model`

`ng-model` provides two-way data binding between the form inputs and the Controller.

```html
<label for="nameInput">Full Name</label>

<input
    type="text"
    id="nameInput"
    placeholder="Enter full name"
    ng-model="vm.newStaff.name"
>
```

```html
<label for="roleInput">Role</label>

<input
    type="text"
    id="roleInput"
    placeholder="Enter role"
    ng-model="vm.newStaff.role"
>
```

The values entered by the user are stored in:

```javascript
vm.newStaff.name
vm.newStaff.role
```

---

### `ng-if`

`ng-if` is used to control whether Active or Inactive staff are displayed.

```html
ng-if="vm.showInactiveOnly === (staff.status === 'Inactive')"
```

When the toggle is OFF:

```text
Active staff are displayed.
```

When the toggle is ON:

```text
Inactive staff are displayed.
```

This implements the visibility toggle requirement.

---

### `ng-show`

`ng-show` is used to display the correct status badge.

For Active:

```html
<span
    class="badge active"
    ng-show="staff.status === 'Active'"
>
    Active
</span>
```

For Inactive:

```html
<span
    class="badge inactive"
    ng-show="staff.status === 'Inactive'"
>
    Inactive
</span>
```

---

### `ng-click`

`ng-click` triggers Controller functions when buttons are clicked.

For the visibility toggle:

```html
<button
    type="button"
    ng-click="vm.toggleInactive()"
>
```

For changing staff status:

```html
<button
    type="button"
    ng-click="vm.toggleStatus(staff)"
>
```

---

### `ng-submit`

`ng-submit` handles the Add Staff form submission.

```html
<form ng-submit="vm.addStaff()">
```

This calls the Controller's `addStaff()` function.

---

## Form Labels

Labels are included for the form inputs instead of relying only on placeholder text.

Example:

```html
<label for="nameInput">Full Name</label>

<input
    type="text"
    id="nameInput"
    placeholder="Enter full name"
    ng-model="vm.newStaff.name"
>
```

And:

```html
<label for="roleInput">Role</label>

<input
    type="text"
    id="roleInput"
    placeholder="Enter role"
    ng-model="vm.newStaff.role"
>
```

This makes the form clearer and more accessible.

---

## Core Functions

### `vm.addStaff()`

The `addStaff()` function validates the form inputs and adds a new staff member.

```javascript
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
```

New staff members are automatically assigned:

```text
Status: Active
```

and receive a unique Epoch-based ID.

---

### `vm.toggleInactive()`

This function controls whether Active or Inactive staff are displayed.

```javascript
vm.toggleInactive = function () {
    vm.showInactiveOnly = !vm.showInactiveOnly;
};
```

The value changes between:

```text
false → Show Active Staff
true  → Show Inactive Staff
```

When the toggle is ON, only inactive staff members are displayed.

---

### `vm.toggleStatus(staff)`

This function changes an individual staff member's status.

```javascript
vm.toggleStatus = function (staff) {

    if (staff.status === "Active") {
        staff.status = "Inactive";
    } else {
        staff.status = "Active";
    }

};
```

The status changes between:

```text
Active → Inactive
Inactive → Active
```

---

## Conditional Logic

Conditional logic is used to determine the staff member's status.

```javascript
if (staff.status === "Active") {
    staff.status = "Inactive";
} else {
    staff.status = "Active";
}
```

AngularJS expressions are also used to control visibility.

Example:

```html
ng-show="staff.status === 'Active'"
```

and:

```html
ng-show="staff.status === 'Inactive'"
```

The staff visibility toggle uses:

```html
ng-if="vm.showInactiveOnly === (staff.status === 'Inactive')"
```

This means:

```text
Toggle OFF → Active staff are displayed.
Toggle ON  → Inactive staff are displayed.
```

---

## Features

The Staff Directory provides the following features:

- Displays IT staff members.
- Displays Full Name, Role, Status, and Actions.
- Displays Active and Inactive status badges.
- Allows users to add new staff members.
- Validates required form fields.
- Generates unique Epoch-based staff IDs.
- Uses `track by staff.id`.
- Shows Active staff by default.
- Shows only Inactive staff when the toggle is enabled.
- Allows individual staff members to be switched between Active and Inactive.
- Uses AngularJS two-way data binding.
- Uses AngularJS directives instead of manual DOM manipulation.
- Uses a basic MVC folder structure.
- Uses labels for form inputs.

---

## Task 2 Requirements Checklist

- [x] Define an AngularJS module.
- [x] Define a `StaffController`.
- [x] Use Controller-As syntax.
- [x] Store staff data separately in the Model.
- [x] Use `ng-repeat` to render staff dynamically.
- [x] Use `ng-model` for the add-staff form.
- [x] Use two-way data binding.
- [x] Use `ng-show` for status badges.
- [x] Use `ng-if` for staff visibility.
- [x] Use `ng-click` for action buttons.
- [x] Use `ng-submit` for form submission.
- [x] Implement Active/Inactive status handling.
- [x] Implement the Active/Inactive visibility toggle.
- [x] Show only Inactive staff when the toggle is enabled.
- [x] Add unique Epoch-based staff IDs.
- [x] Use `track by staff.id`.
- [x] Add labels to form inputs.
- [x] Organize the project using Model, View, and Controller folders.

---

## Task 1 vs Task 2

### Task 1

Task 1 used Vanilla JavaScript and direct DOM manipulation.

Examples:

```javascript
document.getElementById()
document.createElement()
appendChild()
addEventListener()
```

### Task 2

Task 2 was refactored to use AngularJS.

Examples:

```text
ng-repeat
ng-model
ng-show
ng-if
ng-click
ng-submit
```

AngularJS now handles the connection between application data and the HTML View instead of manually creating and modifying DOM elements.

---

## Current Limitation

The application currently uses `model/staff.js` as a temporary data source.

There is no persistent database yet.

Firebase integration and CRUD operations will be implemented in Task 3.