/**
 * The Analyzer (COMPONENT-PLUGIN.md §3, Phase 2).
 *
 * Static analysis of `@ui-organized/react`: for each component, find its props
 * interface and classify each property into a Figma-property kind, emitting the
 * committed Component Manifest (`src/generated/component-manifest.json`). The
 * plugin UI reads that to populate the "select a component" list.
 *
 * Uses the TypeScript compiler API in **source-file-only** mode (no Program, no
 * type resolution) — so it needs no `@types/react` and no new dependency beyond
 * `typescript`, which the workspace already has. That means we read only each
 * interface's *own* declared members (not inherited host props like
 * `React.ComponentPropsWithRef<"button">`), which is exactly the set of
 * meaningful, component-specific props we want as variant axes.
 *
 * Run: pnpm --filter @ui-organized/figma-component-bridge generate:manifest
 */

import ts from "typescript";
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ComponentManifest,
  ComponentManifestEntry,
  ManifestProperty,
  ManifestPropertyKind,
} from "../src/manifest";

const here = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(here, "../../..");
const COMPONENTS_DIR = resolve(REPO, "packages/react/src/components");
const OUT_DIR = resolve(here, "../src/generated");
const OUT_PATH = resolve(OUT_DIR, "component-manifest.json");

// Props that are never a Figma property (native attrs, controlled state, refs).
const SKIP_NAMES = new Set([
  "className", "style", "ref", "key", "id", "name", "value", "defaultValue",
  "portalContainer", "htmlFor", "role", "tabIndex", "render", "asChild",
]);
// String props whose name reads as visible content → TEXT.
const TEXT_NAMES = new Set([
  "label", "title", "placeholder", "helperText", "text", "description", "message", "caption",
]);

function isSourceFile(name: string): boolean {
  return (
    (name.endsWith(".ts") || name.endsWith(".tsx")) &&
    !name.endsWith(".test.ts") &&
    !name.endsWith(".test.tsx") &&
    !name.endsWith(".stories.tsx")
  );
}

/** Parse a file into an AST with parent pointers (so node.getText() works). */
function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
}

/** Pull a default value out of a member's JSDoc / leading comment, if present. */
function inferDefault(member: ts.PropertySignature, sf: ts.SourceFile): string | boolean | null {
  const text = sf.getFullText();
  const comment = text.slice(member.getFullStart(), member.getStart());
  const at = /@default\s+['"]?([\w-]+)['"]?/.exec(comment);
  const prose = /Defaults?\s+to\s+['"]?([\w-]+)['"]?/i.exec(comment);
  const raw = at?.[1] ?? prose?.[1];
  if (raw === undefined) return null;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return raw;
}

/** All string-literal members of a union type node, or null if it isn't one. */
function stringUnionValues(type: ts.TypeNode): string[] | null {
  if (!ts.isUnionTypeNode(type)) return null;
  const values: string[] = [];
  for (const m of type.types) {
    if (ts.isLiteralTypeNode(m) && ts.isStringLiteral(m.literal)) values.push(m.literal.text);
    else return null; // mixed union (e.g. string | boolean) — not a variant axis
  }
  return values.length > 0 ? values : null;
}

/** Classify one property signature into a Figma property kind, or null to skip. */
function classify(member: ts.PropertySignature, sf: ts.SourceFile): ManifestProperty | null {
  if (!ts.isIdentifier(member.name) && !ts.isStringLiteral(member.name)) return null;
  const name = member.name.text;
  if (SKIP_NAMES.has(name)) return null;

  const type = member.type;
  if (!type) return null;
  const optional = !!member.questionToken;
  const base = { name, optional, default: inferDefault(member, sf) };

  // children → slot content, treated as TEXT by default (overridable later).
  if (name === "children") return { ...base, kind: "TEXT" };

  // Callbacks are not Figma properties.
  if (ts.isFunctionTypeNode(type)) return null;
  if (/^on[A-Z]/.test(name)) return null;

  // String-literal union → VARIANT axis.
  const values = stringUnionValues(type);
  if (values) {
    const def = base.default;
    return { ...base, kind: "VARIANT", values, default: typeof def === "string" ? def : null };
  }

  // boolean → BOOLEAN.
  if (type.kind === ts.SyntaxKind.BooleanKeyword) {
    const def = base.default;
    return { ...base, kind: "BOOLEAN", default: typeof def === "boolean" ? def : null };
  }

  // Icon set reference → INSTANCE_SWAP.
  if (ts.isTypeReferenceNode(type) && type.typeName.getText(sf) === "CanonicalIconName") {
    return { ...base, kind: "INSTANCE_SWAP", default: null };
  }
  if (name === "icon") return { ...base, kind: "INSTANCE_SWAP", default: null };

  // Content-ish string → TEXT.
  if (type.kind === ts.SyntaxKind.StringKeyword && TEXT_NAMES.has(name)) {
    return { ...base, kind: "TEXT" };
  }

  return null; // unclassifiable (arrays, element refs, ambiguous unions) → skip
}

interface FoundProps {
  members: ts.NodeArray<ts.TypeElement>;
  sf: ts.SourceFile;
  file: string;
  interfaceName: string;
}

/** Find the component's props interface across the files in its directory. */
function findProps(componentDir: string, component: string, files: string[]): FoundProps | null {
  const wanted = `${component}Props`;
  let fallback: FoundProps | null = null;

  for (const file of files) {
    const sf = parse(join(componentDir, file));
    for (const stmt of sf.statements) {
      if (!ts.isInterfaceDeclaration(stmt)) continue;
      const interfaceName = stmt.name.text;
      if (!interfaceName.endsWith("Props")) continue;
      const found: FoundProps = { members: stmt.members, sf, file, interfaceName };
      if (interfaceName === wanted) return found; // exact match wins
      // Prefer a name that starts with the component name as the fallback.
      if (!fallback || interfaceName.startsWith(component)) fallback = found;
    }
  }
  return fallback;
}

/** sha256 over the component's source files (sorted) — stable across runs. */
function hashComponent(componentDir: string, files: string[]): string {
  const h = createHash("sha256");
  for (const file of [...files].sort()) {
    h.update(file);
    h.update("\0");
    h.update(readFileSync(join(componentDir, file)));
  }
  return `sha256:${h.digest("hex").slice(0, 16)}`;
}

// ─── Walk the component library ───────────────────────────────────────────────

const entries: ComponentManifestEntry[] = [];
const skipped: string[] = [];

const dirs = readdirSync(COMPONENTS_DIR)
  .filter((name) => statSync(join(COMPONENTS_DIR, name)).isDirectory())
  .sort();

for (const component of dirs) {
  const componentDir = join(COMPONENTS_DIR, component);
  const files = readdirSync(componentDir).filter(isSourceFile);
  const found = findProps(componentDir, component, files);
  if (!found) {
    skipped.push(component);
    continue;
  }

  const properties: ManifestProperty[] = [];
  for (const member of found.members) {
    if (!ts.isPropertySignature(member)) continue;
    const prop = classify(member, found.sf);
    if (prop) properties.push(prop);
  }

  entries.push({
    component,
    file: relative(REPO, join(componentDir, found.file)),
    propsInterface: found.interfaceName,
    hash: hashComponent(componentDir, files),
    properties,
  });
}

const manifest: ComponentManifest = {
  source: "@ui-organized/react",
  componentCount: entries.length,
  components: entries,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2) + "\n");

// ─── Report ───────────────────────────────────────────────────────────────────

const kindCounts: Record<ManifestPropertyKind, number> = {
  VARIANT: 0, BOOLEAN: 0, TEXT: 0, INSTANCE_SWAP: 0,
};
for (const e of entries) for (const p of e.properties) kindCounts[p.kind]++;

console.log(`component-manifest.json: ${entries.length} components`);
console.log(
  `  props: ${kindCounts.VARIANT} variant, ${kindCounts.BOOLEAN} boolean, ` +
    `${kindCounts.TEXT} text, ${kindCounts.INSTANCE_SWAP} instance-swap`,
);
if (skipped.length) console.log(`  no props interface found: ${skipped.join(", ")}`);
console.log("\nvariant axes by component:");
for (const e of entries) {
  const axes = e.properties
    .filter((p) => p.kind === "VARIANT")
    .map((p) => `${p.name}[${p.values?.length}]`);
  if (axes.length) console.log(`  ${e.component.padEnd(16)} ${axes.join(", ")}`);
}
