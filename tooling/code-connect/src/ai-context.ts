/**
 * "Copy for AI" — turns a verified manifest entry into a block a coding agent
 * cannot get wrong (Connect.md §6.4).
 *
 * Pure and browser-safe, for the same reason `serialize-core.ts` is: the native
 * docs site, the Storybook addon, and the static `/ai/<Component>.md` generator
 * all render context for the same component, and if any two of them disagreed an
 * agent's output would depend on which surface the human happened to copy from.
 * One implementation, three callers, no daylight.
 *
 * Determinism is a hard requirement — `generatedAt` is caller-supplied and this
 * module never reads a clock, so the golden test snapshot is stable and the
 * static generator produces byte-identical files across runs.
 *
 * Every function here is total: malformed input degrades the output, it never
 * throws. A copy button that explodes is worse than one that copies a thin block.
 */

import type {
  ComponentManifestEntry,
  Confidence,
  PropDefinition,
  Staleness,
} from "./schema.js";
import { parseEnumValues } from "./controls-core.js";
import { contextForEntry } from "./serialize-core.js";
import { usageReferenceName } from "./usage/index.js";
import type { UsageGuide } from "./usage/types.js";
import {
  CLOSING_RULE,
  COMPOUND_SCOPE_NOTE,
  PASSTHROUGH_NOTE,
  derivePropHints,
  globalRules,
} from "./ai-context-rules.js";

// ─── Public contract ─────────────────────────────────────────────────────────

/** Output flavors the copy button offers. */
export type AiContextFormat = "markdown" | "jsx" | "prompt-url";

export interface AiContextExample {
  /** Story export name, e.g. `AllIntents`. */
  name: string;
  /** Human caption; derived from `name` when absent. */
  label?: string;
  code: string;
  /** Provenance — we never present a fabricated example as a verified one. */
  source: "story-source-param" | "manifest-usage" | "live-args";
}

export interface AiContextMeta {
  packageName?: string;
  packageVersion?: string;
  /** Side-effect imports an app needs once, e.g. `@ui-organized/react/styles`. */
  setupImports?: string[];
  /** Deep link to the story or docs page the human is looking at. */
  storybookUrl?: string;
  /** Canonical fetchable spec, e.g. `https://uiorganized.com/ai/Button.md`. */
  docUrl?: string;
  /** Human docs page, e.g. `https://uiorganized.com/docs/button`. */
  siteUrl?: string;
  /** Index of every component, e.g. `https://uiorganized.com/llms.txt`. */
  indexUrl?: string;
  componentCount?: number;
  /** ISO string. Never read from a clock here — pass it in. */
  generatedAt?: string;
}

export interface AiContextInput {
  entry: ComponentManifestEntry;
  /** Compound siblings — entries sharing `entry.codePath`. */
  related?: ComponentManifestEntry[];
  /** From `computeStalenessCore()`. Omitted ⇒ no staleness claim is made. */
  staleness?: Staleness;
  /** How the entry was resolved. Defaults to `"exact"`. */
  confidence?: Confidence;
  /** Explains a non-exact resolution, e.g. `"name similarity 0.56"`. */
  resolutionNote?: string;
  /** Prose from the story meta's `docs.description.component`. */
  description?: string;
  /**
   * Hand-authored guidance from `src/usage/` — when to reach for the component
   * and, more usefully, when not to.
   *
   * The one part of the payload that isn't derivable from the code: a prop table
   * can say a Meter takes a `value`, and nothing in the type signature can say
   * that a task in flight wants a Progress instead.
   */
  usage?: UsageGuide;
  /** Real examples, best first. Falls back to `entry.usageSnippet`. */
  examples?: AiContextExample[];
  /** Current control values → the "current state" JSX. */
  liveArgs?: Record<string, unknown>;
  /** Named-alias expansions, e.g. `{ CanonicalIconName: ["plus", …] }`. */
  typeValues?: Record<string, string[]>;
  meta?: AiContextMeta;
}

export interface AiContextProp {
  name: string;
  type: string;
  /** Expanded members when the type is a closed set. */
  values?: string[];
  required: boolean;
  defaultValue?: string;
  description?: string;
}

/** Machine-readable mirror of the Markdown. */
export interface AiContextData {
  component: string;
  package: string;
  version?: string;
  importStatement: string;
  /** Merged import for a compound family. */
  compositionImport?: string;
  description?: string;
  usage?: UsageGuide;
  props: AiContextProp[];
  subcomponents?: Array<{ name: string; props: AiContextProp[] }>;
  passthrough: string;
  customInstructions?: string;
  currentJsx?: string;
  examples: AiContextExample[];
  rules: string[];
  /** Stale / deprecated / non-exact confidence. Empty when everything is clean. */
  warnings: string[];
  provenance: Record<string, string>;
}

export interface AiContextResult {
  text: string;
  format: AiContextFormat;
  /** chars/4 heuristic — powers the "≈1.4k tokens" hint in the UI. */
  approxTokens: number;
  data: AiContextData;
}

// ─── Small pure helpers ──────────────────────────────────────────────────────

/** `import { Button } from '@ui-organized/react';` → `@ui-organized/react`. */
export function packageFromImport(importStatement: string): string {
  const m = /from\s+['"]([^'"]+)['"]/.exec(importStatement);
  return m?.[1] ?? "@ui-organized/react";
}

/** `"AllIntents"` → `"All intents"`. Purely cosmetic captioning. */
export function humanizeLabel(name: string): string {
  const spaced = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();
  if (!spaced) return name;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/** Deterministic JSON — sorted keys, React elements and functions elided. */
function stableJson(value: unknown): string {
  try {
    return JSON.stringify(sortDeep(value)) ?? "undefined";
  } catch {
    return "/* value */";
  }
}

function sortDeep(value: unknown, depth = 0): unknown {
  if (depth > 8) return "/* … */";
  if (Array.isArray(value)) return value.map((v) => sortDeep(v, depth + 1));
  if (value && typeof value === "object") {
    // React elements are circular and meaningless as JSON.
    if ("$$typeof" in (value as Record<string, unknown>)) return "/* ReactNode */";
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      if (typeof obj[key] === "function") continue;
      out[key] = sortDeep(obj[key], depth + 1);
    }
    return out;
  }
  if (typeof value === "function") return undefined;
  return value;
}

/** A short stand-in for a value that can't be written literally in JSX. */
function valueLabel(value: unknown): string {
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object" && "$$typeof" in (value as object)) return "ReactNode";
  return typeof value;
}

/** Markdown table cells can't contain a raw pipe or a line break. */
function cell(text: string): string {
  return text.replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();
}

function code(text: string): string {
  return `\`${text}\``;
}

// ─── Prop types ──────────────────────────────────────────────────────────────

/**
 * Resolve a prop's type text into its legal values where the type is a closed
 * set — inline string-literal unions directly, named aliases via `typeValues`.
 *
 * This is the single highest-value transform in the payload: `icon?:
 * CanonicalIconName` tells an agent nothing, while the same prop with its 61
 * members listed tells it everything.
 */
export function expandPropType(
  prop: PropDefinition,
  typeValues?: Record<string, string[]>,
): { type: string; values?: string[] } {
  const inline = parseEnumValues(prop.type);
  if (inline) return { type: prop.type, values: inline };

  const named = typeValues?.[prop.type.trim()];
  if (named?.length) return { type: prop.type, values: [...named] };

  return { type: prop.type };
}

function toContextProp(
  prop: PropDefinition,
  typeValues?: Record<string, string[]>,
): AiContextProp {
  const { values } = expandPropType(prop, typeValues);
  return {
    name: prop.name,
    type: prop.type,
    ...(values ? { values } : {}),
    required: prop.required,
    ...(prop.defaultValue ? { defaultValue: prop.defaultValue } : {}),
    ...(prop.description ? { description: prop.description } : {}),
  };
}

// ─── JSX rendering ───────────────────────────────────────────────────────────

const ONE_LINE_LIMIT = 78;

/**
 * Concrete JSX for a set of arg values — the "copy what I'm looking at" output.
 *
 * Deliberate omissions: `false` and `undefined` props (writing `disabled={false}`
 * teaches nothing), and function args. An emitted `onClick={() => {}}` reads as
 * part of the component's canonical usage and gets copied verbatim into real
 * code as a no-op handler, so we leave a comment instead.
 *
 * `propOrder` (normally the manifest's prop order) makes the output stable across
 * callers whose arg objects were built in different orders.
 */
export function jsxFromArgs(
  codeName: string,
  args: Record<string, unknown>,
  propOrder: string[] = [],
): string {
  const rank = new Map(propOrder.map((name, i) => [name, i]));
  const names = Object.keys(args ?? {}).sort((a, b) => {
    const ra = rank.get(a) ?? Number.MAX_SAFE_INTEGER;
    const rb = rank.get(b) ?? Number.MAX_SAFE_INTEGER;
    return ra !== rb ? ra - rb : a.localeCompare(b);
  });

  const attrs: string[] = [];
  let children: string | undefined;
  let omittedHandlers = false;

  for (const name of names) {
    const value = args[name];

    if (name === "children") {
      if (typeof value === "string" && value.length > 0) children = value;
      else if (typeof value === "number") children = String(value);
      else if (value != null && typeof value !== "boolean") {
        children = `{/* ${valueLabel(value)} */}`;
      }
      continue;
    }
    if (typeof value === "function") {
      omittedHandlers = true;
      continue;
    }
    if (value === undefined || value === null || value === false) continue;
    if (value === true) {
      attrs.push(name);
      continue;
    }
    if (typeof value === "number") {
      attrs.push(`${name}={${value}}`);
      continue;
    }
    if (typeof value === "string") {
      attrs.push(
        value.includes('"') || value.includes("\n")
          ? `${name}={${JSON.stringify(value)}}`
          : `${name}="${value}"`,
      );
      continue;
    }
    attrs.push(`${name}={${stableJson(value)}}`);
  }

  const inlineAttrs = attrs.length ? ` ${attrs.join(" ")}` : "";
  const oneLine =
    children !== undefined
      ? `<${codeName}${inlineAttrs}>${children}</${codeName}>`
      : `<${codeName}${inlineAttrs} />`;

  let jsx: string;
  if (oneLine.length <= ONE_LINE_LIMIT && !oneLine.includes("\n")) {
    jsx = oneLine;
  } else if (attrs.length === 0) {
    jsx =
      children !== undefined
        ? `<${codeName}>\n  ${children.replace(/\n/g, "\n  ")}\n</${codeName}>`
        : `<${codeName} />`;
  } else {
    const block = attrs.map((a) => `  ${a}`).join("\n");
    jsx =
      children !== undefined
        ? `<${codeName}\n${block}\n>\n  ${children.replace(/\n/g, "\n  ")}\n</${codeName}>`
        : `<${codeName}\n${block}\n/>`;
  }

  return omittedHandlers ? `${jsx}\n// + your own event handlers` : jsx;
}

// ─── Assembly ────────────────────────────────────────────────────────────────

/** Long unions go in a fenced block under the table rather than in a cell. */
const INLINE_VALUE_LIMIT = 12;

function buildData(input: AiContextInput): AiContextData {
  const { entry, related = [], typeValues, meta = {} } = input;
  const packageName = meta.packageName ?? packageFromImport(entry.importStatement);
  const confidence = input.confidence ?? "exact";

  const props = entry.props.map((p) => toContextProp(p, typeValues));
  const subcomponents = related.map((r) => ({
    name: r.codeName,
    props: r.props.map((p) => toContextProp(p, typeValues)),
  }));

  const compositionImport = related.length
    ? `import { ${[entry.codeName, ...related.map((r) => r.codeName)].join(", ")} } from '${packageName}';`
    : undefined;

  // Reuse the MCP server's exact deprecated/stale wording so an agent reading a
  // pasted block and an agent calling the tool see the identical caveat.
  const warnings: string[] = [];
  const mcpWarning = contextForEntry(entry, input.staleness).warning;
  if (mcpWarning) warnings.push(mcpWarning);
  if (confidence !== "exact") {
    warnings.push(
      `This mapping was resolved with ${confidence} confidence` +
        (input.resolutionNote ? ` (${input.resolutionNote})` : "") +
        ". The props below may belong to a different component — verify before relying on them.",
    );
  }

  const hints = derivePropHints(entry);
  const rules = globalRules(packageName, hints);
  if (related.length) rules.push(COMPOUND_SCOPE_NOTE);

  const examples = input.examples?.length
    ? input.examples
    : entry.usageSnippet
      ? [{ name: "Usage", code: entry.usageSnippet, source: "manifest-usage" as const }]
      : [];

  const currentJsx = input.liveArgs
    ? jsxFromArgs(
        entry.codeName,
        input.liveArgs,
        entry.props.map((p) => p.name),
      )
    : undefined;

  const provenance: Record<string, string> = {
    package: meta.packageVersion ? `${packageName}@${meta.packageVersion}` : packageName,
    source: entry.codePath,
    confidence,
  };
  if (input.staleness) {
    provenance.props = input.staleness.isStale
      ? `CHANGED since ${entry.lastSyncedAt}`
      : `in sync with code (last scanned ${entry.lastSyncedAt})`;
  }
  if (meta.siteUrl) provenance.docs = meta.siteUrl;
  if (meta.storybookUrl) provenance.storybook = meta.storybookUrl;
  if (meta.docUrl) provenance.spec = meta.docUrl;
  if (meta.indexUrl) {
    provenance.allComponents = meta.componentCount
      ? `${meta.componentCount} components — ${meta.indexUrl}`
      : meta.indexUrl;
  }
  if (meta.generatedAt) provenance.generated = meta.generatedAt;

  return {
    component: entry.codeName,
    package: packageName,
    ...(meta.packageVersion ? { version: meta.packageVersion } : {}),
    importStatement: entry.importStatement,
    ...(compositionImport ? { compositionImport } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.usage ? { usage: input.usage } : {}),
    props,
    ...(subcomponents.length ? { subcomponents } : {}),
    passthrough: PASSTHROUGH_NOTE,
    ...(entry.customInstructions ? { customInstructions: entry.customInstructions } : {}),
    ...(currentJsx ? { currentJsx } : {}),
    examples,
    rules,
    warnings,
    provenance,
  };
}

// ─── Markdown ────────────────────────────────────────────────────────────────

function propTable(props: AiContextProp[]): { table: string; expansions: Map<string, string[]> } {
  const expansions = new Map<string, string[]>();
  const rows = props.map((p) => {
    // Plain pipes here — `cell()` owns the markdown escaping, and doing it in
    // both places yields a visible `\\|` in the rendered table.
    let allowed: string;
    if (p.values && p.values.length <= INLINE_VALUE_LIMIT) {
      allowed = p.values.map((v) => code(`"${v}"`)).join(" | ");
    } else if (p.values) {
      expansions.set(p.type, p.values);
      allowed = `${code(p.type)} — see below`;
    } else {
      allowed = code(p.type);
    }

    // Quote a default that is one of the prop's union members, so it reads as
    // the literal you'd actually type: `"left"`, not `left`.
    const shownDefault = p.defaultValue
      ? code(p.values?.includes(p.defaultValue) ? `"${p.defaultValue}"` : p.defaultValue)
      : "—";

    return `| ${code(p.name)} | ${cell(allowed)} | ${p.required ? "**yes**" : "no"} | ${shownDefault} | ${
      p.description ? cell(p.description) : "—"
    } |`;
  });

  const table = [
    "| Prop | Allowed values | Required | Default | Notes |",
    "| --- | --- | --- | --- | --- |",
    ...rows,
  ].join("\n");

  return { table, expansions };
}

/**
 * The hand-authored guidance, as Markdown blocks.
 *
 * Placed between "what it is" and the prop table on purpose: an agent that
 * reaches the props already knows whether this is the right component, which is
 * the failure the prop table can't prevent. "When not to use" leads with the
 * replacement so the correction is the first thing on the line.
 */
function usageSections(usage: UsageGuide): string[] {
  const out: string[] = [];

  out.push("## When to use");
  out.push(usage.useWhen.map((line) => `- ${line}`).join("\n"));

  out.push("## When NOT to use: pick a different component");
  out.push(
    usage.avoid
      .map(({ text, instead }) => {
        const names = instead?.map((slug) => code(usageReferenceName(slug))).join(" or ");
        return names ? `- ${text} Use ${names} instead.` : `- ${text}`;
      })
      .join("\n"),
  );

  out.push("## Usage rules");
  out.push(
    usage.guidance.map(({ do: yes, dont }) => `- ${yes} **Not:** ${dont}`).join("\n"),
  );

  out.push("## Accessibility obligations");
  out.push(usage.accessibility.map((line) => `- ${line}`).join("\n"));

  if (usage.content?.length) {
    out.push("## Writing the copy");
    out.push(usage.content.map((line) => `- ${line}`).join("\n"));
  }

  if (usage.related?.length) {
    out.push("## Related components");
    out.push(
      usage.related
        .map(({ slug, when }) => `- ${code(usageReferenceName(slug))}: when ${when}`)
        .join("\n"),
    );
  }

  return out;
}

function renderMarkdown(data: AiContextData, input: AiContextInput): string {
  const out: string[] = [];
  const { entry } = input;

  out.push(`# ${data.component} — ${data.package}`);
  out.push(
    "Verified context from the UI Organized design system, scanned directly from " +
      `\`${entry.codePath}\`. Everything below is generated from the component's real ` +
      "type signature — it is not a summary and not a guess.",
  );

  if (data.warnings.length) {
    out.push(data.warnings.map((w) => `> ⚠️ **${w}**`).join("\n>\n"));
  }

  out.push("## Rules — follow exactly");
  out.push(data.rules.map((r, i) => `${i + 1}. ${r}`).join("\n"));

  out.push("## Import");
  out.push(["```tsx", data.compositionImport ?? data.importStatement, "```"].join("\n"));
  if (input.meta?.setupImports?.length) {
    out.push("Once per app (already done in any existing UI Organized app):");
    out.push(
      ["```tsx", ...input.meta.setupImports.map((i) => `import '${i}';`), "```"].join("\n"),
    );
    // The icon subpath is the one setup line whose absence fails *silently*:
    // `@ui-organized/react` imports no icon library itself, so without it
    // `<Icon>` renders nothing at all. An agent that copies the block verbatim
    // would otherwise emit an app whose icons are simply missing.
    const iconImport = input.meta.setupImports.find((i) => i.includes("/icons/"));
    if (iconImport) {
      const library = iconImport.split("/").pop();
      out.push(
        `The \`icons/${library}\` line registers the icon set — \`@ui-organized/react\` imports no icon ` +
          `library itself, so without it every \`<Icon>\` renders nothing. Swap \`${library}\` for ` +
          `\`tabler\` or \`heroicons\` to match the project, and make sure the matching package is installed.`,
      );
    }
  }

  if (data.description) {
    out.push("## What it is");
    out.push(data.description);
  }

  if (data.usage) out.push(...usageSections(data.usage));

  if (data.subcomponents?.length) {
    out.push("## Composition — required");
    out.push(
      `\`${data.component}\` is a compound component: structure its content with the ` +
        "subcomponents below. There are no props on the root that flatten this " +
        "structure — if you want a header, use the header subcomponent.",
    );
    out.push(
      [
        "| Subcomponent | Own props |",
        "| --- | --- |",
        ...data.subcomponents.map(
          (s) =>
            `| ${code(s.name)} | ${
              s.props.length
                ? s.props.map((p) => code(p.name)).join(", ")
                : "*none — children plus standard element attributes*"
            } |`,
        ),
      ].join("\n"),
    );
  }

  const count = data.props.length;
  out.push(`## Props — complete (${count} own ${count === 1 ? "prop" : "props"})`);
  if (count === 0) {
    out.push(
      "This component declares no props of its own. It is driven entirely by its " +
        "children and the standard element attributes described below.",
    );
  } else {
    const { table, expansions } = propTable(data.props);
    out.push(table);
    for (const [typeName, values] of expansions) {
      out.push(
        `\`${typeName}\` is one of exactly these ${values.length} values — any other ` +
          "string is invalid:",
      );
      out.push(["```", wrapValues(values), "```"].join("\n"));
    }
  }
  out.push(data.passthrough);

  if (data.customInstructions) {
    out.push("## Component-specific rules");
    out.push(data.customInstructions);
  }

  if (data.currentJsx) {
    out.push("## Current state (what the human is looking at)");
    out.push(["```tsx", data.currentJsx, "```"].join("\n"));
  }

  if (data.examples.length) {
    out.push("## Verified examples");
    for (const ex of data.examples) {
      out.push(`**${ex.label ?? humanizeLabel(ex.name)}**`);
      out.push(["```tsx", ex.code, "```"].join("\n"));
    }
  }

  out.push("## Provenance");
  out.push(
    Object.entries(data.provenance)
      .map(([k, v]) => `- ${humanizeLabel(k)}: ${v}`)
      .join("\n"),
  );

  out.push(CLOSING_RULE);

  return `${out.join("\n\n")}\n`;
}

/** Fill to ~76 columns so a long value list stays readable in a chat window. */
function wrapValues(values: string[], width = 76): string {
  const lines: string[] = [];
  let line = "";
  for (const value of values) {
    if (line && `${line} ${value}`.length > width) {
      lines.push(line);
      line = value;
    } else {
      line = line ? `${line} ${value}` : value;
    }
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

function renderJsx(data: AiContextData, input: AiContextInput): string {
  if (data.currentJsx) return data.currentJsx;
  const first = data.examples[0];
  if (first) return first.code;
  return input.entry.usageSnippet || `<${data.component} />`;
}

/**
 * The cheapest correct format: point the agent at a URL it can fetch rather than
 * pasting 1,400 tokens that go stale the moment the component changes.
 */
function renderPromptUrl(data: AiContextData, input: AiContextInput): string {
  const url = input.meta?.docUrl ?? input.meta?.siteUrl;
  const lines = [
    `Use the \`${data.component}\` component from the UI Organized design system ` +
      `(\`${data.package}\`).`,
  ];
  if (url) {
    lines.push(
      `Its complete verified spec — exact import, every prop with its allowed ` +
        `values, and real usage examples — is at ${url}. Fetch it and follow it exactly.`,
    );
  } else {
    lines.push(`Import it with: ${data.compositionImport ?? data.importStatement}`);
  }
  lines.push("Do not invent props, imports, or CSS.");
  return `${lines.join("\n")}\n`;
}

/**
 * Build the context block for one component.
 *
 * @param format `"markdown"` (default) for pasting into a chat, `"jsx"` for just
 * the snippet on screen, `"prompt-url"` for agents that can fetch.
 */
export function buildAiContext(
  input: AiContextInput,
  format: AiContextFormat = "markdown",
): AiContextResult {
  const data = buildData(input);
  const text =
    format === "jsx"
      ? `${renderJsx(data, input)}\n`
      : format === "prompt-url"
        ? renderPromptUrl(data, input)
        : renderMarkdown(data, input);

  return {
    text,
    format,
    approxTokens: Math.ceil(text.length / 4),
    data,
  };
}
