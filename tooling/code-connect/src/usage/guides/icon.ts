import type { UsageGuide } from "../types.js";

export const iconUsage: UsageGuide = {
  slug: "icon",
  codeName: "Icon",
  summary:
    "A named glyph from the active icon library. It speeds up recognition of something the reader already understands, and it explains nothing on its own.",
  useWhen: [
    "A glyph is conventional enough to be read at a glance, like search or close.",
    "It sits beside a label and makes that label quicker to find.",
    "Space is genuinely tight and the action is unmistakable.",
  ],
  avoid: [
    {
      text: "For a concept with no conventional glyph, where the picture becomes a riddle.",
    },
    {
      text: "As the only carrier of a status, since colour and shape are read differently by everyone.",
      instead: ["tag"],
    },
    {
      text: "As decoration beside every heading, which adds noise and no meaning.",
    },
  ],
  guidance: [
    {
      do: "Pair an icon with a label wherever there is room for one.",
      dont: "Ship a row of unlabelled glyphs and rely on tooltips to explain them.",
      example: "with-label",
    },
    {
      do: "Use one glyph for one meaning across the whole product.",
      dont: "Let the same glyph mean edit here and settings there.",
      example: "one-meaning",
    },
    {
      do: "Keep icons at the sizes the control expects, so they sit on the text's baseline.",
      dont: "Scale a glyph up as a picture, where line weight and detail stop matching the type.",
    },
  ],
  accessibility: [
    "An icon with no `label` is treated as decorative, which is right whenever text beside it says the same thing.",
    "A meaningful icon needs a `label` that says what it means, not what it depicts.",
    "Never let an icon be the only signal for a state that matters, since not everyone reads glyphs the same way.",
  ],
  content: [
    "Choose the conventional glyph rather than the clever one.",
    "Write labels for what the icon does: Delete, not Bin.",
  ],
  related: [
    { slug: "button", when: "the glyph is something you can act on." },
    { slug: "tag", when: "the meaning is a status that deserves words." },
  ],
};
