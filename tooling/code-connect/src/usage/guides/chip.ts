import type { UsageGuide } from "../types.js";

export const chipUsage: UsageGuide = {
  slug: "chip",
  codeName: "Chip",
  summary:
    "A compact token standing for something the reader added, such as a filter, a facet or a recipient. It is segmented: the field, the relation and the value are each a control that opens a menu for that one part, and the chip can usually be taken away again.",
  useWhen: [
    "The reader has applied something and needs to see it, change it or remove it.",
    "A condition reads as a short phrase made of a field, a relation and a value.",
    "Several added items sit in a row and each one can be removed on its own.",
  ],
  avoid: [
    {
      text: "For a status or category the reader did not choose.",
      instead: ["tag"],
    },
    {
      text: "For a command that runs once and leaves nothing behind.",
      instead: ["button"],
    },
    {
      text: "For typing many free-text values into a single field.",
      instead: ["tags-input"],
    },
    {
      text: "For a mode that is simply pressed on or off.",
      instead: ["toggle"],
    },
  ],
  guidance: [
    {
      do: "Split the condition into `label`, `operator` and `value`, so the field name never truncates.",
      dont: "Put the whole condition in the value, so the field name is the part that gets cut off.",
      example: "phrase",
    },
    {
      do: "Mark a chip with no value yet as `incomplete`, so it reads as waiting to be filled.",
      dont: "Draw a chip with no value like any other, so it looks like a filter already in force.",
      example: "incomplete",
    },
    {
      do: "Give each `ChipSegment` the menu for the one part it shows, so a click on the operator changes the operator.",
      dont: "Open the same editor from every segment, so a click on the operator lands in a form that leads with the field.",
    },
    {
      do: "Set `selected` while any of the chip's menus is open, so the chip being changed is filled with the brand color.",
      dont: "Leave the chip unfilled while its menu is open, so nothing on the row says which filter the menu belongs to.",
    },
    {
      do: "Give each dismiss button a `removeLabel` naming its condition, like Remove role filter.",
      dont: "Label every dismiss button Remove, so a screen reader hears a row of identical controls.",
    },
  ],
  accessibility: [
    "Each segment and the dismiss control are separate sibling buttons, so name the chip as a whole with `aria-label` on the group, such as Filter: Role is any of Admin.",
    "The operator is always spelled, so the relation is read out with the rest of the sentence.",
    "Incomplete is shown by a dashed outline, so the value text should also say when nothing is chosen.",
  ],
  content: [
    "Name the field in `label` exactly as it appears where the reader chose it.",
    "Only the value truncates, so put its distinguishing part first.",
  ],
  related: [
    { slug: "tag", when: "the label reports a state the reader did not choose." },
    { slug: "tags-input", when: "the reader types the values into a field." },
  ],
};
