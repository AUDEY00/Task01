import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "staff";

// -----------------------------------
// Generate Unique Id
// Same format as the old app (timestamp + random), but guaranteed
// unique inside one session, so a bulk import can never overwrite itself.
// -----------------------------------
const usedIds = new Set();

export function generateStaffId() {
  let id = Date.now() + Math.floor(Math.random() * 100000);

  while (usedIds.has(id)) {
    id += 1;
  }

  usedIds.add(id);
  return id;
}

// -----------------------------------
// Read staff (live updates)
// Returns the unsubscribe function.
// -----------------------------------
export function subscribeToStaff(onData, onError) {
  return onSnapshot(
    collection(db, COLLECTION),
    (snapshot) => {
      onData(snapshot.docs.map((d) => d.data()));
    },
    onError
  );
}

// -----------------------------------
// Create
// -----------------------------------
export function createStaff(staff) {
  return setDoc(doc(db, COLLECTION, String(staff.id)), staff);
}

// -----------------------------------
// Update status only
// -----------------------------------
export function updateStaffStatus(id, status) {
  return updateDoc(doc(db, COLLECTION, String(id)), { status });
}

// -----------------------------------
// Update details (name, role, image info)
// -----------------------------------
export function updateStaffDetails(id, details) {
  return updateDoc(doc(db, COLLECTION, String(id)), {
    name: details.name,
    role: details.role,
    profileUrl: details.profileUrl || "",
    cloudinaryPublicId: details.cloudinaryPublicId || "",
  });
}

// -----------------------------------
// Delete
// -----------------------------------
export function deleteStaff(id) {
  return deleteDoc(doc(db, COLLECTION, String(id)));
}
