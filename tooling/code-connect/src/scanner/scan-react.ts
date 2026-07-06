/**
 * React scanner (Connect.md §5) — code → PropDefinition[], driven by the library's
 * PUBLIC API.
 *
 * The scan is anchored on `packages/react/src/index.ts` — the export barrel that
 * defines what's actually importable from `@ui-organized/react` — NOT on directory
 * names. That matters because the design system renames and composes: the `Radio`
 * folder exports `RadioGroup`; the `Navigation` folder exports `NavItem` /
 * `Sidebar`; `Card` exports `Card` + `CardHeader` + `CardBody` + `CardFooter`. A
 * folder-name scan produces import statements that don't resolve and misses every
 * compound subcomponent a designer needs to map individually.
 *
 * For each exported value with a matching `${Name}Props` type export, we resolve
 * that interface (or type-literal alias) in the component's source and read its
 * OWN declared members via the TypeScript compiler API in source-file-only mode —
 * the meaningful, component-specific props, not inherited DOM attributes. We never
 * regex-parse (Connect.md §5).
 */

import ts from "typescript";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import type { PropDefinition } from "../schema.js";
import { hashProps } from "../hash.js";

export interface ScannedComponent {
  /** The exported code symbol, e.g. `Button` or `CardHeader`. */
  codeName: string;
  codePath: string;
  framework: "react";
  importStatement: string;
  props: PropDefinition[];
  propSignatureHash: string;
  /** Generated seed — the writer preserves a human-edited snippet over this. */
  usageSnippet: string;
}

const PKG = "@ui-organized/react";
const INDEX = "packages/react/src/index.ts";

/** Members that are never part of the meaningful public API surface. */
const SKIP_NAMES = new Set(["ref", "key", "asChild", "render"]);

function isSourceFile(name: string): boolean {
  return (
    (name.endsWith(".ts") || name.endsWith(".tsx")) &&
    !name.endsWith(".test.ts") &&
    !name.endsWith(".test.tsx") &&
    !name.endsWith(".stories.tsx")
  );
}

function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
}

function typeText(type: ts.TypeNode, sf: ts.SourceFile): string {
  return type.getText(sf).replace(/\s+/g, " ").trim();
}

function readJsDoc(
  member: ts.PropertySignature,
  sf: ts.SourceFile,
): { defaultValue?: string; description?: string } {
  const full = sf.getFullText();
  const lead = full.slice(member.getFullStart(), member.getStart());
  const atDefault = /@default\s+(?:`([^`]+)`|['"]?([\w-]+)['"]?)/.exec(lead);
  const proseDefault = /Defaults?\s+to\s+['"]?([\w-]+)['"]?/i.exec(lead);
  const defaultValue = atDefault?.[1] ?? atDefault?.[2] ?? proseDefault?.[1];

  const cleaned = lead
    .replace(/\/\*\*?|\*\//g, "")
    .split("\n")
    .map((l) => l.replace(/^\s*\*?\s?/, "").trim())
    .filter((l) => l && !l.startsWith("@"))
    .join(" ")
    .trim();
  const description = cleaned ? cleaned.split(/(?<=\.)\s/)[0]!.trim() : undefined;

  return { defaultValue: defaultValue || undefined, description };
}

function toProp(member: ts.TypeElement, sf: ts.SourceFile): PropDefinition | null {
  if (!ts.isPropertySignature(member)) return null;
  if (!ts.isIdentifier(member.name) && !ts.isStringLiteral(member.name)) return null;
  const name = member.name.text;
  if (SKIP_NAMES.has(name)) return null;
  if (!member.type) return null;

  const { defaultValue, description } = readJsDoc(member, sf);
  return {
    name,
    type: typeText(member.type, sf),
    required: !member.questionToken,
    ...(defaultValue ? { defaultValue } : {}),
    ...(description ? { description } : {}),
  };
}

/** Extract props from a named `${codeName}Props` interface or type-literal alias. */
function extractProps(
  members: ts.NodeArray<ts.TypeElement>,
  sf: ts.SourceFile,
): PropDefinition[] {
  const props: PropDefinition[] = [];
  for (const member of members) {
    const prop = toProp(member, sf);
    if (prop) props.push(prop);
  }
  props.sort((a, b) => a.name.localeCompare(b.name));
  return props;
}

interface FoundProps {
  props: PropDefinition[];
  file: string;
}

/** Locate the `${propsName}` declaration within a directory's source files. */
function findPropsDecl(searchDir: string, propsName: string): FoundProps | null {
  if (!existsSync(searchDir)) return null;
  const files = readdirSync(searchDir).filter(isSourceFile);
  for (const file of files) {
    const full = join(searchDir, file);
    const sf = parse(full);
    for (const stmt of sf.statements) {
      if (ts.isInterfaceDeclaration(stmt) && stmt.name.text === propsName) {
        return { props: extractProps(stmt.members, sf), file: full };
      }
      if (ts.isTypeAliasDeclaration(stmt) && stmt.name.text === propsName) {
        // `type XProps = { ... }` → read the literal; alias to HTMLAttributes → no
        // own props (a valid, prop-light component entry).
        const props = ts.isTypeLiteralNode(stmt.type) ? extractProps(stmt.type.members, sf) : [];
        return { props, file: full };
      }
    }
  }
  return null;
}

interface ExportModule {
  /** Directory to search for prop declarations (from the module specifier). */
  searchDir: string;
  /** Exported value symbols (e.g. `Button`, `CardHeader`). */
  values: string[];
  /** Exported type names (e.g. `ButtonProps`, `ButtonVariants`). */
  types: Set<string>;
}

/** Parse index.ts into per-module value/type export sets. */
function parseIndex(repoRoot: string): ExportModule[] {
  const indexPath = resolve(repoRoot, INDEX);
  const indexDir = dirname(indexPath);
  const sf = parse(indexPath);
  const byModule = new Map<string, ExportModule>();

  for (const stmt of sf.statements) {
    if (!ts.isExportDeclaration(stmt) || !stmt.moduleSpecifier) continue;
    if (!ts.isStringLiteral(stmt.moduleSpecifier)) continue;
    if (!stmt.exportClause || !ts.isNamedExports(stmt.exportClause)) continue;

    const spec = stmt.moduleSpecifier.text;
    if (!spec.startsWith(".")) continue;
    const searchDir = dirname(resolve(indexDir, spec)); // .../Button/index.js → .../Button
    let mod = byModule.get(searchDir);
    if (!mod) {
      mod = { searchDir, values: [], types: new Set() };
      byModule.set(searchDir, mod);
    }

    for (const el of stmt.exportClause.elements) {
      const name = el.name.text; // the public (possibly aliased) name
      // `export type { … }` block, or a per-specifier `export { type X }`.
      if (stmt.isTypeOnly || el.isTypeOnly) mod.types.add(name);
      else mod.values.push(name);
    }
  }
  return [...byModule.values()];
}

/** Build a minimal, honest usage seed from required props + known defaults. */
function usageSeed(name: string, props: PropDefinition[]): string {
  const attrs = props
    .filter((p) => p.required && !/^on[A-Z]/.test(p.name) && p.name !== "children")
    .map((p) => `${p.name}={/* ${p.type} */}`);
  const hasChildren = props.some((p) => p.name === "children");
  const open = [`<${name}`, ...attrs].join(" ");
  return hasChildren ? `${open}>…</${name}>` : `${open} />`;
}

/**
 * Scan `@ui-organized/react`'s public exports for mappable components.
 * @param repoRoot absolute path to the monorepo root.
 */
export function scanReact(repoRoot: string): ScannedComponent[] {
  const modules = parseIndex(repoRoot);
  const scanned: ScannedComponent[] = [];

  for (const mod of modules) {
    for (const codeName of mod.values) {
      if (/^use[A-Z]/.test(codeName)) continue; // hooks aren't components
      if (!mod.types.has(`${codeName}Props`)) continue; // no props type → not mappable here

      const found = findPropsDecl(mod.searchDir, `${codeName}Props`);
      if (!found) continue;

      scanned.push({
        codeName,
        codePath: relative(repoRoot, found.file),
        framework: "react",
        importStatement: `import { ${codeName} } from '${PKG}';`,
        props: found.props,
        propSignatureHash: hashProps(found.props),
        usageSnippet: usageSeed(codeName, found.props),
      });
    }
  }

  scanned.sort((a, b) => a.codeName.localeCompare(b.codeName));
  return scanned;
}
