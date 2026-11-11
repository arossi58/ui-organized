import type { UsageGuide } from "../types.js";

export const tagsInputUsage: UsageGuide = {
  slug: "tags-input",
  codeName: "TagsInput",
  summary:
    "A field that collects a short list of typed values and turns each one into a removable chip. It is for values the reader makes up, such as keywords or addresses, rather than values picked from a known set.",
  useWhen: [
    "The reader enters several values of one kind, and there is no fixed list of answers.",
    "Each value is short enough to read as a chip, like a keyword, a name or an address.",
    "Removing one value without retyping the others matters.",
  ],
  avoid: [
    {
      text: "When every allowed value is already known, so the reader should pick rather than type.",
      instead: ["combobox", "checkbox"],
    },
    {
      text: "For a single value, where a chip adds ceremony to what is just a field.",
      instead: ["input"],
    },
    {
      text: "For long values like sentences, which wrap the chips into an unreadable block.",
      instead: ["text-area"],
    },
    {
      text: "For showing a status or category on a record, which nobody should be editing there.",
      instead: ["tag"],
    },
  ],
  guidance: [
    {
      do: "Say how an entry becomes a chip in the helper text, such as pressing Enter or typing a comma.",
      dont: "Leave the reader typing into a box with no sign that the text will turn into a chip.",
      example: "entry-hint",
    },
    {
      do: "Set `max` when there is a limit, and state the limit before the reader reaches it.",
      dont: "Enforce a limit nobody mentioned, so the next value is refused and the field looks broken.",
      example: "stated-limit",
    },
    {
      do: "Check each value as it is added and say which one is wrong.",
      dont: "Accept everything and report one vague error at submit, leaving the reader to hunt for the bad chip.",
    },
  ],
  accessibility: [
    "Each remove button is labelled with the value it removes, so keep chip values distinct and readable.",
    "Backspace in the empty entry highlights and then removes the last chip, so chips can be cleared without a pointer.",
    "State the separator and any limit in visible text, since a screen reader otherwise hears only an empty edit field.",
  ],
  content: [
    "Write the placeholder as an instruction: Add a topic, not Topics.",
    "Keep chip text exactly as the reader typed it, so they recognise what they entered.",
  ],
  related: [
    { slug: "combobox", when: "the values come from a list the reader can search." },
    { slug: "tag", when: "the chip is a read-only label rather than an entered value." },
  ],
};
