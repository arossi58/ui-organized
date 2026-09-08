import { Accordion } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const CLEAR = [
  {
    value: "delivery",
    title: "Delivery times",
    content: "Standard arrives in three to five days. Express arrives the next working day.",
  },
  { value: "returns", title: "Returns", content: "Anything unopened can go back within 30 days." },
  { value: "support", title: "Getting help", content: "Support answers within one working day." },
];

const VAGUE = [
  { value: "one", title: "More information", content: CLEAR[0].content },
  { value: "two", title: "Details", content: CLEAR[1].content },
  { value: "three", title: "Other", content: CLEAR[2].content },
];

export const accordionExamples: UsageExampleSet = {
  "descriptive-headings": {
    layout: "padded",
    Do: () => <Accordion items={CLEAR} />,
    Dont: () => <Accordion items={VAGUE} />,
  },

  "sensible-default": {
    layout: "padded",
    // The section nearly everyone came for is already open.
    Do: () => <Accordion items={CLEAR} defaultValue={["delivery"]} />,
    Dont: () => <Accordion items={CLEAR} defaultValue={[]} />,
  },
};
