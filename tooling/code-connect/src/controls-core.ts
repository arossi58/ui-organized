/**
 * Manifest {@link PropDefinition} → editable control (INSPECTOR.md §4).
 *
 * Pure — no React, no Storybook — so it's unit-testable and shared by every
 * consumer that has to answer "what are this prop's legal values?": the Storybook
 * Inspector panel's rows, the native docs playground, and `ai-context.ts`'s union
 * expansion.
 *
 * The manifest is the ONLY source of "what properties exist and what they're
 * called" (§0.3): we classify off `prop.type` / `figmaVariantMapping`, never off
 * Storybook's inferred argTypes. `controlFromArgType` exists purely to fill the
 * gaps for args the manifest doesn't describe — it never overrides a verified
 * manifest variant.
 *
 * This lived in `tooling/storybook-inspector/src/controls.ts` until the native
 * docs site needed the same classification; that file is now a re-export shim.
 */

import type { PropDefinition } from "./schema.js";

export type ControlKind =
  | "variant"
  | "boolean"
  | "number"
  | "range"
  | "text"
  | "color"
  | "object"
  | "unsupported";

export interface Control {
  name: string;
  kind: ControlKind;
  /** Enum members, for a `variant` pill group. */
  options?: string[];
  required: boolean;
  defaultValue?: string;
  /** Range bounds, for a slider. */
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  figmaVariantMapping?: string;
  /** True when this control is backed by a verified manifest prop. */
  verified?: boolean;
}

/**
 * Parse a string-literal union type (`"sm" | "md" | "lg"`) into its members.
 * Returns null if the type is anything other than a pure union of string literals
 * (e.g. `string | boolean`, `React.ReactNode`) — those aren't variant axes.
 */
export function parseEnumValues(type: string): string[] | null {
  const parts = type.split("|").map((p) => p.trim());
  const values: string[] = [];
  for (const part of parts) {
    const m = /^"([^"]*)"$|^'([^']*)'$/.exec(part);
    if (!m) return null; // a non-literal member → not an enum
    values.push(m[1] ?? m[2] ?? "");
  }
  return values.length > 0 ? values : null;
}

/** Classify one prop into the control kind used to render its row. */
export function classifyProp(prop: PropDefinition): Control {
  const base = {
    name: prop.name,
    required: prop.required,
    defaultValue: prop.defaultValue,
    description: prop.description,
    figmaVariantMapping: prop.figmaVariantMapping,
  };

  const enumValues = parseEnumValues(prop.type);
  if (enumValues) return { ...base, kind: "variant", options: enumValues };
  if (prop.type === "boolean") return { ...base, kind: "boolean" };
  if (prop.type === "number") return { ...base, kind: "number" };
  if (prop.type === "string") return { ...base, kind: "text" };
  return { ...base, kind: "unsupported" };
}

/** Controls for an entry's props, skipping ones we can't drive (callbacks, nodes). */
export function controlsFor(props: PropDefinition[]): Control[] {
  return props.map(classifyProp).filter((c) => c.kind !== "unsupported");
}

/** A slice of a Storybook argType we can classify into a control. */
export interface StoryArgTypeInput {
  control?: string | { type?: string; min?: number; max?: number; step?: number } | false;
  options?: unknown[];
  description?: string;
  name?: string;
  defaultValue?: unknown;
  table?: { defaultValue?: { summary?: string } };
}

/** The default value Storybook would show in the Controls "Default" column. */
export function defaultOf(argType: StoryArgTypeInput): string | undefined {
  const summary = argType.table?.defaultValue?.summary;
  if (summary != null) return summary;
  if (argType.defaultValue != null) return String(argType.defaultValue);
  return undefined;
}

/**
 * Classify a Storybook argType into a control — the same coverage as the Controls
 * panel (boolean, number, range/slider, text, color, object/JSON, select/radio).
 * Returns null for args with no usable control (actions, disabled controls).
 */
export function controlFromArgType(name: string, argType: StoryArgTypeInput): Control | null {
  if (argType.control === false) return null;
  const c = argType.control;
  const controlType = typeof c === "string" ? c : c?.type;
  const options = argType.options?.map(String);
  const base = {
    name,
    required: false,
    description: argType.description,
    defaultValue: defaultOf(argType),
  };

  // Options → a pill group, regardless of select/radio/check flavor.
  if (options && options.length > 0) return { ...base, kind: "variant", options };

  switch (controlType) {
    case "boolean":
      return { ...base, kind: "boolean" };
    case "number":
      return { ...base, kind: "number" };
    case "range":
      return {
        ...base,
        kind: "range",
        min: typeof c === "object" ? c.min : undefined,
        max: typeof c === "object" ? c.max : undefined,
        step: typeof c === "object" ? c.step : undefined,
      };
    case "color":
      return { ...base, kind: "color" };
    case "object":
      return { ...base, kind: "object" };
    case "text":
    case "date":
      return { ...base, kind: "text" };
    default:
      return null;
  }
}

/**
 * Merge a manifest entry's props with a story's argTypes into one control list.
 *
 * Order follows the argTypes definition order (like Storybook's Controls panel),
 * with manifest-only props appended. Where the manifest has a verified variant its
 * options win — they're read from the real code union, whereas an argType's
 * `options` array is hand-maintained and can drift.
 *
 * Shared by the Inspector panel and the native docs playground so both show the
 * same controls in the same order for the same story.
 */
export function mergeControls(
  props: PropDefinition[],
  argTypes: Record<string, StoryArgTypeInput>,
): Control[] {
  const manifestByName = new Map(controlsFor(props).map((c) => [c.name, c]));
  const controls: Control[] = [];
  const seen = new Set<string>();

  for (const [name, at] of Object.entries(argTypes)) {
    seen.add(name);
    const fromArg = controlFromArgType(name, at);
    const manifest = manifestByName.get(name);
    const chosen = manifest?.kind === "variant" ? manifest : (fromArg ?? manifest);
    if (!chosen) continue;
    controls.push({
      ...chosen,
      description: chosen.description ?? at.description,
      defaultValue: chosen.defaultValue ?? defaultOf(at),
      verified: manifestByName.has(name),
    });
  }

  // Manifest props Storybook didn't surface as argTypes (rare).
  for (const [name, c] of manifestByName) {
    if (!seen.has(name)) controls.push({ ...c, verified: true });
  }
  return controls;
}

/**
 * Group controls into Figma-style sections. A control whose name shares a prefix
 * with others (e.g. `icon`, `iconPosition`) collapses under that prefix; the rest
 * live under "Properties". Pure UI grouping, no logic implication (§4).
 *
 * "State" comes first and is the reason the grouping exists at all for overlays.
 * A Dialog's or a Select's interesting DOM only exists while it is open, so on a
 * preview surface `open` isn't one prop among twenty — it's the switch that
 * makes the component inspectable. Matched on the prop NAME so this stays
 * component-agnostic: nothing here knows what a Dialog is.
 */
const STATE_CONTROL = /^(default)?(open|expanded)$|^modal$/i;

export interface ControlSection {
  title: string;
  controls: Control[];
}

export function groupControls(controls: Control[]): ControlSection[] {
  const state = controls.filter((c) => STATE_CONTROL.test(c.name));
  const iconish = controls.filter((c) => !STATE_CONTROL.test(c.name) && /^icon/i.test(c.name));
  const rest = controls.filter((c) => !STATE_CONTROL.test(c.name) && !/^icon/i.test(c.name));
  const sections: ControlSection[] = [];
  if (state.length) sections.push({ title: "State", controls: state });
  if (rest.length) sections.push({ title: "Properties", controls: rest });
  if (iconish.length) sections.push({ title: "Icon", controls: iconish });
  return sections;
}
