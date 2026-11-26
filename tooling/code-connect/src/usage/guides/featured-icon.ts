import type { UsageGuide } from "../types.js";

export const featuredIconUsage: UsageGuide = {
  slug: "featured-icon",
  codeName: "FeaturedIcon",
  summary:
    "An icon set in a tinted circle or square, giving a heading, an empty state or a feature description a visual anchor. It signals the topic or the tone of a block, and is decorative unless it means something on its own.",
  useWhen: [
    "A heading, an empty state or a dialog needs a visual anchor that names its topic.",
    "A row of features or metrics needs the same marker on every item.",
    "The tone of a block matters, such as a success or an error, and a coloured shape helps it read at a glance.",
  ],
  avoid: [
    {
      text: "As a control. A featured icon takes no focus and does nothing when pressed.",
      instead: ["button"],
    },
    {
      text: "Inline in a sentence or inside a control, where a bare icon fits the line.",
      instead: ["icon"],
    },
    {
      text: "As the only signal of a status, since colour alone reaches nobody who can't see it.",
      instead: ["alert", "tag"],
    },
    {
      text: "On every row of a dense list, where the shapes crowd out the content.",
    },
  ],
  guidance: [
    {
      do: "Match the colour to what the block means: brand or neutral for a topic, a status colour for an outcome.",
      dont: "Use the error colour to decorate something that hasn't gone wrong.",
      example: "meaning",
    },
    {
      do: "Keep one appearance and one shape across a set of items.",
      dont: "Mix circles with squares, or solid with subtle, in the same row.",
      example: "consistency",
    },
    {
      do: "Leave it decorative when a heading beside it already says the same thing.",
      dont: "Give it a `label` that repeats the heading, so a screen reader hears the topic twice.",
    },
  ],
  accessibility: [
    "It is hidden from assistive technology by default, which is right whenever text beside it carries the meaning.",
    "Pass `label` only when the icon means something on its own; it is then announced as an image with that name.",
    "Every subtle pair holds at least 4.5:1 between icon and tint in both modes, the brand pair included for every theme colour.",
  ],
  related: [
    { slug: "icon", when: "the icon sits inline with text or inside a control." },
    { slug: "avatar", when: "the image stands for a person or an entity." },
  ],
};
