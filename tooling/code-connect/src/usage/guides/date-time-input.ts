import type { UsageGuide } from "../types.js";

export const dateTimeInputUsage: UsageGuide = {
  slug: "date-time-input",
  codeName: "DateTimeInput",
  summary:
    "A field for a moment: a date and a time together. Ask for the time only when it changes what happens, because it doubles what the reader has to decide.",
  useWhen: [
    "The exact moment matters, such as when something is scheduled to run.",
    "Two entries on the same day need ordering by their times.",
    "The value is compared against a clock rather than a calendar.",
  ],
  avoid: [
    {
      text: "When the day alone is enough, where a time only adds a decision.",
      instead: ["date-input"],
    },
    {
      text: "For a span of days that needs no times.",
      instead: ["date-range-input"],
    },
    {
      text: "For a duration, which is a quantity rather than a moment.",
      instead: ["number-field"],
    },
  ],
  guidance: [
    {
      do: "Say which time zone the value is read in, beside the field.",
      dont: "Collect a time with no zone, so the same value means different moments to different readers.",
      example: "time-zone",
    },
    {
      do: "Default to a sensible moment, and set a `step` that matches how precisely it is stored.",
      dont: "Open on an empty field at second precision, when only quarter hours are honoured.",
      example: "precision",
    },
    {
      do: "Bound the field so a moment in the past can't be scheduled.",
      dont: "Accept an impossible moment and reject it after the reader has finished.",
    },
  ],
  accessibility: [
    "The native control gives keyboard entry, locale formatting and the platform picker without extra work.",
    "Both the date and the time are announced from one field, so the label has to cover both.",
    "State the time zone in text: an offset shown only in the formatted value is easy to miss.",
  ],
  content: [
    "Name the moment and its zone: Publish at (UTC), not just Date.",
    "Keep helper text to the constraint that would otherwise be discovered by failing.",
  ],
  related: [
    { slug: "date-input", when: "the day alone answers the question." },
    { slug: "date-range-input", when: "the value is a period rather than a moment." },
  ],
};
