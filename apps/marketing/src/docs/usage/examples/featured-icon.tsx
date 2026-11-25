import { FeaturedIcon } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const block = { display: "flex", gap: "var(--spacing-space-03)", alignItems: "center" };
const title = {
  margin: 0,
  color: "var(--color-content-primary)",
};
const row = { display: "flex", gap: "var(--spacing-space-04)", alignItems: "center" };

export const featuredIconExamples: UsageExampleSet = {
  meaning: {
    Do: () => (
      <div style={block}>
        <FeaturedIcon icon="circle-check-big" variant="success" />
        <p className="text-default-body-large" style={title}>
          Changes saved
        </p>
      </div>
    ),
    Dont: () => (
      <div style={block}>
        <FeaturedIcon icon="circle-check-big" variant="error" />
        <p className="text-default-body-large" style={title}>
          Changes saved
        </p>
      </div>
    ),
  },

  consistency: {
    Do: () => (
      <div style={row}>
        <FeaturedIcon icon="mail" />
        <FeaturedIcon icon="bell" />
        <FeaturedIcon icon="users" />
      </div>
    ),
    Dont: () => (
      <div style={row}>
        <FeaturedIcon icon="mail" />
        <FeaturedIcon icon="bell" appearance="solid" shape="square" />
        <FeaturedIcon icon="users" appearance="outline" />
      </div>
    ),
  },
};
