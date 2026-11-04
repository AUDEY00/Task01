// Popup content shown when a marker is clicked. Looks the same as the old
//   <strong>Name</strong><br>Latitude: ..<br>Longitude: ..
// but is built with text nodes, so a location name can never inject HTML.
export function buildPopupContent(location) {
  const wrapper = document.createElement("div");

  const title = document.createElement("strong");
  title.textContent = location.name;

  wrapper.append(
    title,
    document.createElement("br"),
    `Latitude: ${location.latitude}`,
    document.createElement("br"),
    `Longitude: ${location.longitude}`
  );

  return wrapper;
}
