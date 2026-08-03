import type { UsageGuide } from "../types.js";

export const alertUsage: UsageGuide = {
  slug: "alert",
  codeName: "Alert",
  summary:
    "An inline message about the surface it sits on: what just happened, what needs attention, what to do next. It holds its place and stays until the situation changes.",
  useWhen: [
    "The message belongs to a specific part of the page and should sit beside it.",
    "The reader needs it to stay put while they act on it.",
    "The situation is worth taking layout space for, rather than passing by.",
  ],
  avoid: [
    {
      text: "For a passing confirmation that needs nothing from the reader.",
      instead: ["toast"],
    },
    {
      text: "For a validation message belonging to one field.",
      instead: ["field-error"],
    },
    {
      text: "For a one-word state inside a row or a card.",
      instead: ["tag"],
    },
    {
      text: "For something that has to be acknowledged before anything else can happen.",
      instead: ["alert-dialog"],
    },
  ],
  guidance: [
    {
      do: "Say what happened and what to do next, in that order.",
      dont: "State the failure alone and leave the reader to work out their move.",
      example: "actionable",
    },
    {
      do: "Keep one alert per situation, placed next to what it concerns.",
      dont: "Stack alerts at the top of a page until none of them gets read.",
      example: "one-at-a-time",
    },
    {
      do: "Match `variant` to real severity, and let the title say the same thing.",
      dont: "Reach for the error tone routinely, until the strongest signal means nothing.",
      example: "severity",
    },
    {
      do: "Offer `onDismiss` only where the reader can safely lose the message.",
      dont: "Make a blocking problem dismissible, so the page can look fine while it stands.",
    },
  ],
  accessibility: [
    "Tone is carried by colour and an icon, so the words have to carry it for anyone who sees neither.",
    "An alert added after load needs announcing: put it in a live region, or move focus to it.",
    "Dismissing removes the message completely, so never leave the only copy of an instruction inside one.",
  ],
  content: [
    "Open with the outcome, not the system: Upload failed, not An error was encountered.",
    "Keep the body to a sentence or two, and put anything longer behind a link.",
  ],
  related: [
    { slug: "toast", when: "the message is transient and needs no action." },
    { slug: "alert-dialog", when: "the reader has to answer before continuing." },
    { slug: "field-error", when: "the problem belongs to one input." },
  ],
};
