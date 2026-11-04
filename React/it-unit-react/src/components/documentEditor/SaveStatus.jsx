import { Check } from "lucide-react";

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Shown at the right of the status bar:
//   Unsaved changes  ->  Saving draft... (spinner)  ->  Saved at 3:45 PM
export default function SaveStatus({ state }) {
  const { status, savedAt } = state;

  let text;

  if (status === "idle") text = "Saves automatically";
  else if (status === "pending") text = "Unsaved changes";
  else if (status === "saving") text = "Saving draft...";
  else if (status === "saved") text = savedAt ? `Saved at ${formatTime(savedAt)}` : "Saved";
  else text = "Couldn't save draft";

  return (
    <div
      className={`auto-save-status ${status}`}
      role="status"
      aria-live="polite"
    >
      {status === "saving" && (
        <span className="auto-save-spinner" aria-hidden="true"></span>
      )}

      {status === "saved" && <Check size={15} aria-hidden="true" />}

      <span>{text}</span>
    </div>
  );
}
