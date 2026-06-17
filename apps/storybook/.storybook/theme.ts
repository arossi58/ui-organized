/**
 * White-label theming for Storybook — both the manager chrome (sidebar /
 * toolbar / panels) and the brand mark — derived from the design system's own
 * tokens so Storybook reads as a page of the UI Organized site rather than
 * stock Storybook.
 *
 * The manager runs OUTSIDE the preview iframe, so the shipped CSS variables in
 * `@ui-organized/tokens/variables.css` aren't in scope there — Storybook's
 * `create()` needs literal hex values. We get them from the same single source
 * of truth the marketing site and the builder use: `resolveSemanticColors`
 * from `@ui-organized/utils`. So the chrome can't drift from the DS palette.
 *
 * On GitHub Pages the marketing site and Storybook share an origin, so they
 * share `localStorage`: we read the visitor's chosen brand + light/dark from
 * the site's `ui-org-site-theme` key and theme the chrome to match. In local
 * dev (different ports → no shared storage) we fall back to the system colour
 * scheme and the design system's default brand.
 */

import { create } from "storybook/theming/create";
import { getCoreFamily, resolveSemanticColors } from "@ui-organized/utils";

/** Matches the marketing site's ThemeProvider storage key/shape. */
const STORAGE_KEY = "ui-org-site-theme";
/** The DS default brand family (matches the shipped `--brand-*` → `--mars-*`). */
const DEFAULT_BRAND = "mars";
/** The neutral family that drives surfaces, borders, and text site-wide. */
const NEUTRAL_FAMILY = "grey";

export type ThemeMode = "light" | "dark";

export interface SiteTheme {
  mode: ThemeMode;
  brand: string;
}

/**
 * The only tokens the brand hue drives. Applied to the preview canvas so its
 * components follow the visitor's chosen brand; everything else (neutrals,
 * status, translucent control surfaces) is left to the shipped `[data-theme]`
 * cascade so its alpha is preserved — same rationale as the marketing site's
 * ThemeProvider.
 */
export const BRAND_TOKEN_KEYS = [
  "--color-interactive-primary-default",
  "--color-interactive-primary-hover",
  "--color-interactive-primary-active",
  "--color-interactive-primary-selected",
  "--color-interactive-tertiary-default",
  "--color-interactive-tertiary-hover",
  "--color-interactive-tertiary-active",
  "--color-interactive-tertiary-selected",
  "--brand",
] as const;

/** Read the site's stored brand + mode, falling back to system scheme. */
export function readSiteTheme(): SiteTheme {
  const prefersDark =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const fallback: SiteTheme = { mode: prefersDark ? "dark" : "light", brand: DEFAULT_BRAND };
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<SiteTheme>;
    return {
      mode: parsed.mode === "dark" ? "dark" : parsed.mode === "light" ? "light" : fallback.mode,
      brand: typeof parsed.brand === "string" ? parsed.brand : DEFAULT_BRAND,
    };
  } catch {
    return fallback;
  }
}

/** Resolve the flat `{ "--color-…": "#hex" }` map for a mode + brand. */
export function resolveVars(mode: ThemeMode, brand: string): Record<string, string> {
  return resolveSemanticColors(mode, {
    brandRamp: getCoreFamily(brand),
    neutralRamp: getCoreFamily(NEUTRAL_FAMILY),
  });
}

// ── Brand mark ────────────────────────────────────────────────────────────────
// The bracketed "UI" logomark (apps/assets/logo-mark.svg) + wordmark, the same
// glyph the marketing nav inlines. Built as a data-URI so `brandImage` can be
// tinted with the active theme's ink colour (Storybook shows the image instead
// of `brandTitle`, so the wordmark is baked into the SVG).

const GLYPH_PATHS = [
  "M86.1392 86.3589C85.1792 86.3589 84.4858 86.2256 84.0592 85.9589C83.6325 85.6656 83.3658 85.2789 83.2592 84.7989C83.1792 84.3189 83.1392 83.8256 83.1392 83.3189V61.4389C83.1392 60.9056 83.1792 60.4123 83.2592 59.9589C83.3658 59.5056 83.6325 59.1323 84.0592 58.8389C84.4858 58.5456 85.1925 58.3989 86.1792 58.3989C87.1925 58.3989 87.8992 58.5456 88.2992 58.8389C88.7258 59.1323 88.9792 59.5056 89.0592 59.9589C89.1658 60.4123 89.2192 60.9189 89.2192 61.4789V83.3589C89.2192 83.8656 89.1658 84.3589 89.0592 84.8389C88.9525 85.2923 88.6858 85.6656 88.2592 85.9589C87.8592 86.2256 87.1525 86.3589 86.1392 86.3589Z",
  "M67.6802 86.7191C65.7335 86.7191 64.0135 86.3458 62.5202 85.5991C61.0535 84.8258 59.8002 83.8125 58.7602 82.5591C57.7469 81.2791 56.9869 79.8525 56.4802 78.2791C55.9735 76.6791 55.7202 75.0525 55.7202 73.3991V61.4391C55.7202 60.9058 55.7602 60.4125 55.8402 59.9591C55.9469 59.4791 56.2135 59.0925 56.6402 58.7991C57.0669 58.5058 57.7735 58.3591 58.7602 58.3591C59.7735 58.3591 60.4935 58.5058 60.9202 58.7991C61.3469 59.0925 61.6002 59.4791 61.6802 59.9591C61.7869 60.4125 61.8402 60.9191 61.8402 61.4791V73.3991C61.8402 74.5725 62.0269 75.7058 62.4002 76.7991C62.8002 77.8925 63.4402 78.7991 64.3202 79.5191C65.2002 80.2391 66.3602 80.5991 67.8002 80.5991C69.0269 80.5991 70.0802 80.3058 70.9602 79.7191C71.8402 79.1058 72.5202 78.2658 73.0002 77.1991C73.4802 76.1058 73.7202 74.8258 73.7202 73.3591V61.1991C73.7202 60.7191 73.7736 60.2658 73.8802 59.8391C73.9869 59.4125 74.2535 59.0658 74.6802 58.7991C75.1069 58.5058 75.8136 58.3591 76.8002 58.3591C77.7869 58.3591 78.4802 58.5191 78.8802 58.8391C79.3069 59.1325 79.5602 59.5058 79.6402 59.9591C79.7469 60.4125 79.8002 60.9191 79.8002 61.4791V73.4791C79.8002 75.1591 79.5335 76.7858 79.0002 78.3591C78.4935 79.9325 77.7202 81.3458 76.6802 82.5991C75.6669 83.8525 74.4002 84.8525 72.8802 85.5991C71.3869 86.3458 69.6535 86.7191 67.6802 86.7191Z",
  "M46 32.427C46 35.5043 48.4947 37.999 51.572 37.999H93.4221C96.4995 37.999 98.9941 35.5043 98.9941 32.427V21C98.9941 18.7909 100.785 17 102.994 17C105.203 17 106.994 18.7909 106.994 21V32.427C106.994 35.5043 109.489 37.999 112.566 37.999H120C122.209 37.999 124 39.7899 124 41.999C124 44.2082 122.209 45.999 120 45.999H112.566C109.489 45.999 106.994 48.4937 106.994 51.571V91.3948C106.994 94.4721 109.489 96.9668 112.566 96.9668H140C142.209 96.9668 144 98.7577 144 100.967C144 103.176 142.209 104.967 140 104.967H112.566C109.489 104.967 106.994 107.461 106.994 110.539V122C106.994 124.209 105.203 126 102.994 126C100.785 126 98.9941 124.209 98.9941 122V110.539C98.9941 107.461 96.4995 104.967 93.4221 104.967H51.572C48.4947 104.967 46 107.461 46 110.539V121C46 123.209 44.2091 125 42 125C39.7909 125 38 123.209 38 121V110.539C38 107.461 35.5053 104.967 32.428 104.967H24C21.7909 104.967 20 103.176 20 100.967C20 98.7577 21.7909 96.9668 24 96.9668H32.428C35.5053 96.9668 38 94.4721 38 91.3948V51.571C38 48.4937 35.5053 45.999 32.428 45.999H4C1.79086 45.999 0 44.2082 0 41.999C0 39.7899 1.79086 37.999 4 37.999H32.428C35.5053 37.999 38 35.5043 38 32.427V21C38 18.7909 39.7909 17 42 17C44.2091 17 46 18.7909 46 21V32.427ZM51.572 45.999C48.4947 45.999 46 48.4937 46 51.571V91.3948C46 94.4721 48.4947 96.9668 51.572 96.9668H93.4221C96.4995 96.9668 98.9941 94.4721 98.9941 91.3948V51.571C98.9941 48.4937 96.4995 45.999 93.4221 45.999H51.572Z",
];

/** A tinted `data:` SVG of the logomark + "UI Organized" wordmark. */
function brandLogo(ink: string): string {
  const paths = GLYPH_PATHS.map((d) => `<path d="${d}"/>`).join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="144" viewBox="0 0 560 144">` +
    `<g fill="${ink}">${paths}</g>` +
    `<text x="170" y="95" fill="${ink}" font-family="Roboto, system-ui, -apple-system, sans-serif" ` +
    `font-size="60" font-weight="700" letter-spacing="-1">UI Organized</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ── Manager theme ─────────────────────────────────────────────────────────────

/** Build the Storybook manager theme from DS tokens for the given mode + brand. */
export function makeManagerTheme(mode: ThemeMode, brand: string) {
  const t = resolveVars(mode, brand);
  // Read a token with a hard fallback so a missing key can never blank the chrome.
  const v = (key: string, fallback: string) => t[key] ?? fallback;

  const primary = v("--color-interactive-primary-default", "#d2502a");
  const ink = v("--color-text-primary", mode === "dark" ? "#f7f7f7" : "#17150f");

  return create({
    base: mode,

    brandTitle: "UI Organized",
    // No brandUrl: the logo is a plain (non-clickable) mark. Navigation back to
    // the site is handled by the marketing nav that wraps the /docs embed.
    brandImage: brandLogo(ink),

    colorPrimary: primary,
    colorSecondary: primary,

    appBg: v("--color-surface-secondary", "#f2f2f2"),
    appContentBg: v("--color-surface-primary", "#ffffff"),
    appPreviewBg: v("--color-surface-primary", "#ffffff"),
    appBorderColor: v("--color-border-secondary", "#e0e0e0"),
    appBorderRadius: 8,

    fontBase: '"Roboto", system-ui, -apple-system, "Segoe UI", sans-serif',
    fontCode: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',

    textColor: ink,
    textInverseColor: v("--color-text-inverse", "#ffffff"),
    textMutedColor: v("--color-text-secondary", "#6b6b6b"),

    barTextColor: v("--color-text-secondary", "#6b6b6b"),
    barSelectedColor: primary,
    barHoverColor: v("--color-interactive-primary-hover", primary),
    barBg: v("--color-surface-primary", "#ffffff"),

    buttonBg: v("--color-surface-secondary", "#f2f2f2"),
    buttonBorder: v("--color-border-secondary", "#e0e0e0"),
    booleanBg: v("--color-surface-secondary", "#f2f2f2"),
    booleanSelectedBg: primary,

    inputBg: v("--color-surface-primary", "#ffffff"),
    inputBorder: v("--color-border-data-entry", "#cccccc"),
    inputTextColor: ink,
    inputBorderRadius: 6,
  });
}
