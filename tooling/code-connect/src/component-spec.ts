/**
 * One component's full spec, as served by `/ai/<Component>.md` and the MCP
 * `get_component` tool. Both call this, so a file and a tool answer can't differ.
 *
 * Node-free, so it can be bundled into the published MCP server.
 */

import { buildAiContext } from "./ai-context.js";
import { aiSpecPath, setupImportsFor, type DocFramework, type FrameworkTarget } from "./frameworks.js";
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

/**
 * Which library the spec is written for. Omitted, it's React. For the other
 * three, `target` is the component as that library ships it (from
 * `resolveTarget`) and `relatedTargets` its compound siblings by React name.
 */
export interface SpecFrameworkOptions {
  framework?: DocFramework;
  target?: FrameworkTarget;
  relatedTargets?: Record<string, FrameworkTarget>;
  /**
   * That library's own scan (`manifest/frameworks/<framework>.json`). With it,
   * the spec lists the library's real props; without it, React's.
   */
  frameworkManifest?: ComponentManifest;
}

/** The framework entry implementing a React export, found by its `reactName` link. */
function implementing(manifest: ComponentManifest | undefined, reactName: string) {
  return manifest?.components.find((c) => c.reactName === reactName && c.status !== "deprecated");
}

export function buildComponentSpec(
  entry: ComponentManifestEntry,
  manifest: ComponentManifest,
  latest: LatestHashes,
  packageVersion: string,
  options: SpecFrameworkOptions = {},
): string {
  const framework = options.framework ?? "react";
  const id = entryId(entry.codePath, entry.codeName);
  const staleness = computeStalenessCore(entry, latest.hashes?.[id], latest.props?.[id]);
  const related = manifest.components.filter(
    (sibling) => sibling.codePath === entry.codePath && sibling.codeName !== entry.codeName,
  );

  // Subcomponents have no guide of their own — guidance is written per docs
  // page, and a page covers the whole compound family.
  const usage = usageGuideForCodeName(entry.codeName);
  const table = entry.codePath.startsWith("packages/react-table/");
  // The guide carries the real docs slug where one exists — `kebab()` of a
  // codeName is right for all but the components whose page is named after
  // the family rather than the export (`NavItem` → `/docs/navigation`).
  const slug = usage?.slug ?? kebab(entry.codeName);

  return buildAiContext({
    entry,
    related,
    staleness,
    confidence: "exact",
    usage,
    ...(options.target ? { target: options.target, relatedTargets: options.relatedTargets ?? {} } : {}),
    ...(options.target && options.frameworkManifest
      ? {
          frameworkEntry: implementing(options.frameworkManifest, entry.codeName),
          relatedFrameworkEntries: Object.fromEntries(
            related.flatMap((r) => {
              const own = implementing(options.frameworkManifest, r.codeName);
              return own ? [[r.codeName, own]] : [];
            }),
          ),
        }
      : {}),
    meta: {
      packageVersion,
      // Includes the icon set: omit it and every icon renders nothing — no
      // library imports an icon package itself.
      setupImports: setupImportsFor(framework, { table }),
      siteUrl: `${SITE_ORIGIN}/docs/${slug}${framework === "react" ? "" : `?framework=${framework}`}`,
      docUrl: `${SITE_ORIGIN}${aiSpecPath(framework, entry.codeName)}`,
      indexUrl: `${SITE_ORIGIN}/llms.txt`,
      componentCount: manifest.components.length,
      // The manifest's timestamp, not a clock, so output stays deterministic.
      generatedAt: manifest.generatedAt,
    },
  }).text;
}
