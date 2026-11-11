/**
 * Pure helpers for the Dev-Mode style inspector. No DOM access here — just string
 * parsing and shaping — so they're unit-testable; the DOM walk lives in extract.ts.
 */

/** Extract the design-token variable names referenced in a CSS value. */
export function parseVarRefs(value: string): string[] {
  const names: string[] = [];
  const re = /var\(\s*(--[A-Za-z0-9-_]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value))) names.push(m[1]!);
  return names;
}

/** True when the value uses at least one CSS variable. */
export function usesVar(value: string): boolean {
  return /var\(\s*--/.test(value);
}

/** CSS-wide keywords and zeros: a value there is no token to swap in for. */
export function isKeywordValue(value: string): boolean {
  return /^(0|0px|none|transparent|currentcolor|initial|unset|revert|auto|normal)$/i.test(value.trim());
}

/** [ids, classes/attributes/pseudo-classes, types/pseudo-elements]. */
export type Specificity = [number, number, number];

export function compareSpecificity(a: Specificity, b: Specificity): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/** Split a selector list on its top-level commas (`:is(a, b)` stays whole). */
export function splitSelectorList(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of selector) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** Specificity of one complex selector, per Selectors Level 4. */
export function selectorSpecificity(selector: string): Specificity {
  const score: Specificity = [0, 0, 0];
  const add = (s: Specificity) => {
    score[0] += s[0];
    score[1] += s[1];
    score[2] += s[2];
  };
  const ident = /^(?:\\.|[\w-]|[^\x00-\x7f])+/;
  let i = 0;
  const skipIdent = () => {
    const m = ident.exec(selector.slice(i));
    const text = m?.[0] ?? "";
    i += text.length;
    return text;
  };
  /** Consume a balanced `(...)` at the cursor, returning what's inside. */
  const takeArgument = () => {
    if (selector[i] !== "(") return null;
    const start = ++i;
    for (let depth = 1; i < selector.length && depth > 0; i++) {
      if (selector[i] === "(") depth++;
      if (selector[i] === ")") depth--;
    }
    return selector.slice(start, i - 1);
  };
  while (i < selector.length) {
    const ch = selector[i]!;
    if (ch === "#") {
      i++;
      skipIdent();
      score[0]++;
    } else if (ch === ".") {
      i++;
      skipIdent();
      score[1]++;
    } else if (ch === "[") {
      const end = selector.indexOf("]", i);
      i = end === -1 ? selector.length : end + 1;
      score[1]++;
    } else if (ch === ":") {
      const pseudoElement = selector[i + 1] === ":";
      i += pseudoElement ? 2 : 1;
      const name = skipIdent().toLowerCase();
      const arg = takeArgument();
      if (pseudoElement) score[2]++;
      else if (name === "where") continue;
      else if ((name === "is" || name === "not" || name === "has") && arg != null) {
        const inner = splitSelectorList(arg).map(selectorSpecificity);
        const best = inner.sort((a, b) => compareSpecificity(b, a))[0];
        if (best) add(best);
      } else score[1]++;
    } else if (ident.test(selector.slice(i))) {
      skipIdent();
      score[2]++;
    } else {
      i++;
    }
  }
  return score;
}

/** The design system's typography utility class on an element, if any (`text-*`). */
export function textClassOf(classes: string[]): string | undefined {
  return classes.find((c) => /^text-/.test(c));
}

/** An element is an icon if it's an <svg> (Lucide/Tabler icons render as svg). */
export function isIconTag(tag: string): boolean {
  return tag.toLowerCase() === "svg";
}

/** A computed value that reads as a color (rgb/rgba/hsl/hex). */
export function isColorValue(v: string): boolean {
  return /^(rgb|rgba|hsl|hsla|#)/i.test(v.trim());
}

/** A color that actually paints something (not fully transparent / unset). */
export function isVisibleColor(v: string): boolean {
  const t = v.trim();
  return t !== "" && t !== "transparent" && t !== "rgba(0, 0, 0, 0)" && t !== "none";
}

/** A length shorthand that's all zeros (`0px`, `0px 0px`, …) → nothing to show. */
export function isZeroLength(v: string): boolean {
  const t = v.trim();
  return t === "" || t === "0px" || /^(0px)(\s+0px)+$/.test(t) || t === "normal" || t === "0";
}

/** Collapse a computed line-height/px value pair into a compact label. */
export function shorten(value: string, max = 44): string {
  const v = value.trim();
  return v.length > max ? v.slice(0, max - 1) + "…" : v;
}

/** A stable, readable label for an element row in the tree. */
export function nodeLabel(tag: string, classes: string[], text?: string): string {
  const cls = classes.length ? `.${classes[0]}` : "";
  const t = text ? ` “${shorten(text, 18)}”` : "";
  return `${tag}${cls}${t}`;
}

/** Element-list search: match a node by tag, any class, or its text. */
export function matchesQuery(
  node: { tag: string; classes: string[]; text?: string },
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (node.tag.toLowerCase().includes(q)) return true;
  if (node.classes.some((c) => c.toLowerCase().includes(q))) return true;
  return node.text ? node.text.toLowerCase().includes(q) : false;
}
