import { useRef, useState } from "react";
import Swal from "sweetalert2";
import { FilePlus, Save } from "lucide-react";

import { useDocumentSaver } from "../hooks/useDocumentSaver";
import { isEmptyHtml } from "../utils/documentHtml";
import { countText, formatCount } from "../utils/documentStats";
import { DEFAULT_PAPER_SETTINGS, normalizeSettings } from "../utils/paper";

import QuillEditor from "../components/documentEditor/QuillEditor";
import SaveStatus from "../components/documentEditor/SaveStatus";
import PaperControls from "../components/documentEditor/PaperControls";
import PaperPreview from "../components/documentEditor/PaperPreview";

import "../styles/document-editor.css";

const PAPER_STORAGE_KEY = "documentPaperSettings";

// The paper settings used last time (remembered between visits).
function readPaperSettings() {
  try {
    const stored = localStorage.getItem(PAPER_STORAGE_KEY);

    return normalizeSettings(stored ? JSON.parse(stored) : null);
  } catch {
    return { ...DEFAULT_PAPER_SETTINGS };
  }
}

function storePaperSettings(settings) {
  try {
    localStorage.setItem(PAPER_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable: the choice just isn't remembered.
  }
}

export default function DocumentEditorPage() {
  const { saver, saveState } = useDocumentSaver();

  const editorRef = useRef(null);

  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [paperSettings, setPaperSettings] = useState(readPaperSettings);
  const [manualSaving, setManualSaving] = useState(false);
  const [stats, setStats] = useState({ words: 0, characters: 0 });

  // -----------------------------------
  // The user edited the document -> (re)start the 10-second auto-save timer
  // -----------------------------------
  function handleEditorChange(html, text) {
    saver.contentChanged(html);

    const counts = countText(text);

    // Only re-render when a number actually changed.
    setStats((previous) =>
      previous.words === counts.words && previous.characters === counts.characters
        ? previous
        : counts
    );
  }

  // -----------------------------------
  // Save Document (button)
  // -----------------------------------
  async function handleSave() {
    if (manualSaving || !editorRef.current) return;

    const html = editorRef.current.getHtml();

    // Check empty document
    if (isEmptyHtml(html)) {
      Swal.fire({
        icon: "warning",
        title: "Empty Document",
        text: "Please enter some content before saving.",
      });
      return;
    }

    setManualSaving(true);

    let result;

    try {
      result = await saver.saveNow(html);
    } finally {
      setManualSaving(false);
    }

    if (result.status === "saved") {
      Swal.fire({
        icon: "success",
        title: "Document Saved",
        text: result.created
          ? "Your document has been saved successfully."
          : "Your document has been updated successfully.",
      });
    } else if (result.status === "error") {
      console.error("Error saving document:", result.error);

      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: result.existed
          ? "Unable to update the document."
          : "Unable to save the document.",
      });
    }
    // "stale": a new document was started while saving - nothing to tell.
  }

  // -----------------------------------
  // Reset (start a fresh, empty document)
  // -----------------------------------
  function resetDocument() {
    saver.reset();

    if (editorRef.current) editorRef.current.clear();

    setPreviewHtml("");
    setShowPreview(false);
    setStats({ words: 0, characters: 0 });
  }

  // -----------------------------------
  // New Document (button)
  // -----------------------------------
  async function handleNewDocument() {
    const editor = editorRef.current;

    if (!editor) return;

    // Nothing written yet: start straight away.
    if (isEmptyHtml(editor.getHtml())) {
      resetDocument();
      return;
    }

    const confirmation = await Swal.fire({
      icon: "question",
      title: "Start a New Document?",
      text: "Your current document will stay saved. The editor will be cleared so you can start a new one.",
      showCancelButton: true,
      confirmButtonText: "New Document",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    // Save the last few seconds of typing before clearing the editor
    // (typing is paused while that happens).
    editor.setEnabled(false);

    let flushed;

    try {
      flushed = await saver.flush({ timeoutMs: 5000 });
    } finally {
      editor.setEnabled(true);
    }

    if (flushed.status === "error") {
      const again = await Swal.fire({
        icon: "warning",
        title: "Latest Changes Not Saved",
        text: "Your most recent changes could not be saved. If you start a new document now, those changes will be lost.",
        showCancelButton: true,
        confirmButtonText: "Start New Anyway",
        cancelButtonText: "Keep Editing",
      });

      if (!again.isConfirmed) return;
    }

    resetDocument();
  }

  // -----------------------------------
  // Preview / Back to Editor
  // -----------------------------------
  function handlePreview() {
    if (showPreview || !editorRef.current) return;

    const html = editorRef.current.getHtml();

    if (isEmptyHtml(html)) {
      Swal.fire({
        icon: "warning",
        title: "Empty Document",
        text: "Please enter some content before previewing.",
      });
      return;
    }

    setPreviewHtml(html);
    setShowPreview(true);
  }

  function handleClosePreview() {
    setShowPreview(false);
  }

  // -----------------------------------
  // Paper size / orientation / margins
  // -----------------------------------
  function handlePaperChange(changes) {
    const next = normalizeSettings({ ...paperSettings, ...changes });

    setPaperSettings(next);
    storePaperSettings(next);
  }

  return (
    <div className="document-editor-page">
      {/* Page Header */}
      <div className="de-page-header">
        <h1>Document Editor</h1>

        <p>Create and format rich-text documents.</p>
      </div>

      <section className="editor-card">
        {/* Top bar: New, Save and the Edit / Preview switch */}
        <div className="editor-topbar">
          <div className="topbar-actions">
            <button
              type="button"
              className="tool-btn"
              title="Start a new document"
              onClick={handleNewDocument}
            >
              <FilePlus size={16} aria-hidden="true" />
              New
            </button>

            <button
              type="button"
              className="tool-btn primary"
              title="Save the document"
              onClick={handleSave}
              disabled={manualSaving}
            >
              <Save size={16} aria-hidden="true" />
              {manualSaving ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="mode-switch" role="group" aria-label="View">
            <button
              type="button"
              className={!showPreview ? "selected" : ""}
              aria-pressed={!showPreview}
              onClick={handleClosePreview}
            >
              Edit
            </button>

            <button
              type="button"
              className={showPreview ? "selected" : ""}
              aria-pressed={showPreview}
              onClick={handlePreview}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Preview: paper controls take the place of the formatting toolbar */}
        {showPreview && (
          <div className="editor-toolrow">
            <PaperControls
              settings={paperSettings}
              onChange={handlePaperChange}
            />
          </div>
        )}

        {/* The editor (formatting toolbar + page) stays alive, just hidden,
            while previewing */}
        <div className={showPreview ? "is-hidden" : undefined}>
          <QuillEditor ref={editorRef} onChange={handleEditorChange} />
        </div>

        {/* Document Preview */}
        {showPreview && (
          <PaperPreview html={previewHtml} settings={paperSettings} />
        )}

        {/* Status bar */}
        <div className="editor-statusbar">
          <span className="doc-counts">
            {formatCount(stats.words, "word")} ·{" "}
            {formatCount(stats.characters, "character")}
          </span>

          <SaveStatus state={saveState} />
        </div>
      </section>
    </div>
  );
}
