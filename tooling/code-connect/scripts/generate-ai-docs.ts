/**
 * Publish the design system's component specs as fetchable Markdown.
 *
 * Emits `<out>/llms.txt` (the llms.txt convention index) and
 * `<out>/ai/<Component>.md` for every manifest entry, rendered by the SAME
 * `buildAiContext()` the docs site's "Copy for AI" button and the Storybook
 * addon use. That's what makes the "Prompt + URL" copy format honest: the ~40
 * tokens it copies point at a file that says exactly what the 1,400-token
 * version would have said.
 *
 * One documented asymmetry: this runs in Node and cannot execute the Storybook
 * CSF modules (they import CSS through `@ui-organized/react`), so these files
 * carry the manifest content — import, complete prop table, rules, provenance —
 * without the curated composition examples the in-browser button adds. Both call
 * the same function; only the `examples` input differs. Each file links back to
 * its docs page for the richer version. Closing the gap means a build-time story
 * extractor (`scan-stories.ts`), which is the tracked follow-up.
 *
 *   pnpm --filter @ui-organized/code-connect exec tsx scripts/generate-ai-docs.ts [outDir]
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAiContext } from "../src/ai-context.js";
import { usageGuideForCodeName } from "../src/usage/index.js";
import { computeStalenessCore } from "../src/staleness-core.js";
import { entryId } from "../src/schema.js";
import type { ComponentManifest, ComponentManifestEntry, LatestHashes } from "../src/schema.js";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SITE_ORIGIN = "https://uiorganized.com";

const out = resolve(REPO, process.argv[2] ?? "_site");
const manifestPath = join(REPO, "manifest/components.json");

if (!existsSync(manifestPath)) {
  console.error(`✖ No manifest at ${manifestPath} — run \`pnpm --filter @ui-organized/code-connect scan\` first.`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as ComponentManifest;
const hashesPath = join(REPO, "manifest/latest-hashes.json");
const latest: LatestHashes = existsSync(hashesPath)
  ? (JSON.parse(readFileSync(hashesPath, "utf8")) as LatestHashes)
  : { generatedAt: "", hashes: {} };

const reactPkg = JSON.parse(
  readFileSync(join(REPO, "packages/react/package.json"), "utf8"),
) as { version: string };

/** URL slug for a component's docs page — must match `kebab()` in the docs registry. */
function kebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

const byCodePath = new Map<string, ComponentManifestEntry[]>();
for (const entry of manifest.components) {
  const list = byCodePath.get(entry.codePath) ?? [];
  list.push(entry);
  byCodePath.set(entry.codePath, list);
}

// `generatedAt` is passed in rather than read inside buildAiContext, so the
// generator stays the only place a clock is consulted and the function itself
// remains deterministic for its golden test.
const generatedAt = manifest.generatedAt;

const aiDir = join(out, "ai");
mkdirSync(aiDir, { recursive: true });

interface IndexRow {
  name: string;
  summary: string;
  deprecated: boolean;
}
const rows: IndexRow[] = [];

for (const entry of manifest.components) {
  const id = entryId(entry.codePath, entry.codeName);
  const staleness = computeStalenessCore(entry, latest.hashes?.[id], latest.props?.[id]);
  const related = (byCodePath.get(entry.codePath) ?? []).filter(
    (sibling) => sibling.codeName !== entry.codeName,
  );

  // Subcomponents have no guide of their own — guidance is written per docs
  // page, and a page covers the whole compound family.
  const usage = usageGuideForCodeName(entry.codeName);

  const { text } = buildAiContext({
    entry,
    related,
    staleness,
    confidence: "exact",
    usage,
    meta: {
      packageVersion: reactPkg.version,
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
      generatedAt,
    },
  });

  writeFileSync(join(aiDir, `${entry.codeName}.md`), text);

  rows.push({
    name: entry.codeName,
    summary: summarise(entry, related),
    deprecated: entry.status === "deprecated",
  });
}

/**
 * The family root — the entry whose name every sibling extends (`Card` for
 * `CardHeader`/`CardBody`), else the shortest name in the group. Without this,
 * every part of a family gets described as if it were the whole thing, so an
 * agent scanning the index reads "AlertDialogCancel: compound component" and has
 * no idea which name to reach for first.
 */
function familyRoot(group: ComponentManifestEntry[]): ComponentManifestEntry {
  const sorted = [...group].sort((a, b) => a.codeName.length - b.codeName.length);
  const shortest = sorted[0]!;
  return sorted.every((e) => e.codeName.startsWith(shortest.codeName)) ? shortest : shortest;
}

/** A one-line description built from what the manifest actually knows. */
function summarise(entry: ComponentManifestEntry, related: ComponentManifestEntry[]): string {
  if (related.length) {
    const root = familyRoot([entry, ...related]);
    if (root.codeName !== entry.codeName) {
      return `Part of the ${root.codeName} compound component.`;
    }
    return `Compound component — compose with ${related.map((r) => r.codeName).join(", ")}.`;
  }
  const variants = entry.props
    .filter((p) => /^("|')/.test(p.type) && p.type.includes("|"))
    .map((p) => p.name);
  if (variants.length) return `Variant props: ${variants.join(", ")}.`;
  if (entry.props.length) return `Props: ${entry.props.map((p) => p.name).join(", ")}.`;
  return "No props of its own — driven by children and element attributes.";
}

rows.sort((a, b) => a.name.localeCompare(b.name));
const live = rows.filter((r) => !r.deprecated);

const llms = `# UI Organized

> A React design system (\`@ui-organized/react\` v${reactPkg.version}) with ${live.length} verified components.
> Each link below is the complete, machine-verified spec for one component: its exact
> import, every prop with its allowed values, and the rules for using it. The specs are
> generated from the components' real TypeScript signatures, not written by hand.
>
> Do not generate code against this design system without reading the relevant file.
> If a component you want is not listed here, it does not exist — ask rather than invent one.

## Components

${live.map((r) => `- [${r.name}](${SITE_ORIGIN}/ai/${r.name}.md): ${r.summary}`).join("\n")}
${
  rows.length > live.length
    ? `\n## Deprecated\n\nStill documented so old links resolve, but prefer a current component.\n\n${rows
        .filter((r) => r.deprecated)
        .map((r) => `- [${r.name}](${SITE_ORIGIN}/ai/${r.name}.md): ${r.summary}`)
        .join("\n")}\n`
    : ""
}
## Human documentation

- [Component docs](${SITE_ORIGIN}/docs) — live previews, prop tables, accessibility checks
- [Storybook](${SITE_ORIGIN}/storybook/) — the interactive playground

Generated ${generatedAt} from manifest version ${manifest.manifestVersion}.
`;

writeFileSync(join(out, "llms.txt"), llms);
// Also under /ai/ so a reader who found one spec can walk up to the index.
writeFileSync(join(aiDir, "llms.txt"), llms);

console.log(
  `✓ AI surface: ${rows.length} specs → ${aiDir.replace(`${REPO}/`, "")}/  + llms.txt` +
    (rows.length > live.length ? `  (${rows.length - live.length} deprecated)` : ""),
);
