// Paper sizes, margins and the maths for the paper preview.
// (No React: pure functions, so they can be tested on their own.)

const MM_PER_INCH = 25.4;
const CSS_PX_PER_INCH = 96;

// Standard sizes (stored in millimetres; "unit" is how people usually quote them).
export const PAPER_SIZES = {
  a3: { label: "A3", widthMm: 297, heightMm: 420, unit: "mm" },
  a4: { label: "A4", widthMm: 210, heightMm: 297, unit: "mm" },
  a5: { label: "A5", widthMm: 148, heightMm: 210, unit: "mm" },
  letter: { label: "Letter", widthMm: 215.9, heightMm: 279.4, unit: "in" },
  legal: { label: "Legal", widthMm: 215.9, heightMm: 355.6, unit: "in" },
  folio: { label: "Folio", widthMm: 215.9, heightMm: 330.2, unit: "in" },
  tabloid: { label: "Tabloid", widthMm: 279.4, heightMm: 431.8, unit: "in" },
  executive: { label: "Executive", widthMm: 184.15, heightMm: 266.7, unit: "in" },
};

export const MARGIN_PRESETS = {
  narrow: { label: "Narrow", mm: 12.7 },
  normal: { label: "Normal", mm: 25.4 },
  wide: { label: "Wide", mm: 38.1 },
};

export const DEFAULT_PAPER_SETTINGS = {
  size: "a4", // a key of PAPER_SIZES, or "custom"
  orientation: "portrait", // "portrait" | "landscape"
  margin: "normal", // a key of MARGIN_PRESETS
  customWidth: 210,
  customHeight: 297,
  customUnit: "mm", // "mm" | "in"
};

// A custom page must be between these sizes (in millimetres).
export const CUSTOM_MIN_MM = 30;
export const CUSTOM_MAX_MM = 1500;

export function mmToPx(mm) {
  return (mm * CSS_PX_PER_INCH) / MM_PER_INCH;
}

function toMm(value, unit) {
  return unit === "in" ? value * MM_PER_INCH : value;
}

// Round to at most 2 decimals and drop trailing zeros: 8.50 -> "8.5"
function formatNumber(number) {
  return String(Math.round(number * 100) / 100);
}

// Makes sure settings read from storage (or typed by the user) are usable.
export function normalizeSettings(raw) {
  const settings = { ...DEFAULT_PAPER_SETTINGS };

  if (!raw || typeof raw !== "object") return settings;

  if (raw.size === "custom" || PAPER_SIZES[raw.size]) settings.size = raw.size;
  if (raw.orientation === "landscape") settings.orientation = "landscape";
  if (MARGIN_PRESETS[raw.margin]) settings.margin = raw.margin;
  if (raw.customUnit === "in") settings.customUnit = "in";

  const width = Number(raw.customWidth);
  const height = Number(raw.customHeight);

  if (Number.isFinite(width) && width > 0) settings.customWidth = width;
  if (Number.isFinite(height) && height > 0) settings.customHeight = height;

  return settings;
}

// Page size in millimetres, after orientation. A custom size outside the
// allowed range is pulled back into it.
export function getPaperDimensionsMm(rawSettings) {
  const settings = normalizeSettings(rawSettings);

  let widthMm;
  let heightMm;

  if (settings.size === "custom") {
    const clamp = (mm) => Math.min(CUSTOM_MAX_MM, Math.max(CUSTOM_MIN_MM, mm));

    widthMm = clamp(toMm(settings.customWidth, settings.customUnit));
    heightMm = clamp(toMm(settings.customHeight, settings.customUnit));
  } else {
    ({ widthMm, heightMm } = PAPER_SIZES[settings.size]);
  }

  if (settings.orientation === "landscape") {
    [widthMm, heightMm] = [heightMm, widthMm];
  }

  return { widthMm, heightMm };
}

// Everything the preview needs, in CSS pixels.
export function getPageMetrics(rawSettings) {
  const settings = normalizeSettings(rawSettings);
  const { widthMm, heightMm } = getPaperDimensionsMm(settings);

  const widthPx = Math.round(mmToPx(widthMm));
  const heightPx = Math.round(mmToPx(heightMm));

  // Never let the margins eat the page (a tiny custom page with Wide margins).
  const wanted = Math.round(mmToPx(MARGIN_PRESETS[settings.margin].mm));
  const largest = Math.max(0, Math.floor((Math.min(widthPx, heightPx) - 120) / 2));
  const marginPx = Math.min(wanted, largest);

  return {
    widthPx,
    heightPx,
    marginPx,
    contentWidthPx: widthPx - 2 * marginPx,
    contentHeightPx: heightPx - 2 * marginPx,
  };
}

// "A4 · 210 × 297 mm" / "Letter · 8.5 × 11 in" / "Custom · 100 × 150 mm"
export function describePaper(rawSettings) {
  const settings = normalizeSettings(rawSettings);
  const { widthMm, heightMm } = getPaperDimensionsMm(settings);

  const isCustom = settings.size === "custom";
  const unit = isCustom ? settings.customUnit : PAPER_SIZES[settings.size].unit;
  const label = isCustom ? "Custom" : PAPER_SIZES[settings.size].label;

  const convert = (mm) => (unit === "in" ? mm / MM_PER_INCH : mm);

  return `${label} · ${formatNumber(convert(widthMm))} × ${formatNumber(convert(heightMm))} ${unit}`;
}

// How much to shrink the sheet so it fits a narrow screen (never enlarges).
export function computeScale(availableWidth, sheetWidth) {
  if (!(availableWidth > 0) || !(sheetWidth > 0)) return 1;

  return Math.min(1, availableWidth / sheetWidth);
}

// The text is laid out in columns, one column per page. The scroll width of
// the column container is  pages * columnWidth + (pages - 1) * gap.
export function computePageCount(scrollWidth, columnWidth, gap) {
  if (!(scrollWidth > 0) || !(columnWidth > 0)) return 1;

  const pages = (scrollWidth + gap) / (columnWidth + gap);

  return Math.max(1, Math.ceil(pages - 0.001));
}
