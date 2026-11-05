/**
 * Reads the REAL rendered story DOM (in the preview iframe) and extracts the
 * Figma-Dev-Mode facts the panel shows, curated per element:
 *  - only property groups that apply (typography only when there's text, icon only
 *    for <svg>, layout values only when non-zero);
 *  - each property tagged by where its winning declaration came from (`PropSource`),
 *    `literal` where a token was expected being the highlighted one;
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
  compareSpecificity,
  isKeywordValue,
  selectorSpecificity,
  splitSelectorList,
  type Specificity,
} from "./format.js";

/**
 * - `token`: declared here through a design-token variable.
 * - `literal`: declared here in a stylesheet as a raw value. The one to act on.
 * - `keyword`: declared here as `transparent`, `currentcolor`, `0`… nothing to tokenise.
 * - `inline`: a raw value in a `style` attribute: runtime data or story scaffolding.
 * - `inherited`: comes from an ancestor inside the component (see `varName`).
 * - `page`: inherited from beyond the inspected root, so the component sets nothing.
 * - `default`: nothing declares it; the browser's initial value.
 */
export type PropSource = "token" | "literal" | "keyword" | "inline" | "inherited" | "page" | "default";

export interface StyleProp {
  /** Display label (e.g. "color", "font-size"). */
  property: string;
  /** Resolved computed value. */
  value: string;
  source: PropSource;
  /** The `--token` behind it, when a `token`, `inherited` or `page` value has one. */
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
  /** The rule's selector list, split into branches. */
  selectors: string[];
  style: CSSStyleDeclaration;
  /** Inside an `@layer` block, so it loses to unlayered rules. */
  layered: boolean;
}

/** The longhands one row reads, and the shorthands that can also set them. */
interface Family {
  longhands: string[];
  shorthands: string[];
}

/** One inspection's shared state: the rules, and where the component ends. */
interface Context {
  rules: StyleRuleLike[];
  roots: Set<Element>;
  matched: WeakMap<Element, MatchedRule[]>;
}

interface MatchedRule {
  style: CSSStyleDeclaration;
  layered: boolean;
  specificity: Specificity;
  order: number;
}

function collectStyleRules(win: Window): StyleRuleLike[] {
  const out: StyleRuleLike[] = [];
  const visit = (rules: CSSRuleList, layered: boolean) => {
    for (const r of Array.from(rules) as unknown[]) {
      const rule = r as {
        selectorText?: string;
        style?: CSSStyleDeclaration;
        cssRules?: CSSRuleList;
        media?: MediaList;
        conditionText?: string;
        constructor?: { name?: string };
      };
      if (typeof rule.selectorText === "string" && rule.style) {
        out.push({ selectors: splitSelectorList(rule.selectorText), style: rule.style, layered });
      } else if (rule.cssRules) {
        // An inactive `@media` block isn't in the cascade. By constructor name
        // because the preview's rules belong to another window's realm.
        if (rule.media && !win.matchMedia?.(rule.media.mediaText).matches) continue;
        const kind = rule.constructor?.name;
        if (kind === "CSSSupportsRule" && !(win as Window & typeof globalThis).CSS?.supports(rule.conditionText ?? "")) continue;
        visit(rule.cssRules, layered || kind === "CSSLayerBlockRule");
      }
    }
  };
  for (const sheet of Array.from(win.document.styleSheets)) {
    try {
      visit(sheet.cssRules, false);
    } catch {
      // cross-origin sheet — skip
    }
  }
  return out;
}

/** The rules matching an element, weakest first. Cached: ancestor walks repeat. */
function matchedRules(el: Element, ctx: Context): MatchedRule[] {
  const cached = ctx.matched.get(el);
  if (cached) return cached;
  const out: MatchedRule[] = [];
  ctx.rules.forEach((rule, order) => {
    let best: Specificity | null = null;
    for (const selector of rule.selectors) {
      let hit = false;
      try {
        hit = el.matches(selector);
      } catch {
        hit = false;
      }
      if (!hit) continue;
      const specificity = selectorSpecificity(selector);
      if (!best || compareSpecificity(specificity, best) > 0) best = specificity;
    }
    if (best) out.push({ style: rule.style, layered: rule.layered, specificity: best, order });
  });
  out.sort(
    (a, b) =>
      Number(b.layered) - Number(a.layered) ||
      compareSpecificity(a.specificity, b.specificity) ||
      a.order - b.order,
  );
  ctx.matched.set(el, out);
  return out;
}

/**
 * The text a declaration block gives a family, or null if it doesn't declare it.
 *
 * A shorthand containing `var()` can't be split until the variable resolves, so
 * the CSSOM lists its longhands with an EMPTY value: `border: 1px solid var(--c)`
 * enumerates `border-top-color`, and reading that returns "". Only the shorthand
 * itself still has the text. So a listed longhand with no text anywhere is a value
 * pending substitution, which means a variable — it is never a literal.
 */
function declaredIn(style: CSSStyleDeclaration, family: Family): { text: string; important: boolean } | null {
  const items = Array.from({ length: style.length }, (_, i) => style.item(i));
  const longhand = family.longhands.find((name) => items.includes(name));
  if (!longhand) return null;
  const important = style.getPropertyPriority(longhand) === "important";
  for (const name of [...family.longhands, ...family.shorthands]) {
    const text = style.getPropertyValue(name).trim();
    if (text) return { text, important };
  }
  return { text: PENDING, important };
}

/** Sentinel for a declaration whose text the CSSOM won't give up (see above). */
const PENDING = "var(--)";

/** The declaration that wins the cascade on this element, if any. */
function winningDeclaration(el: Element, family: Family, ctx: Context): { text: string; inline: boolean } | null {
  let normal: string | null = null;
  let important: string | null = null;
  for (const rule of matchedRules(el, ctx)) {
    const decl = declaredIn(rule.style, family);
    if (!decl) continue;
    if (decl.important) important = decl.text;
    else normal = decl.text;
  }
  if (important != null) return { text: important, inline: false };
  const inline = (el as HTMLElement).style ? declaredIn((el as HTMLElement).style, family) : null;
  if (inline) return { text: inline.text, inline: true };
  return normal != null ? { text: normal, inline: false } : null;
}

const named = (text: string) => parseVarRefs(text)[0];

/** Where one family's value comes from, following inheritance up the tree. */
function sourceOfFamily(el: Element, family: Family, inherits: boolean, ctx: Context): { source: PropSource; varName?: string } {
  let cur: Element | null = el;
  let own = true;
  let outside = false;
  let decl = winningDeclaration(cur, family, ctx);
  while (!decl || /^(inherit|unset)$/i.test(decl.text)) {
    if (!decl && !inherits) return { source: "default" };
    cur = cur.parentElement;
    if (!cur) return { source: "default" };
    own = false;
    if (ctx.roots.has(cur)) outside = true;
    decl = winningDeclaration(cur, family, ctx);
  }
  const usesToken = usesVar(decl.text);
  const varName = usesToken ? named(decl.text) : undefined;
  if (outside) return { source: "page", varName };
  if (!own) return { source: "inherited", varName };
  if (usesToken) return { source: "token", varName };
  if (isKeywordValue(decl.text)) return { source: "keyword" };
  return { source: decl.inline ? "inline" : "literal" };
}

/** A row spanning several sides reports its most actionable side. */
const SOURCE_RANK: PropSource[] = ["literal", "inline", "token", "keyword", "inherited", "page", "default"];

function mergeSources(sources: { source: PropSource; varName?: string }[]): { source: PropSource; varName?: string } {
  return [...sources].sort((a, b) => SOURCE_RANK.indexOf(a.source) - SOURCE_RANK.indexOf(b.source))[0]!;
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
  families?: Family[]; // what can declare it (defaults to `css` alone)
  tokenable?: boolean;
}

/** Inherited CSS properties among those the panel reports. */
const INHERITS = new Set([
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-transform",
  "stroke",
  "fill",
  "stroke-width",
]);

const fontFamily = (css: string): Family[] => [{ longhands: [css], shorthands: ["font"] }];
const SIDES = [
  { side: "top", logical: "block-start", axis: "block" },
  { side: "right", logical: "inline-end", axis: "inline" },
  { side: "bottom", logical: "block-end", axis: "block" },
  { side: "left", logical: "inline-start", axis: "inline" },
] as const;

const PADDING: Family[] = SIDES.map(({ side, logical, axis }) => ({
  longhands: [`padding-${side}`, `padding-${logical}`],
  shorthands: ["padding", `padding-${axis}`],
}));
const GAP: Family[] = [
  { longhands: ["row-gap"], shorthands: ["gap"] },
  { longhands: ["column-gap"], shorthands: ["gap"] },
];
const RADIUS: Family[] = [
  ["top-left", "start-start"],
  ["top-right", "start-end"],
  ["bottom-right", "end-end"],
  ["bottom-left", "end-start"],
].map(([corner, logical]) => ({
  longhands: [`border-${corner}-radius`, `border-${logical}-radius`],
  shorthands: ["border-radius"],
}));
const BORDER_COLOR = Object.fromEntries(
  SIDES.map(({ side, logical, axis }) => [
    side,
    {
      longhands: [`border-${side}-color`, `border-${logical}-color`],
      shorthands: [`border-${side}`, "border-color", "border", `border-${logical}`, `border-${axis}`, `border-${axis}-color`],
    },
  ]),
) as Record<(typeof SIDES)[number]["side"], Family>;

/** SVG icons take these from attributes, which no stylesheet rule will show. */
const SVG_ATTRIBUTES = new Set(["stroke", "fill", "stroke-width"]);

function buildProp(el: Element, cs: CSSStyleDeclaration, ctx: Context, spec: Spec): StyleProp {
  const value = cs.getPropertyValue(spec.css).trim();
  const inherits = INHERITS.has(spec.css);
  const families = spec.families ?? [{ longhands: [spec.css], shorthands: [] }];
  let { source, varName } = mergeSources(families.map((f) => sourceOfFamily(el, f, inherits, ctx)));
  const attribute = SVG_ATTRIBUTES.has(spec.css) ? el.getAttribute(spec.css) : null;
  if (attribute != null && !winningDeclaration(el, families[0]!, ctx)) {
    source = isKeywordValue(attribute) ? "keyword" : "inline";
    varName = undefined;
  }
  return {
    property: spec.label,
    value,
    source,
    varName,
    isColor: isColorValue(value),
    tokenable: spec.tokenable ?? false,
  };
}

/**
 * Border rows, one per side that paints. A single row would read one side's
 * colour for all of them, so a `border-bottom` would report `border-top-color`.
 */
function borderProps(el: Element, cs: CSSStyleDeclaration, ctx: Context): StyleProp[] {
  const rows = SIDES.filter(({ side }) => {
    const width = cs.getPropertyValue(`border-${side}-width`);
    return width && width !== "0px";
  }).map(({ side }) =>
    buildProp(el, cs, ctx, {
      label: `border-${side}`,
      css: `border-${side}-color`,
      families: [BORDER_COLOR[side]],
      tokenable: true,
    }),
  );
  const [first] = rows;
  const uniform =
    rows.length === 4 &&
    rows.every((r) => r.value === first!.value && r.source === first!.source && r.varName === first!.varName);
  return uniform ? [{ ...first!, property: "border" }] : rows;
}

export function extractInspection(
  win: Window,
  roots: Element[],
  opts: { maxNodes?: number; maxDepth?: number } = {},
): Inspection {
  const maxNodes = opts.maxNodes ?? 160;
  const maxDepth = opts.maxDepth ?? 8;
  const ctx: Context = { rules: collectStyleRules(win), roots: new Set(roots), matched: new WeakMap() };
  const nodes: InspectedNode[] = [];
  const elements: Element[] = [];
  let portal = false;

  const walk = (el: Element, depth: number) => {
    if (nodes.length >= maxNodes || depth > maxDepth) return;
    const tag = el.tagName.toLowerCase();
    const classes = Array.from(el.classList);
    const cs = win.getComputedStyle(el);
    const prop = (spec: Spec) => buildProp(el, cs, ctx, spec);
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
        prop({ label: "color", css: "color", tokenable: true }),
        prop({ label: "font", css: "font-family", families: fontFamily("font-family"), tokenable: true }),
        prop({ label: "size", css: "font-size", families: fontFamily("font-size"), tokenable: true }),
        prop({ label: "weight", css: "font-weight", families: fontFamily("font-weight"), tokenable: true }),
        prop({ label: "line-height", css: "line-height", families: fontFamily("line-height"), tokenable: true }),
        prop({ label: "letter-spacing", css: "letter-spacing", tokenable: true }),
      ];
      const tt = cs.textTransform;
      if (tt && tt !== "none") text_.push(prop({ label: "transform", css: "text-transform" }));
      groups.push({ title: "Text", props: text_ });
    }

    // ── Fill & stroke ──────────────────────────────────────────────────────────
    const fill: StyleProp[] = [];
    const bg = cs.backgroundColor;
    if (isVisibleColor(bg)) fill.push(prop({ label: "background", css: "background-color", families: [{ longhands: ["background-color"], shorthands: ["background"] }], tokenable: true }));
    fill.push(...borderProps(el, cs, ctx));
    if (cs.boxShadow && cs.boxShadow !== "none") fill.push(prop({ label: "shadow", css: "box-shadow", tokenable: true }));
    if (cs.opacity && cs.opacity !== "1") fill.push(prop({ label: "opacity", css: "opacity" }));
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
        prop({ label: "stroke-width", css: "stroke-width", tokenable: true }),
        prop({ label: "stroke", css: "stroke", tokenable: true }),
        prop({ label: "fill", css: "fill", tokenable: true }),
      ].filter((p) => p.value && p.value !== "none" && p.value !== "0px");
      if (iconProps.length) groups.push({ title: "Icon", props: iconProps });
    }

    // ── Layout ───────────────────────────────────────────────────────────────────
    const layout: StyleProp[] = [prop({ label: "display", css: "display" })];
    if (!isZeroLength(cs.padding)) layout.push(prop({ label: "padding", css: "padding", families: PADDING, tokenable: true }));
    if (/flex|grid/.test(cs.display) && !isZeroLength(cs.gap)) layout.push(prop({ label: "gap", css: "gap", families: GAP, tokenable: true }));
    if (!isZeroLength(cs.borderRadius)) layout.push(prop({ label: "radius", css: "border-radius", families: RADIUS, tokenable: true }));
    groups.push({ title: "Layout", props: layout });

    // ── Design tokens set on this element (rare, but useful) ─────────────────────
    const setVars: StyleProp[] = [];
    const declaredVars = new Map<string, string>();
    for (const { style } of [...matchedRules(el, ctx), { style: (el as HTMLElement).style }]) {
      for (let i = 0; i < (style?.length ?? 0); i++) {
        const name = style.item(i);
        if (name.startsWith("--")) declaredVars.set(name, style.getPropertyValue(name).trim());
      }
    }
    for (const [name, value] of declaredVars) {
      setVars.push({ property: name, value: cs.getPropertyValue(name).trim() || value, source: "token", isColor: isColorValue(value), tokenable: false });
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
