/**
 * Turning a story's arg values into markup, once, for every framework.
 *
 * `jsxFromArgs()` used to own all of this privately. It was split out when the
 * docs site grew a framework switcher: the Svelte, Vue and Angular samples are
 * derived from the very same args as the React one, and if each dialect
 * re-implemented "which args become attributes, in what order, and which are
 * dropped" they would disagree about a component's canonical usage — the exact
 * failure `ai-context.ts` exists to prevent, reproduced four ways.
 *
 * So: this module decides *what* is rendered, the dialects decide *how*.
 *
 * Everything here is pure and total. Malformed input degrades the output; it
 * never throws.
 */

/** One arg that survived normalization, still carrying its raw value. */
export interface MarkupAttr {
  name: string;
  value: unknown;
}

export interface MarkupArgs {
  attrs: MarkupAttr[];
  /** Printable children — a string or number arg. */
  text?: string;
  /**
   * Set instead of `text` when children exist but cannot be written literally,
   * e.g. `ReactNode` or `array`. Dialects render it as a placeholder comment.
   */
  slotLabel?: string;
  /** True when function args were dropped, so a dialect can say so once. */
  omittedHandlers: boolean;
}

/** A short stand-in for a value that can't be written literally in markup. */
export function valueLabel(value: unknown): string {
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object" && "$$typeof" in (value as object)) return "ReactNode";
  return typeof value;
}

/**
 * Which args become attributes, in which order, and what the children are.
 *
 * Deliberate omissions: `false` and `undefined` props (writing `disabled={false}`
 * teaches nothing), and function args. An emitted `onClick={() => {}}` reads as
 * part of the component's canonical usage and gets copied verbatim into real
 * code as a no-op handler, so callers leave a comment instead.
 *
 * `propOrder` (normally the manifest's prop order) makes the output stable across
 * callers whose arg objects were built in different orders.
 */
export function normalizeArgs(
  args: Record<string, unknown>,
  propOrder: string[] = [],
): MarkupArgs {
  const rank = new Map(propOrder.map((name, i) => [name, i]));
  const names = Object.keys(args ?? {}).sort((a, b) => {
    const ra = rank.get(a) ?? Number.MAX_SAFE_INTEGER;
    const rb = rank.get(b) ?? Number.MAX_SAFE_INTEGER;
    return ra !== rb ? ra - rb : a.localeCompare(b);
  });

  const attrs: MarkupAttr[] = [];
  let text: string | undefined;
  let slotLabel: string | undefined;
  let omittedHandlers = false;

  for (const name of names) {
    const value = args[name];

    if (name === "children") {
      if (typeof value === "string" && value.length > 0) text = value;
      else if (typeof value === "number") text = String(value);
      else if (value != null && typeof value !== "boolean") slotLabel = valueLabel(value);
      continue;
    }
    if (typeof value === "function") {
      omittedHandlers = true;
      continue;
    }
    if (value === undefined || value === null || value === false) continue;
    attrs.push({ name, value });
  }

  return { attrs, ...(text !== undefined ? { text } : {}), ...(slotLabel ? { slotLabel } : {}), omittedHandlers };
}

// ─── Value serialization ─────────────────────────────────────────────────────

const DEPTH_LIMIT = 8;

/**
 * Deterministic plain data — sorted keys, functions dropped, React elements
 * replaced by `nodeLabel`, which is what makes the golden snapshots stable.
 */
function sortDeep(value: unknown, nodeLabel: string, depth = 0): unknown {
  if (depth > DEPTH_LIMIT) return "/* … */";
  if (Array.isArray(value)) return value.map((v) => sortDeep(v, nodeLabel, depth + 1));
  if (value && typeof value === "object") {
    // React elements are circular and meaningless as data.
    if ("$$typeof" in (value as Record<string, unknown>)) return nodeLabel;
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      if (typeof obj[key] === "function") continue;
      out[key] = sortDeep(obj[key], nodeLabel, depth + 1);
    }
    return out;
  }
  if (typeof value === "function") return undefined;
  return value;
}

/** Deterministic JSON, for a JSX expression container. */
export function jsonValue(value: unknown, nodeLabel = "/* ReactNode */"): string {
  try {
    return JSON.stringify(sortDeep(value, nodeLabel)) ?? "undefined";
  } catch {
    return "/* value */";
  }
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function literal(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") {
    // Single-quoted on purpose: these literals end up inside double-quoted HTML
    // attributes (`:items="[…]"`, `[items]="[…]"`), where a double quote would
    // close the attribute and silently truncate the sample.
    return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n")}'`;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `[${value.map(literal).join(", ")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, val]) => `${IDENTIFIER.test(key) ? key : `'${key}'`}: ${literal(val)}`,
    );
    return entries.length ? `{ ${entries.join(", ")} }` : "{}";
  }
  return "undefined";
}

/** Deterministic JavaScript literal, for a template expression. */
export function jsValue(value: unknown, nodeLabel = "/* content */"): string {
  try {
    return literal(sortDeep(value, nodeLabel));
  } catch {
    return "null";
  }
}

// ─── Layout ──────────────────────────────────────────────────────────────────

const ONE_LINE_LIMIT = 78;

export interface ElementLayout {
  /** Tag name — the component in JSX, the host element in an Angular sample. */
  tag: string;
  /** Fully formatted attributes, in order. */
  attrs: string[];
  /** Rendered children, already in the target dialect. */
  children?: string;
  /**
   * Whether `<tag />` is legal when there are no children. False for Angular,
   * whose directives sit on ordinary HTML elements — `<span uioTag />` is parsed
   * as an unclosed `<span>` and swallows the rest of the template.
   */
  selfClose: boolean;
}

/** One element, on one line where it fits and broken over several where it doesn't. */
export function layoutElement({ tag, attrs, children, selfClose }: ElementLayout): string {
  const inlineAttrs = attrs.length ? ` ${attrs.join(" ")}` : "";
  const empty = selfClose ? `<${tag}${inlineAttrs} />` : `<${tag}${inlineAttrs}></${tag}>`;
  const oneLine =
    children !== undefined ? `<${tag}${inlineAttrs}>${children}</${tag}>` : empty;

  if (oneLine.length <= ONE_LINE_LIMIT && !oneLine.includes("\n")) return oneLine;

  if (attrs.length === 0) {
    return children !== undefined
      ? `<${tag}>\n  ${children.replace(/\n/g, "\n  ")}\n</${tag}>`
      : empty;
  }

  const block = attrs.map((a) => `  ${a}`).join("\n");
  if (children !== undefined) {
    return `<${tag}\n${block}\n>\n  ${children.replace(/\n/g, "\n  ")}\n</${tag}>`;
  }
  return selfClose ? `<${tag}\n${block}\n/>` : `<${tag}\n${block}\n></${tag}>`;
}
