/**
 * Scores one agent-generated file for the AI surface eval.
 *
 * Counts what makes generated UI drift off-system: components and props that
 * don't exist (Layer 4 `verify`), custom properties that resolve to nothing, and
 * raw colours or lengths where a token belongs. Type errors are counted by the
 * runner, which needs a whole program rather than one source text.
 */

/** `var(--x)` references whose `--x` isn't in `known` and isn't declared locally. */
export function unknownTokens(source: string, known: ReadonlySet<string>): string[] {
  const declared = new Set(
    [...source.matchAll(/(?:^|[\s{;"'`])(--[\w-]+)["'`]?\s*:/g)].map((m) => m[1]!),
  );
  const refs = [...source.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]!);
  return [...new Set(refs)].filter((name) => !known.has(name) && !declared.has(name)).sort();
}

/**
 * Hex colours, `rgb()`/`hsl()` and non-zero px/rem lengths outside `var()` fallbacks.
 *
 * Deliberately crude: a 1px hairline counts the same as a hardcoded brand colour.
 * It only has to move in the right direction between two runs of one prompt set.
 */
export function hardcodedValues(source: string): string[] {
  const stripped = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/var\([^)]*\)/g, "");
  const pattern = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\([^)]*\)|(?<![\w.-])(?!0(?:px|rem))\d*\.?\d+(?:px|rem)\b/g;
  return [...stripped.matchAll(pattern)].map((m) => m[0]);
}

/** Names declared as custom properties in a stylesheet. */
export function declaredTokens(css: string): Set<string> {
  return new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]!));
}

/** The first fenced code block, or the whole reply when the agent didn't fence it. */
export function extractCode(reply: string): string {
  const fence = /```(?:tsx|jsx|typescript|ts|svelte|vue|html)?\s*\n([\s\S]*?)```/.exec(reply);
  return (fence ? fence[1]! : reply).trim() + "\n";
}

export interface RunScore {
  id: string;
  /** The agent failed or returned nothing compilable; excluded from no totals. */
  failed: boolean;
  hallucinatedImports: number;
  unknownProps: number;
  unknownTokens: string[];
  hardcoded: number;
  typeErrors: number;
}

export interface Totals {
  files: number;
  failed: number;
  hallucinatedImports: number;
  unknownProps: number;
  unknownTokens: number;
  hardcoded: number;
  typeErrors: number;
  /** Files with none of the above except `hardcoded`, which is a count of taste. */
  cleanFiles: number;
}

export function totals(scores: RunScore[]): Totals {
  const sum = (pick: (s: RunScore) => number): number => scores.reduce((n, s) => n + pick(s), 0);
  return {
    files: scores.length,
    failed: scores.filter((s) => s.failed).length,
    hallucinatedImports: sum((s) => s.hallucinatedImports),
    unknownProps: sum((s) => s.unknownProps),
    unknownTokens: sum((s) => s.unknownTokens.length),
    hardcoded: sum((s) => s.hardcoded),
    typeErrors: sum((s) => s.typeErrors),
    cleanFiles: scores.filter(
      (s) =>
        !s.failed &&
        s.hallucinatedImports === 0 &&
        s.unknownProps === 0 &&
        s.unknownTokens.length === 0 &&
        s.typeErrors === 0,
    ).length,
  };
}
