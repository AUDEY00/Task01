import { MapPin, Pencil, Search, Trash2 } from "lucide-react";
import { formatCoordinate } from "../../utils/locationList";

// Scrollable, searchable list of locations (side panel).
// The page decides which locations are shown (search + "show more").
export default function LocationList({
  locations, // the ones to display right now
  totalCount, // all locations
  matchCount, // locations matching the search
  searchTerm,
  onSearchChange,
  selectedId,
  onFocus,
  onEdit,
  onDelete,
  onShowMore,
}) {
  const isSearching = searchTerm.trim() !== "";
  const remaining = matchCount - locations.length;

  return (
    <section className="side-card location-panel" id="tour-location-list">
      <div className="panel-header">
        <h2 className="side-title">
          Locations <span className="count-badge">{totalCount}</span>
        </h2>
      </div>

      {/* Search */}
      <div className="search-box">
        <Search size={15} aria-hidden="true" />
        <input
          type="text"
          placeholder="Search name or coordinates"
          aria-label="Search locations"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {isSearching && (
        <p className="result-info">
          {matchCount} of {totalCount} match
        </p>
      )}

      {/* List */}
      <ul className="location-list">
        {locations.map((location) => (
          <li
            key={location.id}
            className={
              location.id === selectedId
                ? "location-item selected"
                : "location-item"
            }
          >
            <button
              type="button"
              className="location-main"
              onClick={() => onFocus(location)}
            >
              <MapPin size={17} aria-hidden="true" />

              <span className="location-text">
                <span className="location-name">{location.name}</span>
                <span className="location-coords">
                  {formatCoordinate(location.latitude)},{" "}
                  {formatCoordinate(location.longitude)}
                </span>
              </span>
            </button>

            <div className="item-actions">
              <button
                type="button"
                className="icon-btn"
                title="Edit"
                aria-label={`Edit ${location.name}`}
                onClick={() => onEdit(location)}
              >
                <Pencil size={16} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="icon-btn danger"
                title="Delete"
                aria-label={`Delete ${location.name}`}
                onClick={() => onDelete(location)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}

        {matchCount === 0 && (
          <li className="list-empty">
            {totalCount === 0
              ? "No locations yet. Click the map to pick a point, then add it."
              : "No locations match your search."}
          </li>
        )}

        {remaining > 0 && (
          <li className="list-more">
            <button type="button" className="load-more" onClick={onShowMore}>
              Show more ({remaining} remaining)
            </button>
          </li>
        )}
      </ul>
    </section>
  );
}
