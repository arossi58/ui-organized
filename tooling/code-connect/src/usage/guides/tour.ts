import type { UsageGuide } from "../types.js";

export const tourUsage: UsageGuide = {
  slug: "tour",
  codeName: "Tour",
  summary:
    "A guided sequence of cards that walks someone through a surface, spotlighting one part at a time. It is for orienting people to something new, not for explaining what a single control does.",
  useWhen: [
    "A surface is new or has changed enough that people need its parts pointed out in order.",
    "The steps only make sense in sequence, each building on the one before.",
    "People start it themselves or can leave it at any point without losing work.",
  ],
  avoid: [
    {
      text: "For explaining one control, which a hint beside that control does without taking over.",
      instead: ["tooltip", "popover"],
    },
    {
      text: "For a task the reader completes step by step, where each step records something.",
      instead: ["steps"],
    },
    {
      text: "For news or messages that need no pointing at, which belong in place.",
      instead: ["alert"],
    },
    {
      text: "For making up for a confusing interface, which the tour will only describe.",
    },
  ],
  guidance: [
    {
      do: "Keep each step to a short title and one or two sentences.",
      dont: "Fill a step with a paragraph, which the reader skims or skips entirely.",
      example: "short-steps",
    },
    {
      do: "Keep `showProgress` on, so the reader knows how far there is to go.",
      dont: "Hide the counter, so every Next could be the last or one of twenty.",
      example: "progress",
    },
    {
      do: "Offer a way out on the first step, such as a skip action alongside Next.",
      dont: "Make the reader click through every step before they can get back to work.",
    },
    {
      do: "Keep a tour to a handful of steps, one per idea the reader needs.",
      dont: "Point at every control on the surface, so the important ones are lost in the list.",
    },
  ],
  accessibility: [
    "Each card has a real title and description, and a labelled close button, so it reads as a named dialog.",
    "Escape and the close button end the tour, so never rely on the last step being reached.",
    "A spotlight is visual only, so the description must say in words which part of the surface it means.",
  ],
  content: [
    "Title a step with what the part is for: Share your work, not Step 2.",
    "Name actions by what they do: Next, Back, Skip tour, Done.",
  ],
  related: [
    { slug: "popover", when: "a single element needs an explanation the reader opens on demand." },
    { slug: "steps", when: "the reader is completing a multi-part task rather than learning a surface." },
  ],
};
