/**
 * Per-framework code samples — the data behind the docs site's framework
 * switcher.
 *
 * The design constraint that shapes everything here: there is exactly one
 * hand-authored sample per example, and it is React's. The Svelte, Vue and
 * Angular samples are *derived* from the same args the React one is built from
 * (see `markup.ts`), never translated from React source and never hand-written a
 * second time. A translated sample would be a second copy of the truth that
 * drifts silently; a derived one is wrong only if the args are wrong, in which
 * case React is wrong too and you can see it.
 *
 * The other half is coverage. The four libraries do not ship the same
 * components, so every function that resolves a component into a framework can
 * return `undefined`, and callers are expected to say "not available in Svelte"
 * rather than show a React sample under a Svelte label. Which components a
 * framework ships is not stored here — it is read out of that package's own
 * public barrel by {@link parseBarrelExports}, so a component added to
 * `@ui-organized/vue` shows up in the docs with no edit to this file.
 *
 * Pure and browser-safe: the docs site, and anything else that renders a sample,
 * import it through `@ui-organized/code-connect/browser`.
 */

import { jsValue, jsxAttr, layoutElement, normalizeArgs, type MarkupAttr } from "./markup.js";
import type { Framework } from "./schema.js";

// ─── The frameworks the docs site can show ───────────────────────────────────

/**
 * `Framework` also covers `swiftui` and `compose`, which exist in the schema for
 * mappings that are not code the docs site can print. These four are the ones a
 * sample can be rendered for.
 */
// `satisfies` rather than a plain literal: a doc framework the manifest schema
// does not know about would let a mapping be written that no tool can read back.
export const DOC_FRAMEWORKS = [
  "react",
  "svelte",
  "vue",
  "angular",
] as const satisfies readonly Framework[];

export type DocFramework = (typeof DOC_FRAMEWORKS)[number];

export function isDocFramework(value: unknown): value is DocFramework {
  return typeof value === "string" && (DOC_FRAMEWORKS as readonly string[]).includes(value);
}

export interface FrameworkInfo {
  label: string;
  packageName: string;
  /** Language tag for a code block or a fenced snippet. */
  language: string;
}

export const FRAMEWORK_INFO: Record<DocFramework, FrameworkInfo> = {
  react: { label: "React", packageName: "@ui-organized/react", language: "tsx" },
  svelte: { label: "Svelte", packageName: "@ui-organized/svelte", language: "svelte" },
  vue: { label: "Vue", packageName: "@ui-organized/vue", language: "vue" },
  angular: { label: "Angular", packageName: "@ui-organized/angular", language: "ts" },
};

// ─── Reading a package's public surface ──────────────────────────────────────

/**
 * Value exports of a barrel file, in source order.
 *
 * This is how coverage is decided, so it is deliberately literal: it reports
 * what the package's own `index.ts` re-exports and nothing else. `export type`
 * lines are skipped — a type is not a component you can render.
 */
export function parseBarrelExports(source: string): string[] {
  const out: string[] = [];
  const clause = /export\s+(type\s+)?\{([\s\S]*?)\}\s*from/g;

  for (let m = clause.exec(source); m; m = clause.exec(source)) {
    if (m[1]) continue; // `export type { … }`
    for (const raw of (m[2] ?? "").split(",")) {
      const name = raw.trim();
      if (!name || name.startsWith("type ")) continue; // inline `type X` in a value clause
      // `default as IconProvider` and `X as Y` both publish the right-hand name.
      const alias = /\bas\s+([A-Za-z_$][\w$]*)/.exec(name);
      out.push(alias ? alias[1]! : name);
    }
  }

  return out;
}

/** Where an Angular directive attaches, and under what attribute. */
export interface AngularSelector {
  /**
   * Host element the caller writes — `button` in `<button uioButton>`, and the
   * element itself for a component with an element selector: `uio-dialog`.
   */
  element: string;
  /**
   * The directive's attribute, e.g. `uioButton`. Absent for a component that
   * *is* its own element — the overlays are all written that way.
   */
  attribute?: string;
  /**
   * Every host element the selector accepts for `attribute`, when it accepts
   * more than one: `["button", "a"]` for `button[uioButton], a[uioButton]`.
   * `element` is the first of them, the one a generated sample uses.
   */
  elements?: string[];
}

/**
 * `@Directive({ selector: "button[uioButton], a[uioButton]" })` → the element and
 * attribute a caller actually types, keyed by the exported class name.
 *
 * Most of Angular's components here are attribute directives on the caller's own
 * element, not custom elements. Getting that wrong is the single worst thing a
 * generated Angular sample can do — `<uio-button>` is not a tag that exists, and
 * nothing about it fails loudly — so the element name is read from the real
 * selector rather than guessed from the class name.
 *
 * The overlays are the other kind: `uio-dialog`, `uio-popover`, `uio-menu`,
 * `uio-sheet` and friends are element selectors, because they own the host that
 * projects their content. Rejecting those — which this did — made nine shipped,
 * parity-tested components read as "not available in Angular" on their own docs
 * pages. An element selector yields an `element` with no `attribute`.
 */
export function parseAngularSelectors(sources: Iterable<string>): Record<string, AngularSelector> {
  const out: Record<string, AngularSelector> = {};
  // Non-greedy up to the next `export class`, so the class a decorator sits on
  // is the one immediately after it even in a file declaring several.
  const decorated = /selector:\s*["'`]([^"'`]+)["'`][\s\S]*?export class (\w+)/g;

  const attributeSelector = /^([a-zA-Z][\w-]*)?\[([\w-]+)\]$/;
  for (const source of sources) {
    for (let m = decorated.exec(source); m; m = decorated.exec(source)) {
      const alternatives = (m[1] ?? "").split(",").map((part) => part.trim());
      const first = alternatives[0]!;
      const attributeForm = attributeSelector.exec(first);
      if (attributeForm) {
        const attribute = attributeForm[2]!;
        // A bare `[uioCard]` matches any element; `div` is the neutral choice and
        // the one the library's own docs use.
        const elements = alternatives.flatMap((part) => {
          const form = attributeSelector.exec(part);
          return form && form[2] === attribute ? [form[1] || "div"] : [];
        });
        out[m[2]!] = {
          element: attributeForm[1] || "div",
          attribute,
          ...(elements.length > 1 ? { elements } : {}),
        };
        continue;
      }
      // An element selector — `uio-dialog`. Kebab-case with a hyphen, which is
      // what separates it from a bare tag name a directive might target.
      const elementForm = /^([a-z][\w]*-[\w-]+)$/.exec(first);
      if (elementForm) out[m[2]!] = { element: elementForm[1]! };
    }
  }

  return out;
}

/**
 * The inputs each Angular class declares, keyed by exported class name.
 *
 * Angular's port is partial in two directions: it has fewer components than
 * React, and the ones it has do not always have every prop (there is no
 * `defaultChecked` on `UioSwitch` — `model()` makes the fork unnecessary). An
 * arg that is not an input renders as an ordinary HTML attribute: no error, no
 * warning, no effect. Reading the real inputs is what keeps a derived sample
 * from carrying one.
 *
 * A class with no inputs maps to an empty array; a class the sources never
 * declared is absent, which callers read as "don't filter" rather than "has no
 * props".
 */
export function parseAngularInputs(sources: Iterable<string>): Record<string, string[]> {
  return parseAngularMembers(sources, /readonly\s+(\w+)\s*=\s*(?:input|model)\b/g);
}

/**
 * The outputs each Angular class declares — `(checkedChange)`, where React and
 * Svelte take an `onCheckedChange` callback prop. Same keying as
 * {@link parseAngularInputs}.
 */
export function parseAngularOutputs(sources: Iterable<string>): Record<string, string[]> {
  return parseAngularMembers(sources, /readonly\s+(\w+)\s*=\s*output\b/g);
}

/**
 * The `model()` members — inputs that also bind two-way, `[(checked)]`. A
 * subset of {@link parseAngularInputs}, listed separately because the binding
 * syntax differs.
 */
export function parseAngularModels(sources: Iterable<string>): Record<string, string[]> {
  return parseAngularMembers(sources, /readonly\s+(\w+)\s*=\s*model\b/g);
}

/**
 * Members are collected per class and then inherited: `UioDateInput` declares
 * none of its own — `label`, `min`, `required` and the rest live on the abstract
 * `UioDateFieldBase` it extends, in another file — and reading only the class
 * body reported every one of them as a prop Angular hasn't got.
 */
function parseAngularMembers(
  sources: Iterable<string>,
  declared: RegExp,
): Record<string, string[]> {
  const own: Record<string, string[]> = {};
  const parents: Record<string, string> = {};

  for (const source of sources) {
    const classes = /export\s+(?:abstract\s+)?class\s+(\w+)(?:<[^{]*?>)?(?:\s+extends\s+(\w+))?/g;
    const bounds: Array<{ name: string; at: number }> = [];
    for (let m = classes.exec(source); m; m = classes.exec(source)) {
      bounds.push({ name: m[1]!, at: m.index });
      own[m[1]!] ??= [];
      if (m[2]) parents[m[1]!] = m[2];
    }
    if (!bounds.length) continue;

    declared.lastIndex = 0;
    for (let m = declared.exec(source); m; m = declared.exec(source)) {
      const owner = [...bounds].reverse().find((b) => b.at < m!.index);
      if (!owner) continue;
      // The template name is the alias when there is one: `ariaLabel` is written
      // `aria-label`, and `disabledInput` is written `disabled`.
      const end = source.indexOf(";", m.index);
      const decl = source.slice(m.index, end === -1 ? undefined : end);
      const alias = /alias:\s*["']([^"']+)["']/.exec(decl);
      own[owner.name]!.push(alias ? alias[1]! : m[1]!);
    }
  }

  const inherited = (name: string, seen: Set<string>): string[] => {
    const parent = parents[name];
    if (!parent || seen.has(parent) || !own[parent]) return own[name] ?? [];
    seen.add(parent);
    return [...new Set([...inherited(parent, seen), ...own[name]!])];
  };
  return Object.fromEntries(
    Object.keys(own).map((name) => [name, inherited(name, new Set([name]))]),
  );
}

/**
 * A framework's surface from the raw text of its source files — the one place
 * the docs site (Vite `?raw` globs) and the static spec generator (`fs`) both
 * build it, so the two cannot disagree about what a library ships.
 *
 * `table` is the data table's own package: its symbols are part of the surface
 * but import from that package, not the library.
 */
export function surfaceFromSources(
  framework: Exclude<DocFramework, "react">,
  sources: {
    barrels: string[];
    table?: { packageName: string; barrels: string[] };
    /** Angular only: every directive source, for selectors, inputs and outputs. */
    angularSources?: string[];
  },
): FrameworkSurface {
  const tableExports = (sources.table?.barrels ?? []).flatMap(parseBarrelExports);
  const surface: FrameworkSurface = {
    exports: [...sources.barrels.flatMap(parseBarrelExports), ...tableExports],
    ...(sources.table && tableExports.length
      ? {
          packages: Object.fromEntries(
            tableExports.map((symbol) => [symbol, sources.table!.packageName]),
          ),
        }
      : {}),
  };
  if (framework === "angular") {
    const all = sources.angularSources ?? [];
    surface.selectors = parseAngularSelectors(all);
    surface.inputs = parseAngularInputs(all);
    surface.outputs = parseAngularOutputs(all);
    surface.models = parseAngularModels(all);
  }
  return surface;
}

// ─── Resolving a component into a framework ──────────────────────────────────

/** What one framework needs to know to render a sample for one component. */
export interface FrameworkTarget {
  framework: DocFramework;
  /** Symbol to import, e.g. `Button` or `UioButton`. */
  symbol: string;
  /** Angular only — from {@link parseAngularSelectors}. */
  selector?: AngularSelector;
  /**
   * Props this framework's component really accepts. Present only where the
   * package's source makes them readable (Angular); absent means "don't filter",
   * not "takes nothing".
   */
  inputs?: readonly string[];
  /**
   * Package the symbol is imported from, when it isn't the library's own — the
   * data table lives in `@ui-organized/<framework>-table`. Absent means
   * {@link FRAMEWORK_INFO}'s `packageName`.
   */
  packageName?: string;
  /** Angular only — from {@link parseAngularOutputs}. */
  outputs?: readonly string[];
  /** Angular only — from {@link parseAngularModels}. */
  models?: readonly string[];
}

/** What a framework package publishes, as read from its own source. */
export interface FrameworkSurface {
  exports: readonly string[];
  /** Angular only. */
  selectors?: Record<string, AngularSelector>;
  /** Angular only — from {@link parseAngularInputs}. */
  inputs?: Record<string, readonly string[]>;
  /**
   * Symbols exported by a package other than the library itself, mapped to that
   * package. A surface is a union of barrels, so without this every symbol
   * would be imported from the library and the table samples would not resolve.
   */
  packages?: Record<string, string>;
  /** Angular only — from {@link parseAngularOutputs}. */
  outputs?: Record<string, readonly string[]>;
  /** Angular only — from {@link parseAngularModels}. */
  models?: Record<string, readonly string[]>;
}

/**
 * Angular prefixes every export, so `Button` is `UioButton`. Svelte and Vue use
 * the React name unchanged, which is what makes coverage a plain set lookup.
 */
export function frameworkSymbol(framework: DocFramework, codeName: string): string {
  return framework === "angular" ? `Uio${codeName}` : codeName;
}

/**
 * The handful of components Angular spells differently. Neither of these is a
 * missing component, and both used to read as one on the docs site.
 *
 * `ToastProvider` has no Angular counterpart by design: the provider is a
 * root-injected service, and the thing a template writes is the region.
 */
const ANGULAR_ALIASES: Record<string, string> = {
  UioToastProvider: "UioToastRegion",
};

/**
 * The name Angular actually exports for a symbol, or `undefined` when it ships
 * no such thing.
 *
 * The case-insensitive pass exists for exactly one class of mismatch: Angular's
 * style guide capitalises an initialism as a word, so `QRCode` is `UioQrCode`.
 * A fold that matches is the same export under a different convention — treating
 * it as absent printed "not available in Angular" over a component that ships
 * and is compared against React by the parity gate on every run.
 */
function angularExport(symbol: string, exports: readonly string[]): string | undefined {
  if (exports.includes(symbol)) return symbol;
  const alias = ANGULAR_ALIASES[symbol];
  if (alias && exports.includes(alias)) return alias;
  const folded = symbol.toLowerCase();
  return exports.find((name) => name.toLowerCase() === folded);
}

/**
 * The target for a component, or `undefined` when the framework does not ship
 * it. Never falls back to another framework: a page that says "not available in
 * Angular" is right, and a React sample under an Angular heading is a bug
 * report waiting to happen.
 */
export function resolveTarget(
  framework: DocFramework,
  codeName: string,
  surface: FrameworkSurface,
): FrameworkTarget | undefined {
  const wanted = frameworkSymbol(framework, codeName);
  const symbol =
    framework === "angular"
      ? angularExport(wanted, surface.exports)
      : surface.exports.includes(wanted)
        ? wanted
        : undefined;
  if (!symbol) return undefined;

  const selector = surface.selectors?.[symbol];
  // A class with no selector is a service, a context or a token — something a
  // template never writes — so there is no sample to generate for it.
  if (framework === "angular" && !selector) return undefined;

  const inputs = surface.inputs?.[symbol];
  const packageName = surface.packages?.[symbol];
  const outputs = surface.outputs?.[symbol];
  const models = surface.models?.[symbol];
  return {
    framework,
    symbol,
    ...(selector ? { selector } : {}),
    ...(inputs ? { inputs } : {}),
    ...(packageName ? { packageName } : {}),
    ...(outputs ? { outputs } : {}),
    ...(models ? { models } : {}),
  };
}

/**
 * Args the target's component does not accept, in the order they were given.
 *
 * `frameworkUsage()` drops these rather than emitting an inert attribute, which
 * makes the sample thinner than the example above it. Callers ask this first so
 * they can decline to show a sample at all and name the missing prop — "Checked"
 * above a switch that isn't is worse than no snippet.
 */
export function unsupportedArgs(
  target: FrameworkTarget,
  args: Record<string, unknown>,
  propOrder: string[] = [],
): string[] {
  if (!target.inputs) return [];
  // Compared under the name the framework's template uses — `className` is
  // `class`, and that is what the input list carries.
  return normalizeArgs(args, propOrder)
    .attrs.map((attr) => attr.name)
    .filter((name) => !target.inputs!.includes(propName(target, name)));
}

// ─── Prop names ──────────────────────────────────────────────────────────────

/**
 * Vue reserves `style`, so `IconProvider`'s outline/solid prop is `iconStyle`
 * there (`icon-style` in a template). A `style="solid"` reaches the component as
 * a parsed style *object*, which is truthy, is not `"solid"`, and produces
 * outline icons with no error anywhere — see the note in
 * `packages/vue/src/context/IconProvider.vue`. Nothing about that is derivable
 * from the React manifest, so it is written down; it is the only such rename,
 * and a second one belongs here rather than in a renderer.
 */
const VUE_PROP_RENAMES: Record<string, Record<string, string>> = {
  IconProvider: { style: "iconStyle" },
};

function kebabProp(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * React's uncontrolled `defaultValue`, in Angular, when the component has no such
 * input but has a `value` model. A one-way `value="…"` into a `model()` seeds it
 * and the component goes on writing its own signal — React's `defaultValue`
 * exactly, which is why Angular never grew the fork (`defaultChecked` → `checked`,
 * `defaultOpen` → `open`, …).
 */
function angularModelFor(target: FrameworkTarget, name: string): string | undefined {
  const m = /^default([A-Z]\w*)$/.exec(name);
  if (!m || !target.models || target.inputs?.includes(name)) return undefined;
  const model = m[1]!.charAt(0).toLowerCase() + m[1]!.slice(1);
  return target.models.includes(model) ? model : undefined;
}

/** React's `className` is `class` everywhere else. */
function propName(target: FrameworkTarget, name: string): string {
  if (target.framework === "react") return name;
  if (target.framework === "angular") {
    const model = angularModelFor(target, name);
    if (model) return model;
  }
  const renamed = target.framework === "vue" ? VUE_PROP_RENAMES[target.symbol]?.[name] : undefined;
  const base = renamed ?? (name === "className" ? "class" : name);
  // Vue's own style guide writes props kebab-cased in templates; the compiler
  // accepts either, so this is convention rather than correctness.
  return target.framework === "vue" ? kebabProp(base) : base;
}

// ─── Attributes, per dialect ─────────────────────────────────────────────────

/** Escape a value that goes inside a double-quoted HTML attribute. */
function htmlAttrValue(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/\n/g, "&#10;");
}

function svelteAttr(name: string, value: unknown): string {
  if (value === true) return name; // Svelte reads a valueless attribute as `true`
  if (typeof value === "number") return `${name}={${value}}`;
  if (typeof value === "string") {
    return value.includes('"') || value.includes("\n")
      ? `${name}={${JSON.stringify(value)}}`
      : `${name}="${value}"`;
  }
  return `${name}={${jsValue(value)}}`;
}

function vueAttr(name: string, value: unknown): string {
  // `:prop="true"` rather than a bare attribute: a valueless attribute reaches a
  // Vue component as `""`, and whether that becomes `true` depends on the prop
  // being declared Boolean. Binding the literal is true regardless.
  if (typeof value === "string") return `${name}="${htmlAttrValue(value)}"`;
  if (value === true || typeof value === "number") return `:${name}="${value}"`;
  return `:${name}="${jsValue(value)}"`;
}

function angularAttr(name: string, value: unknown): string {
  if (typeof value === "string") return `${name}="${htmlAttrValue(value)}"`;
  if (value === true || typeof value === "number") return `[${name}]="${value}"`;
  return `[${name}]="${jsValue(value)}"`;
}

function attrFor(target: FrameworkTarget, attr: MarkupAttr): string {
  const name = propName(target, attr.name);
  switch (target.framework) {
    case "svelte":
      return svelteAttr(name, attr.value);
    case "vue":
      return vueAttr(name, attr.value);
    case "angular":
      return angularAttr(name, attr.value);
    case "react":
      return jsxAttr({ name, value: attr.value });
  }
}

// ─── Usage ───────────────────────────────────────────────────────────────────

const HANDLER_NOTE = "+ your own event handlers";

/**
 * The markup for one instance — no imports, no file scaffolding.
 *
 * Use {@link frameworkSample} for something copyable; this is the part that goes
 * inside a template.
 */
export function frameworkUsage(
  target: FrameworkTarget,
  args: Record<string, unknown>,
  propOrder: string[] = [],
): string {
  const { attrs, text, slotLabel, omittedHandlers } = normalizeArgs(args, propOrder);
  const angular = target.framework === "angular";
  const react = target.framework === "react";

  // "content" rather than the React-flavored "ReactNode": a Svelte reader has no
  // ReactNode. React keeps its own wording, so this function and `jsxFromArgs()`
  // stay byte-identical for `react` — the invariant that keeps the React docs
  // unchanged by the switcher.
  const slot = react ? slotLabel : slotLabel === "ReactNode" ? "content" : slotLabel;
  const children = text ?? (slot ? (react ? `{/* ${slot} */}` : `<!-- ${slot} -->`) : undefined);

  // An arg the component does not declare would render as an ordinary HTML
  // attribute — inert, and silent about it. Better a thinner sample than one
  // carrying a prop that does nothing; `unsupportedArgs()` is how the drift gets
  // noticed.
  const supported = target.inputs
    ? attrs.filter((attr) => target.inputs!.includes(propName(target, attr.name)))
    : attrs;
  const formatted = supported.map((attr) => attrFor(target, attr));

  const angularAttribute = angular ? target.selector!.attribute : undefined;
  const markup = layoutElement({
    tag: angular ? target.selector!.element : target.symbol,
    // The directive attribute leads, so the element reads as "a button that is a
    // uioButton" rather than the attribute being lost among the props. A
    // component with an element selector has none — `<uio-dialog>` is already
    // named by its tag.
    attrs: angular && angularAttribute ? [angularAttribute, ...formatted] : formatted,
    children,
    // An Angular directive sits on a real HTML element, and `<span uioTag />` is
    // parsed as an unclosed `<span>` that swallows the rest of the template.
    selfClose: !angular,
  });

  if (!omittedHandlers) return markup;
  return target.framework === "react"
    ? `${markup}\n// ${HANDLER_NOTE}`
    : `${markup}\n<!-- ${HANDLER_NOTE} -->`;
}

// ─── Complete samples ────────────────────────────────────────────────────────

export function importStatement(
  framework: DocFramework,
  symbols: string[],
  packageName: string = FRAMEWORK_INFO[framework].packageName,
): string {
  return `import { ${symbols.join(", ")} } from "${packageName}";`;
}

function indent(text: string, pad: string): string {
  return text
    .split("\n")
    .map((line) => (line ? `${pad}${line}` : line))
    .join("\n");
}

export interface FrameworkSampleOptions {
  /**
   * Overrides the derived import line. The React docs use the manifest's own
   * `importStatement`, which is scanned from the real export rather than
   * assembled from a package name.
   */
  importStatement?: string;
  /** Extra symbols on the import line, e.g. a compound component's parts. */
  extraSymbols?: string[];
}

/**
 * A complete, copyable sample: the import plus the usage, in the file shape that
 * framework actually uses.
 *
 * Complete is the point — a Svelte snippet with no `<script>` block leaves the
 * reader to work out where the import goes, and an Angular template fragment
 * with no `imports: []` array leaves them with a directive that silently does
 * nothing.
 */
export function frameworkSample(
  target: FrameworkTarget,
  args: Record<string, unknown>,
  propOrder: string[] = [],
  options: FrameworkSampleOptions = {},
): string {
  const usage = frameworkUsage(target, args, propOrder);
  const symbols = [target.symbol, ...(options.extraSymbols ?? [])];
  const line =
    options.importStatement ?? importStatement(target.framework, symbols, target.packageName);

  switch (target.framework) {
    case "react":
      return `${line}\n\n${usage}`;

    case "svelte":
      return `<script lang="ts">\n  ${line}\n</script>\n\n${usage}`;

    case "vue":
      return `<script setup lang="ts">\n${line}\n</script>\n\n<template>\n${indent(usage, "  ")}\n</template>`;

    case "angular":
      return [
        `import { Component } from "@angular/core";`,
        line,
        "",
        "@Component({",
        `  selector: "app-example",`,
        `  imports: [${symbols.join(", ")}],`,
        "  template: `",
        indent(usage, "    "),
        "  `,",
        "})",
        "export class ExampleComponent {}",
      ].join("\n");
  }
}

// ─── AI specs ────────────────────────────────────────────────────────────────

/**
 * The once-per-app imports an AI spec lists, in the order Get started documents
 * and the release smoke apps (`examples/*-table-smoke`) build with. `table`
 * adds the data table's stylesheet, which is separate in every library.
 *
 * Only React's packages ship type declarations for the bare `/styles` subpath.
 * TypeScript 6 checks side-effect imports, so `svelte-check` and `vue-tsc`
 * reject `@ui-organized/vue/styles` in a fresh app: the other three get the
 * `.css` spelling, as Get started tells their readers.
 */
export function setupImportsFor(
  framework: DocFramework,
  options: { table?: boolean } = {},
): string[] {
  const pkg = FRAMEWORK_INFO[framework].packageName;
  const styles = framework === "react" ? "styles" : "styles.css";
  const table = options.table ? [`${pkg}-table/${styles}`] : [];
  // Registers the icon set. Omit it and every icon renders nothing — no
  // library imports an icon package itself.
  const icons = `${pkg}/icons/lucide`;
  if (framework === "angular") {
    return [
      "@ui-organized/tokens/variables.css",
      "@angular/cdk/overlay-prebuilt.css",
      `${pkg}/styles.css`,
      `${pkg}/overlay.css`,
      ...table,
      icons,
    ];
  }
  return ["@ui-organized/tokens/variables.css", `${pkg}/${styles}`, ...table, icons];
}

/**
 * Where a component's published spec lives, relative to the site origin. React
 * keeps the original `/ai/<Component>.md` so links already shared still
 * resolve; the other libraries sit one level down.
 */
export function aiSpecPath(framework: DocFramework, codeName: string): string {
  return framework === "react" ? `/ai/${codeName}.md` : `/ai/${framework}/${codeName}.md`;
}

/**
 * Where a library's component index lives, relative to the site origin. React
 * keeps the original `/llms.txt`; each other library has its own, listing its
 * own symbols. Every spec, Copy for AI and the agent rules point here, so one
 * helper keeps a Vue spec from sending its reader to React's index.
 */
export function aiIndexPath(framework: DocFramework): string {
  return framework === "react" ? "/llms.txt" : `/llms-${framework}.txt`;
}
