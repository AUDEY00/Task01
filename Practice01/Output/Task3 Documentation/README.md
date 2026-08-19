# Task 3 - Firebase Firestore Integration (CRUD)

## Overview

Task 3 connects the AngularJS Staff Directory to **Firebase Cloud Firestore** to replace local mock data with persistent database storage.

## Requirements Completed

* **Firebase Setup** – Initialized Firebase and connected the application to Cloud Firestore.
* **Create** – New staff members are saved to the Firestore `staff` collection.
* **Read** – Staff records are retrieved from Firestore in real time and displayed through AngularJS.
* **Update** – Staff status can be changed between **Active** and **Inactive** directly in Firestore. Staff details such as name and role can also be edited.
* **Delete** – Staff records can be permanently removed from Firestore after confirmation.
* **UI Alerts** – Replaced browser `alert()` messages with **SweetAlert2** for validation, confirmations, success messages, and errors.

## Database

The application uses the Firestore collection:

```text
staff
```

Each staff record contains:

```text
id
name
role
status
```

## CRUD Flow

```text
AngularJS Controller
        ↓
Cloud Firestore
        ↓
Staff Collection
        ↓
AngularJS Staff Table
```

## Additional Features

The application also supports:

* Excel/CSV import
* Excel/CSV export
* PDF export
* Staff details dialog
* Staff information editing
