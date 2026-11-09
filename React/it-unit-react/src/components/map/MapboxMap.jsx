import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { buildPopupContent } from "../../utils/mapPopup";
import { updateShapefileOverlay } from "../../utils/mapboxShapefile";
import { updateRasterOverlay } from "../../utils/mapboxRaster";

// Token comes from the ".env" file (VITE_MAPBOX_ACCESS_TOKEN).
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// The three Mapbox views (same coordinates as the old app).
const VIEWS = {
  palawan: { center: [118.7384, 9.8349], zoom: 8 },
  philippines: { center: [121.774, 12.8797], zoom: 5 },
  world: { center: [0, 20], zoom: 1.5 },
};

function applyView(map, mapView) {
  const view = VIEWS[mapView];

  if (!view) return;

  map.flyTo({ center: view.center, zoom: view.zoom, essential: true });
}

// Draws one marker (with popup) for every saved location.
function renderMarkers(map, markersRef, locations) {
  markersRef.current.forEach((entry) => entry.marker.remove());
  markersRef.current = [];

  locations.forEach((location) => {
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    // Ignore invalid coordinates
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(
      buildPopupContent(location)
    );

    const marker = new mapboxgl.Marker()
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(map);

    markersRef.current.push({ marker, latitude, longitude });
  });
}

// Props:
//   locations   - saved locations to show as markers
//   mapView     - "palawan" | "philippines" | "world"
//   pickedPoint - { latitude, longitude } | null  (temporary marker)
//   onPick      - called with (latitude, longitude) when the map is clicked
// Ref method:
//   focusLocation(location) - fly to a location and toggle its popup
const MapboxMap = forwardRef(function MapboxMap(
  { locations, mapView, pickedPoint, onPick, shapefileOverlay = null, rasterOverlay = null },
  ref
) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const loadedRef = useRef(false);
  const markersRef = useRef([]); // [{ marker, latitude, longitude }]
  const tempMarkerRef = useRef(null);

  // Always-current copies for the map's event handlers.
  const onPickRef = useRef(onPick);
  const locationsRef = useRef(locations);
  const mapViewRef = useRef(mapView);
  const pickedPointRef = useRef(pickedPoint);
  const overlayRef = useRef(shapefileOverlay);
  const rasterRef = useRef(rasterOverlay);

  useEffect(() => {
    onPickRef.current = onPick;
    locationsRef.current = locations;
    mapViewRef.current = mapView;
    pickedPointRef.current = pickedPoint;
    overlayRef.current = shapefileOverlay;
    rasterRef.current = rasterOverlay;
  });

  // -----------------------------------
  // Create the map once (and destroy it when this component goes away)
  // -----------------------------------
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/standard",
      // Initial view of Palawan
      center: VIEWS.palawan.center,
      zoom: VIEWS.palawan.zoom,
    });

    mapRef.current = map;
    loadedRef.current = false;

    // Navigation controls
    // Bottom right: the top is used by the floating map controls.
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    // Click = choose coordinates
    map.on("click", (event) => {
      onPickRef.current(event.lngLat.lat, event.lngLat.lng);
    });

    // Wait until Mapbox finishes loading
    map.on("load", () => {
      loadedRef.current = true;

      renderMarkers(map, markersRef, locationsRef.current);

      // Apply the selected Mapbox view.
      applyView(map, mapViewRef.current);
      updateShapefileOverlay(map, overlayRef.current);
      updateRasterOverlay(map, rasterRef.current);
    });

    // Keep the map sized to its container (window resize, layout change).
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      loadedRef.current = false;
      markersRef.current = [];
      tempMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && loadedRef.current) {
      updateShapefileOverlay(mapRef.current, shapefileOverlay);
    }
  }, [shapefileOverlay]);

  useEffect(() => {
    if (mapRef.current && loadedRef.current) updateRasterOverlay(mapRef.current, rasterOverlay);
  }, [rasterOverlay]);

  // -----------------------------------
  // Locations changed -> redraw markers
  // -----------------------------------
  useEffect(() => {
    if (mapRef.current) {
      renderMarkers(mapRef.current, markersRef, locations);
    }
  }, [locations]);

  // -----------------------------------
  // Map view changed -> fly there
  // -----------------------------------
  useEffect(() => {
    if (mapRef.current && loadedRef.current) {
      applyView(mapRef.current, mapView);
    }
  }, [mapView]);

  // -----------------------------------
  // Temporary marker for the clicked point
  // -----------------------------------
  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    if (pickedPoint) {
      tempMarkerRef.current = new mapboxgl.Marker()
        .setLngLat([pickedPoint.longitude, pickedPoint.latitude])
        .addTo(map);
    }
  }, [pickedPoint]);

  // -----------------------------------
  // Used by the table (click a row = focus that location)
  // -----------------------------------
  useImperativeHandle(ref, () => ({
    focusLocation(location) {
      const map = mapRef.current;
      const longitude = Number(location.longitude);
      const latitude = Number(location.latitude);

      if (!map || !Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return;
      }

      map.flyTo({ center: [longitude, latitude], zoom: 12 });

      markersRef.current.forEach((entry) => {
        if (entry.longitude === longitude && entry.latitude === latitude) {
          entry.marker.togglePopup();
        }
      });
    },
  }));

  return <div id="mapboxMap" className="map-view" ref={containerRef}></div>;
});

export default MapboxMap;
