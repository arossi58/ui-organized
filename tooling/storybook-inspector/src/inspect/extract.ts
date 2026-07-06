/**
 * Reads the REAL rendered story DOM (in the preview iframe) and extracts the
 * Figma-Dev-Mode facts the panel shows, curated per element:
 *  - only property groups that apply (typography only when there's text, icon only
 *    for <svg>, layout values only when non-zero);
 *  - each property tagged as `token` (resolves through a design-token variable),
 *    `literal` (a hardcoded value where a token was expected — highlighted), or
 *    `inherited` (comes from an ancestor);
 *  - the element/class tree.
 *
 * Returns element refs alongside the serializable nodes so the panel can highlight
 * the selected element back in the preview. Runs from the manager against the
 * same-origin preview `window`.
 */

import {
  isColorValue,
  isIconTag,
  isVisibleColor,
  isZeroLength,
  nodeLabel,
  parseVarRefs,
  textClassOf,
  usesVar,
} from "./format.js";

export type PropSource = "token" | "literal" | "inherited";

export interface StyleProp {
  /** Display label (e.g. "color", "font-size"). */
  property: string;
  /** Resolved computed value. */
  value: string;
  source: PropSource;
  /** The `--token` when source is `token`. */
  varName?: string;
  isColor: boolean;
  /** True when this property is expected to be token-backed — so a `literal` here
   *  is worth flagging (colors/typography/spacing), unlike `display`/`width`. */
  tokenable: boolean;
}

export interface StyleGroup {
  title: string;
  props: StyleProp[];
}

export interface InspectedNode {
  ref: number;
  depth: number;
  tag: string;
  classes: string[];
  label: string;
  hasText: boolean;
  isIcon: boolean;
  /** True when this node has child nodes in the tree (drives the collapse caret). */
  hasChildren: boolean;
  /** True for nodes from a portal root (dropdowns, popovers, dialogs rendered
   *  outside #storybook-root when open). */
  portal: boolean;
  /** Rendered box size in px, when the element has one. */
  box?: { width: number; height: number };
  text?: string;
  textClass?: string;
  groups: StyleGroup[];
  tokenCount: number;
  /** Count of flagged hardcoded (tokenable literal) properties. */
  hardcodedCount: number;
}

export interface Inspection {
  nodes: InspectedNode[];
  /** Live element refs, aligned to `nodes[i].ref` — kept out of React state. */
  elements: Element[];
}

interface StyleRuleLike {
  selectorText: string;
  style: CSSStyleDeclaration;
}

function collectStyleRules(win: Window): StyleRuleLike[] {
  const out: StyleRuleLike[] = [];
  const visit = (rules: CSSRuleList) => {
    for (const r of Array.from(rules) as unknown[]) {
      const rule = r as { selectorText?: string; style?: CSSStyleDeclaration; cssRules?: CSSRuleList };
      if (typeof rule.selectorText === "string" && rule.style) {
        out.push({ selectorText: rule.selectorText, style: rule.style });
      } else if (rule.cssRules) {
        visit(rule.cssRules);
      }
    }
  };
  for (const sheet of Array.from(win.document.styleSheets)) {
    try {
      visit(sheet.cssRules);
    } catch {
      // cross-origin sheet — skip
    }
  }
  return out;
}

function matchedDeclarations(el: Element, rules: StyleRuleLike[]): Map<string, string> {
  const decls = new Map<string, string>();
  for (const rule of rules) {
    let hit = false;
    try {
      hit = el.matches(rule.selectorText);
    } catch {
      hit = false;
    }
    if (!hit) continue;
    const style = rule.style;
    for (let i = 0; i < style.length; i++) {
      const prop = style.item(i);
      decls.set(prop, style.getPropertyValue(prop).trim());
    }
  }
  const inline = (el as HTMLElement).style;
  for (let i = 0; i < inline.length; i++) {
    const prop = inline.item(i);
    decls.set(prop, inline.getPropertyValue(prop).trim());
  }
  return decls;
}

/** Where the winning value for a property (across related keys) came from. */
function sourceOf(
  decls: Map<string, string>,
  keys: string[],
): { source: PropSource; varName?: string } {
  let literal = false;
  for (const k of keys) {
    const d = decls.get(k);
    if (d == null) continue;
    if (usesVar(d)) return { source: "token", varName: parseVarRefs(d)[0] };
    literal = true;
  }
  return { source: literal ? "literal" : "inherited" };
}

function directText(el: Element): string {
  let t = "";
  for (const n of Array.from(el.childNodes)) {
    if (n.nodeType === 3) t += n.textContent ?? "";
  }
  return t.replace(/\s+/g, " ").trim();
}

interface Spec {
  label: string;
  css: string; // computed property to read the value from
  keys?: string[]; // declared keys to check for source (defaults to [css])
  tokenable?: boolean;
}

function buildProp(cs: CSSStyleDeclaration, decls: Map<string, string>, spec: Spec): StyleProp {
  const value = cs.getPropertyValue(spec.css).trim();
  const { source, varName } = sourceOf(decls, spec.keys ?? [spec.css]);
  return {
    property: spec.label,
    value,
    source,
    varName,
    isColor: isColorValue(value),
    tokenable: spec.tokenable ?? false,
  };
}

export function extractInspection(
  win: Window,
  roots: Element[],
  opts: { maxNodes?: number; maxDepth?: number } = {},
): Inspection {
  const maxNodes = opts.maxNodes ?? 160;
  const maxDepth = opts.maxDepth ?? 8;
  const rules = collectStyleRules(win);
  const nodes: InspectedNode[] = [];
  const elements: Element[] = [];
  let portal = false;

  const walk = (el: Element, depth: number) => {
    if (nodes.length >= maxNodes || depth > maxDepth) return;
    const tag = el.tagName.toLowerCase();
    const classes = Array.from(el.classList);
    const cs = win.getComputedStyle(el);
    const decls = matchedDeclarations(el, rules);
    const text = directText(el);
    const hasText = text.length > 0;
    const icon = isIconTag(tag);
    const rect = (el as HTMLElement).getBoundingClientRect();
    const box =
      rect.width > 0 && rect.height > 0
        ? { width: Math.round(rect.width), height: Math.round(rect.height) }
        : undefined;
    const groups: StyleGroup[] = [];

    // ── Text (only when the element renders text) ──────────────────────────────
    if (hasText) {
      const text_: StyleProp[] = [
        buildProp(cs, decls, { label: "color", css: "color", tokenable: true }),
        buildProp(cs, decls, { label: "font", css: "font-family", keys: ["font-family", "font"], tokenable: true }),
        buildProp(cs, decls, { label: "size", css: "font-size", keys: ["font-size", "font"], tokenable: true }),
        buildProp(cs, decls, { label: "weight", css: "font-weight", keys: ["font-weight", "font"], tokenable: true }),
        buildProp(cs, decls, { label: "line-height", css: "line-height", keys: ["line-height", "font"], tokenable: true }),
        buildProp(cs, decls, { label: "letter-spacing", css: "letter-spacing", tokenable: true }),
      ];
      const tt = cs.textTransform;
      if (tt && tt !== "none") text_.push(buildProp(cs, decls, { label: "transform", css: "text-transform" }));
      groups.push({ title: "Text", props: text_ });
    }

    // ── Fill & stroke ──────────────────────────────────────────────────────────
    const fill: StyleProp[] = [];
    const bg = cs.backgroundColor;
    if (isVisibleColor(bg)) fill.push(buildProp(cs, decls, { label: "background", css: "background-color", keys: ["background-color", "background"], tokenable: true }));
    const borderW = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth];
    if (borderW.some((w) => w && w !== "0px")) {
      fill.push(buildProp(cs, decls, { label: "border", css: "border-top-color", keys: ["border-color", "border", "border-top-color"], tokenable: true }));
    }
    if (cs.boxShadow && cs.boxShadow !== "none") fill.push(buildProp(cs, decls, { label: "shadow", css: "box-shadow", tokenable: true }));
    if (cs.opacity && cs.opacity !== "1") fill.push(buildProp(cs, decls, { label: "opacity", css: "opacity" }));
    if (fill.length) groups.push({ title: "Fill & stroke", props: fill });

    // ── Icon (svg only) ──────────────────────────────────────────────────────────
    if (icon) {
      const sizeProp: StyleProp = {
        property: "size",
        value: `${el.getAttribute("width") || cs.width} × ${el.getAttribute("height") || cs.height}`,
        source: "literal",
        isColor: false,
        tokenable: false,
      };
      const iconProps: StyleProp[] = [
        sizeProp,
        buildProp(cs, decls, { label: "stroke-width", css: "stroke-width", tokenable: true }),
        buildProp(cs, decls, { label: "stroke", css: "stroke", tokenable: true }),
        buildProp(cs, decls, { label: "fill", css: "fill", tokenable: true }),
      ].filter((p) => p.value && p.value !== "none" && p.value !== "0px");
      if (iconProps.length) groups.push({ title: "Icon", props: iconProps });
    }

    // ── Layout ───────────────────────────────────────────────────────────────────
    const layout: StyleProp[] = [buildProp(cs, decls, { label: "display", css: "display" })];
    if (!isZeroLength(cs.padding)) layout.push(buildProp(cs, decls, { label: "padding", css: "padding", keys: ["padding", "padding-top", "padding-inline", "padding-block", "padding-left"], tokenable: true }));
    if (/flex|grid/.test(cs.display) && !isZeroLength(cs.gap)) layout.push(buildProp(cs, decls, { label: "gap", css: "gap", keys: ["gap", "column-gap", "row-gap"], tokenable: true }));
    if (!isZeroLength(cs.borderRadius)) layout.push(buildProp(cs, decls, { label: "radius", css: "border-radius", keys: ["border-radius", "border-top-left-radius"], tokenable: true }));
    groups.push({ title: "Layout", props: layout });

    // ── Design tokens set on this element (rare, but useful) ─────────────────────
    const setVars: StyleProp[] = [];
    for (const [prop, value] of decls) {
      if (prop.startsWith("--")) {
        setVars.push({ property: prop, value: cs.getPropertyValue(prop).trim() || value, source: "token", isColor: isColorValue(value), tokenable: false });
      }
    }
    if (setVars.length) groups.push({ title: "Variables set", props: setVars });

    let tokenCount = 0;
    let hardcodedCount = 0;
    for (const g of groups) {
      for (const p of g.props) {
        if (p.source === "token") tokenCount++;
        else if (p.source === "literal" && p.tokenable) hardcodedCount++;
      }
    }

    nodes.push({
      ref: nodes.length,
      depth,
      tag,
      classes,
      label: nodeLabel(tag, classes, text),
      hasText,
      isIcon: icon,
      hasChildren: false, // filled in after the walk (from depth adjacency)
      portal,
      box,
      text: text || undefined,
      textClass: textClassOf(classes),
      groups,
      tokenCount,
      hardcodedCount,
    });
    elements.push(el);

    if (!icon) {
      for (const child of Array.from(el.children)) walk(child, depth + 1);
    }
  };

  // The main story root first, then any portal roots (open dropdowns/popovers/
  // dialogs) — each contributes a depth-0 subtree flagged `portal`.
  roots.forEach((root, i) => {
    portal = i > 0;
    for (const child of Array.from(root.children)) walk(child, 0);
  });
  // A node has children iff the next node in DFS order is one level deeper.
  for (let i = 0; i < nodes.length; i++) {
    nodes[i]!.hasChildren = (nodes[i + 1]?.depth ?? -1) > nodes[i]!.depth;
  }
  return { nodes, elements };
}
