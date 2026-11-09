import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { Compass, FilePlus, Save } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

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
  const tourRef = useRef(null);
  const tourButtonRef = useRef(null);
  useEffect(() => () => tourRef.current?.destroy(), []);

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

  function startEditorTour() {
    tourRef.current?.destroy();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = (element, title, description) => ({ element, popover: { title, description, side: 'bottom', align: 'start' } });
    const steps = [
      { popover: { title: 'Document Editor', description: 'Create, format, save, and preview documents. This tour explains the current view without changing your document.' } },
      step('#tour-document-new', 'New document', 'Start a fresh document. If you have content, the editor asks for confirmation and attempts to save pending changes before clearing it.'),
      step('#tour-document-save', 'Save document', 'Save your current document manually. Add some content first; empty documents cannot be saved.'),
      step('#tour-document-mode', 'Edit and Preview', 'Use Edit to write and format text. Preview shows the paper layout and paper settings. Add content before opening Preview.'),
      ...(showPreview ? [
        step('#tour-document-paper', 'Paper settings', 'Choose a paper size, custom dimensions, orientation, and margins. Your paper settings are remembered between visits.'),
        step('.document-editor-page .paper-area', 'Document preview', 'Review how the content fits across the pages. Return to Edit when you want to change the text.'),
      ] : [
        step('#document-editor .ql-toolbar', 'Formatting toolbar', 'Select text to apply bold, italic, underline, headings, lists, text colors, or alignment.'),
        step('#document-editor .ql-editor', 'Writing area', 'Write your document here. After you stop typing, the editor schedules an automatic save after 10 seconds.'),
      ]),
      step('#tour-document-status', 'Document status', 'Check the word and character counts and the current save status here. Review save errors before leaving the page.'),
      { popover: { title: 'Ready to write', description: showPreview ? 'Return to Edit to continue writing. You can restart this tour at any time.' : 'Open Preview after adding content, then run Guided tour again to explore paper settings.' } },
    ];
    tourRef.current = driver({
      showProgress: true,
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next', prevBtnText: 'Back', doneBtnText: 'Finish',
      animate: !reducedMotion, smoothScroll: !reducedMotion,
      disableActiveInteraction: true,
      onDestroyed: () => { if (tourButtonRef.current?.isConnected) tourButtonRef.current.focus({ preventScroll: true }); },
      steps,
    });
    tourRef.current.drive();
  }

  return (
    <div className="document-editor-page">
      {/* Page Header */}
      <div className="de-page-header">
        <div>
        <h1>Document Editor</h1>

        <p>Create and format rich-text documents.</p>
        </div>
        <button ref={tourButtonRef} type="button" className="tool-btn" onClick={startEditorTour}>
          <Compass size={16} aria-hidden="true" /> Guided tour
        </button>
      </div>

      <section className="editor-card">
        {/* Top bar: New, Save and the Edit / Preview switch */}
        <div className="editor-topbar">
          <div className="topbar-actions">
            <button
              type="button"
              className="tool-btn"
              title="Start a new document"
              id="tour-document-new"
              onClick={handleNewDocument}
            >
              <FilePlus size={16} aria-hidden="true" />
              New
            </button>

            <button
              type="button"
              className="tool-btn primary"
              title="Save the document"
              id="tour-document-save"
              onClick={handleSave}
              disabled={manualSaving}
            >
              <Save size={16} aria-hidden="true" />
              {manualSaving ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="mode-switch" role="group" aria-label="View" id="tour-document-mode">
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
          <div className="editor-toolrow" id="tour-document-paper">
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
        <div className="editor-statusbar" id="tour-document-status">
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
