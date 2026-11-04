import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "documents";

// Same id format as the old app: "doc_" + timestamp + random number.
export function generateDocumentId() {
  return "doc_" + Date.now() + Math.floor(Math.random() * 100000);
}

// Writes one document. Used for BOTH the first save and every later save:
// setDoc with { merge: true } creates the document if it does not exist and
// updates it if it does, so saving twice can never produce two documents.
// "dateCreated" is only sent with the first save (isNew).
export function persistDocument(id, { content }, { isNew }) {
  const data = {
    content,
    dateModified: serverTimestamp(),
  };

  if (isNew) data.dateCreated = serverTimestamp();

  return setDoc(doc(db, COLLECTION, id), data, { merge: true });
}
