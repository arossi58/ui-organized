import type { UsageGuide } from "../types.js";

export const spinnerUsage: UsageGuide = {
  slug: "spinner",
  codeName: "Spinner",
  summary:
    "A small turning ring that says work is under way. It is for waits whose length you can't predict and whose result you can't sketch in advance, and it takes the colour of the text around it.",
  useWhen: [
    "A short wait follows something the reader did, and how long it will take is unknown.",
    "An action is running inside the control that started it, through Button's `loading` state.",
    "A region is loading on its own and the shape of what will arrive isn't known yet.",
  ],
  avoid: [
    {
      text: "When the layout of the incoming content is known, where a placeholder holds the page still while it loads.",
      instead: ["skeleton"],
    },
    {
      text: "For work you can measure, where a bar can show how far along it is.",
      instead: ["progress"],
    },
    {
      text: "For a wait long enough to need explaining, where a sentence says more than any animation.",
      instead: ["alert"],
    },
    {
      text: "Several at once on one surface, which reads as a page that is struggling rather than one that is working.",
    },
  ],
  guidance: [
    {
      do: "Put the spinner where the result will appear, or inside the control that started the work.",
      dont: "Show it in a corner far from the action, where the reader can't connect the two.",
      example: "placement",
    },
    {
      do: "Use Button's `loading` state for an action the reader just started.",
      dont: "Disable the button and set a separate spinner beside it, which drops focus and doubles the signal.",
      example: "in-button",
    },
    {
      do: "Name what is loading with `label`, or pair the spinner with a line of text and mark it `decorative`.",
      dont: "Leave every spinner on a page announcing the same bare Loading.",
    },
  ],
  accessibility: [
    "A standalone spinner is a `status` region named by `label`, which defaults to Loading.",
    "Mark it `decorative` when something nearby already announces the work, such as a busy Button or a status message, so it is not announced twice.",
    "Under a reduced-motion preference the ring turns slowly instead of stopping, because a still ring reads as a frozen page.",
  ],
  related: [
    { slug: "skeleton", when: "the shape of the incoming content is known." },
    { slug: "progress", when: "the work can be measured and the reader wants to watch it." },
    { slug: "button", when: "the wait follows a click, and the button can show it with `loading`." },
  ],
};
