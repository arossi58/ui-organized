import { Steps } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const frame = { width: "100%", maxWidth: 320 };

export const stepsExamples: UsageExampleSet = {
  "short-titles": {
    layout: "padded",
    Do: () => (
      <div style={frame}>
        <Steps
          steps={[{ title: "Details" }, { title: "Access" }, { title: "Review" }]}
          defaultStep={1}
          showContent={false}
          size="sm"
        />
      </div>
    ),
    // Sentences wrap and leave no room for the separators between stages.
    Dont: () => (
      <div style={frame}>
        <Steps
          steps={[
            { title: "Tell us about your team" },
            { title: "Choose who gets access" },
            { title: "Check everything before you finish" },
          ]}
          defaultStep={1}
          showContent={false}
          size="sm"
        />
      </div>
    ),
  },

  "stage-count": {
    layout: "padded",
    Do: () => (
      <div style={frame}>
        <Steps
          steps={[{ title: "Details" }, { title: "Access" }, { title: "Review" }]}
          defaultStep={0}
          showContent={false}
          size="sm"
          variant="dotted"
        />
      </div>
    ),
    // Eight stages for a short task: it looks twice as long as it is.
    Dont: () => (
      <div style={frame}>
        <Steps
          steps={["Name", "Email", "Team", "Role", "Access", "Region", "Terms", "Review"].map((title) => ({
            title,
          }))}
          defaultStep={0}
          showContent={false}
          size="sm"
          variant="dotted"
        />
      </div>
    ),
  },

  orientation: {
    layout: "padded",
    Do: () => (
      <div style={frame}>
        <Steps
          orientation="vertical"
          steps={[
            { title: "Details", description: "Name and contact email." },
            { title: "Access", description: "Who can see the workspace." },
            { title: "Review", description: "Check and confirm." },
          ]}
          defaultStep={1}
          showContent={false}
          size="sm"
        />
      </div>
    ),
    // Three descriptions side by side in a narrow column wrap into a block.
    Dont: () => (
      <div style={frame}>
        <Steps
          steps={[
            { title: "Details", description: "Name and contact email." },
            { title: "Access", description: "Who can see the workspace." },
            { title: "Review", description: "Check and confirm." },
          ]}
          defaultStep={1}
          showContent={false}
          size="sm"
        />
      </div>
    ),
  },
};
