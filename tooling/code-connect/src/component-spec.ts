/**
 * One component's full spec, as served by `/ai/<Component>.md` and the MCP
 * `get_component` tool. Both call this, so a file and a tool answer can't differ.
 *
 * Node-free, so it can be bundled into the published MCP server.
 */

import { buildAiContext } from "./ai-context.js";
import { entryId } from "./schema.js";
import type { ComponentManifest, ComponentManifestEntry, LatestHashes } from "./schema.js";
import { computeStalenessCore } from "./staleness-core.js";
import { usageGuideForCodeName } from "./usage/index.js";

export const SITE_ORIGIN = "https://uiorganized.com";

/** URL slug for a component's docs page — must match `kebab()` in the docs registry. */
function kebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

export function buildComponentSpec(
  entry: ComponentManifestEntry,
  manifest: ComponentManifest,
  latest: LatestHashes,
  packageVersion: string,
): string {
  const id = entryId(entry.codePath, entry.codeName);
  const staleness = computeStalenessCore(entry, latest.hashes?.[id], latest.props?.[id]);
  const related = manifest.components.filter(
    (sibling) => sibling.codePath === entry.codePath && sibling.codeName !== entry.codeName,
  );

  // Subcomponents have no guide of their own — guidance is written per docs
  // page, and a page covers the whole compound family.
  const usage = usageGuideForCodeName(entry.codeName);

  return buildAiContext({
    entry,
    related,
    staleness,
    confidence: "exact",
    usage,
    meta: {
      packageVersion,
      setupImports: [
        "@ui-organized/tokens/variables.css",
        "@ui-organized/react/styles",
        // Registers the icon set. Omit it and every <Icon> renders nothing —
        // the library imports no icon package itself.
        "@ui-organized/react/icons/lucide",
      ],
      // The guide carries the real docs slug where one exists — `kebab()` of a
      // codeName is right for all but the components whose page is named after
      // the family rather than the export (`NavItem` → `/docs/navigation`).
      siteUrl: `${SITE_ORIGIN}/docs/${usage?.slug ?? kebab(entry.codeName)}`,
      docUrl: `${SITE_ORIGIN}/ai/${entry.codeName}.md`,
      indexUrl: `${SITE_ORIGIN}/llms.txt`,
      componentCount: manifest.components.length,
      // The manifest's timestamp, not a clock, so output stays deterministic.
      generatedAt: manifest.generatedAt,
    },
  }).text;
}
