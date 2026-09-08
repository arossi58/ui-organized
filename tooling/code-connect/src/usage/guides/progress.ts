import type { UsageGuide } from "../types.js";

export const progressUsage: UsageGuide = {
  slug: "progress",
  codeName: "Progress",
  summary:
    "A bar that tracks work the interface has started: uploading, importing, saving. It moves because something is happening, and it is expected to end.",
  useWhen: [
    "An operation is running and the reader is waiting on its result.",
    "The wait is long enough that silence would read as a failure.",
    "Completion can be stated as a fraction, or as simply running with a `null` value.",
  ],
  avoid: [
    {
      text: "For a static measurement inside a range that isn't going anywhere.",
      instead: ["meter"],
    },
    {
      text: "As a placeholder while content loads into a layout.",
      instead: ["skeleton"],
    },
    {
      text: "For a value the reader is meant to set.",
      instead: ["range"],
    },
  ],
  guidance: [
    {
      do: "Label what is progressing, so the bar has a subject.",
      dont: "Show a bare bar and leave the reader guessing what will finish.",
      example: "labelled",
    },
    {
      do: "Pass `null` for work you genuinely cannot measure, and let the bar say only that it is running.",
      dont: "Invent a percentage, turning a wait into a promise the interface can't keep.",
      example: "indeterminate",
    },
    {
      do: "Keep the bar in place until the work resolves, then say how it ended.",
      dont: "Remove the bar on completion and leave nothing confirming the result.",
    },
  ],
  accessibility: [
    "The bar exposes its value and bounds, so the state is available without seeing the fill.",
    "A moving bar announces nothing by itself: report the important transitions in text as well.",
    "Never let the bar be the only sign of failure, since a stalled bar looks identical to a slow one.",
  ],
  content: [
    "Name the operation, not the widget: Uploading files, not Progress.",
    "Say what finished when it does, so completion is a statement rather than a disappearance.",
  ],
  related: [
    { slug: "meter", when: "the value is a measurement rather than work in flight." },
    { slug: "skeleton", when: "the wait is content arriving into a known layout." },
  ],
};
