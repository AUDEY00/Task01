import { useCallback, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Compass, MapPin, X } from "lucide-react";

import { useLocations } from "../hooks/useLocations";
import { createLocation, deleteLocation } from "../services/locationService";
import { validateLocation } from "../utils/validateLocation";
import {
  filterLocations,
  formatCoordinate,
  sortNewestFirst,
} from "../utils/locationList";

import MapboxMap from "../components/map/MapboxMap";
import ShapefileUpload from "../components/map/ShapefileUpload";
import LeafletMap from "../components/map/LeafletMap";
import MapControls from "../components/map/MapControls";
import NewLocationCard from "../components/map/NewLocationCard";
import LocationList from "../components/map/LocationList";
import LocationDetailsDialog from "../components/map/LocationDetailsDialog";

import "../styles/map.css";

const PROVIDERS = ["mapbox", "leaflet"];
const VIEWS = ["palawan", "philippines", "world"];

// How many locations the list shows at first, and per "Show more" click.
const PAGE_SIZE = 50;

// The layout stacks (map on top, panel below) at or below this width.
const STACKED_QUERY = "(max-width: 960px)";

// Reads a remembered choice from localStorage (falls back safely).
function readStored(key, allowed, fallback) {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function storeValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the choice just isn't remembered.
  }
}

const EMPTY_FORM = { name: "", latitude: "", longitude: "" };

export default function MapPage() {
  const { locations } = useLocations();
  const [shapefileOverlay, setShapefileOverlay] = useState(null);
  const [rasterOverlay, setRasterOverlay] = useState(null);

  // Remembered between visits, like the old app.
  const [mapProvider, setMapProvider] = useState(() =>
    readStored("mapProvider", PROVIDERS, "mapbox")
  );
  const [mapView, setMapView] = useState(() =>
    readStored("mapView", VIEWS, "palawan")
  );

  const [newLocation, setNewLocation] = useState(EMPTY_FORM);
  const [pickedPoint, setPickedPoint] = useState(null); // temporary marker
  const [saving, setSaving] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  // List state
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState(null);

  // Whichever map is showing exposes focusLocation(location).
  const mapRef = useRef(null);
  const mapPaneRef = useRef(null);
  const nameInputRef = useRef(null);

  // -----------------------------------
  // List: newest first -> search -> first N
  // -----------------------------------
  const sortedLocations = useMemo(() => sortNewestFirst(locations), [locations]);

  const matchingLocations = useMemo(
    () => filterLocations(sortedLocations, searchTerm),
    [sortedLocations, searchTerm]
  );

  const visibleLocations = useMemo(
    () => matchingLocations.slice(0, limit),
    [matchingLocations, limit]
  );

  function handleSearchChange(term) {
    setSearchTerm(term);
    setLimit(PAGE_SIZE);
  }

  // -----------------------------------
  // Switch Map Provider
  // (the old map is destroyed and a new one is created; the temporary
  //  marker is cleared but the form values stay, like before)
  // -----------------------------------
  function switchMapProvider(provider) {
    if (provider === mapProvider) return;

    storeValue("mapProvider", provider);
    setPickedPoint(null);
    setMapProvider(provider);
  }

  // -----------------------------------
  // Change Mapbox View
  // -----------------------------------
  function changeMapView(event) {
    const view = event.target.value;

    storeValue("mapView", view);
    setMapView(view);
  }

  // -----------------------------------
  // Map click -> fill the form + temporary marker
  // -----------------------------------
  const handlePick = useCallback((latitude, longitude) => {
    setNewLocation((current) => ({
      ...current,
      latitude: String(latitude),
      longitude: String(longitude),
    }));

    setPickedPoint({ latitude, longitude });
  }, []);

  function handleFormChange(changes) {
    setNewLocation((current) => ({ ...current, ...changes }));
  }

  // Remove the temporary marker and the picked coordinates.
  function handleClearPick() {
    setPickedPoint(null);
    setNewLocation((current) => ({ ...current, latitude: "", longitude: "" }));
  }

  // Phones: the form is below the map, so jump to it.
  function handleGoToForm() {
    nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    nameInputRef.current?.focus({ preventScroll: true });
  }

  // -----------------------------------
  // Add Location
  // -----------------------------------
  async function handleAddLocation() {
    if (saving) return;

    const result = validateLocation(
      newLocation,
      "Please enter valid latitude and longitude values."
    );

    if (result.error) {
      Swal.fire({
        icon: "warning",
        title: result.error.title,
        text: result.error.text,
      });
      return;
    }

    setSaving(true);

    try {
      await createLocation(result.values);

      // Remove temporary marker and clear the form
      setPickedPoint(null);
      setNewLocation(EMPTY_FORM);

      Swal.fire({
        icon: "success",
        title: "Location Added",
        text: `${result.values.name} was added successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Firestore location error:", error);

      Swal.fire({
        icon: "error",
        title: "Add Location Failed",
        text: "The location could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------------
  // Delete Location
  // -----------------------------------
  async function handleDeleteLocation(location) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Location?",
      text: `Are you sure you want to delete ${location.name}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteLocation(location.id);

      if (selectedId === location.id) setSelectedId(null);

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: `${location.name} was deleted successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Firestore delete error:", error);

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Failed to delete the location.",
      });
    }
  }

  // -----------------------------------
  // Focus Location (list item click)
  // -----------------------------------
  function handleFocusLocation(location) {
    setSelectedId(location.id);
    mapRef.current?.focusLocation(location);

    // Phones: the map is above the list, so bring it into view.
    if (window.matchMedia(STACKED_QUERY).matches) {
      mapPaneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const closeEditDialog = useCallback(() => setEditingLocation(null), []);

  // -----------------------------------
  // Guided Tour
  // -----------------------------------
  function startMapTour() {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,

      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Finish",

      progressText: "{{current}} of {{total}}",

      steps: [
        {
          element: "#tour-navigation",
          popover: {
            title: "Map Navigation",
            description:
              "Use the sidebar to move between the Dashboard and Location Map.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-map-provider",
          popover: {
            title: "Map Provider",
            description:
              "Choose which map engine you want to use. The system supports both Mapbox and Leaflet while using the same location records.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-map-view",
          popover: {
            title: "Map View",
            description:
              "When Mapbox is selected, use this control to change the geographic view between Palawan, the Philippines, and the World.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-map",
          popover: {
            title: "Interactive Map",
            description:
              "This is the interactive map. You can view saved locations, interact with markers, and click or tap on the map to select coordinates.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#tour-add-location",
          popover: {
            title: "Add Location",
            description:
              "Enter a location name, latitude, and longitude to create a new location record. You can also select coordinates directly from the map.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#tour-location-list",
          popover: {
            title: "Location List",
            description:
              "All registered locations are listed here, newest first. Use the search box to find one, and click a location to focus it on the map.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#tour-location-list .item-actions",
          popover: {
            title: "Location Actions",
            description:
              "Use the pencil to edit a location or the trash can to delete it.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#tour-logout",
          popover: {
            title: "Logout",
            description:
              "Use the Logout button when you are finished using the system.",
            side: "right",
            align: "start",
          },
        },
        {
          popover: {
            title: "Map Tour Complete!",
            description:
              "You now know how to navigate the map, switch map providers, change map views, add locations, and manage existing location records.",
          },
        },
      ],
    });

    driverObj.drive();
  }

  const MapComponent = mapProvider === "mapbox" ? MapboxMap : LeafletMap;

  return (
    <div className="map-page">
      {/* Page Header */}
      <div className="map-header">
        <div>
          <h1>Location Map</h1>
          <p>
            {locations.length} {locations.length === 1 ? "location" : "locations"}
            {" · "}Click or tap the map to pick a point
          </p>
        </div>

        <div className="map-header-actions">
        <ShapefileUpload overlay={shapefileOverlay} onChange={setShapefileOverlay} mapProvider={mapProvider} raster={rasterOverlay} onRasterChange={setRasterOverlay} />
        <button type="button" className="tool-btn" onClick={startMapTour}>
          <Compass size={16} aria-hidden="true" />
          Guided tour
        </button>
        </div>
      </div>

      <div className="map-layout">
        {/* Map */}
        <section className="map-pane" id="tour-map" ref={mapPaneRef}>
          <div className="map-canvas">
            <MapComponent
              ref={mapRef}
              locations={locations}
              mapView={mapView}
              pickedPoint={pickedPoint}
              onPick={handlePick}
              {...(mapProvider === "mapbox" ? { shapefileOverlay, rasterOverlay } : {})}
            />

            <MapControls
              mapProvider={mapProvider}
              onSelectProvider={switchMapProvider}
              mapView={mapView}
              onChangeView={changeMapView}
            />

            {/* Phones only: confirms the picked point and jumps to the form */}
            {pickedPoint && (
              <div className="pick-bar">
                <MapPin size={16} aria-hidden="true" />

                <span className="pick-coords">
                  {formatCoordinate(pickedPoint.latitude, 4)},{" "}
                  {formatCoordinate(pickedPoint.longitude, 4)}
                </span>

                <button type="button" className="pick-add" onClick={handleGoToForm}>
                  Add details
                </button>

                <button
                  type="button"
                  className="pick-clear"
                  title="Clear point"
                  aria-label="Clear picked point"
                  onClick={handleClearPick}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Side panel */}
        <aside className="map-side">
          <NewLocationCard
            values={newLocation}
            onChange={handleFormChange}
            onSubmit={handleAddLocation}
            saving={saving}
            nameInputRef={nameInputRef}
          />

          <LocationList
            locations={visibleLocations}
            totalCount={locations.length}
            matchCount={matchingLocations.length}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            selectedId={selectedId}
            onFocus={handleFocusLocation}
            onEdit={setEditingLocation}
            onDelete={handleDeleteLocation}
            onShowMore={() => setLimit((current) => current + PAGE_SIZE)}
          />
        </aside>
      </div>

      {/* Edit Location Dialog */}
      {editingLocation && (
        <LocationDetailsDialog
          key={editingLocation.id}
          location={editingLocation}
          onClose={closeEditDialog}
        />
      )}
    </div>
  );
}
