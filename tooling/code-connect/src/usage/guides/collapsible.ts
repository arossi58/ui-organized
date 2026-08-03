import type { UsageGuide } from "../types.js";

export const collapsibleUsage: UsageGuide = {
  slug: "collapsible",
  codeName: "Collapsible",
  summary:
    "One section that opens and closes in place. It is the smallest disclosure there is: a trigger, and the content it reveals, with no set to belong to.",
  useWhen: [
    "A single block of detail is worth offering but not worth showing by default.",
    "The content belongs exactly where the trigger is.",
    "Hiding it shortens the page without hiding anything anyone needs.",
  ],
  avoid: [
    {
      text: "For several sections that belong together as a set.",
      instead: ["accordion"],
    },
    {
      text: "For content anchored to a control rather than to the page.",
      instead: ["popover"],
    },
    {
      text: "To hide required form fields, which still have to be filled in.",
    },
  ],
  guidance: [
    {
      do: "Say what is inside on the trigger itself.",
      dont: "Label it Show more, which asks the reader to open it to find out what more is.",
      example: "named-trigger",
    },
    {
      do: "Keep the trigger's wording stable as the section opens and closes.",
      dont: "Swap the label between Show and Hide, so it describes the state and the action at once.",
      example: "stable-trigger",
    },
    {
      do: "Keep the revealed content next to the trigger, so opening doesn't move the page around.",
      dont: "Reveal a section long enough to push everything else out of view.",
    },
  ],
  accessibility: [
    "The trigger is a button reporting its expanded state, so an arrow alone never carries that meaning.",
    "Hidden content is out of the tab order and out of find-in-page, which is the point and also the risk.",
    "Keep focus where the reader left it: opening a section shouldn't move it somewhere else.",
  ],
  content: [
    "Name the content on the trigger: Delivery options, not Show more.",
    "Keep the trigger to a few words, since it is read before anything is revealed.",
  ],
  related: [
    { slug: "accordion", when: "there are several sections in one set." },
    { slug: "popover", when: "the detail belongs to a control rather than the page." },
  ],
};
