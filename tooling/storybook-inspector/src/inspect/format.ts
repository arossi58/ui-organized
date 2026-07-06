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
