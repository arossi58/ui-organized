import type { UsageGuide } from "../types.js";

export const selectUsage: UsageGuide = {
  slug: "select",
  codeName: "Select",
  summary:
    "A field that folds a list of options onto one line and reveals them on demand. It is for choosing a value, almost always as part of a form.",
  useWhen: [
    "There are more options than deserve permanent space on the surface.",
    "The reader knows what they are choosing and only needs to pick it.",
    "The value belongs to a form and is submitted with everything else.",
  ],
  avoid: [
    {
      text: "For a handful of options that would read better laid out in the open.",
      instead: ["radio-group", "segmented-control"],
    },
    {
      text: "For a list long enough that scrolling it is work, where typing narrows it faster.",
      instead: ["combobox"],
    },
    {
      text: "For running commands, since a list of actions is not a value.",
      instead: ["menu"],
    },
    {
      text: "For a simple on or off setting.",
      instead: ["switch", "checkbox"],
    },
  ],
  guidance: [
    {
      do: "Give the field a `label`, and let the placeholder say what to do.",
      dont: "Drop the label and let the placeholder name the field, which disappears on selection.",
      example: "labelled",
    },
    {
      do: "Say the constraint in `helperText` before the reader can trip over it.",
      dont: "Stay silent until submit, then turn the field red with a message that only says invalid.",
      example: "helper-vs-error",
    },
    {
      do: "Order options the way the reader thinks: common ones first, then predictably.",
      dont: "Leave the options in whatever order the data arrived in.",
    },
  ],
  accessibility: [
    "The `label` is what assistive technology announces, so a placeholder can never stand in for it.",
    "Error text is tied to the field, so it is read out with the field rather than announced alone.",
    "Keep option labels to plain readable text, since that is what typeahead and screen readers work from.",
  ],
  content: [
    "Write the placeholder as a prompt: Select a region, not Region.",
    "Keep option labels in one grammar, so the list reads as one set of answers.",
  ],
  related: [
    { slug: "combobox", when: "the reader should be able to type to narrow the list." },
    { slug: "radio-group", when: "there are few enough options to show at once." },
    { slug: "menu", when: "the list runs commands rather than setting a value." },
  ],
};
