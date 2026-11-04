// Word and character counts for the status bar.
// "text" is the plain text of the editor (Quill's getText(), which always
// ends with a line break).
export function countText(text) {
  const value = String(text ?? "");
  const trimmed = value.trim();

  return {
    words: trimmed === "" ? 0 : trimmed.split(/\s+/).length,
    // Spaces count; line breaks between paragraphs do not.
    characters: value.replace(/\n/g, "").length,
  };
}

// 1 -> "1 word", 1532 -> "1,532 characters"
export function formatCount(count, word) {
  return `${count.toLocaleString("en-US")} ${word}${count === 1 ? "" : "s"}`;
}
