import type { UsageGuide } from "../types.js";

export const textAreaUsage: UsageGuide = {
  slug: "text-area",
  codeName: "TextArea",
  summary:
    "A field for text that runs to sentences. Its height is a promise about how much is wanted, and it lets the reader see what they have written.",
  useWhen: [
    "The answer is naturally longer than one line.",
    "Line breaks are part of the content rather than an accident.",
    "The reader benefits from seeing several lines of what they wrote at once.",
  ],
  avoid: [
    {
      text: "For a short single value, where a tall box asks for more than is wanted.",
      instead: ["input"],
    },
    {
      text: "For structured content that needs formatting the field can't express.",
    },
    {
      text: "For a value that must come from a list.",
      instead: ["select", "combobox"],
    },
  ],
  guidance: [
    {
      do: "Set the starting height to the length you actually expect.",
      dont: "Ship a two-line box for a paragraph, so the reader edits through a slot.",
      example: "expected-length",
    },
    {
      do: "Say what belongs in the field, and any limit, in `helperText`.",
      dont: "Cut the text off at a hidden limit and report it only once it is too late.",
      example: "limits",
    },
    {
      do: "Use `resize` deliberately: allow vertical growth, and lock the axis a layout can't take.",
      dont: "Leave a field resizable in both directions inside a narrow column it can break.",
    },
  ],
  accessibility: [
    "The `label` names the field, and helper text tied to it is read before the reader starts typing.",
    "Never trap the keyboard: Tab has to leave the field rather than indent inside it.",
    "A character limit needs announcing as it is approached, not only when it is hit.",
  ],
  content: [
    "Say what a good answer contains, in one line of helper text.",
    "Keep the label a noun for the content: Description, not Describe the thing.",
  ],
  related: [
    { slug: "input", when: "the answer fits on one line." },
    { slug: "field-error", when: "the message belongs under a control the form owns." },
  ],
};
