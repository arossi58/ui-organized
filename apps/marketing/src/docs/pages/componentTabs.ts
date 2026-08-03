/**
 * The Docs / Usage / Inspect tab set, defined once so every route agrees on ids,
 * labels and order — a mismatch would make the strip appear to jump between
 * views.
 */
import { hasUsageGuide } from "@ui-organized/code-connect/usage";
import type { DocsTab } from "../components";

export function componentTabs(slug: string): DocsTab[] {
  return [
    { id: "docs", label: "Docs", to: `/docs/${slug}` },
    // Only where guidance has actually been written. A tab that opens onto a
    // placeholder costs more trust than the missing tab does, and the guides
    // land component by component.
    ...(hasUsageGuide(slug)
      ? [{ id: "usage", label: "Usage", to: `/docs/${slug}/usage` } satisfies DocsTab]
      : []),
    { id: "inspect", label: "Inspect", to: `/docs/${slug}/inspect` },
  ];
}
