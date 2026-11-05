import type { UsageGuide } from "../types.js";

export const pinInputUsage: UsageGuide = {
  slug: "pin-input",
  codeName: "PinInput",
  summary:
    "A row of single-character cells for a short code of known length, usually one the reader copies from somewhere else. The empty cells show how much is left to type before the code is complete.",
  useWhen: [
    "The value is a short code with a fixed, known number of characters.",
    "The code arrives somewhere else, such as a message or an authenticator app, and is copied across.",
    "Seeing the code cell by cell helps the reader check it against the source.",
  ],
  avoid: [
    {
      text: "For a password or passphrase, whose length varies and should not be revealed.",
      instead: ["password-input"],
    },
    {
      text: "For a number the reader chooses, where stepping and bounds matter more than digits.",
      instead: ["number-field"],
    },
    {
      text: "For a code longer than about eight characters, where the row stops fitting and stops scanning.",
      instead: ["input"],
    },
  ],
  guidance: [
    {
      do: "Set `length` to the exact length of the code that was sent.",
      dont: "Leave the default four cells for a six-character code, so the reader runs out of room.",
      example: "matching-length",
    },
    {
      do: "Label the row with where the code came from.",
      dont: "Leave the cells unlabelled, so the reader has to guess which code belongs here.",
      example: "labelled",
    },
    {
      do: "Turn on `otp` when the code is sent by text message, so the device can offer to fill it.",
      dont: "Make the reader switch away, memorise the code and type it back one character at a time.",
    },
    {
      do: "Report a wrong code once, under the row, and let the reader retype it straight away.",
      dont: "Clear the cells silently on a mismatch, so the reader cannot tell a typo from a slow network.",
    },
  ],
  accessibility: [
    "Each cell is its own input, so the `label` is what ties the row together for a screen reader.",
    "Pasting a whole code fills every cell at once; never block paste, since that is how most codes arrive.",
    "Say how many characters to expect in words, because the number of cells is only visible.",
  ],
  content: [
    "Name the source in the label: Code from your authenticator app, not Enter code.",
    "Use helper text to say how to get a new code rather than repeating the label.",
  ],
  related: [
    { slug: "password-input", when: "the secret has no fixed length." },
    { slug: "input", when: "the code is long or its length varies." },
  ],
};
