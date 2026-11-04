import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "locations";

// -----------------------------------
// Read locations (live updates). Returns the unsubscribe function.
// -----------------------------------
export function subscribeToLocations(onData, onError) {
  return onSnapshot(
    collection(db, COLLECTION),
    (snapshot) => {
      onData(snapshot.docs.map((d) => d.data()));
    },
    onError
  );
}

// -----------------------------------
// Create. Id format "loc_<timestamp>" like the old app.
// -----------------------------------
export async function createLocation({ name, latitude, longitude }) {
  const id = "loc_" + Date.now();
  const timestamp = Timestamp.now();

  const location = {
    id,
    name,
    latitude,
    longitude,
    dateCreated: timestamp,
    dateModified: timestamp,
  };

  await setDoc(doc(db, COLLECTION, id), location);

  return location;
}

// -----------------------------------
// Update name / coordinates and refresh dateModified
// -----------------------------------
export function updateLocation(id, { name, latitude, longitude }) {
  return updateDoc(doc(db, COLLECTION, String(id)), {
    name,
    latitude,
    longitude,
    dateModified: Timestamp.now(),
  });
}

// -----------------------------------
// Delete
// -----------------------------------
export function deleteLocation(id) {
  return deleteDoc(doc(db, COLLECTION, String(id)));
}
