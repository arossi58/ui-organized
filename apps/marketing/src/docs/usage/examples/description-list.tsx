import { DescriptionList } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const PLAN = [
  { term: "Plan", details: "Pro, billed yearly" },
  { term: "Seats", details: "12 of 20" },
  { term: "Renews", details: "1 March 2027" },
];

export const descriptionListExamples: UsageExampleSet = {
  terms: {
    layout: "padded",
    Do: () => (
      <div style={{ maxWidth: 420 }}>
        <DescriptionList items={PLAN} />
      </div>
    ),
    // The terms take the width the values needed.
    Dont: () => (
      <div style={{ maxWidth: 420 }}>
        <DescriptionList
          items={[
            { term: "The plan this workspace is on", details: "Pro, billed yearly" },
            { term: "How many seats are in use", details: "12 of 20" },
            { term: "When the plan renews next", details: "1 March 2027" },
          ]}
        />
      </div>
    ),
  },

  layouts: {
    layout: "padded",
    Do: () => (
      <div style={{ maxWidth: 200 }}>
        <DescriptionList items={PLAN} layout="stacked" />
      </div>
    ),
    // Every value wraps beside its term.
    Dont: () => (
      <div style={{ maxWidth: 200 }}>
        <DescriptionList items={PLAN} />
      </div>
    ),
  },
};
