/**
 * Resolves the theme's typefaces into loadable stylesheet links, and emits the
 * `fonts.ts` module in the export bundle.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 *
 * `theme.css` *names* its typefaces (`--type-font-heading: 'Oswald', sans-serif`)
 * but nothing in the bundle ever *fetched* them. A consumer who followed the
 * install instructions exactly got the theme's metrics — sizes, weights, leading —
 * rendered in the fallback typeface. It looks deliberate, so it doesn't get
 * reported as a bug.
 *
 * ── Why not just `@import` in theme.css ─────────────────────────────────────
 *
 * It's the obvious fix and it's the wrong one:
 *
 * - It hides the font behind a second round trip. `@import` is invisible to the
 *   preload scanner, so the browser has to fetch and parse `theme.css` before it
 *   discovers a font request exists. A `<link>` in the head is found immediately,
 *   and fonts are already the most render-blocking asset on a page.
 * - It hard-codes a third-party CDN into a token artifact. Self-hosting would
 *   then mean hand-editing generated output after every re-export, and
 *   hotlinking Google Fonts carries GDPR exposure in the EU.
 * - There's no opt-out that survives regeneration.
 *
 * Loading *strategy* — subsetting, `font-display`, preloading only the
 * above-the-fold weight — is legitimately app-specific. So the bundle exports the
 * metadata and the recommended markup and lets the app decide, which serves both
 * the drop-it-in case and the self-hosting case. Same treatment icons already
 * get: something the CSS can't express, given its own artifact and a documented
 * mount rather than being forced into the stylesheet.
 */

import { googleFontsHref, normalizeWeights } from "../hooks/useGoogleFonts";
import type { BuilderState } from "../state/themeState";

export interface ThemeFont {
  family: string;
  /** Ascending, deduplicated — the order the `css2` endpoint requires. */
  weights: number[];
  /** The `css2` stylesheet URL for exactly this family and these weights. */
  href: string;
}

/**
 * The theme's typefaces as one entry per family.
 *
 * Deduplicated by family, because heading and body are the same font more often
 * than not (the design system's own default is Inter for both) — two `<link>`s
 * to the same family would be a wasted request. When they do share, the weight
 * sets are merged so the single request covers both roles.
 *
 * One `href` per family, never a combined multi-family URL: the endpoint drops an
 * unknown family from a multi-family request *silently*, answering 200 with that
 * font simply missing. Per-family requests keep one bad name from taking the
 * others down with it.
 */
export function resolveThemeFonts(state: BuilderState): ThemeFont[] {
  const roles: Array<{ family: string; weights: Record<string, number> }> = [
    { family: state.headingFamily, weights: state.headingWeights },
    { family: state.bodyFamily, weights: state.bodyWeights },
  ];

  const byFamily = new Map<string, Set<number>>();
  for (const { family, weights } of roles) {
    if (!family) continue;
    const set = byFamily.get(family) ?? new Set<number>();
    for (const weight of Object.values(weights)) {
      if (Number.isFinite(weight)) set.add(weight);
    }
    byFamily.set(family, set);
  }

  return [...byFamily.entries()].map(([family, weights]) => {
    const list = normalizeWeights([...weights]);
    return { family, weights: list, href: googleFontsHref(family, list) };
  });
}

/** The `<link>` block for the document head — used by the README and the docs. */
export function fontLinkTags(fonts: ThemeFont[]): string {
  return [
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    ...fonts.map((f) => `<link rel="stylesheet" href="${f.href}">`),
  ].join("\n");
}

// ─── fonts.ts (the exported module) ──────────────────────────────────────────

/**
 * Emit `fonts.ts` — data only, so a build step can generate the tags without
 * regex-parsing the CSS for family names.
 *
 * No imports: an unused one is a hard error under `noUnusedLocals`, which is the
 * default in the Vite React template the docs assume.
 */
export function buildFontsModule(state: BuilderState): string {
  const fonts = resolveThemeFonts(state);
  const entries = fonts
    .map(
      (f) =>
        `  {\n` +
        `    family: ${JSON.stringify(f.family)},\n` +
        `    weights: [${f.weights.join(", ")}],\n` +
        `    href: ${JSON.stringify(f.href)},\n` +
        `  },`,
    )
    .join("\n");

  return `/**
 * Font configuration exported from the UI Organized Theme Builder.
 *
 * theme.css names these families but cannot load them — a stylesheet @import
 * would sit behind an extra round trip (it's invisible to the browser's preload
 * scanner) and would hard-code a CDN into your tokens. Add the tags below to
 * your document head instead, or use \`themeFonts\` to generate them at build
 * time — or ignore both and self-host the files.
 *
${fontLinkTags(fonts)
  .split("\n")
  .map((line) => ` *   ${line}`)
  .join("\n")}
 *
 * One entry per family, one request each: the Google Fonts endpoint drops an
 * unknown family from a multi-family request silently, answering 200 with that
 * font missing.
 */
export interface ThemeFont {
  family: string;
  /** Ascending and deduplicated, as the css2 endpoint requires. */
  weights: readonly number[];
  href: string;
}

export const themeFonts: readonly ThemeFont[] = [
${entries}
];
`;
}
