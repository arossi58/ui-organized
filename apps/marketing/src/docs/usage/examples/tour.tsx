import { useEffect, useState } from "react";
import { Tour, type TourStep } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

/**
 * Opens on its first step after mount, which is when the tour can measure
 * anything. Centred steps only, so nothing depends on a target in the card.
 */
function OpenTour({ steps, showProgress }: { steps: TourStep[]; showProgress?: boolean }) {
  const [stepId, setStepId] = useState<string | null>(null);
  const first = steps[0]?.id ?? null;
  useEffect(() => setStepId(first), [first]);
  return (
    <Tour
      steps={steps}
      stepId={stepId}
      onStepChange={setStepId}
      size="sm"
      variant="compact"
      showProgress={showProgress}
    />
  );
}

const SHORT: TourStep[] = [
  {
    id: "share",
    title: "Share your work",
    description: "Invite people to view or edit from here.",
    actions: [
      { label: "Skip tour", action: "dismiss" },
      { label: "Next", action: "next" },
    ],
  },
  { id: "history", title: "See every change", description: "Restore any earlier version." },
  { id: "done", title: "You're set", description: "Start whenever you're ready." },
];

const LONG: TourStep[] = [
  {
    id: "share",
    title: "Sharing",
    description:
      "This is where you can share your work with other people. You can invite them by name or address, choose whether they can view or edit, change that later, remove them at any point, and see who already has access.",
  },
  ...SHORT.slice(1),
];

const staged = { layout: "centered" as const, containOverlays: true };

export const tourExamples: UsageExampleSet = {
  "short-steps": {
    ...staged,
    Do: () => <OpenTour steps={SHORT} />,
    // A paragraph in a step card, which people skim past or skip entirely.
    Dont: () => <OpenTour steps={LONG} />,
  },

  progress: {
    ...staged,
    Do: () => <OpenTour steps={SHORT} />,
    // No counter, so the reader cannot tell how many steps are left.
    Dont: () => <OpenTour steps={SHORT} showProgress={false} />,
  },
};
