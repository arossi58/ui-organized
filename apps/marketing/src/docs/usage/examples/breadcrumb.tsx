import { Breadcrumb } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const breadcrumbExamples: UsageExampleSet = {
  hierarchy: {
    layout: "padded",
    Do: () => (
      <Breadcrumb
        items={[
          { label: "Home", href: "#", icon: "home" },
          { label: "Projects", href: "#" },
          { label: "Quarterly report" },
        ]}
      />
    ),
    // A record of where this reader happened to come from, which means
    // something different for everyone who arrives.
    Dont: () => (
      <Breadcrumb
        items={[
          { label: "Search results", href: "#" },
          { label: "Recently viewed", href: "#" },
          { label: "Quarterly report" },
        ]}
      />
    ),
  },

  "current-page": {
    layout: "padded",
    Do: () => (
      <Breadcrumb
        items={[
          { label: "Home", href: "#", icon: "home" },
          { label: "Projects", href: "#" },
          { label: "Quarterly report" },
        ]}
      />
    ),
    Dont: () => (
      <Breadcrumb
        items={[
          { label: "Home", href: "#", icon: "home" },
          { label: "Projects", href: "#" },
          { label: "Quarterly report", href: "#" },
        ]}
      />
    ),
  },
};
