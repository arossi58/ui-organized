/**
 * The design tokens an agent may use, and what each family is for.
 *
 * Names and values come from the built `variables.css`, the file consumers
 * actually load, so this can't list a token that resolves to nothing. The purpose
 * of each group is hand-written here, because only 11 of the semantic tokens carry
 * a `$description` and most of those describe a value rather than when to reach
 * for it. Guidance is per group, not per token: 200 sentences would mostly restate
 * the name.
 *
 * The raw palette (`--grey-1400`, `--brand-1200`) is left out on purpose. It is
 * theme-blind, so UI built on it breaks in the other mode.
 *
 * Pure: the caller reads the file. Shared by `generate-ai-docs.ts` and the MCP
 * tools so `/ai/tokens.md` and `search_tokens` can't disagree.
 */

export interface TokenGroup {
  id: string;
  title: string;
  prefix: RegExp;
  useFor: string;
  /** Words an agent would search with that the token names don't contain. */
  keywords: string[];
}

export const TOKEN_GROUPS: readonly TokenGroup[] = [
  {
    id: "surface",
    title: "Surfaces",
    prefix: /^--color-surface-/,
    useFor:
      "Backgrounds of custom containers. `base` is the page; `primary` and `secondary` step away from it for raised panels. " +
      "`overlay-*` are translucent layers over another surface, never a background alone. `curtain` dims the page behind a modal.",
    keywords: ["background", "bg", "panel", "card", "page", "fill", "raised", "elevated"],
  },
  {
    id: "content",
    title: "Text and icons",
    prefix: /^--color-content-/,
    useFor:
      "Foreground colour of text and icons. `primary` for main text, `secondary` for supporting text, `tertiary` for the least important, " +
      "`placeholder` for empty inputs. `inverse` sits on an opposite-tone fill. `light` and `dark` don't change with the theme, so use them only on a fill that doesn't either.",
    keywords: ["text", "foreground", "font colour", "font color", "icon", "heading", "body", "muted", "label"],
  },
  {
    id: "border",
    title: "Borders",
    prefix: /^--color-border-/,
    useFor: "Border and divider colours. `primary` and `secondary` for containers and rules; `data-entry` for the edge of custom inputs.",
    keywords: ["divider", "outline", "stroke", "separator", "hairline", "line"],
  },
  {
    id: "status",
    title: "Status",
    prefix: /^--color-status-/,
    useFor:
      "Outcome colours: success, info, caution, warning, error. Each has a solid base, a `-bg` tint for a background and a `-content` colour for text on that tint; pair them. " +
      "Colour alone never carries the meaning, so say it in words too.",
    keywords: ["success", "error", "warning", "danger", "alert", "info", "feedback", "state"],
  },
  {
    id: "interactive",
    title: "Interactive",
    prefix: /^--color-interactive-/,
    useFor:
      "Only for a custom control that no component covers; a component's own props come first. Each role has `default`, `hover`, `active` and often `selected`. " +
      "`focus` is the focus ring, `inactive-*` is disabled. Secondary and ghost values are translucent overlays, not fills.",
    keywords: ["button", "hover", "focus", "disabled", "pressed", "brand", "accent", "link", "primary colour", "primary color"],
  },
  {
    id: "spacing",
    title: "Spacing",
    prefix: /^--spacing-space-/,
    useFor: "All padding, margins and gaps. The suffix is a scale step, not pixels: `--spacing-space-04` is 16px. There is no `--space-*` family.",
    keywords: ["padding", "margin", "gap", "gutter", "inset", "layout", "whitespace"],
  },
  {
    id: "radius",
    title: "Corner radius",
    prefix: /^--border-radius-/,
    useFor: "Rounded corners of custom containers. `full` makes a pill or circle.",
    keywords: ["rounded", "corner", "corners", "pill", "circle"],
  },
  {
    id: "dimension",
    title: "Dimensions",
    prefix: /^--dimension-/,
    useFor: "Large fixed sizes in 40px steps: widths and heights of panels and columns. Not for padding or gaps.",
    keywords: ["width", "height", "size", "column", "sidebar", "max-width"],
  },
  {
    id: "type-size",
    title: "Type size",
    prefix: /^--type-size-/,
    useFor: "Font size. Roles run from `display-*` through `heading-*` and `body-*` to `caption`; choose by role, then use the matching leading.",
    keywords: ["font", "font-size", "text size", "typography", "heading", "title", "body", "caption"],
  },
  {
    id: "type-leading",
    title: "Line height",
    prefix: /^--type-leading-/,
    useFor: "Line height. Always pair with the `--type-size-*` of the same role.",
    keywords: ["line-height", "line height", "typography"],
  },
  {
    id: "type-weight",
    title: "Font weight",
    prefix: /^--type-weight-/,
    useFor: "Font weight, in `body-*` and `heading-*` sets. Use the set that matches the text's role.",
    keywords: ["bold", "font-weight", "typography", "strong", "emphasis"],
  },
  {
    id: "type-font",
    title: "Font family",
    prefix: /^--type-font-/,
    useFor: "Font family for headings and body. Never name a typeface directly; themes change it.",
    keywords: ["typeface", "font-family", "family", "typography"],
  },
  {
    id: "z-index",
    title: "Stacking",
    prefix: /^--z-index-/,
    useFor: "Stacking order of custom floating layers, so they sit correctly against dialogs, popovers, toasts and tooltips.",
    keywords: ["layer", "stack", "overlay", "modal", "above"],
  },
  {
    id: "component",
    title: "Component internals",
    prefix: /^--(Button-|control-height-|radius-(checkbox|interactive|status)\b)/,
    useFor: "Read by the components themselves. Read `--control-height-*` to line a custom element up with a control; otherwise leave these alone.",
    keywords: ["control", "input height", "align"],
  },
];

export interface Token {
  name: string;
  group: TokenGroup | null;
  /** Resolved through `var()` chains. Equal to `dark` and `light` when the theme doesn't change it. */
  value: string;
  dark?: string;
  light?: string;
}

/** `prop: value` declarations of each block, later blocks overriding earlier ones with the same selector. */
function readBlocks(css: string): Map<string, Map<string, string>> {
  const blocks = new Map<string, Map<string, string>>();
  for (const block of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = block[1]!.replace(/\/\*[\s\S]*?\*\//g, "").trim();
    const decls = blocks.get(selector) ?? new Map<string, string>();
    for (const decl of block[2]!.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      decls.set(decl[1]!, decl[2]!.trim());
    }
    blocks.set(selector, decls);
  }
  return blocks;
}

export function parseTokens(css: string): Token[] {
  const blocks = readBlocks(css);
  const root = blocks.get(":root") ?? new Map<string, string>();
  const dark = blocks.get('[data-theme="dark"]') ?? new Map<string, string>();
  const light = blocks.get('[data-theme="light"]') ?? new Map<string, string>();

  const resolve = (name: string, mode: Map<string, string>): string | undefined => {
    let value = mode.get(name) ?? root.get(name);
    const seen = new Set([name]);
    for (let ref = value && /^var\((--[\w-]+)\)$/.exec(value); ref; ref = value && /^var\((--[\w-]+)\)$/.exec(value)) {
      if (seen.has(ref[1]!)) break;
      seen.add(ref[1]!);
      value = mode.get(ref[1]!) ?? root.get(ref[1]!);
    }
    return value;
  };

  const names = new Set([...root.keys(), ...dark.keys(), ...light.keys()]);
  return [...names].sort().map((name) => {
    const inDark = resolve(name, dark);
    const inLight = resolve(name, light);
    return {
      name,
      group: TOKEN_GROUPS.find((g) => g.prefix.test(name)) ?? null,
      value: resolve(name, root) ?? inDark ?? inLight ?? "",
      ...(inDark !== inLight ? { dark: inDark, light: inLight } : {}),
    };
  });
}

function shape(token: Token) {
  return {
    name: token.name,
    usage: `var(${token.name})`,
    ...(token.dark !== undefined || token.light !== undefined
      ? { dark: token.dark, light: token.light }
      : { value: token.value }),
    group: token.group?.title ?? "Raw palette",
    useFor: token.group?.useFor ?? "Do not use directly: raw palette steps ignore the theme.",
  };
}

export type TokenResult = ReturnType<typeof shape>;

const SEARCH_LIMIT = 20;

/** Semantic tokens matching a query, best first. The raw palette is never returned. */
export function searchTokens(tokens: Token[], query: string): TokenResult[] {
  const words = query.toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean);
  const scored = tokens.flatMap((token) => {
    if (!token.group) return [];
    const name = token.name.toLowerCase();
    const keywords = token.group.keywords.join(" ");
    const title = token.group.title.toLowerCase();
    const score = words.reduce(
      (total, word) =>
        total + (name.includes(word) ? 3 : 0) + (keywords.includes(word) ? 2 : 0) + (title.includes(word) ? 2 : 0),
      0,
    );
    return score > 0 ? [{ token, score }] : [];
  });
  return scored
    .sort((a, b) => b.score - a.score || a.token.name.localeCompare(b.token.name))
    .slice(0, SEARCH_LIMIT)
    .map(({ token }) => shape(token));
}

export type TokenLookup =
  | { found: true; token: TokenResult; warning?: string }
  | { found: false; warning: string; suggestions: string[] };

/** One token by exact name. A miss returns real alternatives, never a guess. */
export function getToken(tokens: Token[], rawName: string): TokenLookup {
  const name = rawName.trim().replace(/^var\(\s*/, "").replace(/\s*\)$/, "");
  const wanted = name.startsWith("--") ? name : `--${name}`;
  const token = tokens.find((t) => t.name === wanted);
  if (token) {
    return token.group
      ? { found: true, token: shape(token) }
      : {
          found: true,
          token: shape(token),
          warning: `${wanted} is a raw palette step and ignores the theme. Use a semantic token instead.`,
        };
  }
  return {
    found: false,
    warning: `${wanted} does not exist. Do not use it; it would resolve to nothing.`,
    suggestions: searchTokens(tokens, wanted.replace(/^--/, "").replace(/-/g, " ")).slice(0, 5).map((t) => t.name),
  };
}

/** `/ai/tokens.md`. */
export function renderTokensMarkdown(tokens: Token[], packageVersion: string): string {
  const cell = (value: string | undefined): string => `\`${value ?? ""}\``;

  const sections = TOKEN_GROUPS.flatMap((group) => {
    const members = tokens.filter((t) => t.group?.id === group.id);
    if (members.length === 0) return [];
    const themed = members.some((t) => t.dark !== undefined || t.light !== undefined);
    const rows = members.map((t) =>
      themed
        ? `| \`${t.name}\` | ${cell(t.dark ?? t.value)} | ${cell(t.light ?? t.value)} |`
        : `| \`${t.name}\` | ${cell(t.value)} |`,
    );
    return [
      `## ${group.title}`,
      "",
      group.useFor,
      "",
      themed ? "| Token | Dark | Light |\n|---|---|---|" : "| Token | Value |\n|---|---|",
      ...rows,
      "",
    ];
  });

  return `# Design tokens — @ui-organized/tokens v${packageVersion}

## Rules — follow exactly

1. A component's own props come first. Reach for tokens only in custom layout and custom elements.
2. Write every colour, space, radius and font value as \`var(--token)\` from this file. Never a hex colour or a px literal.
3. Values are shown so you can choose between tokens. Never copy a value into code: themes change them.
4. If a token isn't listed here, it does not exist. Stop and ask; do not invent one.
5. Never use raw palette steps such as \`--grey-1400\`. They ignore the theme.

Load the tokens once at the app entry: \`import "@ui-organized/tokens/variables.css";\`

${sections.join("\n")}`;
}

function splitFirst(value: string): [string, string | undefined] {
  const at = value.indexOf("-");
  return at === -1 ? [value, undefined] : [value.slice(0, at), value.slice(at + 1)];
}

/**
 * The Figma Variable a token is published as (`FIGMA-PARITY.md` §3). The leaf keeps
 * its inner dashes: `interactive/destructive-default-ghost`, not four levels.
 */
export function cssVarToFigmaVariable(cssVar: string): string | null {
  const name = cssVar.replace(/^--/, "");
  const nested = (rest: string): string => {
    const [category, leaf] = splitFirst(rest);
    return leaf ? `${category}/${leaf}` : category;
  };
  if (name.startsWith("color-")) return nested(name.slice("color-".length));
  if (name.startsWith("type-")) return nested(name.slice("type-".length));
  if (name.startsWith("spacing-")) return `spacing/${name.slice("spacing-".length)}`;
  if (name.startsWith("border-radius-")) return `radius/${name.slice("border-radius-".length)}`;
  if (name.startsWith("radius-")) return `component/radius/${name.slice("radius-".length)}`;
  if (name.startsWith("control-height-")) return `component/control-height/${name.slice("control-height-".length)}`;
  if (name.startsWith("Button-")) return `component/button/${name.slice("Button-".length).toLowerCase()}`;
  return null;
}

/**
 * Figma Variable name → CSS property, built from real tokens so a name that maps
 * can't resolve to nothing. The raw palette is excluded: components never bind it.
 */
export function figmaVariableIndex(tokens: Token[]): Map<string, string> {
  const index = new Map<string, string>();
  for (const token of tokens) {
    if (!token.group) continue;
    const variable = cssVarToFigmaVariable(token.name);
    if (variable) index.set(variable, token.name);
  }
  return index;
}
