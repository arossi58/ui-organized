/**
 * Layer 4 — retroactive verification pass. (The four layers are listed under
 * "Hallucination flagging" in this package's README.)
 *
 * Statically scans generated files against the manifest and flags what the
 * earlier layers can't guarantee (an agent can ignore the Layer 2 instruction):
 *  - a component imported from a UI Organized library that ISN'T one of that
 *    library's real components — i.e. a hallucination (error);
 *  - a prop bound on a component that isn't in its signature (error);
 *  - a `var(--…)` that isn't a real design token (error), when the token
 *    catalog is given;
 *  - a usage of a non-exact mapping (deprecated or stale) with no Layer 2
 *    annotation above it (error, React) — what catches an ignored Layer 2
 *    instruction;
 *  - use of a deprecated component (warning).
 *
 * Every library is read with its own parser: TSX with TypeScript, `.vue` with
 * `@vue/compiler-sfc`, `.svelte` with `svelte/compiler`, and Angular templates
 * (`.html`, or a component's inline `template:`) with `@angular/compiler`. A
 * component is checked against THAT library's own scan, so Vue's `modelValue`
 * passes and React's `onValueChange` on a Vue component does not.
 *
 * Run as a CI gate the same way lint/type-check gate. Node-only.
 */

import ts from "typescript";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { relative } from "node:path";
import type { ComponentManifest, ComponentManifestEntry } from "../schema.js";
import type { ManifestLoader } from "../mcp/manifest-loader.js";
import { computeStaleness } from "../mcp/staleness.js";
import { ANNOTATION_MARKER } from "./annotation.js";

/** The template compilers load only when a file of theirs is checked. */
const require = createRequire(import.meta.url);

const PACKAGES = {
  react: ["@ui-organized/react", "@ui-organized/react-table"],
  svelte: ["@ui-organized/svelte", "@ui-organized/svelte-table"],
  vue: ["@ui-organized/vue", "@ui-organized/vue-table"],
  angular: ["@ui-organized/angular", "@ui-organized/angular-table"],
} as const;
type Library = keyof typeof PACKAGES;

export type FindingKind =
  | "unresolved-import"
  | "deprecated-import"
  | "unknown-prop"
  | "unknown-token"
  | "missing-annotation";

export interface VerifyFinding {
  file: string;
  line: number;
  severity: "error" | "warning";
  kind: FindingKind;
  message: string;
}

export interface VerifyOptions {
  /** Svelte, Vue and Angular's own scans (`manifest/frameworks/<framework>.json`). */
  frameworkManifests?: Partial<Record<Exclude<Library, "react">, ComponentManifest>>;
  /** Real token names (`--spacing-space-04`). Given, every `var(--…)` is checked. */
  tokens?: ReadonlySet<string>;
}

/**
 * Attributes valid on any host element, and so never "unknown". The scanner
 * reads a component's OWN props and skips the native ones it forwards, so these
 * must be allowed rather than reported — `value`, `name` and `disabled` on an
 * Input are real, and flagging them was the false positive this list fixes.
 */
const NATIVE = new Set([
  // global
  "className", "class", "style", "id", "key", "ref", "children", "role", "tabIndex", "tabindex",
  "title", "hidden", "dir", "lang", "slot", "draggable", "inert", "spellCheck", "spellcheck",
  "autoFocus", "autofocus", "translate", "contentEditable", "contenteditable", "accessKey", "accesskey",
  // forms and inputs
  "value", "defaultValue", "checked", "defaultChecked", "name", "type", "disabled", "required",
  "readOnly", "readonly", "placeholder", "autoComplete", "autocomplete", "form", "htmlFor", "for",
  "min", "max", "step", "pattern", "multiple", "accept", "maxLength", "maxlength", "minLength",
  "minlength", "inputMode", "inputmode", "enterKeyHint", "enterkeyhint", "rows", "cols", "wrap", "list",
  // links and media
  "href", "target", "rel", "download", "src", "alt", "width", "height", "loading",
  // polymorphism the scanners deliberately skip
  "render", "asChild",
  // Angular forms directives: valid on any control that implements ControlValueAccessor,
  // which the Angular library's form components do.
  "ngModel", "ngModelOptions", "formControl", "formControlName",
]);
function isNative(name: string): boolean {
  // `onClick` (React) and `onclick` (Svelte 5's native event attributes) are both events.
  return NATIVE.has(name) || /^(on[A-Z]|on[a-z]+$|aria-|data-)/.test(name);
}

/** Look back a few lines from `startPos` for a Code Connect annotation. */
function annotatedAbove(text: string, startPos: number): boolean {
  const before = text.slice(0, startPos);
  const lines = before.split("\n").slice(-5);
  return lines.some((l) => l.includes(ANNOTATION_MARKER));
}

const kebabToCamel = (name: string) => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

function libraryOf(file: string, text: string): Library {
  if (file.endsWith(".vue")) return "vue";
  if (file.endsWith(".svelte")) return "svelte";
  if (file.endsWith(".html")) return "angular";
  if (/from\s+["']@ui-organized\/angular(-table)?["']/.test(text) && /@Component\s*\(/.test(text)) return "angular";
  return "react";
}

/** Named imports from a library's packages, local name → imported name, with their offsets. */
function importsFrom(source: string, packages: readonly string[]): { local: string; name: string; pos: number }[] {
  const sf = ts.createSourceFile("imports.ts", source, ts.ScriptTarget.Latest, true);
  const out: { local: string; name: string; pos: number }[] = [];
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) || !ts.isStringLiteral(stmt.moduleSpecifier)) continue;
    if (!packages.includes(stmt.moduleSpecifier.text)) continue;
    const named = stmt.importClause?.namedBindings;
    if (named && ts.isNamedImports(named)) {
      for (const el of named.elements) {
        out.push({ local: el.name.text, name: (el.propertyName ?? el.name).text, pos: el.getStart(sf) });
      }
    }
  }
  return out;
}

export function verifyGeneratedCode(
  files: string[],
  loader: ManifestLoader,
  repoRoot = process.cwd(),
  options: VerifyOptions = {},
): VerifyFinding[] {
  const reactByName = new Map<string, ComponentManifestEntry>();
  for (const e of loader.all()) if (!reactByName.has(e.codeName)) reactByName.set(e.codeName, e);
  const byNameFor = (library: Library): Map<string, ComponentManifestEntry> | undefined => {
    if (library === "react") return reactByName;
    const manifest = options.frameworkManifests?.[library];
    return manifest ? new Map(manifest.components.map((e) => [e.codeName, e])) : undefined;
  };

  const requiresAnnotation = (e: ComponentManifestEntry): boolean =>
    e.status === "deprecated" || computeStaleness(e, loader).isStale;

  const findings: VerifyFinding[] = [];

  for (const file of files) {
    const rel = relative(repoRoot, file);
    const text = readFileSync(file, "utf8");
    const lineAt = (pos: number) => text.slice(0, pos).split("\n").length;
    const library = libraryOf(file, text);
    const byName = byNameFor(library);
    const push = (pos: number, severity: VerifyFinding["severity"], kind: FindingKind, message: string) =>
      findings.push({ file: rel, line: lineAt(pos), severity, kind, message });

    // Tokens, in any library's markup or styles.
    if (options.tokens) {
      for (const m of text.matchAll(/var\(\s*(--[A-Za-z0-9-_]+)/g)) {
        if (!options.tokens.has(m[1]!)) {
          push(m.index!, "error", "unknown-token", `'${m[1]}' is not a design token — check it with search_tokens.`);
        }
      }
    }
    if (!byName) continue; // that library's scan wasn't given

    /** The imports block of the file's script, by library. */
    const script =
      library === "vue"
        ? [...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => ({ code: m[1]!, offset: m.index! + m[0].indexOf(m[1]!) }))
        : library === "svelte"
          ? [...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => ({ code: m[1]!, offset: m.index! + m[0].indexOf(m[1]!) }))
          : [{ code: text, offset: 0 }];

    const imported = new Map<string, string>();
    for (const { code, offset } of script) {
      for (const { local, name, pos } of importsFrom(code, PACKAGES[library])) {
        imported.set(local, name);
        const entry = byName.get(name);
        if (!entry) {
          push(offset + pos, "error", "unresolved-import", `'${name}' is imported from ${PACKAGES[library][0]} but is not one of its components — possible hallucination.`);
        } else if (entry.status === "deprecated") {
          push(offset + pos, "warning", "deprecated-import", `'${name}' maps to a deprecated component; consider a current one.`);
        }
      }
    }

    const checkProp = (component: string, entry: ComponentManifestEntry, prop: string, pos: number) => {
      if (entry.props.some((p) => p.name === prop) || isNative(prop)) return;
      push(pos, "error", "unknown-prop", `<${component}> has prop '${prop}' that is not in ${entry.codeName}'s signature.`);
    };

    if (library === "react") verifyJsx(file, text, imported, byName, checkProp, (entry, pos, tag) => {
      if (requiresAnnotation(entry) && !annotatedAbove(text, pos)) {
        push(pos, "error", "missing-annotation", `<${tag}> uses a non-exact mapping (${entry.status === "deprecated" ? "deprecated" : "stale"}) without a Code Connect annotation above it.`);
      }
    });
    else if (library === "vue") verifyVue(text, imported, byName, checkProp);
    else if (library === "svelte") verifySvelte(text, imported, byName, checkProp);
    else verifyAngular(file, text, byName, checkProp);
  }

  return findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

type CheckProp = (component: string, entry: ComponentManifestEntry, prop: string, pos: number) => void;

function verifyJsx(
  file: string,
  text: string,
  imported: Map<string, string>,
  byName: Map<string, ComponentManifestEntry>,
  checkProp: CheckProp,
  annotation: (entry: ComponentManifestEntry, pos: number, tag: string) => void,
): void {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const walk = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(sf);
      const name = imported.get(tag);
      const entry = name ? byName.get(name) : undefined;
      if (entry) {
        for (const attr of node.attributes.properties) {
          if (ts.isJsxAttribute(attr) && ts.isIdentifier(attr.name)) checkProp(tag, entry, attr.name.text, attr.getStart(sf));
        }
        annotation(entry, node.getStart(sf), tag);
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
}

function verifyVue(text: string, imported: Map<string, string>, byName: Map<string, ComponentManifestEntry>, checkProp: CheckProp): void {
  const { parse } = require("@vue/compiler-sfc") as typeof import("@vue/compiler-sfc");
  const { descriptor } = parse(text);
  const ast = descriptor.template?.ast;
  if (!ast) return;
  const visit = (node: { type: number; tag?: string; props?: unknown[]; children?: unknown[]; loc?: { start: { offset: number } } }) => {
    if (node.type === 1 && node.tag) {
      const name = imported.get(node.tag);
      const entry = name ? byName.get(name) : undefined;
      if (entry) {
        for (const raw of node.props ?? []) {
          const p = raw as { type: number; name: string; arg?: { content?: string; isStatic?: boolean }; loc: { start: { offset: number } } };
          const at = p.loc.start.offset;
          if (p.type === 6) checkProp(node.tag, entry, kebabToCamel(p.name), at); // static attribute
          else if (p.type === 7 && p.name === "bind" && p.arg?.isStatic && p.arg.content) checkProp(node.tag, entry, kebabToCamel(p.arg.content), at);
          else if (p.type === 7 && p.name === "model") checkProp(node.tag, entry, p.arg?.content ? kebabToCamel(p.arg.content) : "modelValue", at);
          // `@event` listens to an emit; v-if, v-for and slots aren't props.
        }
      }
    }
    for (const child of (node.children ?? []) as (typeof node)[]) visit(child);
  };
  visit(ast as unknown as Parameters<typeof visit>[0]);
}

function verifySvelte(text: string, imported: Map<string, string>, byName: Map<string, ComponentManifestEntry>, checkProp: CheckProp): void {
  const { parse } = require("svelte/compiler") as typeof import("svelte/compiler");
  const ast = parse(text, { modern: true });
  const visit = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    const n = node as { type?: string; name?: string; attributes?: unknown[]; start?: number };
    if (n.type === "Component" && n.name) {
      const name = imported.get(n.name);
      const entry = name ? byName.get(name) : undefined;
      if (entry) {
        for (const raw of n.attributes ?? []) {
          const a = raw as { type: string; name: string; start: number };
          if (a.type === "Attribute" || a.type === "BindDirective") checkProp(n.name, entry, a.name, a.start);
        }
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  };
  visit(ast.fragment);
}

/** Angular: the template, from an `.html` file or a component's inline `template:`. */
function verifyAngular(file: string, text: string, byName: Map<string, ComponentManifestEntry>, checkProp: CheckProp): void {
  const { parseTemplate } = require("@angular/compiler") as typeof import("@angular/compiler");
  const templates: { source: string; offset: number }[] = [];
  if (file.endsWith(".html")) templates.push({ source: text, offset: 0 });
  else {
    for (const m of text.matchAll(/template\s*:\s*(`)([\s\S]*?)`/g)) templates.push({ source: m[2]!, offset: m.index! + m[0].indexOf(m[2]!) });
  }

  // Selector → entry, by the attribute that names the directive (`uioButton`) or its element.
  const byAttribute = new Map<string, ComponentManifestEntry>();
  const byElement = new Map<string, ComponentManifestEntry>();
  for (const entry of byName.values()) {
    for (const part of (entry.selector ?? "").split(",")) {
      const m = /^\s*([a-z][\w-]*)?(?:\[([\w-]+)\])?/.exec(part);
      if (m?.[2]) byAttribute.set(m[2], entry);
      else if (m?.[1]) byElement.set(m[1], entry);
    }
  }

  for (const { source, offset } of templates) {
    const { nodes } = parseTemplate(source, file, { preserveWhitespaces: false });
    const visit = (node: unknown): void => {
      if (!node || typeof node !== "object") return;
      const n = node as {
        name?: string;
        attributes?: { name: string; sourceSpan: { start: { offset: number } } }[];
        inputs?: { name: string; sourceSpan: { start: { offset: number } } }[];
        children?: unknown[];
      };
      if (typeof n.name === "string" && Array.isArray(n.attributes)) {
        const entry =
          n.attributes.map((a) => byAttribute.get(a.name)).find(Boolean) ?? byElement.get(n.name);
        if (entry) {
          const label = n.name;
          for (const input of n.inputs ?? []) checkProp(label, entry, input.name, offset + input.sourceSpan.start.offset);
          for (const attr of n.attributes) {
            if (byAttribute.get(attr.name) === entry) continue; // the directive's own attribute
            if (entry.props.some((p) => p.name === attr.name)) continue;
            // A static attribute that isn't an input is plain HTML, which is fine.
          }
        }
      }
      for (const child of n.children ?? []) visit(child);
    };
    nodes.forEach(visit);
  }
}
