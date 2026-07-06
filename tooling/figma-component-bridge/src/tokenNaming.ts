/**
 * Token Name Map — the rules (COMPONENT-PLUGIN.md §1 foundation, Phase 1).
 *
 * Maps a CSS custom property (what the renderer captures from the DOM) to the
 * Figma Variable the Theme Import plugin creates for it. This is the single
 * place the three notations are bridged:
 *
 *   CSS dash     --color-interactive-primary-default
 *   Figma slash  Semantic : interactive/primary-default
 *
 * The rules are NOT guesses — they mirror the two halves of the existing
 * pipeline exactly:
 *
 *   1. The theme builder's export shape — apps/marketing/.../utils/buildConfig.ts
 *      `colorTokensFromRefs` splits a semantic var at the FIRST dash after
 *      `color-`, so `--color-interactive-primary-default` becomes the nested
 *      token `interactive › primary-default` (the leaf keeps its dashes), and
 *      `componentTokens` buckets `radius-*` / `control-height-*` / `Button-*`
 *      under `component`.
 *   2. The importer's naming — tooling/figma-plugin/src/importTheme.ts flattens
 *      that DTCG tree into slash-joined Figma Variable names across the
 *      Semantic / Scale / Typography collections.
 *
 * Worked example of why string-munging dashes is wrong:
 *   --color-interactive-destructive-default-ghost
 *     → Semantic : interactive/destructive-default-ghost   ✓ (one leaf)
 *     ✗ NOT interactive/destructive/default/ghost
 *
 * Primitives are deliberately unmapped: a theme's `brand`/`neutral` Figma
 * primitives are renamed from whichever core family was chosen, so a raw
 * `--grey-1000` has no stable Figma name — and components reference semantic /
 * component tokens, never raw primitives, so it never comes up.
 */

/** Figma Variable collections, as named by the Theme Import plugin. */
export type Collection = "Primitives" | "Semantic" | "Scale" | "Typography" | "Icons";

export interface FigmaVarRef {
  collection: Collection;
  /** Slash-nested Figma Variable name, e.g. "interactive/primary-default". */
  name: string;
}

/** Split `rest` at its first dash → [head, tail]; tail keeps any further dashes. */
function splitFirst(rest: string): [string, string | null] {
  const i = rest.indexOf("-");
  return i === -1 ? [rest, null] : [rest.slice(0, i), rest.slice(i + 1)];
}

/**
 * Resolve a CSS custom property name (with or without the leading `--`) to its
 * Figma Variable reference, or null if it has no stable mapping (primitives,
 * or an unrecognised prefix).
 */
export function cssVarToFigma(cssVar: string): FigmaVarRef | null {
  const name = cssVar.replace(/^--/, "");

  // Semantic colours: --color-<category>-<leaf…> → Semantic : <category>/<leaf…>
  if (name.startsWith("color-")) {
    const [category, leaf] = splitFirst(name.slice("color-".length));
    return { collection: "Semantic", name: leaf ? `${category}/${leaf}` : category };
  }

  // Typography: --type-<category>-<leaf…> → Typography : <category>/<leaf…>
  if (name.startsWith("type-")) {
    const [category, leaf] = splitFirst(name.slice("type-".length));
    return { collection: "Typography", name: leaf ? `${category}/${leaf}` : category };
  }

  // Scale — raw spacing scale: --spacing-<leaf> → Scale : spacing/<leaf>
  if (name.startsWith("spacing-")) {
    return { collection: "Scale", name: `spacing/${name.slice("spacing-".length)}` };
  }

  // Scale — raw radius scale: --border-radius-<leaf> → Scale : radius/<leaf>
  // (checked before `radius-` — distinct prefix, but ordered for clarity).
  if (name.startsWith("border-radius-")) {
    return { collection: "Scale", name: `radius/${name.slice("border-radius-".length)}` };
  }

  // Scale — component radius alias: --radius-<leaf> → Scale : component/radius/<leaf>
  if (name.startsWith("radius-")) {
    return { collection: "Scale", name: `component/radius/${name.slice("radius-".length)}` };
  }

  // Scale — shared control height: --control-height-<leaf> → component/control-height/<leaf>
  if (name.startsWith("control-height-")) {
    return { collection: "Scale", name: `component/control-height/${name.slice("control-height-".length)}` };
  }

  // Scale — button spacing: --Button-<Size>-<edge> → component/button/<size>-<edge>
  // (the importer lower-cases these; buildConfig.ts does too.)
  if (name.startsWith("Button-")) {
    return { collection: "Scale", name: `component/button/${name.slice("Button-".length).toLowerCase()}` };
  }

  return null;
}
