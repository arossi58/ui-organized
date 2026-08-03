import { Skeleton } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const card = {
  display: "flex",
  gap: "var(--spacing-space-04)",
  alignItems: "flex-start",
  width: "100%",
};

const column = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-space-02)",
  flex: 1,
};

export const skeletonExamples: UsageExampleSet = {
  "matched-shape": {
    layout: "padded",
    // Avatar, heading and two lines of body: the same footprint the real row
    // will occupy, so nothing jumps when it arrives.
    Do: () => (
      <div style={card}>
        <Skeleton variant="circle" width={40} height={40} />
        <div style={column}>
          <Skeleton variant="text" width="45%" />
          <Skeleton variant="text" lines={2} />
        </div>
      </div>
    ),
    Dont: () => (
      <div style={card}>
        <Skeleton variant="rect" width="100%" height={40} />
      </div>
    ),
  },

  "text-lines": {
    layout: "padded",
    Do: () => <Skeleton variant="text" lines={3} />,
    Dont: () => <Skeleton variant="rounded" width="100%" height={68} />,
  },
};
