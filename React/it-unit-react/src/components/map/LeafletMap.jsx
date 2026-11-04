import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { buildPopupContent } from "../../utils/mapPopup";

// Leaflet looks for its marker images next to leaflet.css, which bundlers
// break. Point it at the imported image files instead.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Draws one marker (with popup) for every saved location.
function renderMarkers(layer, markersRef, locations) {
  layer.clearLayers();
  markersRef.current = [];

  locations.forEach((location) => {
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    // Ignore invalid coordinates
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    const marker = L.marker([latitude, longitude]).addTo(layer);

    marker.bindPopup(buildPopupContent(location));

    markersRef.current.push({ marker, latitude, longitude });
  });
}

// Props:
//   locations   - saved locations to show as markers
//   pickedPoint - { latitude, longitude } | null  (temporary marker)
//   onPick      - called with (latitude, longitude) when the map is clicked
// Ref method:
//   focusLocation(location) - zoom to a location and open its popup
const LeafletMap = forwardRef(function LeafletMap(
  { locations, pickedPoint, onPick },
  ref
) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null); // holds the saved-location markers
  const markersRef = useRef([]); // [{ marker, latitude, longitude }]
  const tempMarkerRef = useRef(null);

  // Always-current copies for the map's event handlers.
  const onPickRef = useRef(onPick);
  const locationsRef = useRef(locations);

  useEffect(() => {
    onPickRef.current = onPick;
    locationsRef.current = locations;
  });

  // -----------------------------------
  // Create the map once (and destroy it when this component goes away)
  // -----------------------------------
  useEffect(() => {
    // Initial view of Palawan
    const map = L.map(containerRef.current, { zoomControl: false }).setView(
      [9.8349, 118.7384],
      10
    );

    // Zoom buttons at the bottom right (the top is used by the floating map controls).
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);

    // Click = choose coordinates
    map.on("click", (event) => {
      onPickRef.current(event.latlng.lat, event.latlng.lng);
    });

    mapRef.current = map;
    layerRef.current = layer;

    // Render existing locations
    renderMarkers(layer, markersRef, locationsRef.current);

    // Recalculate the map size whenever its container changes size.
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      markersRef.current = [];
      tempMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // -----------------------------------
  // Locations changed -> redraw markers
  // -----------------------------------
  useEffect(() => {
    if (layerRef.current) {
      renderMarkers(layerRef.current, markersRef, locations);
    }
  }, [locations]);

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
      tempMarkerRef.current = L.marker([
        pickedPoint.latitude,
        pickedPoint.longitude,
      ]).addTo(map);
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

      map.setView([latitude, longitude], 12);

      markersRef.current.forEach((entry) => {
        if (entry.latitude === latitude && entry.longitude === longitude) {
          entry.marker.openPopup();
        }
      });
    },
  }));

  return <div id="leafletMap" className="map-view" ref={containerRef}></div>;
});

export default LeafletMap;
