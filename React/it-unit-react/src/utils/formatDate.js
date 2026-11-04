// Same look as AngularJS's  {{ date | date:'medium' }}  ->  "Oct 14, 2026 3:45:12 PM"
// Accepts a Firestore Timestamp. Returns "" if the value is missing or invalid.
export function formatDateMedium(timestamp) {
  const date =
    timestamp && typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : null;

  if (!date || Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type)?.value ?? "";

  return `${get("month")} ${get("day")}, ${get("year")} ${get("hour")}:${get("minute")}:${get("second")} ${get("dayPeriod")}`;
}
