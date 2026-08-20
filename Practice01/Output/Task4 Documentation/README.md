# Task 4: Firebase Authentication

## Overview

This task adds Firebase Authentication to the Staff Directory application. Users must log in using an email and password before they can access the Staff Directory.

The application uses Firebase Authentication to manage the user's session and AngularJS to control the login and logout flow.

---

## Objective

The goal of this task is to:

* Add a dedicated Login view.
* Authenticate users using Firebase email/password authentication.
* Protect the Staff Directory from unauthenticated users.
* Display the currently logged-in user's email.
* Provide a Logout button.
* Redirect users to the Login page after logout.
* Use SweetAlert for login error messages.

---

## Technologies Used

* HTML5
* CSS3
* JavaScript
* AngularJS 1.8.2
* Firebase Authentication
* SweetAlert2

---

## Authentication Flow

The application follows this authentication flow:

```text
Login Page
    ↓
Enter Email and Password
    ↓
Firebase Authentication
    ↓
Successful Login
    ↓
Main Staff Directory
    ↓
Authenticated Session
```

If the user is not authenticated:

```text
Main.html
    ↓
Firebase checks authentication
    ↓
No authenticated user
    ↓
Redirect to Login Page
```

When the user logs out:

```text
Logout
    ↓
Firebase signOut()
    ↓
Session ended
    ↓
Redirect to Login Page
```

---

## Project Structure

```text
Task4/
│
├── Main.html
├── style.css
│
├── Config/
│   └── firebase.js
│
├── Controller/
│   ├── controller.js
│   └── auth-controller.js
│
├── View/
│   └── login.html
│
└── README.md
```

### File Description

| File/Folder                     | Description                                                       |
| ------------------------------- | ----------------------------------------------------------------- |
| `Main.html`                     | Main Staff Directory interface.                                   |
| `style.css`                     | Application and login page styling.                               |
| `Config/`                       | Contains Firebase configuration.                                  |
| `Config/firebase.js`            | Initializes the Firebase application.                             |
| `Controller/controller.js`      | Contains Staff Directory logic and authentication state handling. |
| `Controller/auth-controller.js` | Handles login functionality.                                      |
| `View/login.html`               | Dedicated login page.                                             |
| `README.md`                     | Documentation for Task 4.                                         |

---

## Firebase Authentication

Firebase Authentication is used to authenticate users with an email and password.

The login process uses:

```javascript
firebase.auth()
    .signInWithEmailAndPassword(email, password)
```

When authentication succeeds, the user is redirected to:

```text
Main.html
```

---

## Login

The Login view contains email and password fields.

Example:

```html
<form ng-submit="vm.login()">
```

The form calls:

```javascript
vm.login()
```

The controller validates that both fields contain information before attempting authentication.

If either field is empty, SweetAlert displays a warning.

---

## Authentication State

Firebase's `onAuthStateChanged()` listener checks whether a user currently has an authenticated session.

```javascript
firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        vm.currentUser = user;

    } else {

        vm.currentUser = null;

        window.location.href = "View/login.html";

    }

    $scope.$applyAsync();

});
```

When a user is authenticated:

```text
vm.currentUser = user
```

When there is no authenticated user, the application redirects to:

```text
View/login.html
```

This prevents unauthenticated users from accessing the Staff Directory.

---

## Display Logged-In User

The currently authenticated user's email is displayed in the application header.

```html
<span class="logged-in-user" ng-if="vm.currentUser">
    Logged in as: {{ vm.currentUser.email }}
</span>
```

The email comes from the Firebase Authentication user object:

```javascript
vm.currentUser.email
```

---

## Logout

The application provides a Logout button:

```html
<button
    type="button"
    class="logout-button"
    ng-click="vm.logout()">
    Logout
</button>
```

The logout function uses Firebase:

```javascript
firebase.auth()
    .signOut()
```

After a successful logout, the user is redirected to:

```text
View/login.html
```

---

## SweetAlert Error Handling

SweetAlert2 is used to display meaningful authentication errors.

For example, when login credentials are invalid:

```javascript
Swal.fire({
    icon: "error",
    title: "Login Failed",
    text: "Invalid email or password."
});
```

A warning is also displayed when the login fields are empty:

```javascript
Swal.fire({
    icon: "warning",
    title: "Missing Information",
    text: "Please enter your email and password."
});
```

---

## Session Persistence

Firebase Authentication maintains the authenticated session in the browser by default.

Therefore, closing and reopening the browser does not necessarily log the user out.

The user remains authenticated until the Firebase session is ended, such as by clicking:

```text
Logout
```

After logout, accessing `Main.html` without logging in again redirects the user to the Login page.

---

## Features

The Task 4 Staff Directory provides:

* Email/password login.
* Firebase Authentication.
* Login validation.
* SweetAlert login error messages.
* Authentication state monitoring.
* Protected Staff Directory access.
* Logged-in user's email display.
* Logout functionality.
* Automatic redirect after logout.
* Automatic redirect when no authenticated session exists.
* Persistent Firebase authentication session.

---

## Task 4 Requirements Checklist

* [x] Create a dedicated Login view.
* [x] Implement email/password authentication.
* [x] Connect the Login view to Firebase Authentication.
* [x] Display the Staff Directory only for authenticated users.
* [x] Check the Firebase authentication session.
* [x] Display the currently logged-in user's email.
* [x] Add a Logout button.
* [x] End the Firebase authentication session when logging out.
* [x] Redirect the user to the Login page after logout.
* [x] Redirect unauthenticated users to the Login page.
* [x] Use SweetAlert for failed login attempts.

---

## Task 3 vs Task 4

### Task 3

Task 3 focused on Firebase database integration and CRUD operations.

```text
Create
Read
Update
Delete
```

### Task 4

Task 4 adds authentication and access control.

```text
Login
Authentication Check
Display User
Logout
```

Firebase Authentication is used to determine whether a user is allowed to access the Staff Directory.

---

## Current Result

The Staff Directory is now protected by Firebase Authentication.

Unauthenticated users are redirected to the Login page, while authenticated users can access the Staff Directory and see their logged-in email address.

Users can also log out, which ends the Firebase session and redirects them back to the Login page.
