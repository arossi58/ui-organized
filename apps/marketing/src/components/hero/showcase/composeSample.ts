/**
 * Page-sized code samples for the hero mockup's Code view, in all four
 * frameworks, from one description of the page.
 *
 * Nothing here is hand-written per framework. Every component element is
 * printed by code-connect's `frameworkUsage()` against the target `targetFor()`
 * resolves from the package's own barrel — the same path the docs site's
 * framework switcher takes — so an Angular selector or a Vue prop spelling is
 * read from the package, never typed from memory. This module only adds what a
 * single-instance sample has no need for: nesting, plain layout elements,
 * bindings to script values, and the file shape around the markup.
 *
 * A prop a framework's component does not declare is dropped by
 * `frameworkUsage()`. Rather than let that happen silently, the dropped props
 * are collected and named in a comment at the top of the sample.
 */

import {
  FRAMEWORK_INFO,
  frameworkUsage,
  unsupportedArgs,
  type DocFramework,
} from "@ui-organized/code-connect/browser";
import { targetFor } from "../../../docs/frameworks/surfaces";

export type CodeChild = CodeNode | string;

export type CodeNode =
  /** A design-system component, by its React code name. */
  | { component: string; args?: Record<string, unknown>; children?: CodeChild[] }
  /** A plain layout element. */
  | { element: string; className?: string; children?: CodeChild[] }
  /**
   * Markup for frameworks whose API has a different *shape* than one element
   * per component — Angular's menu is a trigger plus a separate `<uio-menu>`
   * joined by a template reference, which no nesting of single elements can
   * say. `uses` are React code names, each still resolved against the
   * framework's real exports for its import line. Frameworks without a
   * variant render `fallback`.
   */
  | {
      variants: Partial<Record<DocFramework, { markup: string; uses: string[] }>>;
      fallback: CodeChild;
    };

/**
 * A prop bound to a value from the script block rather than written inline.
 * `expr` is what React, Svelte and Vue reference; Angular templates can only
 * reach class members, so it binds `field`, initialised with `angularInit`.
 */
export interface Binding {
  expr: string;
  field: string;
  angularInit: string;
}

export interface PageSpec {
  /** Component name for the React function and the Angular class. */
  name: string;
  /** Module-level declarations, the same TypeScript in every framework. */
  script?: string;
  bindings?: Record<string, Binding>;
  root: CodeNode;
}

export interface ComposedSample {
  code: string;
  language: string;
}

/** Marks an arg as a binding; resolved per framework once the markup is printed. */
export function bind(key: string): string {
  return `@@bind:${key}@@`;
}

const BINDING = /([\w:-]+)="@@bind:(\w+)@@"/g;

const TABLE_PACKAGES = new Set(["DataTable"]);

function packageFor(framework: DocFramework, component: string): string {
  const base = FRAMEWORK_INFO[framework].packageName;
  return TABLE_PACKAGES.has(component) ? `${base}-table` : base;
}

function indent(text: string, pad: string): string {
  return text
    .split("\n")
    .map((line) => (line ? `${pad}${line}` : line))
    .join("\n");
}

interface WalkState {
  framework: DocFramework;
  /** package → symbols, in first-use order. */
  imports: Map<string, string[]>;
  /** Props a component here does not declare, e.g. `UioSelect.placeholder`. */
  dropped: string[];
}

function addImport(framework: DocFramework, component: string, symbol: string, state: WalkState) {
  const pkg = packageFor(framework, component);
  const symbols = state.imports.get(pkg) ?? [];
  if (!symbols.includes(symbol)) symbols.push(symbol);
  state.imports.set(pkg, symbols);
}

/** Import a component a variant's markup uses, or note that it's missing. */
function importFor(component: string, state: WalkState) {
  const target = targetFor(state.framework, component);
  if (target) addImport(state.framework, component, target.symbol, state);
  else state.dropped.push(component);
}

function renderChildren(children: CodeChild[] | undefined, state: WalkState): string | undefined {
  if (!children?.length) return undefined;
  return children.map((child) => render(child, state)).join("\n");
}

function render(node: CodeChild, state: WalkState): string {
  if (typeof node === "string") return node;
  const { framework } = state;

  if ("variants" in node) {
    const variant = node.variants[framework];
    if (!variant) return render(node.fallback, state);
    for (const component of variant.uses) importFor(component, state);
    return variant.markup;
  }

  if ("element" in node) {
    const classAttr = node.className
      ? ` ${framework === "react" ? "className" : "class"}="${node.className}"`
      : "";
    const inner = renderChildren(node.children, state);
    return inner === undefined
      ? `<${node.element}${classAttr}></${node.element}>`
      : `<${node.element}${classAttr}>\n${indent(inner, "  ")}\n</${node.element}>`;
  }

  const target = targetFor(framework, node.component);
  if (!target) {
    // The page asks for a component this framework doesn't ship. Say so in
    // place rather than printing another framework's element.
    const note = `${node.component} is not available in ${FRAMEWORK_INFO[framework].label}`;
    return framework === "react" ? `{/* ${note} */}` : `<!-- ${note} -->`;
  }

  addImport(framework, node.component, target.symbol, state);

  const args = node.args ?? {};
  for (const prop of unsupportedArgs(target, args)) {
    state.dropped.push(`${target.symbol}.${prop}`);
  }

  const inner = renderChildren(node.children, state);
  return frameworkUsage(target, inner === undefined ? args : { ...args, children: inner });
}

function resolveBindings(
  markup: string,
  framework: DocFramework,
  bindings: Record<string, Binding>,
): string {
  return markup.replace(BINDING, (_match, attr: string, key: string) => {
    const binding = bindings[key];
    if (!binding) throw new Error(`composeSample: no binding named "${key}"`);
    switch (framework) {
      case "react":
      case "svelte":
        return `${attr}={${binding.expr}}`;
      case "vue":
        return `:${attr}="${binding.expr}"`;
      case "angular":
        return `[${attr}]="${binding.field}"`;
    }
  });
}

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function composeSample(spec: PageSpec, framework: DocFramework): ComposedSample {
  const state: WalkState = { framework, imports: new Map(), dropped: [] };
  const bindings = spec.bindings ?? {};
  const markup = resolveBindings(render(spec.root, state), framework, bindings);

  const importLines = [...state.imports].map(
    ([pkg, symbols]) => `import { ${symbols.join(", ")} } from "${pkg}";`,
  );
  const header = [...importLines, ...(spec.script ? ["", spec.script] : [])].join("\n");
  const language = FRAMEWORK_INFO[framework].language;
  const droppedNote = state.dropped.length
    ? `Not yet in ${FRAMEWORK_INFO[framework].packageName}: ${state.dropped.join(", ")}`
    : undefined;

  switch (framework) {
    case "react": {
      const code = [
        ...(droppedNote ? [`// ${droppedNote}`] : []),
        header,
        "",
        `export function ${spec.name}() {`,
        "  return (",
        indent(markup, "    "),
        "  );",
        "}",
      ].join("\n");
      return { code, language };
    }

    case "svelte": {
      const code = [
        ...(droppedNote ? [`<!-- ${droppedNote} -->`] : []),
        `<script lang="ts">`,
        indent(header, "  "),
        "</script>",
        "",
        markup,
      ].join("\n");
      return { code, language };
    }

    case "vue": {
      const code = [
        ...(droppedNote ? [`<!-- ${droppedNote} -->`] : []),
        `<script setup lang="ts">`,
        header,
        "</script>",
        "",
        "<template>",
        indent(markup, "  "),
        "</template>",
      ].join("\n");
      return { code, language };
    }

    case "angular": {
      const symbols = [...state.imports.values()].flat();
      const fields = Object.values(bindings)
        .filter((binding) => markup.includes(`"${binding.field}"`))
        .map((binding) => `  protected readonly ${binding.field} = ${binding.angularInit};`);
      const code = [
        ...(droppedNote ? [`// ${droppedNote}`] : []),
        `import { Component } from "@angular/core";`,
        header,
        "",
        "@Component({",
        `  selector: "app-${kebab(spec.name)}",`,
        `  imports: [${symbols.join(", ")}],`,
        "  template: `",
        indent(markup, "    "),
        "  `,",
        "})",
        `export class ${spec.name}Component {${fields.length ? `\n${fields.join("\n")}\n` : ""}}`,
      ].join("\n");
      return { code, language };
    }
  }
}
