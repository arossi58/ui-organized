import type { UsageGuide } from "../types.js";

export const passwordInputUsage: UsageGuide = {
  slug: "password-input",
  codeName: "PasswordInput",
  summary:
    "A masked field with a control to reveal what was typed. Masking protects the value from the room, and revealing it is how people fix a typo they can't see.",
  useWhen: [
    "The value is a secret that shouldn't sit in plain view on screen.",
    "Typing it wrong is likely, and the reader needs a way to check.",
    "The field is part of signing in, signing up, or changing a credential.",
  ],
  avoid: [
    {
      text: "For any value that isn't secret, where masking only makes typing harder.",
      instead: ["input"],
    },
    {
      text: "For a code the reader copies from somewhere else, where hiding it helps nobody.",
      instead: ["input"],
    },
    {
      text: "As a second confirmation field, which mostly produces two identical typos.",
    },
  ],
  guidance: [
    {
      do: "State the requirements up front in `helperText`, before anything is typed.",
      dont: "Reject the value on submit and only then explain what would have been accepted.",
      example: "rules-first",
    },
    {
      do: "Keep the reveal control available, so a mistyped secret can be checked.",
      dont: "Turn the toggle off and leave correcting a typo to guesswork.",
      example: "reveal",
    },
    {
      do: "Let the field be pasted into and filled by a password manager.",
      dont: "Block paste in the name of security, which pushes people to shorter secrets.",
    },
  ],
  accessibility: [
    "The reveal control is a real button with its own label, so it is reachable without a pointer.",
    "Requirements belong in helper text tied to the field, not in a tooltip that focus never reaches.",
    "Announce failures on the field itself: a lone banner leaves a screen reader user hunting for the cause.",
  ],
  content: [
    "Write requirements as a rule, not a scold: At least 12 characters.",
    "Say what is wrong specifically, since Invalid password tells the reader nothing they can act on.",
  ],
  related: [
    { slug: "input", when: "the value isn't secret." },
    { slug: "field-error", when: "a validation message needs a home under a custom control." },
  ],
};
