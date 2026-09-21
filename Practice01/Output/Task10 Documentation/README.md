# Task 10 – Firebase Integration for General Lists

## Overview

Task 10 extends the IT Unit Management System by introducing a dynamic **General Lists Management** feature backed by Firebase Firestore.

The General Lists module allows users to create and manage reusable lists such as **Year, Division, and other configurable lists**. Each list can contain dynamically defined columns with different data types, and users can manage the records stored within each list.

The module follows the existing AngularJS architecture and integrates with Firebase Firestore for real-time data persistence and synchronization.

---

## Goal

Build a UI for managing dynamic general lists where users can:

- Manage existing general lists.
- Create new lists.
- Define custom column names.
- Define column data types.
- Add records dynamically based on the selected list's columns.
- Edit and delete records.
- Edit and delete existing lists.
- Store all general list data in Firebase Firestore.
- Navigate between Dashboard, Location Map, and General Lists.
- Log out securely.
- Prevent unauthenticated users from directly accessing the General Lists page.
- Use a guided tour to understand the General Lists interface.

---

## Technologies Used

- HTML5
- CSS3
- JavaScript
- AngularJS 1.x
- Angular Material
- Firebase Authentication
- Firebase Firestore
- SweetAlert2
- Driver.js

---

## Project Structure

```text
Project
│
├── Config/
│   └── firebase.js
│
├── Controller/
│   ├── controller.js
│   └── general-list-controller.js
│
├── Model/
│   └── general-list.js
│
├── View/
│   ├── general-list.html
│   ├── general-list.css
│   ├── create-list-dialog.html
│   ├── edit-list-dialog.html
│   ├── add-record-dialog.html
│   └── edit-record-dialog.html
│
└── Main.html
```

---

# 1. General List Model

A reusable `GeneralList` model was created to represent each dynamic list.

```javascript
function GeneralList(id, name, columns, records) {

    this.id = id;

    this.name = name;

    this.columns = columns || [];

    this.records = records || [];

}
```

Each General List contains:

- `id` – unique identifier of the list.
- `name` – name of the list.
- `columns` – dynamically defined columns.
- `records` – records belonging to the list.

---

# 2. Dynamic List Structure

Each list can define its own columns.

For example, a **Year** list can contain:

```text
Year
```

while a **Division** list can contain:

```text
Division Code
Division Name
```

A list is represented in the following structure:

```javascript
{
    id: "list_001",
    name: "Year",
    columns: [
        {
            name: "Year",
            type: "number"
        }
    ],
    records: [
        {
            Year: 2024
        },
        {
            Year: 2025
        },
        {
            Year: 2026
        }
    ]
}
```

This allows the system to support different list structures without creating separate HTML tables for every type of list.

---

# 3. Supported Column Types

The General Lists module supports dynamic column types including:

- Text
- Number
- Date
- Boolean

The selected column type determines the input control displayed when adding or editing a record.

For example:

```text
Text     → Text input
Number   → Number input
Date     → Date picker
Boolean  → Checkbox
```

---

# 4. General Lists Page

A dedicated General Lists page was created:

```text
View/general-list.html
```

The page contains:

- Existing Lists panel
- Selected List information
- Dynamic records table
- Create List button
- Edit List button
- Delete List button
- Add Record button
- Edit Record actions
- Delete Record actions
- Guided Tour button
- Logout button

The page uses:

```html
<body ng-controller="GeneralListController as vm">
```

to follow the existing Controller-As architecture.

---

# 5. Create New List

Users can create a new General List by defining:

- List name
- Column names
- Column types

A unique list ID is generated using:

```javascript
var id = "list_" + Date.now();
```

The newly created list is then stored in Firestore.

Example:

```javascript
db.collection("generalLists")
    .doc(id)
    .set({
        name: newList.name,
        columns: newList.columns,
        records: newList.records
    });
```

This allows newly created lists to remain available after refreshing the page.

---

# 6. Firebase Firestore Integration

General Lists are stored in the Firebase Firestore collection:

```text
generalLists
```

Each Firestore document represents one General List.

Example:

```text
generalLists
│
├── list_001
│   ├── name
│   ├── columns
│   └── records
│
├── list_002
│   ├── name
│   ├── columns
│   └── records
│
└── ...
```

Firestore is used to persist:

- List configuration
- Column definitions
- Records

---

# 7. Real-Time List Synchronization

The General Lists page uses Firestore's real-time listener:

```javascript
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

        // Update AngularJS data
    });
```

This allows changes made in Firestore to be reflected automatically in the General Lists interface.

The `$scope.$evalAsync()` method is used to ensure that Firestore updates are properly reflected in the AngularJS interface.

---

# 8. Dynamic Records Table

The records table is generated dynamically based on the selected list's column configuration.

Instead of hard-coding table headers, AngularJS uses:

```html
ng-repeat
```

to generate the columns.

This allows the same table component to display different list structures.

For example:

```text
Year List

┌────────┐
│  Year  │
├────────┤
│  2024  │
│  2025  │
│  2026  │
└────────┘
```

A Division list can use the same table structure:

```text
┌───────────────┬────────────────────────┐
│ Division Code │ Division Name          │
├───────────────┼────────────────────────┤
│ IT            │ Information Technology │
│ HR            │ Human Resources        │
│ FIN           │ Finance                │
└───────────────┴────────────────────────┘
```

---

# 9. Add Record

Users can add records to the currently selected General List.

The Add Record dialog automatically generates its fields based on the selected list's columns.

For example, if a list contains:

```text
Name      → text
Age       → number
Birthdate → date
Active    → boolean
```

the form automatically generates the corresponding input controls.

The record is then saved to the selected Firestore document.

---

# 10. Edit Record

Existing records can be modified using the **Edit** action.

The current record is copied before editing so that changes can be safely modified in the dialog.

After the user confirms the changes, the updated records are saved back to Firestore.

The update process uses the selected list's document:

```javascript
db.collection("generalLists")
    .doc(vm.selectedList.id)
    .update({
        records: updatedRecords
    });
```

---

# 11. Delete Record

Users can delete individual records from a selected list.

Before deletion, SweetAlert2 displays a confirmation dialog:

```text
Delete Record?

Are you sure you want to delete this record?
```

If confirmed, the selected record is removed from the records array and the updated array is saved to Firestore.

---

# 12. Edit List

Users can edit an existing General List.

The Edit List feature allows users to modify:

- List name
- Column names
- Column types
- Column structure

The system also handles renamed columns by updating the corresponding record properties.

For example:

```text
Old Column:
Year

New Column:
School Year
```

Existing record values are transferred to the renamed property.

The system also removes record properties that no longer correspond to valid columns.

---

# 13. Delete List

Users can delete an entire General List.

Before deletion, SweetAlert2 asks for confirmation:

```text
Delete List?

Are you sure you want to delete [List Name]?
All records inside this list will also be removed.
```

If confirmed, the corresponding Firestore document is deleted:

```javascript
db.collection("generalLists")
    .doc(listId)
    .delete();
```

Because the records are stored inside the General List document, deleting the list also removes the records belonging to it.

---

# 14. Navigation Integration

The General Lists module was integrated with the existing application navigation.

The sidebar provides access to:

```text
Dashboard
Location Map
General Lists
Logout
```

### Dashboard → General Lists

The General Lists page can be opened from the Dashboard sidebar.

### Map → General Lists

The Location Map page also contains a General Lists navigation option.

### General Lists → Dashboard / Map

The General Lists page provides navigation back to the Dashboard and Location Map.

This keeps navigation consistent across the system.

---

# 15. Authentication Protection

The General Lists page is protected using Firebase Authentication.

The controller checks the current authentication state:

```javascript
firebase.auth().onAuthStateChanged(function (user) {

    if (!user) {

        window.location.href = "login.html";

        return;
    }

});
```

If a user is not authenticated, the system redirects them to:

```text
login.html
```

This also prevents users from simply copying the General Lists URL and accessing the page after logging out.

---

# 16. Logout

A Logout button was added to the General Lists sidebar.

The logout process uses Firebase Authentication:

```javascript
firebase.auth().signOut()
```

After successful logout, the user is redirected to:

```text
login.html
```

The logout button uses the same visual style as the other system pages.

---

# 17. Guided Tour

Driver.js was integrated into the General Lists page to provide a guided walkthrough of the interface.

The tour explains the main areas and actions of the General Lists module.

The guided tour covers:

1. Navigation
2. Existing Lists
3. Create New List
4. Records Table
5. Edit List
6. Delete List
7. Add Record
8. Logout

Example Driver.js step:

```javascript
{
    element: "#tour-edit-list",
    popover: {
        title: "Edit List",
        description: "Use this button to modify the selected list, including its name, columns, and column types."
    }
}
```

Another step explains the Delete List action:

```javascript
{
    element: "#tour-delete-list",
    popover: {
        title: "Delete List",
        description: "Use this button to delete the selected list. Deleting a list also removes all records stored inside it."
    }
}
```

The tour is started through:

```javascript
vm.startTour();
```

and the page provides a **Guided Tour** button for users.

---

# 18. User Interface

The General Lists page follows the existing IT Unit Management System design.

The interface includes:

- Sidebar navigation
- Card-based layout
- Dynamic tables
- Action buttons
- Responsive layout
- Consistent logout styling
- Guided Tour button
- Dialog-based forms

The page-specific styling is separated into:

```text
View/general-list.css
```

while the shared system styling remains in:

```text
style.css
```

This keeps the General Lists styling organized without unnecessarily modifying the global stylesheet.

---

# 19. Validation and User Feedback

SweetAlert2 is used to provide feedback for important operations.

Examples include:

### Successful operations

```text
List Created
List Updated
List Deleted
Record Added
Record Updated
Record Deleted
```

### Validation

The system checks for:

- Empty list names
- Empty column names
- Duplicate column names
- Lists without columns
- Missing selected lists
- Missing records

### Confirmation dialogs

Confirmation prompts are displayed before destructive operations such as:

- Delete List
- Delete Record

---

# 20. Task 10 Accomplishments

The following features were successfully implemented:

- Created a dedicated General Lists module.
- Created a reusable General List model.
- Implemented dynamic list structures.
- Implemented dynamic column creation.
- Implemented multiple column types.
- Implemented Firebase Firestore integration.
- Implemented real-time Firestore synchronization.
- Implemented Create List functionality.
- Implemented Edit List functionality.
- Implemented Delete List functionality.
- Implemented Add Record functionality.
- Implemented Edit Record functionality.
- Implemented Delete Record functionality.
- Implemented dynamic record forms.
- Added Dashboard navigation.
- Added Map navigation.
- Added General Lists navigation.
- Added Logout functionality.
- Added Firebase authentication protection.
- Added Driver.js guided tour.
- Added Edit List and Delete List tour steps.
- Separated General Lists page-specific CSS.
- Added validation and confirmation feedback using SweetAlert2.

---

# 21. Result

Task 10 successfully extends the IT Unit Management System with a flexible General Lists module.

Instead of creating separate pages and database structures for every simple reference list, administrators can create configurable lists with their own columns and records.

The module is integrated with Firebase Firestore, Firebase Authentication, AngularJS, SweetAlert2, and Driver.js while maintaining the existing architecture and navigation of the system.
