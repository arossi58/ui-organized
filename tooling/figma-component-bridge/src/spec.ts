/**
 * The Spec JSON contract (COMPONENT-PLUGIN.md §2).
 *
 * This is the single boundary between the (future) companion service that reads
 * `@ui-organized/react` + renders it, and the Figma Builder that turns the spec
 * into nodes. The plugin NEVER reads code — it only consumes this shape. Freeze
 * it early; everything upstream and downstream negotiates through it.
 *
 * Two rules keep it bulletproof:
 *  - Token references stay **symbolic**: `"{--color-interactive-primary-default}"`,
 *    never a resolved `rgb()`. The Builder binds to a Figma Variable by name;
 *    the resolved value is only a fallback when no Variable matches (`fallbacks`).
 *  - Anything the pipeline can't decide becomes an `unresolved` record rather
 *    than a silent guess.
 */

/** Figma component-property kinds we emit. */
export type PropertyKind = "VARIANT" | "BOOLEAN" | "TEXT" | "INSTANCE_SWAP";

export interface PropertyDefinition {
  type: PropertyKind;
  /** Allowed values for a VARIANT axis (e.g. ["sm","md","lg"]). */
  values?: string[];
  default?: string | boolean | null;
}

/**
 * A token-or-literal value. Either a symbolic ref `"{--css-var}"` (preferred) or
 * a raw literal (`"#0052cc"`, `8`). Use {@link parseTokenRef} to tell them apart.
 */
export type TokenValue = string | number;

/** Auto-layout description — already Figma-shaped; the normalizer does flex→AL. */
export interface LayoutSpec {
  mode: "HORIZONTAL" | "VERTICAL" | "NONE";
  /** [top, right, bottom, left] in px. */
  padding: [number, number, number, number];
  gap: number;
  /** Cross-axis alignment of children. */
  align?: "MIN" | "CENTER" | "MAX";
  /** Main-axis distribution of children. */
  justify?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
}

export interface BoxSpec {
  /** Corner radius — symbolic FLOAT token ref or a raw number. */
  radius?: TokenValue;
  /** Background fill — symbolic COLOR token ref or a raw color string. */
  fill?: TokenValue | null;
  /** Border color — symbolic COLOR token ref or a raw color string. */
  stroke?: TokenValue | null;
  /** Border width in px (raw). */
  strokeWidth?: number;
}

export interface TypographySpec {
  family?: TokenValue;
  size?: TokenValue;
  weight?: TokenValue;
  /** Text color — symbolic COLOR token ref or a raw color string. */
  color?: TokenValue;
  lineHeight?: TokenValue;
}

export interface FrameNodeSpec {
  name: string;
  type?: "FRAME";
  layout?: LayoutSpec;
  box?: BoxSpec;
  /** Node opacity (0–1) — e.g. a disabled state's dimmed look. */
  opacity?: number;
  children?: NodeSpec[];
}

export interface TextNodeSpec {
  name: string;
  type: "TEXT";
  text: string;
  typography?: TypographySpec;
}

/**
 * An icon: raw SVG markup captured from the DOM, rebuilt with
 * `figma.createNodeFromSvg`. Wiring it to an INSTANCE_SWAP component property
 * needs an icon component in the file to swap to (SLOT_DEFAULT) — deferred.
 */
export interface IconNodeSpec {
  name: string;
  type: "VECTOR";
  svg: string;
  width: number;
  height: number;
  /** The icon's name (e.g. "plus"), matched to a Figma icon component when possible. */
  iconName?: string;
}

export type NodeSpec = FrameNodeSpec | TextNodeSpec | IconNodeSpec;

/** Narrow a node spec to a text node. */
export function isTextNode(node: NodeSpec): node is TextNodeSpec {
  return node.type === "TEXT";
}

/** Narrow a node spec to an icon (vector) node. */
export function isIconNode(node: NodeSpec): node is IconNodeSpec {
  return node.type === "VECTOR";
}

/** One emitted prop+state combination. `props` includes the pseudo-axis `state`. */
export interface VariantSpec {
  props: Record<string, string>;
  tree: FrameNodeSpec;
}

/** The categories the pipeline can't auto-decide (COMPONENT-PLUGIN.md §4). */
export type UnresolvedKind =
  | "TOKEN_NO_MATCH"
  | "LAYOUT_UNMAPPABLE"
  | "STATE_UNCAPTURABLE"
  | "PROP_KIND_AMBIGUOUS"
  | "SLOT_DEFAULT"
  | "AXIS_SELECTION";

export interface UnresolvedRecord {
  id: string;
  kind: UnresolvedKind;
  /** Stable node path the ambiguity lives at, e.g. "root.box.fill". */
  where: string;
  /** What the pipeline found (a raw value, a css var name, …). */
  found?: string;
  /** The Figma Variable the rule looked for, e.g. "Semantic:interactive/primary-default". */
  expected?: string;
  /** Suggested resolutions (e.g. "Semantic:interactive/primary-default"). */
  candidates?: string[];
}

export interface ComponentSpec {
  component: string;
  source: { file: string; hash: string };
  propertyDefinitions: Record<string, PropertyDefinition>;
  states: string[];
  variants: VariantSpec[];
  unresolved: UnresolvedRecord[];
  /**
   * Resolved raw values keyed by css-var, used ONLY when a token ref can't be
   * bound to a Figma Variable — so the build stays visible while the miss is
   * still reported. The companion renderer fills this from `getComputedStyle`.
   */
  fallbacks?: Record<string, string>;
}

/** A symbolic token reference: `{--some-css-var}`. */
const TOKEN_REF_RE = /^\{(--[a-z0-9-]+)\}$/i;

/**
 * If `value` is a symbolic token ref `"{--css-var}"`, return the css-var name
 * (`"--css-var"`); otherwise null (it's a raw literal).
 */
export function parseTokenRef(value: TokenValue | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const m = TOKEN_REF_RE.exec(value.trim());
  return m ? m[1]! : null;
}
