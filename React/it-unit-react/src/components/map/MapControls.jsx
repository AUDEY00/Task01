// Floating controls on top of the map: provider switch + Mapbox view.
export default function MapControls({
  mapProvider,
  onSelectProvider,
  mapView,
  onChangeView,
}) {
  return (
    <div className="map-controls">
      {/* Map Provider */}
      <div
        className="segmented"
        id="tour-map-provider"
        role="group"
        aria-label="Map provider"
      >
        <button
          type="button"
          className={mapProvider === "mapbox" ? "selected" : ""}
          aria-pressed={mapProvider === "mapbox"}
          onClick={() => onSelectProvider("mapbox")}
        >
          Mapbox
        </button>

        <button
          type="button"
          className={mapProvider === "leaflet" ? "selected" : ""}
          aria-pressed={mapProvider === "leaflet"}
          onClick={() => onSelectProvider("leaflet")}
        >
          Leaflet
        </button>
      </div>

      {/* Map View (Mapbox only) */}
      {mapProvider === "mapbox" && (
        <select
          id="tour-map-view"
          className="view-select"
          aria-label="Map view"
          value={mapView}
          onChange={onChangeView}
        >
          <option value="palawan">Palawan</option>
          <option value="philippines">Philippines</option>
          <option value="world">World</option>
        </select>
      )}
    </div>
  );
}
