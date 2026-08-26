/**
 * Derives the library's **state contract**: for each component, every attribute
 * its stylesheet selects on, every class it defines, and every runtime-written
 * custom property it reads.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * There is one stylesheet and four libraries render against it, and almost all
 * of its interactive styling keys off attributes a state machine writes —
 * `[data-state="open"]`, `[data-highlighted]`, `[data-disabled]`,
 * `[data-invalid]`. In React, Svelte and Vue those come free: Zag emits them and
 * the component only has to spread its props. **In Angular nothing emits them at
 * all.** Every part is hand-written, so every part is a fresh chance to forget
 * one, and a forgotten attribute is not an error — it is a control that renders
 * perfectly and never shows that it is disabled.
 *
 * `token-contract.json` exists for the same reason one layer down (a theme that
 * dropped `--z-index-*` and broke every overlay in silence), and this is the
 * same move applied to state: derive the requirement from the CSS itself, check
 * it in, and assert it. Deriving beats listing — a hand-written list is exactly
 * as stale as the day someone stopped updating it.
 *
 * It is not only for Angular. The React, Svelte and Vue libraries can be checked
 * against it too, and the parity gates already compare these attributes across
 * the three; what this adds is the *expected* set, so "all four agree" and "all
 * four are wrong together" stop looking the same.
 *
 * Run as `pnpm --filter @ui-organized/core gen:state-contract`.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, sep } from "node:path";
import { RUNTIME_PROVIDED, SRC_DIR, cssFiles, usages } from "./contract.js";

export const STATE_CONTRACT_PATH = "state-contract.json";

/**
 * Attributes that say nothing about state.
 *
 * `dir` is on every single Ark part and never varies; `class`, `id` and `style`
 * are addressed by other means. Keeping them would put an entry in all sixty-six
 * components that no reader would ever act on.
 */
const NOT_STATE = new Set(["dir", "class", "id", "style"]);

export interface ComponentStateContract {
  /**
   * Attribute selectors the stylesheet depends on: name → the distinct values it
   * distinguishes, sorted. An empty array means the CSS only tests for the
   * attribute's *presence* (`[data-highlighted]`), which is how Zag writes
   * booleans — as an empty-valued attribute, not `="true"`.
   */
  attributes: Record<string, string[]>;
  /** Class names the stylesheet defines. A component must render all of these. */
  classes: string[];
  /**
   * Custom properties from `RUNTIME_PROVIDED` that this stylesheet reads. A
   * theme cannot supply them and the component must write them itself, inline,
   * from something only measurable at runtime.
   */
  runtime: string[];
}

export type StateContract = Record<string, ComponentStateContract>;

// ─── Reading ─────────────────────────────────────────────────────────────────

/**
 * Every selector list in a stylesheet — the text preceding each `{`.
 *
 * Written as a brace walk rather than a regex because the alternative is
 * matching "everything before a brace", which happily returns the tail of a
 * declaration block as a selector. At-rule preludes (`@media …`) are dropped;
 * the rules nested inside them are not, which is the point.
 */
export function selectorLists(css: string): string[] {
  const out: string[] = [];
  let prelude = "";
  for (const char of css) {
    if (char === "{") {
      const text = prelude.trim();
      if (text && !text.startsWith("@")) out.push(text);
      prelude = "";
    } else if (char === "}" || char === ";") {
      prelude = "";
    } else {
      prelude += char;
    }
  }
  return out;
}

const ATTRIBUTE_SELECTOR = /\[\s*([\w-]+)\s*(?:[~^|$*]?=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]*))\s*)?(?:[iIsS]\s*)?\]/g;

/** `[name]` / `[name="value"]` → name → the values it distinguishes. */
export function attributeSelectors(selectors: string[]): Map<string, Set<string>> {
  const found = new Map<string, Set<string>>();
  for (const selector of selectors) {
    for (const [, name, quoted, singleQuoted, bare] of selector.matchAll(ATTRIBUTE_SELECTOR)) {
      if (NOT_STATE.has(name!)) continue;
      const values = found.get(name!) ?? new Set<string>();
      const value = quoted ?? singleQuoted ?? bare;
      if (value) values.add(value);
      found.set(name!, values);
    }
  }
  return found;
}

/**
 * Class names in a selector list.
 *
 * Attribute selectors are removed first: a value can contain a dot, and
 * `[data-x="a.b"]` would otherwise contribute a class named `b`.
 */
export function classNames(selectors: string[]): Set<string> {
  const found = new Set<string>();
  for (const selector of selectors) {
    const withoutAttributes = selector.replace(ATTRIBUTE_SELECTOR, " ");
    for (const [, name] of withoutAttributes.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) found.add(name!);
  }
  return found;
}

// ─── Deriving ────────────────────────────────────────────────────────────────

/**
 * The component a stylesheet belongs to: its directory under `components/`, or
 * its own basename for the handful that sit at the top of `src`.
 */
export function componentOf(file: string): string {
  const parts = dirname(file).split(sep);
  const index = parts.lastIndexOf("components");
  const name = index >= 0 && parts[index + 1] ? parts[index + 1]! : basename(file, ".css");
  return name;
}

export function deriveStateContract(dir: string = SRC_DIR): StateContract {
  const contract: StateContract = {};
  for (const file of cssFiles(dir)) {
    // Comments first, for the same reason the token contract strips them: the
    // overlay-stacking rules explain zag's mechanism by quoting selectors, and
    // prose is not a dependency.
    const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const selectors = selectorLists(css);
    const component = componentOf(file);
    const existing = contract[component];

    const attributes: Record<string, string[]> = { ...(existing?.attributes ?? {}) };
    for (const [name, values] of attributeSelectors(selectors)) {
      attributes[name] = [...new Set([...(attributes[name] ?? []), ...values])].sort();
    }

    const classes = new Set([...(existing?.classes ?? []), ...classNames(selectors)]);
    const runtime = new Set([
      ...(existing?.runtime ?? []),
      ...[...usages(css).keys()].filter((name) => RUNTIME_PROVIDED.has(name)),
    ]);

    contract[component] = {
      attributes: Object.fromEntries(Object.entries(attributes).sort(([a], [b]) => a.localeCompare(b))),
      classes: [...classes].sort(),
      runtime: [...runtime].sort(),
    };
  }
  return Object.fromEntries(Object.entries(contract).sort(([a], [b]) => a.localeCompare(b)));
}

export function writeStateContract(): StateContract {
  const contract = deriveStateContract();
  const body = {
    $comment:
      "GENERATED — do not edit. Per component: the attributes its stylesheet selects on, the classes it defines, and the runtime-written custom properties it reads. A library that does not emit these renders unstyled in states nothing tests. Regenerate with `pnpm --filter @ui-organized/core gen:state-contract`.",
    components: contract,
  };
  writeFileSync(STATE_CONTRACT_PATH, JSON.stringify(body, null, 2) + "\n", "utf8");
  return contract;
}
