import type { UsageGuide } from "../types.js";

export const calendarUsage: UsageGuide = {
  slug: "calendar",
  codeName: "Calendar",
  summary:
    "A month grid that stays open on the page, for one day or a range. Use it where the calendar is the content, such as a booking panel or a filter sidebar; a date field already brings one in a popover.",
  useWhen: [
    "Picking a date is the main task of the surface, and the grid should stay visible.",
    "The reader benefits from seeing the weeks around a date, such as for bookings or availability.",
    "A panel needs presets and a footer of actions around the grid, with `variant` card.",
  ],
  avoid: [
    {
      text: "For a date that is one field among many in a form, where a popover keeps the form short.",
      instead: ["date-input", "date-range-input"],
    },
    {
      text: "For a date far from today, such as a birth date, which is faster to type.",
      instead: ["date-input"],
    },
  ],
  guidance: [
    {
      do: "Offer the spans most readers want as `presets`, and keep them to a short list.",
      dont: "List a dozen shortcuts, until scanning them is slower than picking two days.",
      example: "presets",
    },
    {
      do: "Bound the grid with `min` and `max` when only some dates can be chosen.",
      dont: "Let any date be picked and reject it afterwards.",
      example: "bounded",
    },
  ],
  accessibility: [
    "The grid is one tab stop, and the arrow keys move between days, with Page Up and Page Down for months.",
    "Each preset is a toggle button, pressed while the selection is exactly the range it stands for.",
    "Days outside `min` and `max` stay in the grid but are disabled, so the shape of the month is kept.",
  ],
  content: [
    "Label presets by the span they cover, such as Last 7 days, not by when they were useful.",
  ],
  related: [
    { slug: "date-range-input", when: "the range is one field among others in a form." },
    { slug: "date-input", when: "the reader knows the date and can type it." },
  ],
};
