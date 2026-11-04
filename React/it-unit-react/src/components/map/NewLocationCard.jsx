// "New location" card in the side panel. The page owns the values (clicking
// the map fills in the coordinates) and does the saving.
export default function NewLocationCard({
  values,
  onChange,
  onSubmit,
  saving,
  nameInputRef,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      className="side-card new-location"
      id="tour-add-location"
      onSubmit={handleSubmit}
    >
      <h2 className="side-title">New location</h2>

      <div className="field">
        <label htmlFor="locationName">Name</label>
        <input
          type="text"
          id="locationName"
          placeholder="Location name"
          value={values.name}
          onChange={(e) => onChange({ name: e.target.value })}
          ref={nameInputRef}
        />
      </div>

      <div className="coord-row">
        <div className="field">
          <label htmlFor="latitude">Latitude</label>
          <input
            type="number"
            id="latitude"
            step="any"
            placeholder="Latitude"
            value={values.latitude}
            onChange={(e) => onChange({ latitude: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="longitude">Longitude</label>
          <input
            type="number"
            id="longitude"
            step="any"
            placeholder="Longitude"
            value={values.longitude}
            onChange={(e) => onChange({ longitude: e.target.value })}
          />
        </div>
      </div>

      <p className="side-hint">
        Click or tap the map to fill in the coordinates, or type them.
      </p>

      <button type="submit" className="primary-btn" disabled={saving}>
        {saving ? "Adding..." : "Add location"}
      </button>
    </form>
  );
}
