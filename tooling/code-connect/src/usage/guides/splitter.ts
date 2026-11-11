import type { UsageGuide } from "../types.js";

export const splitterUsage: UsageGuide = {
  slug: "splitter",
  codeName: "Splitter",
  summary:
    "Two or more panes side by side, or stacked, with a handle between each pair that the reader drags to share out the space. It lets people decide how much room each part of a working surface gets.",
  useWhen: [
    "Two views are used together and the right balance between them changes with the task.",
    "One pane holds a list or tree and the other shows the selected item.",
    "Content in a pane can be wide or long enough that the reader will want more room for it.",
  ],
  avoid: [
    {
      text: "For switching between views that are never needed at the same time.",
      instead: ["tabs", "segmented-control"],
    },
    {
      text: "For a side panel that opens over the content on demand.",
      instead: ["sheet"],
    },
    {
      text: "For a fixed layout whose proportions nobody should need to change.",
      instead: ["divider"],
    },
  ],
  guidance: [
    {
      do: "Set `defaultSize` so the primary pane starts with most of the room.",
      dont: "Leave the even default split, so a narrow list gets as much space as the work it drives.",
      example: "proportions",
    },
    {
      do: "Keep the `default` rule where both panes share one background.",
      dont: "Use `subtle` on a flat surface, where nothing shows that the panes are separate or resizable.",
      example: "visible-handle",
    },
    {
      do: "Give panes a `minSize`, so dragging can never crush one into uselessness.",
      dont: "Let a pane shrink to a sliver that shows nothing and is hard to drag back.",
    },
    {
      do: "Remember the sizes the reader chose and restore them on return.",
      dont: "Reset every pane to its default each visit, undoing the reader's adjustments.",
    },
  ],
  accessibility: [
    "Each handle is a focusable separator that resizes with the arrow keys.",
    "Handles are named after the panes on either side, so set `label` wherever a pane id is not a readable word.",
    "Keep each pane usable at its `minSize`, since keyboard resizing moves in small steps.",
  ],
  content: [
    "Write pane labels as the names people use for those regions, such as Sidebar or Preview.",
  ],
  related: [
    { slug: "divider", when: "the separation is visual only and never moves." },
    { slug: "scroll-area", when: "a pane's content is longer than its space." },
  ],
};
