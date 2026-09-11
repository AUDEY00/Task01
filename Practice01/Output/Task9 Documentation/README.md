# Task 9 – Guided Tour and App Navigator

## 📌 Overview

Task 9 focuses on improving the usability and user experience of the IT Unit Management System by integrating a step-by-step guided tour.

The application uses **Driver.js** to provide an interactive walkthrough that highlights important interface elements and explains the key features of the system.

The guided tour is implemented on both the **Dashboard** and **Map** pages to help users easily understand and navigate the application.

---

## 🎯 Goal

Integrate a step-by-step guided tour or app navigator using **Driver.js** to help users easily navigate and learn the key features within the application.

The guided tour provides visual instructions by highlighting specific interface elements and displaying descriptions for each feature.

---

## ⚙️ Features

### 🧭 Dashboard Guided Tour

The Dashboard includes a guided tour that introduces users to the main sections of the Staff Management System.

The tour guides users through:

* **Navigation** – Introduces the main sidebar navigation.
* **Logged-in User** – Displays the currently authenticated user.
* **Add Staff** – Explains where users can add new staff records.
* **Staff Controls** – Introduces staff management and import/export controls.
* **Staff Directory** – Explains the registered staff table and available actions.
* **Logout** – Shows users where they can log out of the application.

### 🗺️ Map Guided Tour

The Map page includes a separate guided tour that introduces users to the location management and mapping features.

The tour guides users through:

* **Map Navigation** – Introduces the Map page navigation.
* **Map Provider** – Explains the Mapbox and Leaflet provider selection.
* **Map View** – Explains the available geographic map views.
* **Interactive Map** – Introduces the interactive map interface.
* **Add Location** – Shows where users can enter location information.
* **Location Records** – Explains the registered location table.
* **Location Actions** – Introduces the available actions for location records.
* **Logout** – Shows users where they can log out.

### 🔄 Step-by-Step Guided Tour

The guided tour displays one instruction at a time and highlights the corresponding interface element.

Example flow:

```text
User Starts Guided Tour

        │
        ▼

Driver.js Initializes

        │
        ▼

Highlight Interface Element

        │
        ▼

Display Instructions

        │
        ▼

User Clicks Next

        │
        ▼

Highlight Next Feature

        │
        ▼

Continue Until Tour Completion
```

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML | Provides the application structure and elements targeted by the tour |
| CSS | Provides styling and visual presentation |
| JavaScript | Controls the guided tour functionality |
| AngularJS | Manages controllers, data binding, and user interactions |
| Driver.js | Provides the step-by-step guided tour |
| Mapbox GL JS | Provides interactive Mapbox map functionality |
| LeafletJS | Provides the alternative Leaflet map functionality |

---

## 🧠 Key Concepts Used

### 1. Driver.js Integration

Driver.js is used to create the interactive guided tour.

The library is included through a CDN:

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/driver.js@latest/dist/driver.css">

<script src="https://cdn.jsdelivr.net/npm/driver.js@latest/dist/driver.js.iife.js"></script>
```

The Driver.js library is accessed using:

```javascript
var driver = window.driver.js.driver;
```

This allows the application to create and control guided tours using JavaScript.

---

### 2. Guided Tour Configuration

A Driver.js tour is created by defining its configuration and individual steps.

```javascript
var driverObj = driver({
    showProgress: true,
    animate: true,
    smoothScroll: true,

    steps: [
        // Tour steps
    ]
});

driverObj.drive();
```

The configuration controls the behavior and appearance of the guided tour.

---

### 3. Tour Steps

Each tour step identifies an HTML element that should be highlighted.

Example:

```javascript
{
    element: "#tour-navigation",
    popover: {
        title: "Navigation",
        description: "Use the sidebar to navigate through the application."
    }
}
```

The `element` property identifies the target interface component, while the `popover` contains the title and instructions displayed to the user.

---

### 4. DOM Element Targeting

Specific HTML elements are assigned IDs so Driver.js can identify and highlight them.

Example:

```html
<div id="tour-add-staff">
    <!-- Add Staff section -->
</div>
```

The corresponding Driver.js step can target the element using:

```javascript
{
    element: "#tour-add-staff",
    popover: {
        title: "Add Staff",
        description: "Use this section to add a new staff member."
    }
}
```

This allows the guided tour to connect the instructions directly to the appropriate interface element.

---

### 5. Dashboard Tour Trigger

The Dashboard guided tour is started through a controller function.

```javascript
vm.startTour = function () {

    var driver = window.driver.js.driver;

    var driverObj = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,

        steps: [
            // Dashboard tour steps
        ]
    });

    driverObj.drive();
};
```

The function allows users to start the Dashboard walkthrough whenever they need assistance.

---

### 6. Map Tour Trigger

The Map page uses its own guided tour function.

```javascript
vm.startMapTour = function () {

    var driver = window.driver.js.driver;

    var driverObj = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,

        steps: [
            // Map tour steps
        ]
    });

    driverObj.drive();
};
```

This keeps the Map tour focused on features specific to the Map and Location Management page.

---

## 🔄 Dashboard Tour Flow

```text
Start Dashboard

        │
        ▼

User Clicks Guided Tour

        │
        ▼

Driver.js Initializes

        │
        ▼

Navigation

        │
        ▼

Logged-in User

        │
        ▼

Add Staff

        │
        ▼

Staff Controls

        │
        ▼

Staff Directory

        │
        ▼

Logout

        │
        ▼

Tour Complete
```

---

## 🗺️ Map Tour Flow

```text
Open Map Page

        │
        ▼

User Starts Map Tour

        │
        ▼

Map Navigation

        │
        ▼

Map Provider

        │
        ▼

Map View

        │
        ▼

Interactive Map

        │
        ▼

Add Location

        │
        ▼

Location Records

        │
        ▼

Location Actions

        │
        ▼

Logout

        │
        ▼

Tour Complete
```

---

## 📋 Dashboard Tour Targets

| Target ID | Description |
|-----------|-------------|
| `tour-navigation` | Main application navigation |
| `tour-user` | Logged-in user information |
| `tour-add-staff` | Add Staff section |
| `tour-controls` | Staff management controls |
| `tour-staff-table` | Staff directory table |
| `tour-logout` | Logout control |

---

## 📋 Map Tour Targets

| Target ID | Description |
|-----------|-------------|
| `map-tour-navigation` | Map page navigation |
| `tour-map-provider` | Mapbox and Leaflet provider selector |
| `tour-map-view` | Geographic map-view selector |
| `tour-map` | Interactive map |
| `tour-add-location` | Add Location form |
| `tour-location-table` | Registered location table |
| `tour-logout` | Logout control |

---

## 🎨 User Experience Improvements

The guided tour improves the application's user experience by providing:

* Step-by-step instructions for important features
* Visual highlighting of interface elements
* Easier navigation for first-time users
* Better understanding of Staff Management features
* Better understanding of Location Management features
* Guidance for Mapbox and Leaflet selection
* Guidance for different Map View options
* Reduced learning curve for new users

The Map page layout was also organized so that the **Add Location form and interactive map are displayed side-by-side**, while the **Registered Locations table is positioned underneath both sections**.

---

## 🔗 Relationship to Previous Tasks

Task 9 builds on the functionality developed throughout the previous tasks.

```text
Task 6

Location CRUD + Mapbox GL JS

        │
        ▼

Task 7

Mapbox GL JS + LeafletJS

        │
        ▼

Task 8

Dynamic Map View Selection

Palawan → Philippines → World

        │
        ▼

Task 9

Guided Tour and App Navigator

Dashboard + Map Page
```

Unlike the previous tasks that focused primarily on application functionality, Task 9 focuses specifically on improving **user guidance, navigation, and overall usability**.

The existing CRUD, authentication, Mapbox, LeafletJS, and dynamic map-view functionality remain available while the guided tour provides additional assistance to users.

---

## 📸 Output

The completed application provides interactive guided tours for the main application pages.

The Dashboard tour guides users through:

* Application navigation
* Logged-in user information
* Staff creation
* Staff controls
* Staff directory
* Logout

The Map tour guides users through:

* Map navigation
* Map provider selection
* Map view selection
* Interactive map
* Add Location form
* Registered locations
* Location actions
* Logout

The user can move through each step using the Driver.js navigation controls until the tour is completed.

---

## 🚀 Learning Outcomes

After completing this task, the following concepts were practiced:

* Integrating a third-party JavaScript library
* Implementing guided tours
* Creating step-by-step application navigation
* Targeting HTML elements using IDs
* Configuring Driver.js
* Creating JavaScript tour functions
* Connecting guided tours with AngularJS controllers
* Improving application onboarding
* Improving application usability
* Guiding users through complex application features
* Creating separate guided tours for different application pages
* Improving the overall user experience of an existing application

---

## ✅ Task Status

**Completed**

Task 9 successfully integrates **Driver.js** into the IT Unit Management System to provide step-by-step guided tours for the **Dashboard** and **Map** pages.

The implementation helps users understand the application's navigation, Staff Management features, Map Provider selection, Map View selection, Location Management, and other important system functions while maintaining the existing application functionality.