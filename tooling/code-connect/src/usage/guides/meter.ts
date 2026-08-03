import type { UsageGuide } from "../types.js";

export const meterUsage: UsageGuide = {
  slug: "meter",
  codeName: "Meter",
  summary:
    "A reading of a value inside a known range: how full, how much, how far along a fixed scale. It measures something that is true right now, rather than tracking something in flight.",
  useWhen: [
    "The value sits between a `min` and `max` the reader would recognise as real.",
    "The number means something on its own and would read the same way in a table.",
    "Seeing the magnitude and the number together is faster than reading either alone.",
  ],
  avoid: [
    {
      text: "For the state of an operation the interface has started, such as anything loading, uploading or saving.",
      instead: ["progress"],
    },
    {
      text: "When the maximum is invented. A bar against an arbitrary ceiling reads as a judgement the data doesn't support.",
    },
    {
      text: "As a control. A meter is read, never set.",
      instead: ["range"],
    },
    {
      text: "As a placeholder while the real value is still loading.",
      instead: ["skeleton"],
    },
  ],
  guidance: [
    {
      do: "Label the meter and show the value, so the bar is a second reading of a stated number.",
      dont: "Show a bare fill and leave the scale to be guessed from its width.",
      example: "labelled",
    },
    {
      do: "Hold `max` fixed for a given meter, so two readings can be compared.",
      dont: "Rescale the range to whatever the current value happens to be, which flattens every difference.",
      example: "fixed-range",
    },
    {
      do: "Use `variant` to reinforce a threshold the label already states.",
      dont: "Let the fill colour be the only thing saying a value is in trouble.",
      example: "threshold",
    },
  ],
  accessibility: [
    "Exposes the value, its bounds and a formatted `aria-valuetext`, so the reading is available without seeing the fill.",
    "It needs an accessible name: pass `label`, or an `aria-label` when the caption lives elsewhere.",
    "It isn't a live region. A value that changes while the page is open needs announcing somewhere it will be heard.",
  ],
  content: [
    "Label the thing being measured, not the widget: Storage used, not Usage meter.",
    "Give the value a unit through `format` so the number is legible on its own.",
  ],
  related: [
    { slug: "progress", when: "the bar represents work the interface is doing." },
    { slug: "range", when: "the value is one the reader sets." },
  ],
};
