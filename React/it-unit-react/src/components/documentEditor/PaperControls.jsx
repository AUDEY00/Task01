import { useState } from "react";
import {
  CUSTOM_MAX_MM,
  CUSTOM_MIN_MM,
  MARGIN_PRESETS,
  PAPER_SIZES,
} from "../../utils/paper";

// Paper size, orientation and margins for the preview.
//   settings - the current paper settings (see utils/paper.js)
//   onChange({ ...changes }) - called with the part that changed
export default function PaperControls({ settings, onChange }) {
  // The custom size boxes keep what the user is typing as text, and only
  // send a value up when it is a valid number (so typing never "snaps back").
  const [widthText, setWidthText] = useState(String(settings.customWidth));
  const [heightText, setHeightText] = useState(String(settings.customHeight));

  function handleCustomChange(field, text, setText) {
    setText(text);

    const number = Number(text);

    if (text.trim() !== "" && Number.isFinite(number) && number > 0) {
      onChange({ [field]: number });
    }
  }

  const minForUnit = settings.customUnit === "in" ? +(CUSTOM_MIN_MM / 25.4).toFixed(1) : CUSTOM_MIN_MM;
  const maxForUnit = settings.customUnit === "in" ? +(CUSTOM_MAX_MM / 25.4).toFixed(1) : CUSTOM_MAX_MM;

  return (
    <div className="paper-controls">
      {/* Paper size */}
      <label className="paper-field">
        <span>Paper</span>

        <select
          value={settings.size}
          onChange={(e) => onChange({ size: e.target.value })}
        >
          {Object.entries(PAPER_SIZES).map(([key, paper]) => (
            <option key={key} value={key}>
              {paper.label}
            </option>
          ))}

          <option value="custom">Custom...</option>
        </select>
      </label>

      {/* Custom size */}
      {settings.size === "custom" && (
        <div className="paper-field custom-size">
          <input
            type="number"
            aria-label="Paper width"
            title={`Between ${minForUnit} and ${maxForUnit} ${settings.customUnit}`}
            min={minForUnit}
            max={maxForUnit}
            step="any"
            value={widthText}
            onChange={(e) =>
              handleCustomChange("customWidth", e.target.value, setWidthText)
            }
            onBlur={() => setWidthText(String(settings.customWidth))}
          />

          <span aria-hidden="true">×</span>

          <input
            type="number"
            aria-label="Paper height"
            title={`Between ${minForUnit} and ${maxForUnit} ${settings.customUnit}`}
            min={minForUnit}
            max={maxForUnit}
            step="any"
            value={heightText}
            onChange={(e) =>
              handleCustomChange("customHeight", e.target.value, setHeightText)
            }
            onBlur={() => setHeightText(String(settings.customHeight))}
          />

          <select
            aria-label="Unit"
            value={settings.customUnit}
            onChange={(e) => onChange({ customUnit: e.target.value })}
          >
            <option value="mm">mm</option>
            <option value="in">in</option>
          </select>
        </div>
      )}

      {/* Orientation */}
      <div className="paper-segmented" role="group" aria-label="Orientation">
        <button
          type="button"
          className={settings.orientation === "portrait" ? "selected" : ""}
          aria-pressed={settings.orientation === "portrait"}
          onClick={() => onChange({ orientation: "portrait" })}
        >
          Portrait
        </button>

        <button
          type="button"
          className={settings.orientation === "landscape" ? "selected" : ""}
          aria-pressed={settings.orientation === "landscape"}
          onClick={() => onChange({ orientation: "landscape" })}
        >
          Landscape
        </button>
      </div>

      {/* Margins */}
      <label className="paper-field">
        <span>Margins</span>

        <select
          value={settings.margin}
          onChange={(e) => onChange({ margin: e.target.value })}
        >
          {Object.entries(MARGIN_PRESETS).map(([key, preset]) => (
            <option key={key} value={key}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
