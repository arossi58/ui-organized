/**
 * The notation row under the picker: a format select and the fields that go
 * with the notation it names.
 *
 * These are the library's own inputs rather than Ark's `ChannelInput`, for one
 * reason. Ark writes a channel by converting the colour to the *machine's*
 * format first, so an HSL field only works while the machine is in `hsla` —
 * which would mean the notation select had to reformat the machine, and the
 * machine's format is what decides the value string, the hidden input's form
 * value and whether the picker area is saturation×brightness or
 * saturation×lightness. Flipping a display control must not move any of those,
 * so the fields convert on their own and leave the machine alone. Reads and
 * writes both go through `toFormat`, so every notation works from any machine
 * format, and OKLCH — which the machine cannot represent at all — is just one
 * more entry in the same table.
 */
import { useState } from "react";
import { parseColor, type Color } from "@ark-ui/react";
import { Icon } from "../Icon/index.js";
import { formatOklchComponents, parseOklch, type Rgba } from "./oklch.js";

/**
 * The parsed colour the machine holds. Named here rather than in the public
 * types so `ColorPickerProps` keeps its string-only surface — a caller never
 * handles one of these.
 */
export type ColorLike = Color;

/** Which notation the row is showing. Not the same set as the `format` prop,
 *  which names an *output* notation and includes `hsba`. */
export type InputFormat = "hex" | "rgb" | "hsl" | "oklch";

/** The notations the select offers, in the order it offers them. */
export const INPUT_FORMATS: { value: InputFormat; label: string }[] = [
  { value: "hex", label: "HEX" },
  { value: "rgb", label: "RGB" },
  { value: "hsl", label: "HSL" },
  { value: "oklch", label: "OKLCH" },
];

const round = (n: number, places = 0) => Number(n.toFixed(places));

export function toRgba(color: ColorLike): Rgba {
  const rgb = color.toFormat("rgba");
  return {
    r: round(rgb.getChannelValue("red")),
    g: round(rgb.getChannelValue("green")),
    b: round(rgb.getChannelValue("blue")),
    a: rgb.getChannelValue("alpha"),
  };
}

/**
 * One field's contract: how to read the current colour into text, and how to
 * read text back into a colour. `write` returning `null` rejects the edit, and
 * the field falls back to the colour it was showing.
 */
interface FieldSpec {
  key: string;
  /** Accessible name; also the abbreviation under the field. */
  label: string;
  read: (color: ColorLike) => string;
  write: (text: string, color: ColorLike) => ColorLike | null;
  /** Absent for the free-text fields (hex, oklch), which fill the row instead. */
  numeric?: { min: number; max: number; step: number };
}

/** A numeric channel read and written in `space`, whatever the machine holds. */
function channel(
  key: string,
  label: string,
  space: "rgba" | "hsla",
  name: "red" | "green" | "blue" | "hue" | "saturation" | "lightness",
  max: number,
): FieldSpec {
  return {
    key,
    label,
    numeric: { min: 0, max, step: 1 },
    read: (color) => String(round(color.toFormat(space).getChannelValue(name))),
    write: (text, color) => {
      const n = Number(text);
      if (text.trim() === "" || Number.isNaN(n)) return null;
      const clamped = Math.min(max, Math.max(0, n));
      return color.toFormat(space).withChannelValue(name, clamped);
    },
  };
}

/* Alpha is the one channel every notation shares, and the only one that needs
   no conversion — it survives `toFormat` untouched. */
const ALPHA: FieldSpec = {
  key: "alpha",
  label: "A",
  numeric: { min: 0, max: 1, step: 0.01 },
  read: (color) => String(round(color.getChannelValue("alpha"), 2)),
  write: (text, color) => {
    const n = Number(text);
    if (text.trim() === "" || Number.isNaN(n)) return null;
    return color.withChannelValue("alpha", Math.min(1, Math.max(0, n)));
  },
};

const HEX: FieldSpec = {
  key: "hex",
  label: "HEX",
  read: (color) => color.toString("hex"),
  /* Alpha deliberately survives a hex edit rather than being reset to opaque by
     a six-digit string. The field beside this one owns alpha; typing a colour
     is not a statement about transparency. */
  write: (text, color) => {
    const trimmed = text.trim();
    const hex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null;
    return parseColor(hex).withChannelValue("alpha", color.getChannelValue("alpha"));
  },
};

/* The only notation that carries its own alpha — `L C H / A` reads and writes
   it — so it is the only one without a field beside it, and it takes the whole
   row it would otherwise have shared. At this width it needs it. */
const OKLCH: FieldSpec = {
  key: "oklch",
  label: "OKLCH",
  read: (color) => formatOklchComponents(toRgba(color)),
  write: (text) => {
    const parsed = parseOklch(text);
    if (!parsed) return null;
    return parseColor(`rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})`);
  },
};

const FIELDS: Record<InputFormat, FieldSpec[]> = {
  hex: [HEX, ALPHA],
  rgb: [
    channel("r", "R", "rgba", "red", 255),
    channel("g", "G", "rgba", "green", 255),
    channel("b", "B", "rgba", "blue", 255),
    ALPHA,
  ],
  hsl: [
    channel("h", "H", "hsla", "hue", 360),
    channel("s", "S", "hsla", "saturation", 100),
    channel("l", "L", "hsla", "lightness", 100),
    ALPHA,
  ],
  oklch: [OKLCH],
};

interface ChannelFieldProps {
  spec: FieldSpec;
  color: ColorLike;
  onCommit: (next: ColorLike) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

function ChannelField({ spec, color, onCommit, disabled, readOnly }: ChannelFieldProps) {
  /* `null` means "show the colour". A string means the reader is mid-edit, and
     the colour must not overwrite what they are typing — which it otherwise
     would on every pointer move over the area behind the field. */
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const next = spec.write(draft, color);
    setDraft(null);
    if (next) onCommit(next);
  };

  return (
    <label className="color-picker__field">
      <input
        className="color-picker__channel-input"
        type={spec.numeric ? "number" : "text"}
        inputMode={spec.numeric ? "decimal" : "text"}
        aria-label={spec.label}
        spellCheck={false}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        min={spec.numeric?.min}
        max={spec.numeric?.max}
        step={spec.numeric?.step}
        value={draft ?? spec.read(color)}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          } else if (event.key === "Escape") {
            // Abandon the edit without closing the picker under it.
            event.stopPropagation();
            setDraft(null);
          }
        }}
      />
      {/* Only the numeric channels are abbreviated. A `HEX` caption under a hex
          field would only repeat the select sitting next to it — but the line
          stays reserved in CSS, so switching notation cannot resize the popup
          out from under the pointer. */}
      {spec.numeric && (
        <span className="color-picker__field-label" aria-hidden="true">
          {spec.label}
        </span>
      )}
    </label>
  );
}

export interface FormatInputsProps {
  format: InputFormat;
  onFormatChange: (format: InputFormat) => void;
  color: ColorLike;
  onCommit: (next: ColorLike) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function FormatInputs({
  format,
  onFormatChange,
  color,
  onCommit,
  disabled,
  readOnly,
}: FormatInputsProps) {
  return (
    <div className="color-picker__inputs" data-format={format}>
      <span className="color-picker__format">
        <select
          className="color-picker__format-select"
          aria-label="Colour notation"
          value={format}
          disabled={disabled}
          onChange={(event) => onFormatChange(event.target.value as InputFormat)}
        >
          {INPUT_FORMATS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={12} className="color-picker__format-caret" />
      </span>

      {FIELDS[format].map((spec) => (
        <ChannelField
          key={spec.key}
          spec={spec}
          color={color}
          onCommit={onCommit}
          disabled={disabled}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
