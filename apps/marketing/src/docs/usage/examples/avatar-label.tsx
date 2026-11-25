import { AvatarLabel } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const column = { display: "flex", flexDirection: "column" as const, gap: "var(--spacing-space-04)" };

export const avatarLabelExamples: UsageExampleSet = {
  "one-line": {
    layout: "padded",
    Do: () => <AvatarLabel name="Ada Lovelace" description="Engineering lead" />,
    Dont: () => (
      <div style={{ maxWidth: 240 }}>
        <AvatarLabel name="Ada Lovelace" description="Engineering lead, Platform team, ada@example.com" />
      </div>
    ),
  },

  "one-size": {
    layout: "padded",
    Do: () => (
      <div style={column}>
        <AvatarLabel size="sm" name="Ada Lovelace" description="Owner" />
        <AvatarLabel size="sm" name="Grace Hopper" description="Editor" />
      </div>
    ),
    Dont: () => (
      <div style={column}>
        <AvatarLabel size="lg" name="Ada Lovelace" description="Owner" />
        <AvatarLabel size="sm" name="Grace Hopper" description="Editor" />
      </div>
    ),
  },
};
