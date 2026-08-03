import type { UsageGuide } from "../types.js";

export const comboboxUsage: UsageGuide = {
  slug: "combobox",
  codeName: "Combobox",
  summary:
    "A Select you can type into. The field filters its options as the reader types, which is what makes a list of dozens or hundreds workable.",
  useWhen: [
    "The list is long enough that scanning it is slower than typing.",
    "The reader usually knows the value they want by name.",
    "The options are a fixed set, and one of them has to be chosen.",
  ],
  avoid: [
    {
      text: "For a short list, where a plain dropdown saves the reader any typing at all.",
      instead: ["select"],
    },
    {
      text: "For free text that isn't drawn from a list of options.",
      instead: ["input"],
    },
    {
      text: "For searching through content rather than choosing a value.",
      instead: ["search-input"],
    },
    {
      text: "For a list of commands to run.",
      instead: ["menu"],
    },
  ],
  guidance: [
    {
      do: "Write a placeholder that invites typing, so the field's advantage is discoverable.",
      dont: "Reuse a dropdown's placeholder, leaving the field looking like something you can only click.",
      example: "invite-typing",
    },
    {
      do: "Say in `helperText` what the list contains when its scope isn't obvious.",
      dont: "Leave the reader unsure whether a missing option is absent or just unmatched.",
      example: "scope",
    },
    {
      do: "Write an `emptyMessage` that suggests what to try instead.",
      dont: "Show an empty list, which reads as a broken field rather than a narrow filter.",
    },
  ],
  accessibility: [
    "It is a text field with a list attached, so the label belongs on the field itself.",
    "Filtering rearranges the list under the reader, so the empty state has to be announced rather than blank.",
    "Front-load the distinguishing word in each option, since typeahead and screen readers both start at the beginning.",
  ],
  content: [
    "Name what can be typed: Search cities, not Select an option.",
    "Keep option labels short enough to read in a narrow list on a phone.",
  ],
  related: [
    { slug: "select", when: "the list is short enough to browse." },
    { slug: "search-input", when: "the query searches content instead of picking a value." },
  ],
};
