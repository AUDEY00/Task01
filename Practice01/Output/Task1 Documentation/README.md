# Task 1: HTML & Vanilla JavaScript Foundation

## Objective

Build a basic Staff Directory using HTML and Vanilla JavaScript. The task focuses on creating a static interface, manipulating the DOM, implementing conditional logic, and validating user input using pure JavaScript.

## Technologies Used

* HTML5
* CSS3
* Vanilla JavaScript
* DOM Manipulation

## Features Implemented

### 1. Staff Directory

Created a Staff Directory interface with the title:

**IT Unit Directory**

The directory displays the following information for each staff member:

* Full Name
* Role
* Status
* Actions

### 2. Add Staff Form

Added a form at the top of the directory that allows the user to enter a new staff member.

The form contains input fields for:

* Full Name
* Role
* Status

When the form is submitted, the new staff member is added to the directory.

### 3. Status Conditional Logic

Implemented JavaScript conditional logic for staff status.

* **Active** staff members are displayed with a green badge/text.
* **Inactive** staff members are displayed with a gray badge/text.

### 4. Form Validation

Added validation using JavaScript.

If the **Full Name** or **Role** field is empty when the form is submitted, a JavaScript `alert()` displays an error message and prevents the incomplete staff member from being added.

### 5. Show/Hide Inactive Staff

Added a toggle button that allows the user to show or hide inactive staff members from the directory.

This feature uses JavaScript DOM manipulation to control the visibility of inactive staff.

## JavaScript Concepts Used

The following Vanilla JavaScript concepts were applied:

* DOM manipulation
* Event listeners
* Conditional statements
* Form submission handling
* Input validation
* Dynamic element creation
* Element visibility control
* Updating HTML content

## Key Code / Syntax Used

### DOM Methods

The following DOM methods were used to interact with and manipulate HTML elements:

* `document.getElementById()` - Used to access HTML elements using their ID.
* `document.querySelector()` - Used to select specific HTML elements.
* `document.querySelectorAll()` - Used to select multiple elements when needed.
* `document.createElement()` - Used to dynamically create HTML elements.
* `element.appendChild()` - Used to add newly created elements to the page.
* `element.classList.add()` - Used to add CSS classes dynamically.
* `element.classList.remove()` - Used to remove CSS classes dynamically.

### Core Functions

#### `displayStaff()`

Used to display the staff members in the Staff Directory and update the directory when staff data changes.

#### `addStaff()`

Handles adding a new staff member after validating the required input fields.

#### `toggleInactiveStaff()`

Controls the visibility of inactive staff members when the show/hide button is clicked.

### Event Listeners

Event listeners were used to respond to user actions.

* `submit` event - Handles the Staff form submission.
* `click` event - Handles buttons such as the show/hide inactive staff toggle and action buttons.

Example:

```javascript
form.addEventListener("submit", function(event) {
    event.preventDefault();
    // Form handling logic
});
```

### Conditional Logic

JavaScript `if` statements were used to implement the required conditions.

For staff status:

```javascript
if (staff.status === "Active") {
    // Display active staff with green styling
} else {
    // Display inactive staff with gray styling
}
```

Form validation was also implemented using conditional logic to check whether the required fields were empty:

```javascript
if (name === "" || role === "") {
    alert("Please fill in all required fields.");
    return;
}
```

These DOM methods, functions, event listeners, and conditional statements were used to implement the interactive behavior of the Staff Directory using Vanilla JavaScript.

## Files

```text
Task 1/
├── index.html
└── script.js
```

## Testing

The following features were tested successfully:

* [x] IT Unit Directory title is displayed
* [x] Staff members are displayed in the directory
* [x] Add Staff form is working
* [x] New staff members can be added
* [x] Active status displays as green
* [x] Inactive status displays as gray
* [x] Empty Name field triggers an alert
* [x] Empty Role field triggers an alert
* [x] Inactive staff can be shown or hidden
* [x] JavaScript DOM manipulation is working

## Conclusion

Task 1 was completed using HTML, CSS, and Vanilla JavaScript. The Staff Directory successfully demonstrates basic DOM manipulation, conditional logic, form validation, and show/hide functionality without using external JavaScript frameworks or libraries.