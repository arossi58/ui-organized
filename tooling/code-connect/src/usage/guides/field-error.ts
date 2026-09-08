import type { UsageGuide } from "../types.js";

export const fieldErrorUsage: UsageGuide = {
  slug: "field-error",
  codeName: "FieldError",
  summary:
    "The validation message that belongs to one control. It sits directly beneath the thing that is wrong, and renders nothing at all when there is no message.",
  useWhen: [
    "A control is invalid and the reader needs to know why, right there.",
    "The control is a custom one, so the built-in fields' own `error` prop isn't available.",
    "The message should appear and disappear with the state, without shifting the layout around it.",
  ],
  avoid: [
    {
      text: "Under a field that already takes an `error` message of its own, which would say it twice.",
      instead: ["input", "select"],
    },
    {
      text: "For a problem covering the whole form or page.",
      instead: ["alert"],
    },
    {
      text: "For a hint that is true before anything goes wrong, which belongs in helper text.",
    },
    {
      text: "For a passing failure with nothing to correct.",
      instead: ["toast"],
    },
  ],
  guidance: [
    {
      do: "Say what is wrong and what would be right, in one sentence.",
      dont: "Print the rule that failed, which names the check rather than the fix.",
      example: "specific",
    },
    {
      do: "Show the message next to the control it belongs to, as soon as the problem is known.",
      dont: "Collect every message at the top of the form, away from the fields that caused them.",
      example: "in-place",
    },
    {
      do: "Clear the message the moment the value becomes valid.",
      dont: "Leave a stale error under a field the reader has already fixed.",
    },
  ],
  accessibility: [
    "Tie the message to its control so assistive technology reads the two together, and mark the control invalid.",
    "Colour carries none of the meaning: the words have to say that something is wrong.",
    "Move focus to the first invalid control on submit, rather than expecting the reader to hunt for it.",
  ],
  content: [
    "Address the value, not the person: Enter a date in the future, not You entered an invalid date.",
    "Keep it to one line, and put anything longer beside the field as helper text.",
  ],
  related: [
    { slug: "input", when: "the control already has an `error` prop of its own." },
    { slug: "alert", when: "the problem is bigger than one field." },
  ],
};
