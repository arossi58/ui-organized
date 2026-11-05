import type { UsageGuide } from "../types.js";

export const listboxUsage: UsageGuide = {
  slug: "listbox",
  codeName: "Listbox",
  summary:
    "A list of options that stays open on the surface, so the choices are the interface rather than something hidden behind a trigger. The reader picks one value or several by clicking or moving through the list.",
  useWhen: [
    "The options are the main thing on the surface and deserve to stay visible.",
    "The reader compares options side by side before choosing, which a closed field would hide.",
    "Several values can be picked from a list too long for a column of checkboxes.",
  ],
  avoid: [
    {
      text: "Inside a form row, where an open list crowds out every field around it.",
      instead: ["select"],
    },
    {
      text: "For a long list the reader would rather narrow by typing.",
      instead: ["combobox"],
    },
    {
      text: "For a handful of options that read better laid out as plain choices.",
      instead: ["radio-group"],
    },
    {
      text: "For items with children that open and close.",
      instead: ["tree-view"],
    },
    {
      text: "For a list of commands to run rather than values to choose.",
      instead: ["menu"],
    },
  ],
  guidance: [
    {
      do: "Give the list a `label`, so it is announced as a named set of choices.",
      dont: "Rely on a heading somewhere above, which the list itself never announces.",
      example: "labelled",
    },
    {
      do: "Give options a shared `group` when the list mixes two kinds of thing.",
      dont: "Run two kinds of option together in one column, leaving the reader to sort them.",
      example: "grouped",
    },
    {
      do: "Write an `emptyMessage` that says why nothing is listed and what to do next.",
      dont: "Keep the default message, which reads as a fault rather than an empty result.",
      example: "empty-message",
    },
    {
      do: "Say in the label when several values can be picked, as in Pick any.",
      dont: "Turn on multiple selection silently, so the reader assumes each pick replaces the last.",
    },
  ],
  accessibility: [
    "Arrow keys move the highlight and typing jumps to a match, so each option should lead with its distinguishing word.",
    "The highlight and the selection look different, because the keyboard can rest on an option that is not chosen.",
    "An empty list still announces one dimmed option carrying the empty message, so that message must make sense read aloud.",
  ],
  content: [
    "Write the label as the thing being chosen: Notification channel, not Options.",
    "Keep option labels short and in one grammar, so the list reads as one set of answers.",
  ],
  related: [
    { slug: "select", when: "the list should fold away until the reader asks for it." },
    { slug: "combobox", when: "typing should narrow a long list." },
    { slug: "checkbox", when: "each choice is an independent yes or no that needs its own explanation." },
  ],
};
