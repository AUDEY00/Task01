// Helpers for the side-panel list of locations.

// Firestore Timestamp -> milliseconds (0 if missing, so odd records sort last).
export function toMillis(timestamp) {
  if (timestamp && typeof timestamp.toMillis === "function") {
    const ms = timestamp.toMillis();
    return Number.isFinite(ms) ? ms : 0;
  }

  return 0;
}

// Newest first (by date created). Does not change the original array.
export function sortNewestFirst(locations) {
  return [...locations].sort(
    (a, b) => toMillis(b.dateCreated) - toMillis(a.dateCreated)
  );
}

// Matches the name or the coordinates, ignoring upper/lower case.
export function filterLocations(locations, searchTerm) {
  const term = String(searchTerm ?? "").trim().toLowerCase();

  if (term === "") return locations;

  return locations.filter((location) =>
    `${location.name ?? ""} ${location.latitude} ${location.longitude}`
      .toLowerCase()
      .includes(term)
  );
}

// 9.739200000001 -> "9.7392"  (display only; saved values are never rounded)
export function formatCoordinate(value, decimals = 5) {
  // Number(null) and Number("") are 0, which would show a fake "0".
  if (value === null || value === undefined || value === "") return "";

  const number = Number(value);

  if (!Number.isFinite(number)) return String(value ?? "");

  const factor = 10 ** decimals;

  return String(Math.round(number * factor) / factor);
}
