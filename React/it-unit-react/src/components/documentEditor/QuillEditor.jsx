import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// Same toolbar as the old editor.
const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline"],
  [{ header: [1, 2, 3, false] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ color: [] }],
  [{ align: ["", "center", "right", "justify"] }],
];

const QuillEditor = forwardRef(function QuillEditor({ onChange }, ref) {
  const wrapperRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);

  // Always call the newest onChange without rebuilding the editor.
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;

    // Quill puts its toolbar NEXT TO the element it is given. Giving it a
    // fresh element inside our wrapper means everything it creates (toolbar
    // + editor) can be removed in one go when React tears the editor down,
    // so the toolbar is never duplicated.
    const editorElement = document.createElement("div");
    wrapper.appendChild(editorElement);

    const quill = new Quill(editorElement, {
      theme: "snow",
      placeholder: "Start writing your document...",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });

    quillRef.current = quill;

    // Only real edits by the user count (source "user"). Clearing the editor
    // from code does not start an auto-save.
    quill.on("text-change", (delta, oldDelta, source) => {
      if (source === "user" && onChangeRef.current) {
        onChangeRef.current(quill.root.innerHTML, quill.getText());
      }
    });

    return () => {
      quillRef.current = null;
      wrapper.innerHTML = "";
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getHtml() {
      return quillRef.current ? quillRef.current.root.innerHTML : "";
    },

    getText() {
      return quillRef.current ? quillRef.current.getText() : "";
    },

    clear() {
      if (quillRef.current) quillRef.current.setContents([]);
    },

    setEnabled(enabled) {
      if (quillRef.current) quillRef.current.enable(enabled);
    },

    focus() {
      if (quillRef.current) quillRef.current.focus();
    },
  }));

  // The wrapper keeps the id the old stylesheet used.
  return <div id="document-editor" ref={wrapperRef}></div>;
});

export default QuillEditor;
