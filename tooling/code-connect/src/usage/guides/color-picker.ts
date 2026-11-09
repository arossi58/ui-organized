import type { UsageGuide } from "../types.js";

export const colorPickerUsage: UsageGuide = {
  slug: "color-picker",
  codeName: "ColorPicker",
  summary:
    "A field for choosing any color, opened from a swatch that shows the current value. It suits open-ended color choice, where the reader may drag, sample the screen or type an exact value.",
  useWhen: [
    "The reader needs any color, not one from a short approved list.",
    "Seeing the color matters as much as knowing its value.",
    "The reader may need an exact value, such as when matching an existing color.",
  ],
  avoid: [
    {
      text: "When only a few approved colors are allowed, which read better laid out as choices.",
      instead: ["radio-group"],
    },
    {
      text: "For choosing a meaning, such as a status, where the color should follow the choice rather than be it.",
      instead: ["select"],
    },
    {
      text: "For showing a color that nobody edits here, where a live control only invites accidental changes.",
    },
  ],
  guidance: [
    {
      do: "Keep the value text in forms, so the color can be read and compared without opening the picker.",
      dont: "Use `swatch-only` in a form, where two similar colors become impossible to tell apart.",
      example: "value-text",
    },
    {
      do: "Give every picker a `label`, and most of all a swatch-only one.",
      dont: "Leave a bare swatch among other settings, so nobody can tell which color it sets.",
      example: "labelled",
    },
    {
      do: "Offer `swatches` for the colors the product already uses.",
      dont: "Make every reader find a shared color again by dragging, so near-duplicates pile up.",
    },
    {
      do: "Set `format` to the notation the value is used in next, such as hex for a stylesheet.",
      dont: "Emit one notation and convert it by hand somewhere else, where rounding makes values drift.",
    },
  ],
  accessibility: [
    "The area and sliders work from the keyboard, but typing a value is the most precise path, so keep `showFormatInputs` on.",
    "A color says nothing to someone who cannot see it, so let the value text or a name travel with the swatch.",
    "A swatch-only trigger has no visible text, so give the field a `label` whenever the value text is off.",
  ],
  content: [
    "Label the role the color plays: Accent color, not Color.",
    "Keep swatch order stable, so a remembered position still finds the same color.",
  ],
  related: [
    { slug: "select", when: "the choice is a named option that happens to carry a color." },
    { slug: "input", when: "the reader only ever types a value they already know." },
  ],
};
