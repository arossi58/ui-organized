/**
 * Publish the design system's component specs as fetchable Markdown.
 *
 * Emits `<out>/llms.txt` (the llms.txt convention index), `<out>/llms-full.txt`
 * (all of it in one document), `<out>/ai/tokens.md`, and
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
 * Each component is also written for Svelte, Vue and Angular, at
 * `<out>/ai/<framework>/<Component>.md`, wherever that library ships it. The
 * surfaces come from `loadFrameworkData()` (src/framework-data.ts) over the packages' source, the
 * same function the docs site's framework switcher uses.
 *
 *   pnpm --filter @ui-organized/code-connect exec tsx scripts/generate-ai-docs.ts [outDir]
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildComponentSpec, SITE_ORIGIN } from "../src/component-spec.js";
import { parseTokens, renderTokensMarkdown } from "../src/tokens/catalog.js";
import { FRAMEWORK_INFO, aiSpecPath, resolveTarget, type DocFramework, type FrameworkTarget } from "../src/frameworks.js";
import { loadFrameworkData, OTHER_FRAMEWORKS as OTHER_FRAMEWORK_LIST } from "../src/framework-data.js";
import type { ComponentManifest, ComponentManifestEntry, LatestHashes } from "../src/schema.js";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const out = resolve(REPO, process.argv[2] ?? "_site");
const manifestPath = join(REPO, "manifest/components.json");

if (!existsSync(manifestPath)) {
  console.error(
    `✖ No manifest at ${manifestPath} — run \`pnpm --filter @ui-organized/code-connect scan\` first.`,
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as ComponentManifest;
const hashesPath = join(REPO, "manifest/latest-hashes.json");
const latest: LatestHashes = existsSync(hashesPath)
  ? (JSON.parse(readFileSync(hashesPath, "utf8")) as LatestHashes)
  : { generatedAt: "", hashes: {} };

const versionOf = (dir: string): string =>
  (
    JSON.parse(readFileSync(join(REPO, "packages", dir, "package.json"), "utf8")) as {
      version: string;
    }
  ).version;
const reactPkg = { version: versionOf("react") };

// ─── The other three libraries ───────────────────────────────────────────────
const FRAMEWORK_DATA = loadFrameworkData(REPO);
const OTHER_SURFACES = {
  svelte: FRAMEWORK_DATA.svelte.surface,
  vue: FRAMEWORK_DATA.vue.surface,
  angular: FRAMEWORK_DATA.angular.surface,
};
const OTHER_FRAMEWORKS = [...OTHER_FRAMEWORK_LIST];
const VERSIONS: Record<DocFramework, string> = {
  react: reactPkg.version,
  svelte: versionOf("svelte"),
  vue: versionOf("vue"),
  angular: versionOf("angular"),
};

/** Each library's own scan, when `scan` has written one; absent, its specs use React's props. */
const FRAMEWORK_MANIFESTS: Partial<Record<DocFramework, ComponentManifest>> = {
  svelte: FRAMEWORK_DATA.svelte.manifest,
  vue: FRAMEWORK_DATA.vue.manifest,
  angular: FRAMEWORK_DATA.angular.manifest,
};

/** Deprecated entries stay React-only: they exist so old links resolve. */
function targetIn(framework: Exclude<DocFramework, "react">, codeName: string) {
  return resolveTarget(framework, codeName, OTHER_SURFACES[framework]);
}

/** How many specs each library got, for the index and the summary line. */
const frameworkCounts: Record<string, string[]> = { svelte: [], vue: [], angular: [] };

const byCodePath = new Map<string, ComponentManifestEntry[]>();
for (const entry of manifest.components) {
  const list = byCodePath.get(entry.codePath) ?? [];
  list.push(entry);
  byCodePath.set(entry.codePath, list);
}

const generatedAt = manifest.generatedAt;

const aiDir = join(out, "ai");
mkdirSync(aiDir, { recursive: true });

interface IndexRow {
  name: string;
  summary: string;
  deprecated: boolean;
}
const rows: IndexRow[] = [];
const specs: string[] = [];
/** Per library: its own index rows (by its own export names) and full spec texts. */
const frameworkRows: Record<string, Array<{ symbol: string; file: string; summary: string }>> = { svelte: [], vue: [], angular: [] };
const frameworkSpecs: Record<string, string[]> = { svelte: [], vue: [], angular: [] };

for (const entry of manifest.components) {
  const related = (byCodePath.get(entry.codePath) ?? []).filter(
    (sibling) => sibling.codeName !== entry.codeName,
  );

  const text = buildComponentSpec(entry, manifest, latest, reactPkg.version);
  writeFileSync(join(aiDir, `${entry.codeName}.md`), text);
  specs.push(text);

  if (entry.status !== "deprecated") {
    for (const framework of OTHER_FRAMEWORKS) {
      const target = targetIn(framework, entry.codeName);
      if (!target) continue;
      const relatedTargets: Record<string, FrameworkTarget> = {};
      for (const sibling of related) {
        const t = targetIn(framework, sibling.codeName);
        if (t) relatedTargets[sibling.codeName] = t;
      }
      mkdirSync(join(aiDir, framework), { recursive: true });
      const fwText = buildComponentSpec(entry, manifest, latest, VERSIONS[framework], {
        framework,
        target,
        relatedTargets,
        frameworkManifest: FRAMEWORK_MANIFESTS[framework],
      });
      writeFileSync(join(out, aiSpecPath(framework, entry.codeName)), fwText);
      frameworkCounts[framework]!.push(entry.codeName);
      frameworkSpecs[framework]!.push(fwText);
      frameworkRows[framework]!.push({
        symbol: target.symbol,
        file: entry.codeName,
        summary: summarise(entry, related),
      });
    }
  }

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

// ── Tokens ──────────────────────────────────────────────────────────────────
// From the built stylesheet, so this can't list a token consumers don't get.
const tokensCss = join(REPO, "packages/tokens/output/variables.css");
if (!existsSync(tokensCss)) {
  console.error(`✖ No ${tokensCss} — run \`pnpm --filter @ui-organized/tokens build\` first.`);
  process.exit(1);
}
const tokensPkg = JSON.parse(
  readFileSync(join(REPO, "packages/tokens/package.json"), "utf8"),
) as { version: string };
const tokensMd = renderTokensMarkdown(parseTokens(readFileSync(tokensCss, "utf8")), tokensPkg.version);
writeFileSync(join(aiDir, "tokens.md"), tokensMd);

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
>
> For custom layout and custom elements, use only the design tokens in tokens.md. Never
> hex colours or px literals, and never a token name that file doesn't list.

## Design tokens

- [Tokens](${SITE_ORIGIN}/ai/tokens.md): Every colour, spacing, radius and type token, with its theme values and when to use it.

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
## Other frameworks

The same components ship for Svelte, Vue and Angular. Each library has its own index
and specs, with its own props, import, markup and conventions:

${OTHER_FRAMEWORKS.map(
  (fw) =>
    `- [${FRAMEWORK_INFO[fw].label}](${SITE_ORIGIN}/llms-${fw}.txt) (\`${FRAMEWORK_INFO[fw].packageName}\` v${VERSIONS[fw]}, ` +
    `${frameworkCounts[fw]!.length} components): ${SITE_ORIGIN}/ai/${fw}/<Component>.md`,
).join("\n")}

## Human documentation

- [Component docs](${SITE_ORIGIN}/docs) — live previews, prop tables, accessibility checks
- [Storybook](${SITE_ORIGIN}/storybook/) — the interactive playground

## Optional

- [Everything in one file](${SITE_ORIGIN}/llms-full.txt): The tokens and every component spec, for tools that load one document.

Generated ${generatedAt} from manifest version ${manifest.manifestVersion}.
`;

writeFileSync(join(out, "llms.txt"), llms);
// Also under /ai/ so a reader who found one spec can walk up to the index.
writeFileSync(join(aiDir, "llms.txt"), llms);
// `specs` follows the manifest's order, which is stable across scans.
writeFileSync(join(out, "llms-full.txt"), [tokensMd, ...specs].join("\n\n---\n\n"));

// One index and one full document per other library, so an agent in a Vue
// project never has to read React's names to find its own.
for (const fw of OTHER_FRAMEWORKS) {
  const info = FRAMEWORK_INFO[fw];
  const fwRows = [...frameworkRows[fw]!].sort((a, b) => a.symbol.localeCompare(b.symbol));
  const index = `# UI Organized — ${info.label}

> \`${info.packageName}\` v${VERSIONS[fw]}, ${fwRows.length} components. Each link below is the complete,
> machine-verified spec for one component as ${info.label} ships it: its exact import, ${
    FRAMEWORK_MANIFESTS[fw]
      ? "every\n> prop scanned from the library's own source,"
      : "the\n> props of the shared API it implements,"
  } and the rules for using it.
>
> Do not generate code against this design system without reading the relevant file.
> If a component you want is not listed here, it does not exist in ${info.packageName} — ask rather than invent one.
>
> For custom layout and custom elements, use only the design tokens in tokens.md.

## Design tokens

- [Tokens](${SITE_ORIGIN}/ai/tokens.md): Every colour, spacing, radius and type token, with its theme values and when to use it.

## Components

${fwRows.map((r) => `- [${r.symbol}](${SITE_ORIGIN}${aiSpecPath(fw, r.file)}): ${r.summary}`).join("\n")}

## Optional

- [Everything in one file](${SITE_ORIGIN}/llms-full-${fw}.txt): The tokens and every ${info.label} spec.
- [Other libraries](${SITE_ORIGIN}/llms.txt): React, and the index of every library.

Generated ${generatedAt} from manifest version ${manifest.manifestVersion}.
`;
  writeFileSync(join(out, `llms-${fw}.txt`), index);
  writeFileSync(join(out, `llms-full-${fw}.txt`), [tokensMd, ...frameworkSpecs[fw]!].join("\n\n---\n\n"));
}

console.log(
  `✓ AI surface: ${rows.length} specs → ${aiDir.replace(`${REPO}/`, "")}/  + tokens.md, llms.txt, llms-full.txt` +
    (rows.length > live.length ? `  (${rows.length - live.length} deprecated)` : "") +
    `  + ${OTHER_FRAMEWORKS.map((fw) => `${frameworkCounts[fw]!.length} ${fw}`).join(", ")}`,
);
