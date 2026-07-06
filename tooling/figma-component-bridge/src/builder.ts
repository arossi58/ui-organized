/**
 * The Builder (sandbox-side). Turns a {@link ComponentSpec} into real Figma
 * nodes: one component per variant, auto-layout from the layout spec, fills /
 * radius / text color bound to live Figma Variables by name, then combined into
 * a variant set.
 *
 * Phase 0 scope: enough of the engine to prove the contract end-to-end — a real
 * variant set whose fill is bound to a live `interactive/*` Variable. Full node
 * construction (effects, instance-swap props, non-variant component properties)
 * is Phase 4. Every token miss degrades gracefully: the raw fallback is painted
 * so the build stays visible, and an `unresolved` record is recorded so the
 * resolution queue can surface it.
 */

import { parseColor, toFloat, type RGBA } from "./color";
import {
  buildVariableIndex,
  resolveByRef,
  resolveVariable,
  type VariableIndex,
} from "./tokenMap";
import { resolutionKey, type ResolutionMap } from "./resolution";
import {
  isIconNode,
  isTextNode,
  parseTokenRef,
  type ComponentSpec,
  type FrameNodeSpec,
  type IconNodeSpec,
  type LayoutSpec,
  type NodeSpec,
  type TextNodeSpec,
  type TokenValue,
  type UnresolvedKind,
  type UnresolvedRecord,
  type VariantSpec,
} from "./spec";

export interface BuildReport {
  component: string;
  variantsBuilt: number;
  /** How many symbolic token refs bound to a live Figma Variable. */
  boundTokens: number;
  /** Token refs resolved manually as "accept the raw value" (Phase 5). */
  acceptedRaw: number;
  /** The seed for the resolution queue: spec misses + binds that failed here. */
  unresolved: UnresolvedRecord[];
  /** Every "Collection:name" Variable in the file — options for the resolution UI. */
  variables: string[];
  /** Every local component name in the file — options for icon SLOT_DEFAULT. */
  components: string[];
}

const BLACK: RGBA = { r: 0, g: 0, b: 0, a: 1 };
const DEFAULT_FONT: FontName = { family: "Inter", style: "Regular" };

/** Nodes that carry `fills` (and `strokes`). */
type PaintableNode = ComponentNode | FrameNode | TextNode;
/** Nodes that carry corner radius + auto-layout. */
type FrameLike = ComponentNode | FrameNode;

interface BuildContext {
  index: VariableIndex;
  fallbacks: Record<string, string>;
  unresolved: UnresolvedRecord[];
  boundTokens: number;
  acceptedRaw: number;
  counter: number;
  /** The component being built — part of the resolution key. */
  component: string;
  /** Remembered manual resolutions, pre-applied so the build converges. */
  resolutions: ResolutionMap;
  /** The font that's been loaded; assigned before any `characters` write. */
  font: FontName;
  /** Local components / component sets indexed by normalized name — icon targets. */
  components: Map<string, ComponentNode | ComponentSetNode>;
  /** Icon instances created this build, to wire to the INSTANCE_SWAP property. */
  iconInstances: InstanceNode[];
  /** The default component/set for the icon INSTANCE_SWAP property. */
  iconDefault: { key: string; type: "COMPONENT" | "COMPONENT_SET" } | null;
}

export async function buildComponentSpec(
  spec: ComponentSpec,
  resolutions: ResolutionMap = {},
): Promise<BuildReport> {
  const index = await buildVariableIndex();
  const font = await loadDefaultFont();
  await figma.loadAllPagesAsync();
  // Index component SETS (e.g. `lucide/plus`, whose children are size variants)
  // and standalone components — keyed by normalized name. The set name is the
  // icon name; its `size=N` variant children are NOT indexed individually.
  const componentSets = figma.root.findAllWithCriteria({ types: ["COMPONENT_SET"] });
  const standalone = figma.root
    .findAllWithCriteria({ types: ["COMPONENT"] })
    .filter((c) => c.parent?.type !== "COMPONENT_SET");
  const components = new Map<string, ComponentNode | ComponentSetNode>();
  for (const s of componentSets) {
    const key = normalizeIconName(s.name);
    if (!components.has(key)) components.set(key, s);
  }
  for (const c of standalone) {
    const key = normalizeIconName(c.name);
    if (!components.has(key)) components.set(key, c);
  }
  const componentNames = [...new Set([...componentSets.map((s) => s.name), ...standalone.map((c) => c.name)])].sort();
  const ctx: BuildContext = {
    index,
    fallbacks: spec.fallbacks ?? {},
    unresolved: [...spec.unresolved],
    boundTokens: 0,
    acceptedRaw: 0,
    counter: spec.unresolved.length,
    component: spec.component,
    resolutions,
    font,
    components,
    iconInstances: [],
    iconDefault: null,
  };

  // Only the props that actually vary become variant-axis name segments, so a
  // single-axis slice produces a clean single-axis set.
  const nameKeys = varyingKeys(spec.variants);

  const built: ComponentNode[] = [];
  for (const variant of spec.variants) {
    const comp = figma.createComponent();
    comp.fills = [];
    await applyFrameSpec(comp, variant.tree, "root", ctx);
    comp.name = variantNodeName(variant.props, nameKeys);
    built.push(comp);
  }

  let result: ComponentSetNode | ComponentNode;
  if (built.length > 1) {
    const set = figma.combineAsVariants(built, figma.currentPage);
    set.name = spec.component;
    layoutGrid(set);
    result = set;
  } else {
    result = built[0]!;
    result.name = spec.component;
  }

  applyComponentProperties(result, spec, ctx);

  figma.currentPage.selection = [result];
  figma.viewport.scrollAndZoomIntoView([result]);

  return {
    component: spec.component,
    variantsBuilt: built.length,
    boundTokens: ctx.boundTokens,
    acceptedRaw: ctx.acceptedRaw,
    unresolved: ctx.unresolved,
    variables: ctx.index.all.map(({ collection, variable }) => `${collection}:${variable.name}`).sort(),
    components: componentNames,
  };
}

/**
 * Decide how to realise an icon (Phase 5 SLOT_DEFAULT): match its name to a local
 * component, else apply a remembered slot resolution (a chosen component, or "keep
 * vector"), else leave it unresolved — the caller falls back to the SVG vector.
 */
type IconTarget = ComponentNode | ComponentSetNode;
type IconDecision = { kind: "instance"; target: IconTarget } | { kind: "vector" } | { kind: "unresolved" };

function decideIcon(ctx: BuildContext, iconName: string): IconDecision {
  const direct = ctx.components.get(normalizeIconName(iconName));
  if (direct) return { kind: "instance", target: direct };

  const remembered = ctx.resolutions[resolutionKey(ctx.component, "SLOT_DEFAULT", iconName)];
  if (remembered?.action === "accept-raw") return { kind: "vector" };
  if (remembered?.action === "bind" && remembered.variable) {
    const picked = ctx.components.get(normalizeIconName(remembered.variable));
    if (picked) return { kind: "instance", target: picked };
  }
  return { kind: "unresolved" };
}

/**
 * Instance an icon target. For a component SET, pick the size variant whose width
 * best matches the captured icon (e.g. a 16px button icon → the `size=16` variant);
 * for a standalone component, just instance it.
 */
function createIconInstance(target: IconTarget, width: number): InstanceNode {
  if (target.type === "COMPONENT_SET") {
    const variants = target.children.filter((c): c is ComponentNode => c.type === "COMPONENT");
    let best: ComponentNode = target.defaultVariant ?? variants[0]!;
    let bestDelta = Infinity;
    for (const v of variants) {
      const delta = Math.abs(v.width - width);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = v;
      }
    }
    return best.createInstance();
  }
  return target.createInstance();
}

/** Normalize a component / icon name for matching: drop group prefix, lowercase, hyphenate. */
function normalizeIconName(name: string): string {
  const leaf = name.split("/").pop() ?? name;
  return leaf.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

/**
 * Decide how to realise a token reference (Phase 5): auto-resolve by the Token
 * Name Map, else apply a remembered manual resolution (bind to a chosen Variable
 * or accept the raw value), else leave it unresolved for the queue.
 */
type TokenDecision =
  | { kind: "bind"; variable: Variable }
  | { kind: "raw" }
  | { kind: "unresolved"; candidates: string[]; expected?: string };

function decideToken(ctx: BuildContext, cssVar: string, type: VariableResolvedDataType): TokenDecision {
  const { variable, candidates, expected } = resolveVariable(cssVar, ctx.index, type);
  if (variable) return { kind: "bind", variable };

  const remembered = ctx.resolutions[resolutionKey(ctx.component, "TOKEN_NO_MATCH", cssVar)];
  if (remembered?.action === "accept-raw") return { kind: "raw" };
  if (remembered?.action === "bind" && remembered.variable) {
    const v = resolveByRef(remembered.variable, ctx.index, type);
    if (v) return { kind: "bind", variable: v };
  }
  return { kind: "unresolved", candidates, expected: expected ?? undefined };
}

// ─── Node construction ────────────────────────────────────────────────────────

async function applyFrameSpec(
  frame: FrameLike,
  spec: FrameNodeSpec,
  path: string,
  ctx: BuildContext,
): Promise<void> {
  frame.name = spec.name;
  if (spec.opacity !== undefined) frame.opacity = spec.opacity;
  if (spec.layout) applyLayout(frame, spec.layout);
  if (spec.box) {
    if (spec.box.fill !== undefined) applyFill(frame, spec.box.fill, `${path}.box.fill`, ctx);
    if (spec.box.radius !== undefined) applyRadius(frame, spec.box.radius, `${path}.box.radius`, ctx);
    if (spec.box.stroke != null) {
      applyStroke(frame, spec.box.stroke, spec.box.strokeWidth ?? 1, `${path}.box.stroke`, ctx);
    }
  }
  for (const child of spec.children ?? []) {
    const node = await buildNode(child, `${path}.${child.name}`, ctx);
    frame.appendChild(node);
  }
}

async function buildNode(spec: NodeSpec, path: string, ctx: BuildContext): Promise<SceneNode> {
  if (isTextNode(spec)) return buildText(spec, path, ctx);
  if (isIconNode(spec)) return buildIcon(spec, ctx);
  const frame = figma.createFrame();
  frame.fills = []; // wrappers are transparent unless box.fill says otherwise
  await applyFrameSpec(frame, spec, path, ctx);
  return frame;
}

/**
 * Realise an icon: an instance of the matching Figma component (wired to an
 * INSTANCE_SWAP property in {@link applyComponentProperties}), else the SVG
 * rebuilt as a vector — recording a SLOT_DEFAULT when there's no match.
 */
function buildIcon(spec: IconNodeSpec, ctx: BuildContext): SceneNode {
  if (spec.iconName) {
    const d = decideIcon(ctx, spec.iconName);
    if (d.kind === "instance") {
      try {
        const inst = createIconInstance(d.target, spec.width);
        inst.name = spec.name;
        if (spec.width > 0 && spec.height > 0) inst.resize(spec.width, spec.height);
        ctx.iconInstances.push(inst);
        if (!ctx.iconDefault) ctx.iconDefault = { key: d.target.key, type: d.target.type };
        return inst;
      } catch {
        // createInstance failed — fall through to the vector.
      }
    } else if (d.kind === "unresolved") {
      pushUnresolved(ctx, "SLOT_DEFAULT", "root.icon", spec.iconName, iconCandidates(ctx, spec.iconName));
    }
  }
  return buildVector(spec);
}

/** Rebuild a captured icon as a real vector (frame of paths) from its SVG. */
function buildVector(spec: IconNodeSpec): SceneNode {
  try {
    const node = figma.createNodeFromSvg(spec.svg);
    node.name = spec.name;
    if (spec.width > 0 && spec.height > 0) node.resize(spec.width, spec.height);
    return node;
  } catch {
    // Malformed SVG — leave a correctly-sized placeholder so layout still holds.
    const ph = figma.createFrame();
    ph.name = spec.name;
    ph.fills = [];
    ph.resize(Math.max(1, spec.width), Math.max(1, spec.height));
    return ph;
  }
}

/** Component names whose normalized form contains the icon name — SLOT_DEFAULT hints. */
function iconCandidates(ctx: BuildContext, iconName: string): string[] {
  const needle = normalizeIconName(iconName);
  return [...ctx.components.entries()]
    .filter(([key]) => key.includes(needle))
    .slice(0, 8)
    .map(([, component]) => component.name);
}

function buildText(spec: TextNodeSpec, path: string, ctx: BuildContext): TextNode {
  const t = figma.createText();
  t.name = spec.name;
  t.fontName = ctx.font; // assign the loaded font before writing characters
  t.characters = spec.text;
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  const typo = spec.typography;
  if (typo) {
    if (typo.color !== undefined) applyFill(t, typo.color ?? null, `${path}.color`, ctx);
    if (typo.size !== undefined) applyFontSize(t, typo.size, `${path}.size`, ctx);
  }
  return t;
}

// ─── Layout ───────────────────────────────────────────────────────────────────

function applyLayout(frame: FrameLike, layout: LayoutSpec): void {
  frame.layoutMode = layout.mode;
  if (layout.mode === "NONE") return;
  const [top, right, bottom, left] = layout.padding;
  frame.paddingTop = top;
  frame.paddingRight = right;
  frame.paddingBottom = bottom;
  frame.paddingLeft = left;
  frame.itemSpacing = layout.gap;
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  if (layout.justify) frame.primaryAxisAlignItems = layout.justify;
  if (layout.align) frame.counterAxisAlignItems = layout.align;
}

// ─── Token binding ──────────────────────────────────────────────────────────

/** Set a node's fill — bound to a COLOR Variable, or a raw fallback on a miss. */
function applyFill(node: PaintableNode, value: TokenValue | null, where: string, ctx: BuildContext): void {
  if (value == null) return;
  const cssVar = parseTokenRef(value);
  if (cssVar) {
    const base = solidFrom(ctx.fallbacks[cssVar]);
    const d = decideToken(ctx, cssVar, "COLOR");
    if (d.kind === "bind") {
      node.fills = [figma.variables.setBoundVariableForPaint(base, "color", d.variable)];
      ctx.boundTokens++;
    } else if (d.kind === "raw") {
      node.fills = [base];
      ctx.acceptedRaw++;
    } else {
      node.fills = [base];
      pushUnresolved(ctx, "TOKEN_NO_MATCH", where, cssVar, d.candidates, d.expected);
    }
    return;
  }
  if (typeof value === "string") {
    const rgba = parseColor(value);
    if (rgba) node.fills = [solidFromRgba(rgba)];
  }
}

/** Set a node's stroke — bound to a COLOR Variable, or a raw fallback on a miss. */
function applyStroke(
  frame: FrameLike,
  value: TokenValue,
  width: number,
  where: string,
  ctx: BuildContext,
): void {
  const cssVar = parseTokenRef(value);
  if (cssVar) {
    const base = solidFrom(ctx.fallbacks[cssVar]);
    const d = decideToken(ctx, cssVar, "COLOR");
    if (d.kind === "bind") {
      frame.strokes = [figma.variables.setBoundVariableForPaint(base, "color", d.variable)];
      ctx.boundTokens++;
    } else if (d.kind === "raw") {
      frame.strokes = [base];
      ctx.acceptedRaw++;
    } else {
      frame.strokes = [base];
      pushUnresolved(ctx, "TOKEN_NO_MATCH", where, cssVar, d.candidates, d.expected);
    }
    frame.strokeWeight = width;
    return;
  }
  if (typeof value === "string") {
    const rgba = parseColor(value);
    if (rgba) {
      frame.strokes = [solidFromRgba(rgba)];
      frame.strokeWeight = width;
    }
  }
}

/** Bind corner radius to a FLOAT Variable (all four corners), or set a raw px. */
function applyRadius(frame: FrameLike, value: TokenValue, where: string, ctx: BuildContext): void {
  const cssVar = parseTokenRef(value);
  if (cssVar) {
    const d = decideToken(ctx, cssVar, "FLOAT");
    if (d.kind === "bind") {
      for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"] as const) {
        frame.setBoundVariable(corner, d.variable);
      }
      ctx.boundTokens++;
    } else {
      const n = numericFallback(ctx, cssVar);
      if (n !== null) frame.cornerRadius = n;
      if (d.kind === "raw") ctx.acceptedRaw++;
      else pushUnresolved(ctx, "TOKEN_NO_MATCH", where, cssVar, d.candidates, d.expected);
    }
    return;
  }
  if (typeof value === "number") frame.cornerRadius = value;
}

/** Bind font size to a FLOAT Variable, or set a raw number. */
function applyFontSize(t: TextNode, value: TokenValue, where: string, ctx: BuildContext): void {
  const cssVar = parseTokenRef(value);
  if (cssVar) {
    const d = decideToken(ctx, cssVar, "FLOAT");
    if (d.kind === "bind") {
      t.setBoundVariable("fontSize", d.variable);
      ctx.boundTokens++;
    } else {
      const fb = numericFallback(ctx, cssVar);
      if (fb !== null) t.fontSize = fb;
      if (d.kind === "raw") ctx.acceptedRaw++;
      else pushUnresolved(ctx, "TOKEN_NO_MATCH", where, cssVar, d.candidates, d.expected);
    }
    return;
  }
  const n = typeof value === "number" ? value : toFloat(value);
  if (n !== null) t.fontSize = n;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function loadDefaultFont(): Promise<FontName> {
  try {
    await figma.loadFontAsync(DEFAULT_FONT);
    return DEFAULT_FONT;
  } catch {
    const fonts = await figma.listAvailableFontsAsync();
    const first = fonts[0]?.fontName ?? DEFAULT_FONT;
    await figma.loadFontAsync(first);
    return first;
  }
}

function solidFrom(raw: string | undefined): SolidPaint {
  const rgba = raw ? parseColor(raw) : null;
  return solidFromRgba(rgba ?? BLACK);
}

function solidFromRgba(c: RGBA): SolidPaint {
  return { type: "SOLID", color: { r: c.r, g: c.g, b: c.b }, opacity: c.a };
}

function numericFallback(ctx: BuildContext, cssVar: string): number | null {
  const fb = ctx.fallbacks[cssVar];
  return fb ? toFloat(fb) : null;
}

function pushUnresolved(
  ctx: BuildContext,
  kind: UnresolvedKind,
  where: string,
  found: string,
  candidates: string[],
  expected?: string,
): void {
  ctx.counter++;
  ctx.unresolved.push({ id: `u${ctx.counter}`, kind, where, found, expected, candidates });
}

/** The prop keys whose value differs across variants → real variant axes. */
function varyingKeys(variants: VariantSpec[]): string[] {
  const first = variants[0];
  if (!first) return [];
  const keys = Object.keys(first.props);
  const varying = keys.filter((k) => new Set(variants.map((v) => v.props[k])).size > 1);
  return varying.length ? varying : keys;
}

/** Figma encodes variant axes in the component name: `intent=primary, size=md`. */
function variantNodeName(props: Record<string, string>, keys: string[]): string {
  return keys.map((k) => `${k}=${props[k]}`).join(", ");
}

/** Lay the variant set out in a tidy padded grid (uniform cells). */
function layoutGrid(set: ComponentSetNode): void {
  set.layoutMode = "NONE";
  const kids = set.children;
  if (kids.length === 0) return;
  const pad = 24;
  const gap = 24;
  const cols = Math.min(6, Math.ceil(Math.sqrt(kids.length)));
  const cellW = Math.max(...kids.map((k) => k.width));
  const cellH = Math.max(...kids.map((k) => k.height));
  kids.forEach((k, i) => {
    k.x = pad + (i % cols) * (cellW + gap);
    k.y = pad + Math.floor(i / cols) * (cellH + gap);
  });
  const rows = Math.ceil(kids.length / cols);
  set.resizeWithoutConstraints(
    pad * 2 + cols * cellW + (cols - 1) * gap,
    pad * 2 + rows * cellH + (rows - 1) * gap,
  );
}

/**
 * Wire non-variant component properties: a TEXT property (e.g. `children`) bound
 * to every label, and — when icons matched local components — an INSTANCE_SWAP
 * property (`icon`) bound to every icon instance, so the generated component
 * exposes an editable label and a swappable icon in Figma.
 */
function applyComponentProperties(
  node: ComponentSetNode | ComponentNode,
  spec: ComponentSpec,
  ctx: BuildContext,
): void {
  const textEntry = Object.entries(spec.propertyDefinitions).find(([, d]) => d.type === "TEXT");
  if (textEntry) {
    const [name, def] = textEntry;
    const labels = node.findAllWithCriteria({ types: ["TEXT"] });
    if (labels.length > 0) {
      const defaultValue = typeof def.default === "string" ? def.default : labels[0]!.characters;
      try {
        const propId = node.addComponentProperty(name, "TEXT", defaultValue);
        for (const t of labels) {
          t.componentPropertyReferences = { ...(t.componentPropertyReferences ?? {}), characters: propId };
        }
      } catch {
        // e.g. a property with this name already exists — skip.
      }
    }
  }

  if (ctx.iconInstances.length > 0 && ctx.iconDefault) {
    try {
      const propId = node.addComponentProperty("icon", "INSTANCE_SWAP", ctx.iconDefault.key, {
        preferredValues: [{ type: ctx.iconDefault.type, key: ctx.iconDefault.key }],
      });
      for (const inst of ctx.iconInstances) {
        inst.componentPropertyReferences = { ...(inst.componentPropertyReferences ?? {}), mainComponent: propId };
      }
    } catch {
      // INSTANCE_SWAP property couldn't be added — instances still render the icon.
    }
  }
}
