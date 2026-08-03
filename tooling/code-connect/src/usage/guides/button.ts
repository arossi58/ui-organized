import type { UsageGuide } from "../types.js";

export const buttonUsage: UsageGuide = {
  slug: "button",
  codeName: "Button",
  summary:
    "The way to trigger an action on the surface someone is already looking at: save, apply, run, open, delete. A button *does* something, while a control that takes someone somewhere else is a link.",
  useWhen: [
    "Something happens in place: saving, applying, running, opening an overlay.",
    "One action on the surface is the expected next step and should look like it.",
    "An action is destructive and needs separating from the safe ones beside it.",
    "The control has to take keyboard focus and announce itself as an action.",
  ],
  avoid: [
    {
      text: "For navigation. A control that changes the URL should be an anchor, so pass one to `render` to keep the button's appearance and the link's behaviour.",
    },
    {
      text: "For a setting that takes effect the moment it changes rather than on activation.",
      instead: ["switch", "toggle"],
    },
    {
      text: "For more than about four peer actions in a row, where emphasis stops ranking anything.",
      instead: ["menu", "toolbar"],
    },
    {
      text: "To present a status, a count or a category that isn't clickable.",
      instead: ["tag"],
    },
  ],
  guidance: [
    {
      do: "Give a surface one primary action, so the expected next step is unambiguous.",
      dont: "Rank two actions as primary and leave the reader to work out which one you meant.",
      example: "emphasis",
    },
    {
      do: "Open the label with a verb that names the outcome.",
      dont: "Fall back on OK, Yes or Submit, which only mean something with the surrounding copy in view.",
      example: "labels",
    },
    {
      do: "Pair an icon with a label unless the action is unmistakable on its own.",
      dont: "Reduce an ambiguous action to a bare glyph and leave a hover tooltip to explain it.",
      example: "icon-only",
    },
    {
      do: "Disable an action only while it genuinely cannot run, and say elsewhere what would enable it.",
      dont: "Treat the disabled state as the explanation, when it takes no focus and announces nothing.",
    },
  ],
  accessibility: [
    "Renders a real `<button>`, so Enter and Space activate it and it takes focus in DOM order.",
    "An icon-only button has no text to announce: give it an `aria-label` naming the action, not the glyph.",
    "Intent is a ranking, not a status. If the outcome matters, the label has to say so too, because colour alone reaches nobody who can't see it.",
  ],
  content: [
    "Name the outcome rather than the mechanism: Delete, not Confirm.",
    "Keep labels to one to three words, and let the label size the button, since translations routinely run a third longer.",
  ],
  related: [
    { slug: "toggle", when: "the control stays pressed to show a state you can see." },
    { slug: "menu", when: "one trigger should open a set of related actions." },
    { slug: "tag", when: "the thing is a label or category rather than an action." },
  ],
};
