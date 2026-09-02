# Task 7 – Dynamic Map Provider Switching

## Overview

Task 7 extends the previous map implementation by introducing support for **multiple map providers**. The application integrates **LeafletJS** and **Mapbox GL JS** and allows the user to dynamically switch between them through a map provider selector.

The primary objective is to separate the **map rendering engine** from the application's **spatial location data**. Both map providers use the same set of location records, ensuring that switching between LeafletJS and Mapbox GL JS does not modify, duplicate, or remove the existing CRUD data.

---

## Objectives

The objectives of Task 7 are to:

* Integrate LeafletJS into the existing map component.
* Integrate Mapbox GL JS into the existing map component.
* Provide a user interface for selecting the active map provider.
* Dynamically switch between LeafletJS and Mapbox GL JS.
* Display the same spatial location records using either map provider.
* Reuse the existing latitude and longitude values.
* Keep location CRUD data independent from the selected map engine.
* Avoid duplicating location records for different map providers.
* Establish a flexible map architecture that can support additional providers in the future.

---

## Technologies Used

* **HTML5** – Structure of the map interface and provider selector.
* **CSS3** – Styling and layout of the map component.
* **JavaScript** – Map initialization and provider-specific logic.
* **AngularJS** – Controller, data binding, and dynamic provider switching.
* **LeafletJS** – Lightweight interactive map rendering.
* **Mapbox GL JS** – WebGL-based map rendering and Mapbox map styles.
* **Angular Material** – User interface components such as the provider selector.

---

# Key Features

## 1. Map Provider Selector

A map provider selector allows the user to choose the active map engine.

Available providers:

* **LeafletJS**
* **Mapbox GL JS**

The selected provider determines which map implementation is initialized.

Example:

```html
<md-select
    ng-model="vm.selectedMapProvider"
    ng-change="vm.changeMapProvider()">

    <md-option value="leaflet">
        LeafletJS
    </md-option>

    <md-option value="mapbox">
        Mapbox GL JS
    </md-option>

</md-select>
```

The `ng-model` stores the selected provider, while `ng-change` triggers the provider-switching function.

---

## 2. Dynamic Map Switching

The application can switch between LeafletJS and Mapbox GL JS without requiring a page reload.

The general process is:

```text
User selects a map provider
          │
          ▼
AngularJS detects the change
          │
          ▼
Current map is cleared
          │
          ▼
Selected map provider is initialized
          │
          ▼
Existing location records are loaded
          │
          ▼
Locations are displayed on the selected map
```

This allows the user to change the map engine while keeping the underlying location data unchanged.

---

## 3. LeafletJS Integration

When **LeafletJS** is selected, the application initializes a Leaflet map and displays the available spatial locations using Leaflet markers.

Typical Leaflet functionality includes:

```javascript
L.map()
L.tileLayer()
L.marker()
marker.addTo()
```

The latitude and longitude values from the location records determine the marker positions.

Conceptually:

```text
Location Data
      │
      ▼
  LeafletJS
      │
      ▼
Leaflet Map
      │
      ▼
Location Markers
```

---

## 4. Mapbox GL JS Integration

When **Mapbox GL JS** is selected, the application initializes a Mapbox map and displays the same spatial location records using Mapbox markers.

Typical Mapbox functionality includes:

```javascript
new mapboxgl.Map()
new mapboxgl.Marker()
map.setCenter()
map.setZoom()
```

The same latitude and longitude values used by LeafletJS are used to position the Mapbox markers.

Conceptually:

```text
Location Data
      │
      ▼
 Mapbox GL JS
      │
      ▼
 Mapbox Map
      │
      ▼
Location Markers
```

---

# Shared Spatial Data Architecture

One of the main design principles of Task 7 is that **location data is shared between the map providers**.

The application does not create one location dataset for LeafletJS and another dataset for Mapbox GL JS.

For example:

```javascript
{
    name: "Location Name",
    latitude: 14.5995,
    longitude: 120.9842
}
```

The same record can be displayed by either map provider.

The architecture can be represented as:

```text
                  Location Records
                         │
                         ▼
              AngularJS Controller
                         │
                         ▼
               Map Provider Selector
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
            LeafletJS         Mapbox GL JS
                │                 │
                ▼                 ▼
        Leaflet Markers     Mapbox Markers
                │                 │
                └────────┬────────┘
                         ▼
                  Map Visualization
```

This separation prevents data duplication and keeps the CRUD functionality independent from the map engine.

---

# LeafletJS vs Mapbox GL JS

Although both technologies are used to display interactive maps, they have different approaches and capabilities.

| Feature        | LeafletJS                                                              | Mapbox GL JS                                                   |
| -------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| Type           | Lightweight JavaScript mapping library                                 | Web mapping library using Mapbox's platform                    |
| Rendering      | Primarily HTML/SVG-based rendering for map elements                    | WebGL-based rendering                                          |
| Map Data       | Requires a tile provider such as OpenStreetMap or another tile service | Uses Mapbox map styles and map data                            |
| Map Styling    | Depends largely on the selected tile provider                          | Highly customizable through Mapbox styles                      |
| Performance    | Lightweight and suitable for standard interactive maps                 | Well-suited for complex visualizations and large datasets      |
| 3D Support     | Limited and generally requires additional plugins                      | Supports advanced 3D features such as terrain and 3D buildings |
| Customization  | Highly extensible through plugins                                      | Strong built-in styling and visualization capabilities         |
| Markers        | Uses Leaflet marker objects                                            | Uses Mapbox marker objects                                     |
| Controls       | Supports common map controls such as zoom and layers                   | Provides navigation and other map controls                     |
| Learning Curve | Generally simpler to learn and implement                               | More advanced with additional mapping capabilities             |
| Data in Task 7 | Uses the shared spatial records                                        | Uses the same shared spatial records                           |

---

## LeafletJS

LeafletJS is a lightweight and flexible JavaScript mapping library. It is appropriate for applications that require interactive maps, markers, popups, controls, and basic map layers without requiring a highly complex mapping engine.

In Task 7, LeafletJS is responsible for rendering the location records whenever **LeafletJS** is selected as the active provider.

### Strengths

* Lightweight.
* Easy to understand and implement.
* Large plugin ecosystem.
* Flexible map-layer support.
* Suitable for basic and moderately complex interactive maps.

---

## Mapbox GL JS

Mapbox GL JS provides a more advanced map rendering system using WebGL. It is designed for interactive maps that require customizable styles, smooth rendering, and more advanced visualization capabilities.

In Task 7, Mapbox GL JS renders the **same location records** used by LeafletJS whenever **Mapbox GL JS** is selected.

### Strengths

* WebGL-based rendering.
* Advanced map styling.
* Smooth interactive map visualization.
* Supports advanced visualization capabilities.
* Supports features such as 3D terrain and buildings.

---

# Key Difference in Task 7

The main difference between the two providers is the **map rendering technology and available mapping features**, not the application's location data.

The application maintains a single source of spatial information:

```text
                  Shared Location Data
                          │
                          ▼
                 Map Provider Selector
                          │
                ┌─────────┴─────────┐
                │                   │
                ▼                   ▼
            LeafletJS          Mapbox GL JS
                │                   │
                ▼                   ▼
        Leaflet Marker        Mapbox Marker
                │                   │
                └─────────┬─────────┘
                          ▼
                   Map Display
```

Therefore:

> **Changing the map provider changes how the locations are rendered, but does not change the location records themselves.**

This separation is important because the location CRUD functionality can continue operating independently of the selected map engine.

---

# AngularJS Concepts Used

## Controller-As Syntax

The application uses AngularJS Controller-As syntax to organize controller data and functions.

```javascript
var vm = this;
```

The `vm` object exposes the controller's properties and functions to the HTML view.

---

## `ng-model`

`ng-model` is used to store the currently selected map provider.

```html
ng-model="vm.selectedMapProvider"
```

The selected value can be:

```text
leaflet
```

or:

```text
mapbox
```

---

## `ng-change`

`ng-change` detects changes to the selected map provider.

```html
ng-change="vm.changeMapProvider()"
```

When the user changes the selection, the corresponding controller function is executed.

---

## Conditional Logic

The controller determines which map engine should be initialized based on the selected provider.

Conceptually:

```javascript
if (vm.selectedMapProvider === "leaflet") {

    // Initialize Leaflet

} else if (vm.selectedMapProvider === "mapbox") {

    // Initialize Mapbox

}
```

This keeps the provider-specific implementation separated.

---

# Map Provider Switching Logic

The map provider selection can be represented as:

```text
                    selectedMapProvider
                            │
              ┌─────────────┴─────────────┐
              │                           │
          "leaflet"                    "mapbox"
              │                           │
              ▼                           ▼
       Initialize Leaflet         Initialize Mapbox
              │                           │
              ▼                           ▼
      Render locations             Render locations
              │                           │
              └─────────────┬─────────────┘
                            ▼
                     Same Location Data
```

The CRUD records remain unchanged during this process.

---

# Data and Map Engine Separation

Task 7 follows a separation-of-concerns approach.

The application can be divided into two major responsibilities:

### Location Data

Responsible for:

* Location records.
* Latitude and longitude.
* CRUD operations.
* Data management.

### Map Rendering

Responsible for:

* Initializing the selected map engine.
* Rendering markers.
* Centering the map.
* Displaying spatial records.

This separation makes the application easier to maintain and extend.

For example, adding another map provider in the future should not require creating another copy of the location records.

---

# User Flow

The expected user flow is:

```text
1. User opens the map page
          │
          ▼
2. Default map provider is loaded
          │
          ▼
3. Location records are displayed
          │
          ▼
4. User selects LeafletJS or Mapbox GL JS
          │
          ▼
5. Application detects the selection
          │
          ▼
6. Current map is cleared
          │
          ▼
7. Selected map engine is initialized
          │
          ▼
8. Existing location records are loaded
          │
          ▼
9. Locations are displayed on the selected map
```

---

# Task 7 Requirements Checklist

* [x] Integrate LeafletJS.
* [x] Integrate Mapbox GL JS.
* [x] Add a map provider selector.
* [x] Allow dynamic switching between LeafletJS and Mapbox GL JS.
* [x] Display the same spatial location records on both map providers.
* [x] Reuse the existing latitude and longitude values.
* [x] Keep CRUD location data independent from the map provider.
* [x] Avoid duplicating the location dataset.
* [x] Dynamically initialize the selected map provider.
* [x] Maintain a separation between location data and map rendering logic.

---

# Result

Task 7 successfully implements **dynamic map provider switching** between LeafletJS and Mapbox GL JS.

The application maintains a single set of spatial location records while allowing the user to select which map engine will be used to visualize those records.

The implementation establishes a flexible architecture in which:

* **LeafletJS** provides a lightweight interactive mapping option.
* **Mapbox GL JS** provides advanced WebGL-based map rendering and styling.
* **AngularJS** manages the provider selection and map switching logic.
* **The location CRUD data remains shared and independent of the selected map provider.**

This architecture also provides a strong foundation for future tasks, where provider-specific features can be added without modifying the underlying location data structure.

