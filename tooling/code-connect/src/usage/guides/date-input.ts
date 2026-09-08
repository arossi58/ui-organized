import type { UsageGuide } from "../types.js";

export const dateInputUsage: UsageGuide = {
  slug: "date-input",
  codeName: "DateInput",
  summary:
    "A field for a single calendar date. It accepts typing for a date the reader already knows, and opens a calendar for one they need to work out.",
  useWhen: [
    "The value is one date, with no time attached.",
    "The reader may want either to type it or to find it on a calendar.",
    "Bounds like a first or last allowed day can be stated up front.",
  ],
  avoid: [
    {
      text: "For a period with a start and an end.",
      instead: ["date-range-input"],
    },
    {
      text: "When the time of day is part of the value.",
      instead: ["date-time-input"],
    },
    {
      text: "For a date the system already knows, which should be shown as text rather than typed again.",
    },
    {
      text: "As three separate fields for day, month and year.",
    },
  ],
  guidance: [
    {
      do: "Set `min` and `max` so impossible dates can't be entered in the first place.",
      dont: "Accept any date and reject it after submit, once the reader has moved on.",
      example: "bounds",
    },
    {
      do: "Say which date is wanted, and any constraint, before the field is used.",
      dont: "Label it Date and leave the reader to discover that weekends are refused.",
      example: "expectations",
    },
    {
      do: "Keep typing available alongside the calendar, since a known date is faster to type.",
      dont: "Force every reader through a month-by-month calendar to reach a date years away.",
    },
  ],
  accessibility: [
    "The field is a native date control, so keyboard entry, locale formatting and the OS picker all come for free.",
    "The calendar button has its own label, and the field keeps its own: neither substitutes for the other.",
    "State the expected format in words where it matters, since the displayed format follows the reader's locale.",
  ],
  content: [
    "Name the date's role: Start date, Due date, Date of birth, rather than a bare Date.",
    "Put the allowed range in helper text when it isn't obvious from the context.",
  ],
  related: [
    { slug: "date-range-input", when: "the value is a period rather than a day." },
    { slug: "date-time-input", when: "the time of day matters too." },
  ],
};
