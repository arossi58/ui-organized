import type { UsageGuide } from "../types.js";

export const angleSliderUsage: UsageGuide = {
  slug: "angle-slider",
  codeName: "AngleSlider",
  summary:
    "A dial for choosing a direction or a rotation in degrees. The value wraps around at a full turn, so there is no start and no end, only a position on the circle.",
  useWhen: [
    "The value is an angle, such as a rotation, a bearing or the direction of a gradient.",
    "Turning past the last value should wrap back to the first rather than stop.",
    "Seeing the direction as a position on a circle helps more than reading a number.",
  ],
  avoid: [
    {
      text: "For a value on a scale with a real minimum and maximum.",
      instead: ["range"],
    },
    {
      text: "When the exact number matters more than the direction, and typing it is quicker.",
      instead: ["number-field"],
    },
    {
      text: "For a few fixed orientations, which read better as named choices.",
      instead: ["segmented-control", "radio-group"],
    },
  ],
  guidance: [
    {
      do: "Keep `showValue` on, so the exact angle is readable while the reader drags.",
      dont: "Hide the readout, leaving the reader to judge degrees from where the thumb happens to sit.",
      example: "show-value",
    },
    {
      do: "Add `markers` at the angles that mean something, such as the four quarter turns.",
      dont: "Leave a bare ring, where finding ninety degrees means estimating by eye.",
      example: "markers",
    },
    {
      do: "Set `step` to the precision the result needs.",
      dont: "Keep one-degree steps where only quarter turns are valid, so a keyboard user presses an arrow ninety times.",
    },
  ],
  accessibility: [
    "The thumb is announced as a slider and arrow keys move it by `step`, so the dial works without dragging.",
    "The label sits inside the dial and truncates, so keep it to one or two words.",
    "Say which way zero points in helper text whenever the surrounding context does not make it obvious.",
  ],
  content: [
    "Name the property being turned: Rotation, not Angle.",
    "Keep the label short enough to fit the hollow of the dial at the smallest size in use.",
  ],
  related: [
    { slug: "range", when: "the value has two ends rather than wrapping around." },
    { slug: "number-field", when: "the reader already knows the exact number to enter." },
  ],
};
