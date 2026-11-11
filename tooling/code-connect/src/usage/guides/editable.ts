import type { UsageGuide } from "../types.js";

export const editableUsage: UsageGuide = {
  slug: "editable",
  codeName: "Editable",
  summary:
    "Text that reads as plain content until the reader chooses to change it in place. It suits a value people look at far more often than they edit, such as a name or a title.",
  useWhen: [
    "A value is mostly read, and changing it is occasional.",
    "Opening a form for one short value would be more work than the change itself.",
    "The value belongs in the layout as text, like a title above the content it names.",
  ],
  avoid: [
    {
      text: "Inside a form where every value is edited and submitted together.",
      instead: ["input"],
    },
    {
      text: "For long or multi-line text, which the single-line editor clips.",
      instead: ["text-area"],
    },
    {
      text: "For choosing from a fixed set of values, which free typing cannot constrain.",
      instead: ["select", "combobox"],
    },
  ],
  guidance: [
    {
      do: "Turn on `showControls` where the edit needs an obvious way in and a clear way out.",
      dont: "Rely on a hover surface alone, which touch screens never show and nobody reads as a promise.",
      example: "visible-controls",
    },
    {
      do: "Set a `placeholder` that says what belongs there when the value is empty.",
      dont: "Leave an empty value to render as a blank gap that nobody knows to click.",
      example: "empty-placeholder",
    },
    {
      do: "Confirm a saved change quietly, and put the old value back with a message if saving fails.",
      dont: "Leave the new text on screen after a failed save, so the reader believes it stuck.",
    },
  ],
  accessibility: [
    "By default, tabbing onto the value starts an edit, so avoid placing many in one long tab sequence.",
    "Escape cancels and restores the previous value, which matters most to readers who started an edit by accident.",
    "The `label` names the value for assistive technology, so keep it even when the text looks self-explanatory.",
  ],
  content: [
    "Write the placeholder as a prompt: Add a project name, not Empty.",
    "The control labels are Edit, Save and Cancel, so nearby copy should use the same verbs.",
  ],
  related: [
    { slug: "input", when: "the value is always editable, or is part of a larger form." },
    { slug: "text-area", when: "the value runs to more than one line." },
  ],
};
