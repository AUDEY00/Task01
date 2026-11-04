// Shared by "Add Location" and "Edit Location".
// Returns { error: { title, text } }  or  { values: { name, latitude, longitude } }
// Messages and order of checks match the old Angular controller.
//
// "invalidCoordinatesText" differs slightly between the two forms:
//   Add:  "Please enter valid latitude and longitude values."
//   Edit: "Please enter valid coordinates."
export function validateLocation(
  { name, latitude, longitude },
  invalidCoordinatesText
) {
  const trimmedName = String(name ?? "").trim();

  // Name
  if (trimmedName === "") {
    return {
      error: {
        title: "Missing Information",
        text: "Please enter a location name.",
      },
    };
  }

  // Coordinates. An empty box must count as missing. (The old code used
  // Number(""), which is 0, so an empty form was silently saved at 0, 0.)
  const latitudeText = String(latitude ?? "").trim();
  const longitudeText = String(longitude ?? "").trim();

  const latitudeNumber = latitudeText === "" ? NaN : Number(latitudeText);
  const longitudeNumber = longitudeText === "" ? NaN : Number(longitudeText);

  if (!Number.isFinite(latitudeNumber) || !Number.isFinite(longitudeNumber)) {
    return {
      error: {
        title: "Invalid Coordinates",
        text: invalidCoordinatesText,
      },
    };
  }

  // Latitude range
  if (latitudeNumber < -90 || latitudeNumber > 90) {
    return {
      error: {
        title: "Invalid Latitude",
        text: "Latitude must be between -90 and 90.",
      },
    };
  }

  // Longitude range
  if (longitudeNumber < -180 || longitudeNumber > 180) {
    return {
      error: {
        title: "Invalid Longitude",
        text: "Longitude must be between -180 and 180.",
      },
    };
  }

  return {
    values: {
      name: trimmedName,
      latitude: latitudeNumber,
      longitude: longitudeNumber,
    },
  };
}
