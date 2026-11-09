/**
 * Figma frame → compact JSX skeleton.
 *
 * The saving comes from what's left out: a recognised instance becomes one element
 * and its internal layers are never sent. The contract comes from what's flagged:
 * an unmapped instance, an invalid value or an unbound colour is reported and never
 * approximated, because a plausible guess is the failure this package exists to stop.
 *
 * Figma properties don't always equal props. `FIGMA-PARITY.md` §7 records where they
 * deliberately differ, and the differences that affect output are handled here.
 *
 * Pure, so the published MCP server and the tests share it.
 */

import { parseEnumValues } from "../controls-core.js";
import { buildAnnotation } from "../flagging/annotation.js";
import { entryId } from "../schema.js";
import type { ComponentManifestEntry, LatestHashes } from "../schema.js";
import { computeStalenessCore } from "../staleness-core.js";
import type { FigmaAlias, FigmaComponentProperty, FigmaDocument, FigmaNode, FigmaPaint, FigmaVariableNames } from "./types.js";

export interface ResolveContext {
  /** Live entries by Figma component (set) key. */
  byKey: (key: string) => ComponentManifestEntry | undefined;
  /** Live entries by code name, to find a compound component's parts. */
  byName: (name: string) => ComponentManifestEntry | undefined;
  latest?: LatestHashes;
  /** Figma Variable name → CSS custom property. */
  variableIndex: Map<string, string>;
  variableNames: FigmaVariableNames;
}

export interface UnboundValue {
  node: string;
  property: string;
}

export interface Skeleton {
  imports: string[];
  code: string;
  unmapped: string[];
  /** Values a designer set by hand. There's no token to use, so they're left out. */
  unbound: UnboundValue[];
  warnings: string[];
  truncated: boolean;
}

const MAX_NODES = 2000;
/** `disabled` is folded into this axis (§7.1). The other values have no static prop. */
const STATE_AXIS = "state";

/** `label#123:0` → `label`. Figma suffixes non-variant property names. */
export function propertyName(raw: string): string {
  return raw.split("#")[0]!;
}

function quoted(value: string): string {
  return value.includes('"') || value.includes("\n") ? `{${JSON.stringify(value)}}` : `"${value}"`;
}

function jsxText(value: string): string {
  return /[{}<>]/.test(value) ? `{${JSON.stringify(value)}}` : value;
}

function comment(text: string): string {
  return `{/* ${text.replace(/\*\//g, "* /")} */}`;
}

/** `buildAnnotation`'s `//` lines, as a comment that's legal between JSX elements. */
function jsxAnnotation(annotation: string): string {
  return comment(annotation.split("\n").map((line) => line.replace(/^\/\/ /, "")).join(" "));
}

export interface ResolvedProps {
  attrs: string[];
  /** Text for the element's children. */
  content?: string;
  warnings: string[];
}

/** Figma properties → valid props for one entry. Anything invalid is dropped and reported. */
export function resolveProps(
  entry: ComponentManifestEntry,
  properties: Record<string, FigmaComponentProperty["value"]>,
  iconNameOf: (value: string) => string | undefined = () => undefined,
): ResolvedProps {
  const attrs = new Map<string, string>();
  const warnings: string[] = [];
  let content: string | undefined;
  const props = new Map(entry.props.map((prop) => [prop.name, prop]));

  for (const [raw, value] of Object.entries(properties)) {
    const name = propertyName(raw);

    if (name === STATE_AXIS) {
      if (value === "disabled") attrs.set("disabled", "disabled");
      else if (value === "error" && props.has("error")) attrs.set("error", "error");
      continue;
    }
    // §7.1: `iconPosition` is two booleans in Figma. `left` is the code's default.
    if (name === "icon-trailing" && props.has("iconPosition")) {
      if (value === true) attrs.set("iconPosition", 'iconPosition="right"');
      continue;
    }
    if (name === "icon-leading" && props.has("iconPosition")) continue;

    const prop = props.get(name);

    if (typeof value === "string" && name === "children") {
      content = value;
      continue;
    }
    if (!prop) {
      warnings.push(`${entry.codeName}: Figma property "${name}" has no prop, so it was left out.`);
      continue;
    }
    if (typeof value === "boolean") {
      if (value) attrs.set(name, name);
      continue;
    }
    if (name === "icon" || /Icon|ReactNode|ComponentType/.test(prop.type)) {
      const icon = iconNameOf(value);
      warnings.push(`${entry.codeName}: choose the "${name}" value yourself${icon ? `; Figma uses "${icon}"` : ""}.`);
      continue;
    }
    const allowed = parseEnumValues(prop.type);
    if (allowed && !allowed.includes(value)) {
      warnings.push(
        `${entry.codeName}: "${value}" isn't valid for "${name}" (${allowed.join(", ")}), so it was left out.`,
      );
      continue;
    }
    if (prop.defaultValue === value) continue;
    attrs.set(name, `${name}=${quoted(value)}`);
  }

  return { attrs: [...attrs.values()].sort(), ...(content !== undefined ? { content } : {}), warnings };
}

function pascal(name: string): string {
  return name
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join("");
}

function first(bound: FigmaAlias | FigmaAlias[] | undefined): FigmaAlias | undefined {
  return Array.isArray(bound) ? bound[0] : bound;
}

function visiblePaint(paints: FigmaPaint[] | undefined): FigmaPaint | undefined {
  return paints?.find((paint) => paint.visible !== false);
}

export function resolveFrame(doc: FigmaDocument, ctx: ResolveContext): Skeleton {
  const imports = new Set<string>();
  const unmapped = new Set<string>();
  const unbound: UnboundValue[] = [];
  const warnings = new Set<string>();
  let visited = 0;
  let truncated = false;

  const entryFor = (node: FigmaNode): ComponentManifestEntry | undefined => {
    const meta = node.componentId ? doc.components?.[node.componentId] : undefined;
    if (!meta) return undefined;
    // An instance points at one variant, which has its own key. The manifest holds the set's.
    const set = meta.componentSetId ? doc.componentSets?.[meta.componentSetId] : undefined;
    return ctx.byKey(set?.key ?? meta.key);
  };

  /** A variable's CSS property. `undefined` when it can't be named; never a guess. */
  const tokenOf = (node: FigmaNode, property: string, alias: FigmaAlias): string | undefined => {
    // Library variables have ids shaped `VariableID:<key>/<local>`, and the key is the stable part.
    const key = /^VariableID:([^/]+)\//.exec(alias.id)?.[1];
    const name = ctx.variableNames[alias.id] ?? (key ? ctx.variableNames[key] : undefined);
    const css = name ? ctx.variableIndex.get(name) : undefined;
    if (!css) {
      warnings.add(
        name
          ? `Figma Variable "${name}" (${node.name}, ${property}) has no matching token.`
          : `A bound variable on "${node.name}" (${property}) couldn't be named. Run figma:sync to refresh the variable names.`,
      );
    }
    return css;
  };

  const styleOf = (node: FigmaNode): string[] => {
    const style: string[] = [];
    const add = (cssProp: string, figmaProp: string, set: boolean, alias: FigmaAlias | undefined): void => {
      if (alias) {
        const css = tokenOf(node, figmaProp, alias);
        if (css) style.push(`${cssProp}: "var(${css})"`);
      } else if (set) {
        unbound.push({ node: node.name, property: figmaProp });
      }
    };
    const bound = node.boundVariables ?? {};

    if (node.type !== "TEXT") {
      if (node.layoutMode === "HORIZONTAL" || node.layoutMode === "VERTICAL") {
        style.push('display: "flex"');
        if (node.layoutMode === "VERTICAL") style.push('flexDirection: "column"');
      }
      add("gap", "itemSpacing", (node.itemSpacing ?? 0) > 0, first(bound.itemSpacing));
      add("paddingTop", "paddingTop", (node.paddingTop ?? 0) > 0, first(bound.paddingTop));
      add("paddingRight", "paddingRight", (node.paddingRight ?? 0) > 0, first(bound.paddingRight));
      add("paddingBottom", "paddingBottom", (node.paddingBottom ?? 0) > 0, first(bound.paddingBottom));
      add("paddingLeft", "paddingLeft", (node.paddingLeft ?? 0) > 0, first(bound.paddingLeft));
      add(
        "borderRadius",
        "cornerRadius",
        (node.cornerRadius ?? 0) > 0,
        first(bound.topLeftRadius) ?? first(bound.cornerRadius),
      );
      const stroke = visiblePaint(node.strokes);
      add("borderColor", "strokes", Boolean(stroke), stroke?.boundVariables?.color);
    }

    const fill = visiblePaint(node.fills);
    add(node.type === "TEXT" ? "color" : "background", "fills", Boolean(fill), fill?.boundVariables?.color);
    if (node.type === "TEXT") {
      add("fontSize", "fontSize", false, first(bound.fontSize));
    }
    return style;
  };

  const texts = (node: FigmaNode, out: string[] = []): string[] => {
    if (node.visible === false) return out;
    if (node.type === "TEXT" && node.characters) out.push(node.characters);
    node.children?.forEach((child) => texts(child, out));
    return out;
  };

  const indent = (lines: string[]): string[] => lines.map((line) => `  ${line}`);

  const wrap = (open: string, close: string, inner: string[]): string[] =>
    inner.length ? [open, ...indent(inner), close] : [`${open.slice(0, -1)} />`];

  const renderChildren = (node: FigmaNode): string[] => (node.children ?? []).flatMap(render);

  /** Slot layers of a compound component (`header` in Card → `CardHeader`). */
  const slotsOf = (node: FigmaNode, root: ComponentManifestEntry): string[] | undefined => {
    const slots = (node.children ?? []).flatMap((child) => {
      if (child.visible === false) return [];
      const part = ctx.byName(`${root.codeName}${pascal(child.name)}`);
      if (!part) return [];
      imports.add(part.codeName);
      return wrap(`<${part.codeName}>`, `</${part.codeName}>`, renderChildren(child));
    });
    return slots.length ? slots : undefined;
  };

  const renderInstance = (node: FigmaNode, entry: ComponentManifestEntry): string[] => {
    imports.add(entry.codeName);
    const properties = Object.fromEntries(
      Object.entries(node.componentProperties ?? {}).map(([name, property]) => [name, property.value]),
    );
    const iconName = (value: string): string | undefined => doc.components?.[value]?.name;
    const resolved = resolveProps(entry, properties, iconName);
    resolved.warnings.forEach((warning) => warnings.add(warning));

    const lines: string[] = [];
    const id = entryId(entry.codePath, entry.codeName);
    const staleness = computeStalenessCore(entry, ctx.latest?.hashes?.[id], ctx.latest?.props?.[id]);
    if (staleness.isStale) {
      lines.push(
        jsxAnnotation(
          buildAnnotation({
            codeName: entry.codeName,
            confidence: "exact",
            isStale: true,
            figmaNodeName: node.name,
          }),
        ),
      );
    }

    const attrs = resolved.attrs.length ? ` ${resolved.attrs.join(" ")}` : "";
    const slots = slotsOf(node, entry);
    if (slots) return [...lines, `<${entry.codeName}${attrs}>`, ...indent(slots), `</${entry.codeName}>`];

    // Internals are collapsed, but their words are the design's content.
    let content = resolved.content;
    const rest = content === undefined ? texts(node) : [];
    if (content === undefined && rest.length === 1) content = rest[0];
    else if (rest.length > 1) warnings.add(`${entry.codeName} ("${node.name}") holds this text: ${rest.join(" | ")}`);

    if (content === undefined) return [...lines, `<${entry.codeName}${attrs} />`];
    return [...lines, `<${entry.codeName}${attrs}>${jsxText(content)}</${entry.codeName}>`];
  };

  function render(node: FigmaNode): string[] {
    if (node.visible === false) return [];
    if (++visited > MAX_NODES) {
      truncated = true;
      return [];
    }

    if (node.type === "INSTANCE") {
      const entry = entryFor(node);
      if (entry) return renderInstance(node, entry);
      // `_Menu/Item`-style parts stand in for array props (§7.1); they're data, not components.
      unmapped.add(node.name);
      return [
        jsxAnnotation(buildAnnotation({ codeName: node.name, confidence: "none", figmaNodeName: node.name })),
        ...renderChildren(node),
      ];
    }

    if (node.type === "TEXT") {
      const style = styleOf(node);
      const attr = style.length ? ` style={{ ${style.join(", ")} }}` : "";
      return [`<p${attr}>${jsxText(node.characters ?? "")}</p>`];
    }

    if (["FRAME", "GROUP", "SECTION", "COMPONENT"].includes(node.type)) {
      const style = styleOf(node);
      const attr = style.length ? ` style={{ ${style.join(", ")} }}` : "";
      return wrap(`<div${attr}>`, "</div>", renderChildren(node));
    }

    // Vectors and shapes have no component and no token.
    return [comment(`${node.type.toLowerCase()}: "${node.name}"`)];
  }

  const body = render(doc.document);
  const names = [...imports].sort();
  const code = [
    ...(names.length ? [`import { ${names.join(", ")} } from "@ui-organized/react";`, ""] : []),
    ...body,
  ].join("\n");

  return {
    imports: names,
    code,
    unmapped: [...unmapped].sort(),
    unbound,
    warnings: [...warnings],
    truncated,
  };
}
