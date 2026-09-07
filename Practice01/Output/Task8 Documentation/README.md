# Task 8 – Dynamic Map View Selection

## 📌 Overview

Task 8 extends the functionality developed in **Task 6 – CRUD with Mapbox** by adding a dynamic map-view selection feature.

The application allows the user to change the Mapbox map view depending on the selected geographic scope. The available views include:

* **Palawan**
* **Philippines**
* **World**

A trigger function detects the selected option and automatically updates the map's center and zoom level to display the appropriate geographic area.

---

## 🎯 Goal

Extend the existing Mapbox CRUD application by implementing a dynamic map-view trigger that allows users to switch between:

1. **Palawan View** – Displays the Palawan area.
2. **Philippines View** – Displays the entire Philippines.
3. **World View** – Displays a global map view.

The selected option dynamically controls the Mapbox camera position and zoom level without affecting the existing location CRUD functionality.

---

## ⚙️ Features

### 🗺️ Dynamic Map View Selection

Users can select a predefined map view from the available options.

Depending on the selected option, the application automatically updates:

* Map center
* Zoom level
* Visible geographic area

### 📍 Palawan View

Centers the map on the Palawan region and applies an appropriate zoom level to focus on the area.

### 🇵🇭 Philippines View

Changes the map view to display the Philippines with a zoom level suitable for viewing the entire country.

### 🌍 World View

Zooms the map out to provide a global or world-level view.

### 🔄 Dynamic Trigger Function

A trigger function listens for changes in the selected map view and dynamically updates the Mapbox map.

The logic determines which location configuration should be applied based on the selected option.

Example flow:

```text
User Selects Map View
          │
          ▼
   Trigger Function
          │
          ▼
Check Selected Option
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
Palawan  Philippines  World
    │        │         │
    ▼        ▼         ▼
Update Map Center and Zoom
```

---

## 🛠️ Technologies Used

| Technology   | Purpose                                                 |
| ------------ | ------------------------------------------------------- |
| HTML         | Creates the application structure and map-view controls |
| CSS          | Provides styling and improves the user interface        |
| JavaScript   | Handles the trigger function and dynamic map behavior   |
| AngularJS    | Manages application data binding and user interactions  |
| Mapbox GL JS | Displays and controls the interactive map               |

---

## 🧠 Key Concepts Used

### 1. Trigger Function

A function is used to respond whenever the user changes the selected map view.

```javascript
function changeMapView(selectedView) {
    // Determine the selected map view
    // Update the map center and zoom level
}
```

The function checks the selected option and applies the corresponding map configuration.

---

### 2. Conditional Logic

Conditional statements are used to determine which map view should be displayed.

```javascript
if (selectedView === "palawan") {
    // Display Palawan
} else if (selectedView === "philippines") {
    // Display the Philippines
} else if (selectedView === "world") {
    // Display the World
}
```

This allows the application to dynamically control the map based on user input.

---

### 3. Updating the Map View

Mapbox methods can be used to dynamically change the camera position.

Example:

```javascript
map.flyTo({
    center: [longitude, latitude],
    zoom: zoomLevel
});
```

The following values are dynamically updated depending on the selected map view:

* `center`
* `zoom`

---

## 📂 Suggested Project Structure

```text
Task8/
│
├── controller/
│   └── map.controller.js
│
├── model/
│   └── location.model.js
│
├── view/
│   └── map.html
│
├── css/
│   └── style.css
│
├── output/
│   └── screenshot.png
│
└── README.md
```

> The exact folder and file names may be adjusted based on your existing project structure.

---

## 🔄 Application Flow

```text
Start Application
        │
        ▼
Load Mapbox Map
        │
        ▼
Display Existing Location Data
        │
        ▼
User Selects Map View
        │
        ▼
Trigger Function Executes
        │
        ▼
Check Selected Option
        │
 ┌──────┼────────┐
 ▼      ▼        ▼
Palawan Philippines World
 │        │        │
 ▼        ▼        ▼
Update Map Center and Zoom
        │
        ▼
Display Selected Geographic View
```

---

## 📋 Map View Options

| Map View    | Description                                      |
| ----------- | ------------------------------------------------ |
| Palawan     | Focuses the map on the Palawan region            |
| Philippines | Displays the Philippines at a country-level view |
| World       | Zooms out to display a global view               |

---

## 🔗 Relationship to Previous Tasks

Task 8 is built as an extension of the previous map functionality.

```text
Task 6
Location CRUD + Mapbox GL JS
        │
        ▼
Task 7
Map Provider Selection
Mapbox GL JS + LeafletJS
        │
        ▼
Task 8
Dynamic Map View Selection
Palawan → Philippines → World
```

Unlike the previous CRUD functionality, Task 8 focuses specifically on controlling **how much geographic area is displayed on the map**.

The existing location data and CRUD operations remain available while the user dynamically changes the map's geographic view.

---

## 📸 Output

The completed application provides an interactive map interface where users can select different geographic views.

The Mapbox map dynamically transitions between:

* A focused view of **Palawan**
* A country-level view of the **Philippines**
* A zoomed-out **World view**

The selected view automatically updates the map's center and zoom level while preserving the existing map and location management functionality.

---

## 🚀 Learning Outcomes

After completing this task, the following concepts were practiced:

* Creating dynamic map controls
* Handling user-selected options
* Using trigger functions
* Applying conditional logic
* Dynamically updating map center coordinates
* Dynamically updating zoom levels
* Using Mapbox camera methods such as `flyTo()`
* Managing geographic map views
* Extending an existing CRUD application without breaking existing functionality

---

## ✅ Task Status

**Completed**

Task 8 successfully extends the existing Mapbox functionality by implementing a dynamic map-view selection system that allows users to switch between **Palawan**, **Philippines**, and **World** views.

