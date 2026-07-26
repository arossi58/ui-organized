/**
 * The Docs / Inspect tab set, defined once so both routes agree on ids, labels
 * and order — a mismatch would make the strip appear to jump between views.
 */
import type { DocsTab } from "../components";

export function componentTabs(slug: string): DocsTab[] {
  return [
    { id: "docs", label: "Docs", to: `/docs/${slug}` },
    { id: "inspect", label: "Inspect", to: `/docs/${slug}/inspect` },
  ];
}
