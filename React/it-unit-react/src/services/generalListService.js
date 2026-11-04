import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "generalLists";

// -----------------------------------
// Read all lists (live updates). Returns the unsubscribe function.
// Each list: { id, name, columns, records }
// -----------------------------------
export function subscribeToLists(onData, onError) {
  return onSnapshot(
    collection(db, COLLECTION),
    (snapshot) => {
      onData(
        snapshot.docs.map((d) => {
          const data = d.data();

          return {
            id: d.id,
            name: data.name,
            columns: data.columns || [],
            records: data.records || [],
          };
        })
      );
    },
    onError
  );
}

// -----------------------------------
// Create. Id format "list_<timestamp>" like the old app.
// -----------------------------------
export async function createList({ name, columns }) {
  const id = "list_" + Date.now();

  await setDoc(doc(db, COLLECTION, id), { name, columns, records: [] });

  return id;
}

// -----------------------------------
// Replace the records of a list (add / edit / delete a record)
// -----------------------------------
export function saveRecords(listId, records) {
  return updateDoc(doc(db, COLLECTION, listId), { records });
}

// -----------------------------------
// Edit list: name, columns and (carried over) records
// -----------------------------------
export function updateList(listId, { name, columns, records }) {
  return updateDoc(doc(db, COLLECTION, listId), { name, columns, records });
}

// -----------------------------------
// Delete a whole list (and its records)
// -----------------------------------
export function deleteList(listId) {
  return deleteDoc(doc(db, COLLECTION, listId));
}
