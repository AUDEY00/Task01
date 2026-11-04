// True when the editor holds no real content.
// Same idea as the old check ("" or "<p><br></p>"), but it also treats
// blank lines, spaces and hidden cursor characters as empty, so a document
// that only contains empty paragraphs is never saved.
export function isEmptyHtml(html) {
  if (!html) return true;

  const text = String(html)
    .replace(/<[^>]*>/g, "") // remove tags
    .replace(/&nbsp;/gi, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width characters
    .trim();

  // Quill has no images/tables here, but never call such content empty.
  const hasEmbeds = /<(img|iframe|video|hr|table)\b/i.test(String(html));

  return text === "" && !hasEmbeds;
}
