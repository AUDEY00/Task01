// ===================================================================
// Saving logic for the Document Editor (no React, no Firebase).
//
// WHY THIS EXISTS
// The old editor remembered a new document's id only AFTER Firestore
// confirmed the write. On a slow connection the next autosave (or a click on
// Save) therefore still saw "no id" and created a SECOND document.
//
// HOW IT IS FIXED
//  1. The id is chosen synchronously the first time a save is requested,
//     before anything is awaited, and it never changes for that document.
//  2. Every save writes to that same id, so a repeated or retried save can
//     only ever update the same document.
//  3. Saves run one after another (never two at once).
//  4. "dateCreated" is only sent until one write has succeeded.
// ===================================================================

import { isEmptyHtml } from "../utils/documentHtml.js";

const noop = () => {};

// Options
//   persist(id, { content }, { isNew })  - writes to the database (returns a promise)
//   generateId()                         - makes a new document id
//   delay        - ms of quiet after the last edit before auto-saving (10 s)
//   maxWait      - ms after the first unsaved edit at which a save is forced,
//                  so non-stop typing is still saved now and then
//   maxRetries   - failed auto-saves retried (every "delay" ms) before giving up
//   onStatusChange({ status, savedAt }) - status: idle | pending | saving | saved | error
export function createDocumentSaver({
  persist,
  generateId,
  delay = 10000,
  maxWait = 60000,
  maxRetries = 3,
  onStatusChange = noop,
  isEmpty = isEmptyHtml,
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
  now = () => Date.now(),
}) {
  let session = 0; // changes every time a NEW document is started
  let documentId = null;
  let created = false; // true once one write has succeeded
  let latestHtml = "";
  let version = 0; // grows with every edit
  let savedVersion = 0; // the version the last successful save contained
  let firstUnsavedAt = null;
  let timer = null;
  let retries = 0;
  let writesInFlight = 0;
  let stopped = false;
  let chain = Promise.resolve(); // makes saves run one at a time
  let status = "idle";
  let savedAt = null;

  function setStatus(next) {
    status = next;
    onStatusChange({ status, savedAt });
  }

  function hasContent() {
    return !isEmpty(latestHtml);
  }

  function clearPending() {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
  }

  function scheduleAutoSave(wait) {
    clearPending();

    if (stopped) return;

    timer = setTimer(() => {
      timer = null;
      requestSave({ force: false }).catch(noop);
    }, wait);
  }

  // -----------------------------------
  // One save. Always called through requestSave(), so never two at once.
  // -----------------------------------
  async function runSave({ force }, taskSession) {
    // A new document was started after this save was requested: drop it.
    if (taskSession !== session) return { status: "stale" };

    if (!hasContent()) return { status: "empty" };

    // Nothing new since the last successful save.
    if (!force && version === savedVersion) return { status: "unchanged" };

    // THE FIX: pick the id right here, before the first "await".
    if (documentId === null) documentId = generateId();

    const id = documentId;
    const html = latestHtml;
    const savedWith = version;
    const isNew = !created;

    writesInFlight += 1;
    setStatus("saving");

    try {
      await persist(id, { content: html }, { isNew });
    } catch (error) {
      writesInFlight -= 1;

      if (taskSession !== session) return { status: "stale" };

      setStatus("error");

      // Auto-saves try again later; the id stays the same, so a retry can
      // never create a second document.
      if (!force && retries < maxRetries) {
        retries += 1;
        scheduleAutoSave(delay);
      }

      return { status: "error", error, existed: !isNew };
    }

    writesInFlight -= 1;

    if (taskSession !== session) return { status: "stale" };

    created = true;
    if (savedWith > savedVersion) savedVersion = savedWith;
    savedAt = new Date(now());
    retries = 0;

    if (version === savedWith) {
      firstUnsavedAt = null;
      setStatus("saved");
    } else {
      // The user kept typing while this was being saved: the auto-save
      // timer for those newer edits is already running.
      firstUnsavedAt = now();
      setStatus("pending");
    }

    return { status: "saved", created: isNew, id };
  }

  function requestSave(options) {
    const taskSession = session;
    const task = chain.then(() => runSave(options, taskSession));

    chain = task.then(noop, noop);

    return task;
  }

  function setLatest(html) {
    latestHtml = html;
    version += 1;
  }

  // -----------------------------------
  // Public API
  // -----------------------------------
  return {
    // The user edited the document.
    contentChanged(html) {
      setLatest(html);
      retries = 0;

      if (!hasContent()) {
        // Nothing worth saving (the old behaviour is kept: an empty
        // editor is never written over a saved document).
        clearPending();
        firstUnsavedAt = null;
        setStatus(created ? "saved" : "idle");
        return;
      }

      if (firstUnsavedAt === null) firstUnsavedAt = now();

      const waited = now() - firstUnsavedAt;

      scheduleAutoSave(Math.max(0, Math.min(delay, maxWait - waited)));

      if (status !== "saving") setStatus("pending");
    },

    // "Save Document" button. Resolves with
    //   { status: "saved", created, id } | { status: "empty" } |
    //   { status: "error", existed, error } | { status: "stale" }
    saveNow(html) {
      if (typeof html === "string" && html !== latestHtml) setLatest(html);

      return requestSave({ force: true });
    },

    // Save pending changes now (before leaving / starting a new document).
    // Resolves with { status } - "timeout" if the database did not answer in
    // time (the write has still been handed to Firestore, which keeps it).
    flush({ timeoutMs = 5000 } = {}) {
      clearPending();

      const save = requestSave({ force: false });

      if (!timeoutMs) return save;

      let timeoutId;
      const timeout = new Promise((resolve) => {
        timeoutId = setTimer(() => resolve({ status: "timeout" }), timeoutMs);
      });

      return Promise.race([save, timeout]).finally(() => clearTimer(timeoutId));
    },

    // "New Document": forget the current document completely.
    reset() {
      session += 1;
      clearPending();

      documentId = null;
      created = false;
      latestHtml = "";
      version = 0;
      savedVersion = 0;
      firstUnsavedAt = null;
      retries = 0;
      savedAt = null;

      setStatus("idle");
    },

    hasUnsavedChanges() {
      return writesInFlight > 0 || (hasContent() && version !== savedVersion);
    },

    getDocumentId() {
      return documentId;
    },

    // Used when the page is left; start() undoes it (React may unmount and
    // mount a component again in development).
    stop() {
      stopped = true;
      clearPending();
    },

    start() {
      stopped = false;
    },
  };
}
