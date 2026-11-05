import type { UsageGuide } from "../types.js";

export const timerUsage: UsageGuide = {
  slug: "timer",
  codeName: "Timer",
  summary:
    "A live count of elapsed or remaining time, split into units that tick in place. It is for time the reader is actively watching, like a deadline approaching or a session running.",
  useWhen: [
    "Time passing is the point, and the reader acts on how much is left or has gone.",
    "The reader needs to start, pause or reset a count themselves.",
    "A countdown to a fixed moment changes what the reader should do next.",
  ],
  avoid: [
    {
      text: "For progress through a task with a known amount of work rather than a known amount of time.",
      instead: ["progress"],
    },
    {
      text: "For a timestamp or a date, which is a value to read rather than a count to watch.",
    },
    {
      text: "To manufacture urgency with a countdown that resets or has no real consequence.",
    },
  ],
  guidance: [
    {
      do: "Show only the units the span needs, so every digit on screen can change.",
      dont: "Show days and hours on a five-minute count, leaving a row of zeros that never move.",
      example: "fitting-units",
    },
    {
      do: "Turn on `showLabels` once the count shows three or more units.",
      dont: "Leave a long run of unlabelled numbers for the reader to decode as days, hours or minutes.",
      example: "unit-labels",
    },
    {
      do: "Offer controls only when the reader owns the timing.",
      dont: "Add pause and reset to a deadline the reader cannot move.",
    },
    {
      do: "Say what happens at zero in the text around the timer.",
      dont: "Let a countdown reach zero with nothing on screen explaining what that means.",
    },
  ],
  accessibility: [
    "The units are announced individually and the colons are hidden, so the spoken count stays clean.",
    "A ticking value is not announced on every change, so state the deadline in text as well.",
    "Warn before a timed limit expires and offer a way to extend it where the task allows.",
  ],
  content: [
    "Describe the count in the surrounding copy: Code expires in, not Timer.",
    "Keep unit labels as plain unit names, which the component already provides.",
  ],
  related: [
    { slug: "progress", when: "the reader is waiting on work that has a measurable amount left." },
  ],
};
