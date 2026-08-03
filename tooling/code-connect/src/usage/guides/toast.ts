import type { UsageGuide } from "../types.js";

export const toastUsage: UsageGuide = {
  slug: "toast",
  codeName: "ToastProvider",
  summary:
    "A short notice that something happened, shown away from the flow and gone on its own. It reports, and it never asks: nothing important should live only inside one.",
  useWhen: [
    "An action succeeded and the result isn't visible on the surface itself.",
    "A background task finished while the reader was busy elsewhere.",
    "The news is worth seeing but not worth interrupting anything for.",
  ],
  avoid: [
    {
      text: "For anything the reader has to act on, since the message expires unread.",
      instead: ["alert"],
    },
    {
      text: "For a decision that must be made before continuing.",
      instead: ["alert-dialog"],
    },
    {
      text: "For a problem with something the reader is filling in.",
      instead: ["field-error"],
    },
    {
      text: "For confirming what the surface already shows, where the notice is just noise.",
    },
  ],
  guidance: [
    {
      do: "Keep a toast to one line that names what happened.",
      dont: "Write a paragraph that expires before anyone finishes reading it.",
    },
    {
      do: "Raise one toast per event, and let a repeat replace the last rather than pile on.",
      dont: "Queue a toast per item, so a bulk action buries the corner of the screen.",
    },
    {
      do: "Keep any recovery action somewhere permanent as well as in the toast.",
      dont: "Put the only Undo inside a message that disappears in seconds.",
    },
  ],
  accessibility: [
    "The toast region announces itself, so it must never be the only place a message exists.",
    "Anything that expires faster than it can be read is not a message: give real time to read.",
    "Mount `ToastProvider` once, so notices stack in one predictable place instead of several.",
  ],
  content: [
    "Name the outcome in the title and keep the description to one clause.",
    "Write in the past tense: Changes saved, not Saving changes.",
  ],
  related: [
    { slug: "alert", when: "the message should stay on the surface it concerns." },
    { slug: "progress", when: "the work is still running rather than finished." },
  ],
};
