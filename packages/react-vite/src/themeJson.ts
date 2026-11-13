/**
 * Theme Builder `theme.json` → the theme stylesheet.
 *
 * Copies the DTCG token tree straight onto the contract's CSS custom properties.
 * It deliberately does NOT re-derive the theme from the builder's parametric
 * inputs in `$extensions` (brand family, radius base, …): that is what the
 * builder does on load, and it throws away every per-variable edit a designer
 * made in Figma. Reading the token values is what keeps those edits.
 *
 * The output is the builder's own `theme.css` for the same theme, block for
 * block (`buildThemeCss` in apps/marketing/src/tools/theme-builder/utils), and
 * a parity test there holds the two together:
 *
 *   :root                       the default mode's colors, then every
 *                               mode-independent token
 *   @media (dark) :root:not([data-theme])   only when the default is "system"
 *   [data-theme="light"]        light colors
 *   [data-theme="dark"]         dark colors
 *
 * Pure and Node-safe: no file system, no Vite. The plugin does the I/O and the
 * token-contract check.
 */

import { globalConstantVars } from "@ui-organized/tokens";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeJsonToCssOptions {
  /**
   * Which mode lands on bare `:root`. Defaults to the theme's own
   * `$extensions["com.ui-organized.theme-builder"].exportDefaultMode` (the
   * builder's Default mode control), else `"light"`.
   */
  defaultMode?: ThemeMode;
}

/** The mode blocks plus everything mode-independent, as `--name → value` maps. */
export interface ThemeVars {
  name: string;
  defaultMode: ThemeMode;
  light: Record<string, string>;
  dark: Record<string, string>;
  /** Typography, spacing, radius, component aliases and the layout constants. */
  shared: Record<string, string>;
}

const BUILDER_EXTENSION = "com.ui-organized.theme-builder";
const THEME_BUILDER_URL = "https://uiorganized.com/tools/theme-builder";
const MODES = ["light", "dark", "system"] as const;
const ALIAS = /^\{([^{}]+)\}$/;

type Group = Record<string, unknown>;

const isGroup = (v: unknown): v is Group =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isToken = (v: unknown): v is Group => isGroup(v) && "$value" in v;

/**
 * A group's keys in the order the builder wrote them.
 *
 * `JSON.parse` hoists integer-like keys ("10", "11", "12") ahead of every other
 * key, so `border-radius` and `dimension` come back as 10, 11, 12, 01 … 09. No
 * object can hold them in written order, so it is re-applied here: all-digit
 * keys first in numeric order, then the rest as written. That is the builder's
 * own order (`01` … `12`, then `full`).
 */
function orderedKeys(group: Group): string[] {
  const keys = Object.keys(group).filter((k) => !k.startsWith("$"));
  const numeric = keys.filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
  return [...numeric, ...keys.filter((k) => !/^\d+$/.test(k))];
}

interface Leaf {
  path: string[];
  token: Group;
  type: string | undefined;
}

/** Every token under `group`, depth first, carrying the nearest `$type`. */
function leaves(group: Group, path: string[] = [], inherited?: string): Leaf[] {
  const type = typeof group.$type === "string" ? group.$type : inherited;
  const out: Leaf[] = [];
  for (const key of orderedKeys(group)) {
    const node = group[key];
    if (isToken(node)) {
      out.push({
        path: [...path, key],
        token: node,
        type: typeof node.$type === "string" ? node.$type : type,
      });
    } else if (isGroup(node)) {
      out.push(...leaves(node, [...path, key], type));
    }
  }
  return out;
}

/** Collects every problem in one pass, so a broken file reports all of them at once. */
class Problems {
  readonly list: string[] = [];
  add(message: string): undefined {
    this.list.push(message);
    return undefined;
  }
}

/**
 * Follow `{a.b.c}` references through the whole document, as DTCG defines
 * them. The builder's colors alias `{primitive.color.<group>.<step>}`; a file
 * re-exported from Figma can alias anything.
 */
function resolve(doc: Group, value: unknown, at: string, problems: Problems, seen: string[] = []): unknown {
  if (typeof value !== "string") return value;
  const match = ALIAS.exec(value.trim());
  if (!match) return value;
  const ref = match[1]!;
  if (seen.includes(ref)) {
    return problems.add(`${at}: circular reference ${[...seen, ref].map((r) => `{${r}}`).join(" → ")}`);
  }
  let node: unknown = doc;
  for (const part of ref.split(".")) node = isGroup(node) ? node[part] : undefined;
  if (!isToken(node)) return problems.add(`${at}: {${ref}} doesn't resolve to a token`);
  return resolve(doc, node.$value, at, problems, [...seen, ref]);
}

/** A family name gets the builder's `'Name', sans-serif`; a full stack is kept as written. */
function fontStack(value: unknown): string | undefined {
  const names = typeof value === "string" ? [value] : Array.isArray(value) ? value : undefined;
  if (!names?.length || !names.every((n): n is string => typeof n === "string")) return undefined;
  if (names.length === 1 && /[,'"]/.test(names[0]!)) return names[0]!.trim();
  const generic = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[a-z-]+)$/;
  const stack = names.map((n) => (generic.test(n) ? n : `'${n}'`));
  if (!generic.test(names[names.length - 1]!)) stack.push("sans-serif");
  return stack.join(", ");
}

/**
 * One token's CSS value. The builder writes strings throughout (`"16px"`,
 * `"#bc4900"`, `"rgba(0, 0, 0, 0.1)"`), so those pass through untouched; the
 * other shapes are DTCG's, accepted so a hand-edited file doesn't need to
 * match the builder's formatting.
 */
function cssValue(leaf: Leaf, doc: Group, defaultType: string | undefined, problems: Problems): string | undefined {
  const at = leaf.path.join(".");
  const value = resolve(doc, leaf.token.$value, at, problems);
  if (value === undefined) return undefined;
  const type = leaf.type ?? defaultType;

  if (type === "fontFamily") {
    return fontStack(value) ?? problems.add(`${at}: a fontFamily needs a name or a list of names`);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return problems.add(`${at}: empty $value`);
    // A brace left in a value is a reference this file can't resolve as a
    // whole-value alias, e.g. `"{a} {b}"`. Writing it into CSS would invalidate
    // the declaration and the component would quietly fall back.
    if (/[{}]/.test(trimmed)) return problems.add(`${at}: unsupported reference in "${trimmed}"`);
    return trimmed;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return type === "dimension" ? `${value}px` : String(value);
  }
  if (isGroup(value) && typeof value.value === "number" && typeof value.unit === "string") {
    return `${value.value}${value.unit}`;
  }
  return problems.add(`${at}: unsupported $value ${JSON.stringify(value)}`);
}

/** Map one top-level group onto CSS custom properties. */
function collect(
  doc: Group,
  group: unknown,
  root: string,
  name: (path: string[]) => string,
  problems: Problems,
  defaultType?: string,
): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!isGroup(group)) return vars;
  for (const leaf of leaves(group)) {
    const value = cssValue({ ...leaf, path: [root, ...leaf.path] }, doc, defaultType, problems);
    if (value !== undefined) vars[name(leaf.path)] = value;
  }
  return vars;
}

/**
 * `type.*` with each size followed by its leading, the order the builder's
 * stylesheet uses (the DTCG tree keeps them in two separate groups).
 */
function typeVars(doc: Group, problems: Problems): Record<string, string> {
  const type = doc.type;
  if (!isGroup(type)) return {};
  const all = collect(doc, type, "type", (p) => `--type-${p.join("-")}`, problems);
  const size = isGroup(type.size) ? orderedKeys(type.size) : [];
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith("--type-leading-") && size.includes(key.slice("--type-leading-".length))) {
      continue; // placed after its size below
    }
    vars[key] = value;
    if (key.startsWith("--type-size-")) {
      const leading = `--type-leading-${key.slice("--type-size-".length)}`;
      if (leading in all) vars[leading] = all[leading]!;
    }
  }
  return vars;
}

/**
 * `color.<mode>.<category>.<leaf>` → `--color-<category>-<leaf>`. The one bare
 * token, `brand`, is `--brand`, which is how the builder's export nests it.
 */
const colorName = (p: string[]): string =>
  p.length === 1 && p[0] === "brand" ? "--brand" : `--color-${p.join("-")}`;

/**
 * `component.radius.*` → `--radius-*`, `component.control-height.*` →
 * `--control-height-*`, `component.button.small-horizontal` →
 * `--Button-Small-horizontal` (the export lower-cases the contract's name).
 */
const componentName = (p: string[]): string => {
  if (p[0] !== "button") return `--${p.join("-")}`;
  const rest = p.slice(1).join("-");
  return `--Button-${rest.charAt(0).toUpperCase()}${rest.slice(1)}`;
};

/**
 * The layout constants: `--dimension-*` and `--z-index-*`.
 *
 * The values ship in `@ui-organized/tokens`, and no theme has a reason to
 * change them, but the component CSS reads them, so a stylesheet without them
 * builds green and then stacks every overlay on DOM order. A builder export
 * carries `dimension` and no z-index (stacking has no Figma equivalent); a file
 * re-exported from Figma carries neither. So the tokens package fills in
 * whatever the file doesn't declare, and anything it does declare wins.
 */
function constantVars(doc: Group, problems: Problems): Record<string, string> {
  const fromDoc = {
    ...collect(doc, doc.dimension, "dimension", (p) => `--dimension-${p.join("-")}`, problems, "dimension"),
    ...collect(doc, doc["z-index"], "z-index", (p) => `--z-index-${p.join("-")}`, problems, "number"),
  };
  const merged = { ...globalConstantVars(), ...fromDoc };
  const step = (k: string) => Number(k.slice("--dimension-".length));
  const dimension = Object.keys(merged)
    .filter((k) => k.startsWith("--dimension-"))
    .sort((a, b) => step(a) - step(b) || a.localeCompare(b));
  const rest = Object.keys(merged).filter((k) => !k.startsWith("--dimension-"));
  return Object.fromEntries([...dimension, ...rest].map((k) => [k, merged[k]!]));
}

function builderExtension(doc: Group): Group {
  const ext = isGroup(doc.$extensions) ? doc.$extensions[BUILDER_EXTENSION] : undefined;
  return isGroup(ext) ? ext : {};
}

function isLegacyConfig(doc: Group): boolean {
  return isGroup(doc.metadata) && isGroup(doc.color) && isGroup(doc.color.modes);
}

/**
 * Read a theme.json into its mode blocks and shared tokens. Throws one error
 * listing every problem it found.
 */
export function themeJsonToVars(input: unknown, options: ThemeJsonToCssOptions = {}): ThemeVars {
  if (!isGroup(input)) {
    throw new Error("theme.json must be a JSON object (a DTCG token document).");
  }
  const doc = input;

  if (isLegacyConfig(doc)) {
    throw new Error(
      "This is a legacy theme config (it has `metadata` and `color.modes`), the format " +
        "@ui-organized/react-vite 2.x read. Version 3 builds from the theme.json the Theme " +
        `Builder exports. Recreate the theme at ${THEME_BUILDER_URL}, export it, and point ` +
        "the plugin's `config` at the theme.json in the zip.",
    );
  }

  const ext = builderExtension(doc);
  const requested = options.defaultMode ?? ext.exportDefaultMode;
  const defaultMode: ThemeMode = MODES.includes(requested as ThemeMode)
    ? (requested as ThemeMode)
    : "light";
  const name =
    typeof ext.themeName === "string" && ext.themeName.trim() ? ext.themeName.trim() : "Theme";

  const color = isGroup(doc.color) ? doc.color : undefined;
  const missingModes = (["light", "dark"] as const).filter((m) => !isGroup(color?.[m]));
  if (missingModes.length) {
    throw new Error(
      `theme.json has no ${missingModes.map((m) => `color.${m}`).join(" or ")} group. ` +
        "Export it from the Theme Builder, or from Figma with the Theme Import plugin, " +
        "both of which write a light and a dark mode.",
    );
  }

  const problems = new Problems();
  const light = collect(doc, color!.light, "color.light", colorName, problems, "color");
  const dark = collect(doc, color!.dark, "color.dark", colorName, problems, "color");
  const shared = {
    ...typeVars(doc, problems),
    ...collect(doc, doc.spacing, "spacing", (p) => `--spacing-${p.join("-")}`, problems, "dimension"),
    ...collect(
      doc,
      doc["border-radius"],
      "border-radius",
      (p) => `--border-radius-${p.join("-")}`,
      problems,
      "dimension",
    ),
    ...collect(doc, doc.component, "component", componentName, problems, "dimension"),
    ...constantVars(doc, problems),
  };

  if (problems.list.length) {
    throw new Error(
      `theme.json has ${problems.list.length} token${problems.list.length === 1 ? "" : "s"} ` +
        `that can't be written as CSS:\n${problems.list.map((p) => `  • ${p}`).join("\n")}`,
    );
  }
  return { name, defaultMode, light, dark, shared };
}

function block(selector: string, vars: Record<string, string>): string {
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}

/** Lay out `themeJsonToVars`' result as the stylesheet. */
export function themeVarsToCss({ name, defaultMode, light, dark, shared }: ThemeVars): string {
  const byMode = { light, dark };
  const rootMode = defaultMode === "system" ? "light" : defaultMode;

  // A theme name is user text; `*/` in it would end the comment early.
  const header =
    `/* ${name.replace(/\*\//g, "* /")}, built from theme.json by @ui-organized/react-vite.\n` +
    `   Default mode: ${defaultMode}${defaultMode === "system" ? " (follows prefers-color-scheme)" : ""}. */\n`;

  const blocks = [header, block(":root", { ...byMode[rootMode], ...shared })];

  if (defaultMode === "system") {
    // `:not([data-theme])` is what keeps an explicit attribute authoritative.
    // Without it this rule ties with `[data-theme="light"]` on specificity and
    // wins on source order, so a light island inside a dark OS theme goes dark.
    const decls = Object.entries(dark)
      .map(([k, v]) => `    ${k}: ${v};`)
      .join("\n");
    blocks.push(
      `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme]) {\n${decls}\n  }\n}`,
    );
  }

  blocks.push(block('[data-theme="light"]', light), block('[data-theme="dark"]', dark));
  return blocks.join("\n\n") + "\n";
}

/**
 * Build the theme stylesheet from a Theme Builder `theme.json` (parsed).
 *
 * Throws on a legacy react-vite 2.x config, a document without both color
 * modes, or tokens whose values can't be written as CSS (an unresolvable
 * `{reference}`, an unsupported value shape). It does not check the result
 * against the token contract; the plugin does, with the contract of the
 * library you have installed.
 */
export function themeJsonToCss(doc: unknown, options: ThemeJsonToCssOptions = {}): string {
  return themeVarsToCss(themeJsonToVars(doc, options));
}
