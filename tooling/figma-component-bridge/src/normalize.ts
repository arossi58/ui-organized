/**
 * The Normalizer (COMPONENT-PLUGIN.md §3, Phase 3).
 *
 * Walks a {@link ComponentCapture} (the renderer's DOM snapshot) into the
 * {@link ComponentSpec} contract: flex → auto-layout, the box model, typography,
 * and — the important part — symbolic token references. A property's token is
 * taken from its authored `var(--…)` (capture `varRefs`) when known, else
 * reverse-matched from the node's resolved token values; anything that can't map
 * (grid, absolute, an untokenised colour) becomes an `unresolved` record rather
 * than a silent guess.
 *
 * Pure and DOM-free: it reads only the capture data, so it runs and is tested
 * without a browser.
 */

import { parseColor, toFloat, type RGBA } from "./color";
import { isIconNode } from "./spec";
import type { CaptureNode, ComponentCapture } from "./capture";
import type {
  BoxSpec,
  ComponentSpec,
  FrameNodeSpec,
  LayoutSpec,
  NodeSpec,
  PropertyDefinition,
  TextNodeSpec,
  TokenValue,
  TypographySpec,
  UnresolvedKind,
  UnresolvedRecord,
  VariantSpec,
} from "./spec";

interface Ctx {
  unresolved: UnresolvedRecord[];
  fallbacks: Record<string, string>;
  counter: number;
}

export interface NormalizeOptions {
  propertyDefinitions?: Record<string, PropertyDefinition>;
  /** Stable source hash for the spec (drift detection); default "live". */
  hash?: string;
}

/** Normalize a whole component capture into a ComponentSpec. */
export function normalizeCapture(
  capture: ComponentCapture,
  options: NormalizeOptions = {},
): ComponentSpec {
  const ctx: Ctx = { unresolved: [], fallbacks: {}, counter: 0 };
  const variants: VariantSpec[] = capture.variants.map((vc) => ({
    props: vc.props,
    tree: normalizeNode(vc.root, ctx, "root", true) as FrameNodeSpec,
  }));
  const states = [...new Set(capture.variants.map((v) => v.props.state ?? "default"))];

  return {
    component: capture.component,
    source: { file: `apps/storybook (${capture.storyId})`, hash: options.hash ?? "live" },
    propertyDefinitions: options.propertyDefinitions ?? {},
    states,
    variants,
    unresolved: ctx.unresolved,
    fallbacks: ctx.fallbacks,
  };
}

// ─── Node ─────────────────────────────────────────────────────────────────────

function normalizeNode(node: CaptureNode, ctx: Ctx, path: string, isRoot: boolean): NodeSpec {
  // An icon: keep the captured SVG + name; the Builder matches it to a Figma
  // icon component (INSTANCE_SWAP), else rebuilds the SVG as a vector.
  if (node.svg) {
    return {
      name: "icon",
      type: "VECTOR",
      svg: node.svg,
      width: node.rect.width,
      height: node.rect.height,
      ...(node.iconName ? { iconName: node.iconName } : {}),
    };
  }

  const hasElementChildren = node.children.length > 0;
  const hasText = !!node.text && node.text.trim().length > 0;

  // A pure inline text run with no box of its own → a TEXT node.
  if (!hasElementChildren && hasText && !looksLikeBox(node, isRoot)) {
    return textNode(node, friendlyName(node, isRoot), ctx, path);
  }

  const frame: FrameNodeSpec = { name: friendlyName(node, isRoot), type: "FRAME" };
  const layout = layoutFor(node, ctx, path, hasElementChildren);
  if (layout) frame.layout = layout;
  const box = boxFor(node, ctx, path);
  if (box) frame.box = box;
  // Dimmed states (e.g. disabled) carry through as node opacity.
  const opacity = toFloat(node.styles.opacity ?? "1");
  if (opacity !== null && opacity < 1) frame.opacity = opacity;

  const children: NodeSpec[] = [];
  if (hasElementChildren) {
    node.children.forEach((child, i) =>
      children.push(normalizeNode(child, ctx, `${path}.${friendlyName(child, false)}#${i}`, false)),
    );
  } else if (hasText) {
    // An element whose only content is text → a label child inside the box.
    children.push(textNode(node, "label", ctx, `${path}.label`));
  }

  // Collapse an icon wrapper (e.g. `<span class="icon"><svg/></span>`) to the icon
  // itself, so the icon resolves directly instead of nesting inside an empty frame.
  if (!isRoot && children.length === 1 && isIconNode(children[0]!) && !frame.box) {
    return children[0]!;
  }

  if (children.length) frame.children = children;
  return frame;
}

function textNode(node: CaptureNode, name: string, ctx: Ctx, path: string): TextNodeSpec {
  const typography: TypographySpec = {};
  const size = dimValue(node, "fontSize", node.styles.fontSize, ctx, "size");
  if (size !== null) typography.size = size;
  const color = colorValue(node, "color", node.styles.color, ctx, `${path}.color`);
  if (color !== null) typography.color = color;
  return { name, type: "TEXT", text: (node.text ?? "").trim(), typography };
}

/** A node "is a box" if it paints or pads or is the component root. */
function looksLikeBox(node: CaptureNode, isRoot: boolean): boolean {
  if (isRoot) return true;
  const s = node.styles;
  if (!isTransparent(s.backgroundColor)) return true;
  if ((s.display ?? "").includes("flex")) return true;
  if (hasBorder(s)) return true;
  return ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].some(
    (p) => (toFloat(s[p] ?? "0") ?? 0) > 0,
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

function layoutFor(
  node: CaptureNode,
  ctx: Ctx,
  path: string,
  hasChildren: boolean,
): LayoutSpec | undefined {
  const s = node.styles;
  const display = s.display ?? "";
  const position = s.position ?? "static";

  if (position === "absolute" || position === "fixed" || position === "sticky") {
    push(ctx, "LAYOUT_UNMAPPABLE", `${path}.position`, position);
  }
  if (display.includes("grid")) {
    push(ctx, "LAYOUT_UNMAPPABLE", `${path}.display`, display);
    return { mode: "VERTICAL", padding: paddingOf(s), gap: gapOf(s, "row") };
  }

  const isFlex = display.includes("flex");
  if (!isFlex) {
    // Non-flex container with children — approximate as a vertical stack and flag it.
    if (hasChildren) push(ctx, "LAYOUT_UNMAPPABLE", `${path}.display`, display || "block");
    return hasChildren ? { mode: "VERTICAL", padding: paddingOf(s), gap: 0 } : undefined;
  }

  const dir = s.flexDirection ?? "row";
  const mode = dir.startsWith("column") ? "VERTICAL" : "HORIZONTAL";
  const layout: LayoutSpec = {
    mode,
    padding: paddingOf(s),
    gap: gapOf(s, mode === "HORIZONTAL" ? "column" : "row"),
  };
  const align = alignOf(s.alignItems);
  if (align) layout.align = align;
  const justify = justifyOf(s.justifyContent);
  if (justify) layout.justify = justify;
  return layout;
}

function paddingOf(s: Record<string, string>): [number, number, number, number] {
  return [
    toFloat(s.paddingTop ?? "0") ?? 0,
    toFloat(s.paddingRight ?? "0") ?? 0,
    toFloat(s.paddingBottom ?? "0") ?? 0,
    toFloat(s.paddingLeft ?? "0") ?? 0,
  ];
}

function gapOf(s: Record<string, string>, axis: "row" | "column"): number {
  const v = s[`${axis}Gap`] ?? s.gap ?? "0";
  return toFloat(v) ?? 0;
}

function alignOf(v: string | undefined): LayoutSpec["align"] {
  switch (v) {
    case "center": return "CENTER";
    case "flex-start": case "start": return "MIN";
    case "flex-end": case "end": return "MAX";
    default: return undefined;
  }
}

function justifyOf(v: string | undefined): LayoutSpec["justify"] {
  switch (v) {
    case "center": return "CENTER";
    case "flex-start": case "start": return "MIN";
    case "flex-end": case "end": return "MAX";
    case "space-between": return "SPACE_BETWEEN";
    default: return undefined;
  }
}

// ─── Box ──────────────────────────────────────────────────────────────────────

function boxFor(node: CaptureNode, ctx: Ctx, path: string): BoxSpec | undefined {
  const s = node.styles;
  const box: BoxSpec = {};

  const fill = colorValue(node, "backgroundColor", s.backgroundColor, ctx, `${path}.box.fill`);
  if (fill !== null) box.fill = fill;

  const radius = dimValue(node, "borderTopLeftRadius", s.borderTopLeftRadius, ctx, "radius");
  if (radius !== null && !(typeof radius === "number" && radius === 0)) box.radius = radius;

  if (hasBorder(s)) {
    const stroke = colorValue(node, "borderTopColor", s.borderTopColor, ctx, `${path}.box.stroke`);
    if (stroke !== null) {
      box.stroke = stroke;
      box.strokeWidth = toFloat(s.borderTopWidth ?? "0") ?? 1;
    }
  }

  return Object.keys(box).length ? box : undefined;
}

function hasBorder(s: Record<string, string>): boolean {
  const w = toFloat(s.borderTopWidth ?? "0") ?? 0;
  const style = s.borderTopStyle ?? "none";
  return w > 0 && style !== "none" && style !== "hidden";
}

// ─── Token resolution ───────────────────────────────────────────────────────

/**
 * A colour property → `{--token}` ref (preferred) or a raw literal.
 *
 * The **rendered** colour is the source of truth: we reverse-match it to the
 * token(s) resolving to that value, and use the authored `var(--…)` only to
 * disambiguate when several tokens share the value. This is what lets forced
 * states capture the right token — under `:hover` the rendered colour is the
 * hover token's value even though CDP matched-rules (the authored var) still
 * report the base rule.
 */
function colorValue(
  node: CaptureNode,
  prop: string,
  computed: string | undefined,
  ctx: Ctx,
  where: string,
): TokenValue | null {
  if (!computed || isTransparent(computed)) return null;

  const matches = reverseMatchColors(computed, node.tokens);
  const authored = node.varRefs?.[prop];

  let chosen: string | undefined;
  if (authored && matches.includes(authored)) chosen = authored; // disambiguate shared values
  else if (matches.length) chosen = matches[0]; // the rendered colour wins (state-aware)
  else if (authored) chosen = authored; // computed isn't tokenised but a var was authored

  if (chosen) {
    recordFallback(ctx, chosen, node.tokens?.[chosen] ?? computed);
    return `{${chosen}}`;
  }

  // A real colour with no token behind it — emit raw, but flag for review.
  push(ctx, "TOKEN_NO_MATCH", where, computed);
  return computed;
}

/** A dimension property → `{--token}` ref (preferred) or a raw number. */
function dimValue(
  node: CaptureNode,
  prop: string,
  computed: string | undefined,
  ctx: Ctx,
  kind: "radius" | "size",
): TokenValue | null {
  if (computed === undefined) return null;

  const authored = node.varRefs?.[prop];
  if (authored) {
    recordFallback(ctx, authored, node.tokens?.[authored] ?? computed);
    return `{${authored}}`;
  }

  const matched = reverseMatchDim(computed, node.tokens, kind);
  if (matched) {
    recordFallback(ctx, matched, node.tokens![matched]!);
    return `{${matched}}`;
  }

  return toFloat(computed);
}

const round = (n: number) => Math.round(n * 1000) / 1000;
const colorKey = (c: RGBA) => `${round(c.r)}|${round(c.g)}|${round(c.b)}|${round(c.a)}`;

function isTransparent(value: string | undefined): boolean {
  if (!value || value === "transparent" || value === "none") return true;
  const c = parseColor(value);
  return !!c && c.a === 0;
}

/** All `--color-*` tokens whose resolved value equals `value` (sorted). */
function reverseMatchColors(value: string, tokens: Record<string, string> | undefined): string[] {
  if (!tokens) return [];
  const target = parseColor(value);
  if (!target) return [];
  const key = colorKey(target);
  return Object.keys(tokens)
    .filter((v) => v.startsWith("--color-"))
    .filter((v) => {
      const c = parseColor(tokens[v]!);
      return c && colorKey(c) === key;
    })
    .sort();
}

function reverseMatchDim(
  value: string,
  tokens: Record<string, string> | undefined,
  kind: "radius" | "size",
): string | null {
  if (!tokens) return null;
  const target = toFloat(value);
  if (target === null || target === 0) return null;
  const prefixes = kind === "radius" ? ["--radius-", "--border-radius-"] : ["--type-size-"];
  const matches = Object.keys(tokens)
    .filter((v) => prefixes.some((p) => v.startsWith(p)))
    .filter((v) => toFloat(tokens[v]!) === target)
    .sort();
  return matches[0] ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function recordFallback(ctx: Ctx, cssVar: string, resolved: string): void {
  if (!(cssVar in ctx.fallbacks)) ctx.fallbacks[cssVar] = resolved;
}

function push(ctx: Ctx, kind: UnresolvedKind, where: string, found: string): void {
  ctx.counter++;
  ctx.unresolved.push({ id: `u${ctx.counter}`, kind, where, found });
}

function friendlyName(node: CaptureNode, isRoot: boolean): string {
  if (isRoot) return "root";
  if (node.tag === "#text") return "label";
  return node.className?.split(/\s+/)[0] || node.tag;
}
