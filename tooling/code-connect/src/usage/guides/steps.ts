import type { UsageGuide } from "../types.js";

export const stepsUsage: UsageGuide = {
  slug: "steps",
  codeName: "Steps",
  summary:
    "A tracker for a task split into ordered stages. It shows how many stages there are, which one the reader is on and which are done, and carries the controls for moving between them.",
  useWhen: [
    "A long task divides naturally into stages that happen in a fixed order.",
    "Knowing how much is left helps the reader decide whether to carry on now.",
    "Each stage can be finished and checked on its own before the next begins.",
  ],
  avoid: [
    {
      text: "For views the reader can visit in any order.",
      instead: ["tabs"],
    },
    {
      text: "For showing how far a background process has run.",
      instead: ["progress"],
    },
    {
      text: "For a short form that fits on one screen, where stages only add clicks and hide what is coming.",
    },
    {
      text: "For showing where a page sits in a hierarchy.",
      instead: ["breadcrumb"],
    },
  ],
  guidance: [
    {
      do: "Title each stage with a short noun, so the whole tracker fits on one line.",
      dont: "Write sentences as titles, which wrap and squeeze the separators down to nothing.",
      example: "short-titles",
    },
    {
      do: "Keep to three to five stages, so each one is a meaningful piece of the task.",
      dont: "Split the task into many tiny stages, which makes it look longer than it is.",
      example: "stage-count",
    },
    {
      do: "Stack the tracker with `orientation=\"vertical\"` when stages carry descriptions.",
      dont: "Squeeze descriptions into a horizontal tracker, where every title wraps into a cramped block.",
      example: "orientation",
    },
    {
      do: "Set `linear` when a stage depends on what the one before it collects.",
      dont: "Let the reader jump ahead into a stage whose inputs do not exist yet.",
    },
  ],
  accessibility: [
    "Each stage is a tab that announces whether it is selected, so a title must make sense read on its own.",
    "Completion is shown by color and a tick, so the title still has to say what the stage is.",
    "When the stage changes, move focus to its first field, since the panel swaps without a page load.",
  ],
  content: [
    "Name stages by what the reader provides or checks: Details, Preferences, Review.",
    "The Back and Next labels are fixed in English, so a translated product needs its own controls.",
  ],
  related: [
    { slug: "tabs", when: "the views are parallel and can be visited in any order." },
    { slug: "progress", when: "the reader only needs to know how far along something is." },
  ],
};
