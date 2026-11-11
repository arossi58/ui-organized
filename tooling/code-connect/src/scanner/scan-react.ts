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
import type { Framework, PropDefinition } from "../schema.js";
import { hashProps } from "../hash.js";

export interface ScannedComponent {
  /** The exported code symbol, e.g. `Button` or `CardHeader`. */
  codeName: string;
  codePath: string;
  framework: Framework;
  importStatement: string;
  /** Angular only: the selector the component or directive matches. */
  selector?: string;
  /** Svelte, Vue and Angular: the React export this one implements. */
  reactName?: string;
  props: PropDefinition[];
  propSignatureHash: string;
  /** Generated seed — the writer preserves a human-edited snippet over this. */
  usageSnippet: string;
}

/**
 * One library's scan: which barrels define its public API, which props are
 * plumbing rather than API, and how a usage seed is spelled in its markup.
 *
 * The AST walk itself is library-neutral — Svelte and Vue export the same
 * `${Name}Props` interfaces from their barrels that React does, so only these
 * settings differ. Angular declares inputs on a class instead and has its own
 * scanner (`scan-angular.ts`).
 */
export interface LibraryScanConfig {
  framework: "react" | "svelte" | "vue";
  roots: { pkg: string; index: string }[];
  /** Members that are never part of the meaningful public API surface. */
  skip: ReadonlySet<string>;
  usageSeed: (name: string, props: PropDefinition[]) => string;
}

/**
 * The export barrels to scan, and the package each one is imported from.
 *
 * There is more than one now because the data table ships as its own package —
 * a table engine plus a virtualizer is a transitive dependency every consumer of
 * `Button` would otherwise pay for at install time (TABLE.md).
 *
 * They are scanned in ONE pass, deliberately. `reconcile()` deprecates anything
 * absent from the scan it is given, so scanning the roots separately would mark
 * the entire React library deprecated on the react-table pass and vice versa.
 *
 * `@ui-organized/table-core` is not a root: it exports types, prop builders and
 * behaviours, and not a single component.
 */
export const ROOTS: { pkg: string; index: string }[] = [
  { pkg: "@ui-organized/react", index: "packages/react/src/index.ts" },
  { pkg: "@ui-organized/react-table", index: "packages/react-table/src/index.ts" },
];

/**
 * Members that are never part of React's meaningful public API surface. The
 * other libraries keep `asChild` (Vue) and snippet props (Svelte): there they
 * are real API, not React plumbing.
 */
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

/**
 * Type aliases that are a plain union of literals (`type ControlSize = "sm" |
 * "md" | "lg"`), by name, from a package and from `@ui-organized/core`, which all
 * four libraries import their variant types from. Inlining them means a prop
 * table says `"sm" | "md" | "lg"` instead of a name the reader has to go and
 * look up.
 */
const literalAliasCache = new Map<string, Map<string, string>>();

function literalAliases(roots: string[]): Map<string, string> {
  const key = roots.join("|");
  const cached = literalAliasCache.get(key);
  if (cached) return cached;
  const out = new Map<string, string>();
  for (const root of roots) {
    const src = join(root, "src");
    if (!existsSync(src)) continue;
    for (const file of sourceFilesUnder(src)) {
      const sf = parse(file);
      for (const stmt of sf.statements) {
        if (!ts.isTypeAliasDeclaration(stmt) || out.has(stmt.name.text) || stmt.typeParameters) continue;
        const t = stmt.type;
        const literals = ts.isUnionTypeNode(t) ? t.types : [t];
        if (literals.every((m) => ts.isLiteralTypeNode(m) && (ts.isStringLiteral(m.literal) || ts.isNumericLiteral(m.literal)))) {
          out.set(stmt.name.text, literals.map((m) => m.getText(sf)).join(" | "));
        }
      }
    }
  }
  literalAliasCache.set(key, out);
  return out;
}

/** Package roots whose literal aliases `typeText` may inline; set by `scanLibrary`. */
let aliasRoots: string[] = [];

function typeText(type: ts.TypeNode, sf: ts.SourceFile): string {
  const text = type
    .getText(sf)
    .replace(/\s+/g, " ")
    .trim()
    // A union written one member per line starts with a stray `|`.
    .replace(/^\|\s*/, "");
  if (aliasRoots.length && /^[A-Z]\w*$/.test(text)) {
    const inlined = literalAliases(aliasRoots).get(text);
    if (inlined) return inlined;
  }
  return text;
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

/** The skip list of the library being scanned; set by `scanLibrary`. */
let activeSkip: ReadonlySet<string> = SKIP_NAMES;

function toProp(member: ts.TypeElement, sf: ts.SourceFile): PropDefinition | null {
  if (!ts.isPropertySignature(member)) return null;
  if (!ts.isIdentifier(member.name) && !ts.isStringLiteral(member.name)) return null;
  const name = member.name.text;
  if (activeSkip.has(name)) return null;
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

/** Nearest ancestor directory holding a package.json — the package's root. */
function packageRootOf(dir: string): string {
  let current = dir;
  while (!existsSync(join(current, "package.json"))) {
    const parent = dirname(current);
    if (parent === current) return dir;
    current = parent;
  }
  return current;
}

function sourceFilesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFilesUnder(full));
    else if (isSourceFile(entry.name)) out.push(full);
  }
  return out;
}

/**
 * Every interface declared in a package, by name.
 *
 * Built once per package and cached, because resolving a heritage clause means
 * looking outside the component's own directory: `DateInputProps extends
 * DateFieldProps` crosses from `DateInput/` to `DateField/`, and
 * `DataTableProps extends UseDataTableOptions` crosses from `DataTable/` to
 * `core/`.
 */
const interfaceIndexCache = new Map<string, Map<string, { decl: ts.InterfaceDeclaration; sf: ts.SourceFile }>>();

function interfaceIndex(packageRoot: string) {
  const cached = interfaceIndexCache.get(packageRoot);
  if (cached) return cached;
  const index = new Map<string, { decl: ts.InterfaceDeclaration; sf: ts.SourceFile }>();
  const srcDir = join(packageRoot, "src");
  if (existsSync(srcDir)) {
    for (const file of sourceFilesUnder(srcDir)) {
      const sf = parse(file);
      for (const stmt of sf.statements) {
        if (ts.isInterfaceDeclaration(stmt) && !index.has(stmt.name.text)) {
          index.set(stmt.name.text, { decl: stmt, sf });
        }
      }
    }
  }
  interfaceIndexCache.set(packageRoot, index);
  return index;
}

/**
 * An interface's own members, plus the members of any base interface declared in
 * the same package.
 *
 * Inherited DOM attributes stay excluded — `extends React.ComponentPropsWithRef`
 * and `extends Omit<…>` name no local interface, so they resolve to nothing,
 * which is exactly the existing behaviour and the reason a component's entry
 * lists its meaningful props rather than two hundred HTML attributes. What this
 * adds is the case where the meaningful props ARE the inherited ones:
 * `DataTableProps extends UseDataTableOptions` would otherwise document a single
 * `className` for the largest component in the system.
 *
 * A derived member wins over a base member of the same name — that is what
 * narrowing a prop in a subtype means.
 */
function membersWithHeritage(
  decl: ts.InterfaceDeclaration,
  sf: ts.SourceFile,
  packageRoot: string,
  seen = new Set<string>(),
): PropDefinition[] {
  const own = extractProps(decl.members, sf);
  if (seen.has(decl.name.text)) return own;
  seen.add(decl.name.text);

  const inherited: PropDefinition[] = [];
  for (const clause of decl.heritageClauses ?? []) {
    if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue;
    for (const type of clause.types) {
      // Only a bare identifier: `React.X` is a property access and `Omit<…>`
      // names a utility type, neither of which is a local interface.
      if (!ts.isIdentifier(type.expression)) continue;
      const base = interfaceIndex(packageRoot).get(type.expression.text);
      if (!base) continue;
      inherited.push(...membersWithHeritage(base.decl, base.sf, packageRoot, seen));
    }
  }

  const byName = new Map<string, PropDefinition>();
  for (const prop of [...inherited, ...own]) byName.set(prop.name, prop);
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Locate the `${propsName}` declaration within a directory's source files. */
function findPropsDecl(searchDir: string, propsName: string): FoundProps | null {
  if (!existsSync(searchDir)) return null;
  const packageRoot = packageRootOf(searchDir);
  const files = readdirSync(searchDir).filter(isSourceFile);
  for (const file of files) {
    const full = join(searchDir, file);
    const sf = parse(full);
    for (const stmt of sf.statements) {
      if (ts.isInterfaceDeclaration(stmt) && stmt.name.text === propsName) {
        return { props: membersWithHeritage(stmt, sf, packageRoot), file: full };
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

/** The TypeScript `<script>` blocks of a `.vue` / `.svelte` file, as one source file. */
function parseSfcScript(file: string): ts.SourceFile | null {
  const text = readFileSync(file, "utf8");
  const blocks = [...text.matchAll(/<script\b[^>]*\blang=["']ts["'][^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!blocks.length) return null;
  return ts.createSourceFile(`${file}.ts`, blocks.join("\n"), ts.ScriptTarget.Latest, true);
}

/** Literal-ish default text from an initializer, e.g. `"md"` → `md`. */
function defaultText(node: ts.Expression, sf: ts.SourceFile): string {
  return ts.isStringLiteral(node) ? node.text : node.getText(sf);
}

/** Resolve a props type node — inline literal, local declaration, or package interface. */
function propsFromTypeNode(
  type: ts.TypeNode,
  sf: ts.SourceFile,
  packageRoot: string,
): PropDefinition[] {
  if (ts.isTypeLiteralNode(type)) return extractProps(type.members, sf);
  if (ts.isIntersectionTypeNode(type)) {
    const byName = new Map<string, PropDefinition>();
    for (const part of type.types) for (const p of propsFromTypeNode(part, sf, packageRoot)) byName.set(p.name, p);
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName)) {
    const name = type.typeName.text;
    for (const stmt of sf.statements) {
      if (ts.isInterfaceDeclaration(stmt) && stmt.name.text === name) return membersWithHeritage(stmt, sf, packageRoot);
      if (ts.isTypeAliasDeclaration(stmt) && stmt.name.text === name) return propsFromTypeNode(stmt.type, sf, packageRoot);
    }
    const shared = interfaceIndex(packageRoot).get(name);
    if (shared) return membersWithHeritage(shared.decl, shared.sf, packageRoot);
  }
  return [];
}

/**
 * Props declared inside a Svelte or Vue component file rather than exported as
 * `${Name}Props`: Vue's `defineProps<T>()` (optionally inside `withDefaults`) and
 * Svelte's `let { … }: T = $props()`. Defaults come from `withDefaults`' object
 * or Svelte's destructuring. A component file that declares no props at all is
 * still a real export — a wrapper driven by attributes and slots — so it comes
 * back with an empty list rather than being dropped.
 */
function findSfcProps(
  searchDir: string,
  codeName: string,
  framework: "svelte" | "vue",
): FoundProps | null {
  const file = join(searchDir, `${codeName}.${framework}`);
  if (!existsSync(file)) return null;
  const sf = parseSfcScript(file);
  if (!sf) return { props: [], file };
  const packageRoot = packageRootOf(searchDir);

  let props: PropDefinition[] = [];
  const defaults = new Map<string, string>();
  const visit = (node: ts.Node) => {
    if (framework === "vue" && ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      if (node.expression.text === "defineProps" && node.typeArguments?.[0]) {
        props = propsFromTypeNode(node.typeArguments[0], sf, packageRoot);
      }
      if (node.expression.text === "withDefaults" && node.arguments[1] && ts.isObjectLiteralExpression(node.arguments[1])) {
        for (const p of node.arguments[1].properties) {
          if (ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) defaults.set(p.name.text, defaultText(p.initializer, sf));
        }
      }
    }
    if (
      framework === "svelte" &&
      ts.isVariableDeclaration(node) &&
      node.type &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === "$props"
    ) {
      props = propsFromTypeNode(node.type, sf, packageRoot);
      if (ts.isObjectBindingPattern(node.name)) {
        for (const el of node.name.elements) {
          const key = el.propertyName ?? el.name;
          if (el.initializer && ts.isIdentifier(key)) defaults.set(key.text, defaultText(el.initializer, sf));
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  // `withDefaults(…, { open: undefined })` only stops Vue's boolean casting; it isn't a default.
  for (const [k, v] of defaults) if (v === "undefined") defaults.delete(k);
  const merged = props.map((p) => (defaults.has(p.name) && !p.defaultValue ? { ...p, defaultValue: defaults.get(p.name)! } : p));
  return { props: merged, file };
}

interface ExportModule {
  /** The package this module's exports are imported from. */
  pkg: string;
  /** Directory to search for prop declarations (from the module specifier). */
  searchDir: string;
  /** Exported value symbols (e.g. `Button`, `CardHeader`). */
  values: string[];
  /** Exported type names (e.g. `ButtonProps`, `ButtonVariants`). */
  types: Set<string>;
}

/** Parse one export barrel into per-module value/type export sets. */
function parseIndex(repoRoot: string, root: { pkg: string; index: string }): ExportModule[] {
  const indexPath = resolve(repoRoot, root.index);
  if (!existsSync(indexPath)) return [];
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
      mod = { pkg: root.pkg, searchDir, values: [], types: new Set() };
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

/** Required props that a usage seed should spell out — not events, not content. */
function seedProps(props: PropDefinition[]): PropDefinition[] {
  return props.filter((p) => p.required && !/^on[A-Z]/.test(p.name) && p.name !== "children");
}

/** Build a minimal, honest usage seed from required props + known defaults. */
function usageSeed(name: string, props: PropDefinition[]): string {
  const attrs = seedProps(props).map((p) => `${p.name}={/* ${p.type} */}`);
  const hasChildren = props.some((p) => p.name === "children");
  const open = [`<${name}`, ...attrs].join(" ");
  return hasChildren ? `${open}>…</${name}>` : `${open} />`;
}

/** Svelte binds with `{…}` like JSX, but its content prop is a `children` snippet. */
function svelteSeed(name: string, props: PropDefinition[]): string {
  const attrs = seedProps(props).map((p) => `${p.name}={/* ${p.type} */}`);
  const hasChildren = props.some((p) => p.name === "children");
  const open = [`<${name}`, ...attrs].join(" ");
  return hasChildren ? `${open}>…</${name}>` : `${open} />`;
}

/** Vue binds an expression with `:prop="…"` and takes content through the default slot. */
function vueSeed(name: string, props: PropDefinition[]): string {
  const attrs = seedProps(props).map((p) => `:${p.name}="/* ${p.type} */"`);
  const open = [`<${name}`, ...attrs].join(" ");
  return `${open}>…</${name}>`;
}

/** Barrels and conventions per library. Svelte's barrel lives under `src/lib`. */
export const LIBRARIES: Record<LibraryScanConfig["framework"], LibraryScanConfig> = {
  react: { framework: "react", roots: ROOTS, skip: SKIP_NAMES, usageSeed },
  svelte: {
    framework: "svelte",
    roots: [
      { pkg: "@ui-organized/svelte", index: "packages/svelte/src/lib/index.ts" },
      { pkg: "@ui-organized/svelte-table", index: "packages/svelte-table/src/lib/index.ts" },
    ],
    skip: new Set(["key"]),
    usageSeed: svelteSeed,
  },
  vue: {
    framework: "vue",
    roots: [
      { pkg: "@ui-organized/vue", index: "packages/vue/src/index.ts" },
      { pkg: "@ui-organized/vue-table", index: "packages/vue-table/src/index.ts" },
    ],
    skip: new Set(["key"]),
    usageSeed: vueSeed,
  },
};

/**
 * Scan one library's public exports for mappable components, in one pass over
 * all of its roots (see `ROOTS` for why the pass is single).
 * @param repoRoot absolute path to the monorepo root.
 */
export function scanLibrary(repoRoot: string, config: LibraryScanConfig): ScannedComponent[] {
  const modules = config.roots.flatMap((root) => parseIndex(repoRoot, root));
  const scanned: ScannedComponent[] = [];
  activeSkip = config.skip;
  // React's types already spell their unions out; inlining there would only
  // churn its manifest. Svelte and Vue lean on shared aliases like `ControlSize`.
  aliasRoots =
    config.framework === "react"
      ? []
      : [
          ...config.roots.map((r) => packageRootOf(dirname(resolve(repoRoot, r.index)))),
          resolve(repoRoot, "packages/core"),
        ];
  try {
    for (const mod of modules) {
      for (const codeName of mod.values) {
        if (/^use[A-Z]/.test(codeName)) continue; // hooks aren't components
        const exported = mod.types.has(`${codeName}Props`)
          ? findPropsDecl(mod.searchDir, `${codeName}Props`)
          : null;
        // React requires the exported props type. Svelte and Vue often declare a
        // part's props inside its component file instead, so look there next.
        const found =
          exported ??
          (config.framework === "react" ? null : findSfcProps(mod.searchDir, codeName, config.framework));
        if (!found) continue;

        scanned.push({
          codeName,
          codePath: relative(repoRoot, found.file),
          framework: config.framework,
          importStatement: `import { ${codeName} } from '${mod.pkg}';`,
          props: found.props,
          propSignatureHash: hashProps(found.props),
          usageSnippet: config.usageSeed(codeName, found.props),
        });
      }
    }
  } finally {
    activeSkip = SKIP_NAMES;
    aliasRoots = [];
  }

  scanned.sort((a, b) => a.codeName.localeCompare(b.codeName));
  return scanned;
}

/** React's scan — the manifest the Figma link and the React specs read. */
export function scanReact(repoRoot: string): ScannedComponent[] {
  return scanLibrary(repoRoot, LIBRARIES.react);
}
