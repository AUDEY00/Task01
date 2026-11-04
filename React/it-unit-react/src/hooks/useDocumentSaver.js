import { useEffect, useState } from "react";
import { createDocumentSaver } from "../services/documentSaver";
import {
  generateDocumentId,
  persistDocument,
} from "../services/documentService";

// Gives the Document Editor page its "saver" (see services/documentSaver.js)
// and the current save status for the little indicator.
export function useDocumentSaver() {
  const [saveState, setSaveState] = useState({ status: "idle", savedAt: null });

  const [saver] = useState(() =>
    createDocumentSaver({
      persist: persistDocument,
      generateId: generateDocumentId,
      onStatusChange: setSaveState,
    })
  );

  useEffect(() => {
    saver.start();

    // Closing or reloading the tab with unsaved changes: ask first.
    function handleBeforeUnload(event) {
      if (saver.hasUnsavedChanges()) {
        event.preventDefault();
        event.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Leaving the page (for example clicking Map in the sidebar):
      // save whatever is still waiting for the 10-second timer.
      saver.flush({ timeoutMs: 0 }).catch(() => {});
      saver.stop();
    };
  }, [saver]);

  return { saver, saveState };
}
