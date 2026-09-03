/**
 * The notation row under the picker: a format select on a row of its own, and
 * the fields that go with the notation it names underneath it.
 *
 * ── Why the select and the fields are the library's own components ──────────
 *
 * They are `Select` and `Input`, not a bare `<select>` and `<input>` styled to
 * resemble them. Two controls that live inside a popup are still controls, and
 * a picker whose fields drift from the rest of the form chrome — a different
 * focus ring, a different disabled treatment, a different height at `sm` — is a
 * picker that has to be re-fixed every time the field chrome moves. The cost is
 * that the notation select opens a second surface above the one the picker is
 * already showing; the dismissable-layer stack under all four libraries is
 * built for exactly that (a select inside a dialog closes itself and leaves the
 * dialog alone), so the picker stays open while the notation list is up.
 *
 * ── Why not Ark's ChannelInput ──────────────────────────────────────────────
 *
 * Ark writes a channel by converting the colour to the *machine's* format
 * first, so an HSL field only works while the machine is in `hsla` — which
 * would mean the notation select had to reformat the machine, and the machine's
 * format is what decides the value string, the hidden input's form value and
 * whether the picker area is saturation×brightness or saturation×lightness.
 * Flipping a display control must not move any of those, so the fields convert
 * on their own and leave the machine alone. Reads and writes both go through
 * `toFormat`, so every notation works from any machine format, and OKLCH —
 * which the machine cannot represent at all — is just one more entry in the
 * same table.
 *
 * That table is `COLOR_NOTATION_FIELDS` in `@ui-organized/core`, shared with
 * the Svelte, Vue and Angular pickers so all four offer the same notations with
 * the same channels in the same order.
 */
import { useState, type RefObject } from "react";
import { parseColor, type Color } from "@ark-ui/react";
import {
  COLOR_NOTATIONS,
  COLOR_NOTATION_FIELDS,
  formatChannel,
  formatOklchComponents,
  normalizeHex,
  parseOklch,
  readChannelInput,
  type ColorChannelField,
  type ColorField,
  type ColorNotation,
  type Rgba,
} from "@ui-organized/core";
import { Input } from "../Input/index.js";
import { Select } from "../Select/index.js";

/**
 * The parsed colour the machine holds. Named here rather than in the public
 * types so `ColorPickerProps` keeps its string-only surface — a caller never
 * handles one of these.
 */
export type ColorLike = Color;

/** Re-exported under the name the picker uses for it. */
export type InputFormat = ColorNotation;

export const INPUT_FORMATS = COLOR_NOTATIONS;

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

/* ─── Reading and writing one field ─────────────────────────────────────────
   The half of a field the shared table cannot describe, because it needs a
   colour object and the four libraries do not share one. `write` returning
   `null` rejects the edit, and the field falls back to the colour it was
   showing rather than guessing at what was meant. */

/** `space: null` is alpha — the one channel that survives a conversion. */
const inSpace = (color: ColorLike, field: ColorChannelField) =>
  field.space ? color.toFormat(field.space) : color;

function readField(field: ColorField, color: ColorLike): string {
  if (field.kind === "channel") {
    return formatChannel(inSpace(color, field).getChannelValue(field.channel), field);
  }
  return field.key === "hex" ? color.toString("hex") : formatOklchComponents(toRgba(color));
}

function writeField(field: ColorField, text: string, color: ColorLike): ColorLike | null {
  if (field.kind === "channel") {
    const value = readChannelInput(text, field);
    if (value === null) return null;
    return inSpace(color, field).withChannelValue(field.channel, value);
  }

  if (field.key === "hex") {
    const hex = normalizeHex(text);
    if (!hex) return null;
    /* Alpha deliberately survives a hex edit rather than being reset to opaque
       by a six-digit string. The field beside this one owns alpha; typing a
       colour is not a statement about transparency. */
    return parseColor(hex).withChannelValue("alpha", color.getChannelValue("alpha"));
  }

  const parsed = parseOklch(text);
  if (!parsed) return null;
  return parseColor(`rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})`);
}

interface ChannelFieldProps {
  field: ColorField;
  color: ColorLike;
  onCommit: (next: ColorLike) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

function ChannelField({ field, color, onCommit, disabled, readOnly }: ChannelFieldProps) {
  /* `null` means "show the colour". A string means the reader is mid-edit, and
     the colour must not overwrite what they are typing — which it otherwise
     would on every pointer move over the area behind the field. */
  const [draft, setDraft] = useState<string | null>(null);
  const numeric = field.kind === "channel";

  const commit = () => {
    if (draft === null) return;
    const next = writeField(field, draft, color);
    setDraft(null);
    if (next) onCommit(next);
  };

  return (
    <div className="color-picker__field">
      <Input
        size="sm"
        type={numeric ? "number" : "text"}
        inputMode={numeric ? "decimal" : "text"}
        aria-label={field.label}
        spellCheck={false}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        min={numeric ? field.min : undefined}
        max={numeric ? field.max : undefined}
        step={numeric ? field.step : undefined}
        value={draft ?? readField(field, color)}
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
          field would only repeat the select above it — but the line stays
          reserved in CSS, so switching notation cannot resize the popup out
          from under the pointer. */}
      {numeric && (
        <span className="color-picker__field-label" aria-hidden="true">
          {field.label}
        </span>
      )}
    </div>
  );
}

export interface FormatInputsProps {
  format: InputFormat;
  onFormatChange: (format: InputFormat) => void;
  color: ColorLike;
  onCommit: (next: ColorLike) => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** The picker's own portal target, so the notation list lands beside it. */
  container?: RefObject<HTMLElement | null>;
}

export function FormatInputs({
  format,
  onFormatChange,
  color,
  onCommit,
  disabled,
  readOnly,
  container,
}: FormatInputsProps) {
  return (
    <div className="color-picker__notation">
      <Select
        className="color-picker__format"
        size="sm"
        /* Rendered and hidden in CSS rather than left off: Ark names the
           trigger, the listbox and the hidden `<select>` after the Label part,
           so an absent label leaves three dangling references behind. */
        label="Colour notation"
        options={INPUT_FORMATS}
        value={format}
        onValueChange={(value) => onFormatChange(value as InputFormat)}
        disabled={disabled}
        portalContainer={container?.current ?? undefined}
      />

      <div className="color-picker__inputs" data-format={format}>
        {COLOR_NOTATION_FIELDS[format].map((field) => (
          <ChannelField
            key={field.key}
            field={field}
            color={color}
            onCommit={onCommit}
            disabled={disabled}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}
