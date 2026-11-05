import type { UsageGuide } from "../types.js";

export const clipboardUsage: UsageGuide = {
  slug: "clipboard",
  codeName: "Clipboard",
  summary:
    "A string paired with a trigger that copies it, confirming the copy in place by swapping the trigger's icon and label. It is for text someone has to paste somewhere else exactly as written.",
  useWhen: [
    "The value is long or awkward enough that retyping it invites mistakes.",
    "The reader's next step happens somewhere else, and the value has to travel with them.",
    "Seeing the value before copying it helps the reader trust they have the right one.",
  ],
  avoid: [
    {
      text: "For a value the reader is expected to edit before using it.",
      instead: ["input"],
    },
    {
      text: "For an action that does more than copy, such as sharing or exporting.",
      instead: ["button"],
    },
    {
      text: "For short everyday text that selecting and copying by hand already handles.",
    },
  ],
  guidance: [
    {
      do: "Give the copyable value a `label` that says what it is and where it goes.",
      dont: "Leave a bare string beside a copy button and hope its shape explains it.",
      example: "labelled",
    },
    {
      do: "Show the value when the reader should check it before pasting it anywhere.",
      dont: "Use the button alone for a value the reader never sees and cannot verify.",
      example: "show-value",
    },
    {
      do: "Keep the trigger to one short verb, so the copied confirmation fits in the same space.",
      dont: "Write a sentence on the trigger, which then jumps in width when it swaps to the confirmation.",
      example: "trigger-label",
    },
    {
      do: "Warn about sensitive values in `helperText` beside the field.",
      dont: "Copy a secret silently and leave the reader to work out that it matters.",
    },
  ],
  accessibility: [
    "The trigger's label changes on copy, which is the confirmation, so keep both labels as real words.",
    "The value box stays focusable and selectable, so keyboard users can copy it without the trigger.",
    "A button-only clipboard has no visible value, so its label or surrounding text must name what gets copied.",
  ],
  content: [
    "Label the value by its purpose: Invite link, not URL.",
    "Keep the default Copy and Copied pair unless the product already uses different words for them.",
  ],
  related: [
    { slug: "input", when: "the reader types or edits the value." },
    { slug: "toast", when: "the copy happens away from the trigger and needs confirming elsewhere." },
  ],
};
