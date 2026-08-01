/**
 * Derives the library's **token contract**: every CSS custom property the
 * component stylesheets consume but do not define, and which a theme is
 * therefore responsible for supplying.
 *
 * This exists because of a real, silent failure. A Theme Builder export re-skinned
 * the whole semantic layer but never emitted `--dimension-*` or `--z-index-*` —
 * theme-independent layout constants nobody thinks of as part of a "theme".
 * Nothing threw: the build was green and the console was clean, the sidebar just
 * quietly rendered at 185px instead of 240px and every portalled overlay lost its
 * z-index and stacked on DOM order. See `docs/theme-test.md`.
 *
 * So the contract is derived from the CSS itself, never hand-listed. It is
 * checked in as `token-contract.json` and asserted up to date by
 * `src/tokenContract.test.ts`; `apps/marketing`'s theme-builder tests read the
 * same file to assert a generated theme declares every name in it — the check
 * that would have caught the original bug.
 *
 * Run as `pnpm --filter @ui-organized/react gen:contract`. Paths are relative to
 * the package root, which is the cwd for both that script and vitest.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const SRC_DIR = "src";
export const CONTRACT_PATH = "token-contract.json";
export const VARIABLES_CSS = "../tokens/output/variables.css";

/**
 * Custom properties Ark UI sets inline at runtime — popover measurements, the
 * collapsible's animated height, the segmented control's indicator box. Consumed
 * but never themeable, so they are not part of the contract.
 */
export const RUNTIME_PROVIDED = new Set([
  "--reference-width",
  "--height",
  "--width",
  "--top",
  "--left",
]);

// ─── Reading ─────────────────────────────────────────────────────────────────

/** Every `.css` file under a directory, recursively, in stable order. */
export function cssFiles(dir: string = SRC_DIR): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...cssFiles(path));
    else if (entry.name.endsWith(".css")) out.push(path);
  }
  return out.sort();
}

export interface Usage {
  /** Distinct fallback literals seen for this token across all stylesheets. */
  fallbacks: Set<string>;
  /**
   * How many times it is referenced as a bare `var(--name)`.
   *
   * Counted per *occurrence*, not per name: aggregating only the fallbacks means
   * one file dropping its fallback hides behind the nine other files that kept
   * theirs, and the check silently passes.
   */
  bare: number;
}

/** `var(--name)` / `var(--name, fallback)` → name → how it is referenced. */
export function usages(css: string): Map<string, Usage> {
  const found = new Map<string, Usage>();
  // The fallback runs to the matching close paren; no nested var() in this codebase.
  const re = /var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g;
  for (const [, name, fallback] of css.matchAll(re)) {
    const usage = found.get(name!) ?? { fallbacks: new Set<string>(), bare: 0 };
    if (fallback === undefined) usage.bare += 1;
    else usage.fallbacks.add(fallback.trim());
    found.set(name!, usage);
  }
  return found;
}

/**
 * `--name:` opening a declaration → a property the library defines for itself.
 *
 * The leading `\s*` is load-bearing: a declaration is commonly preceded by a
 * comment or blank line, so anchoring straight to `^`/`;`/`{` misses it and the
 * property is wrongly reported as one the theme must supply.
 */
export function declarations(css: string): Set<string> {
  return new Set([...css.matchAll(/(?:^|[;{])\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]!));
}

/** `--name: value;` pairs from a generated stylesheet. */
export function tokenValues(css: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const [, name, value] of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    // First declaration wins — `:root` is emitted before the per-mode blocks, and
    // a mode block only ever re-states colours, which carry no fallbacks anyway.
    if (!out.has(name!)) out.set(name!, value!.trim());
  }
  return out;
}

// ─── Deriving ────────────────────────────────────────────────────────────────

export interface Contract {
  /** Concatenated source of every component stylesheet, comments stripped. */
  css: string;
  /** Every `var()` reference found, with its fallbacks and bare-usage count. */
  used: Map<string, Usage>;
  /** Names the library declares itself. */
  declared: Set<string>;
  /** The contract: consumed, not self-declared, not supplied at runtime. */
  required: string[];
}

export function deriveContract(dir: string = SRC_DIR): Contract {
  // Comments go first: prose is not usage. The overlay stacking rules explain
  // zag's mechanism by quoting `z-index: var(--z-index)` verbatim, and left in
  // place that sentence enters the contract as a token every theme must ship.
  const css = cssFiles(dir)
    .map((file) => readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, ""))
    .join("\n");
  const used = usages(css);
  const declared = declarations(css);
  const required = [...used.keys()]
    .filter((name) => !declared.has(name) && !RUNTIME_PROVIDED.has(name))
    .sort();
  return { css, used, declared, required };
}

export function writeContract(): string[] {
  const { required } = deriveContract();
  const body = {
    $comment:
      "GENERATED — do not edit. Every CSS custom property @ui-organized/react consumes but does not define; a theme must supply all of them. Regenerate with `pnpm --filter @ui-organized/react gen:contract`.",
    tokens: required,
  };
  writeFileSync(CONTRACT_PATH, JSON.stringify(body, null, 2) + "\n", "utf8");
  return required;
}

// Entry point when run directly (`tsx scripts/token-contract.ts`).
if (process.argv[1]?.endsWith("token-contract.ts")) {
  const tokens = writeContract();
  console.log(`✓ ${CONTRACT_PATH} — ${tokens.length} tokens a theme must supply`);
}
