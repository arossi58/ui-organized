/**
 * Reads the visitor's chosen brand + light/dark from the marketing site's
 * localStorage (shared on the same origin) and resolves the brand-driven token
 * hexes so the panel's accent tracks the site's brand picker.
 *
 * The manager realm only has the *default*-brand token values in scope (the
 * injected variables.css bakes one brand ramp), so to follow the picker we
 * resolve the chosen brand here — the same source of truth the marketing site,
 * the builder, and the Storybook chrome theme use — and set the results inline
 * on `.fcp-root`, where they win over the injected `[data-theme]` defaults.
 *
 * This mirrors apps/storybook/.storybook/theme.ts (readSiteTheme / BRAND_TOKEN_KEYS);
 * kept local so the addon stays self-contained and depends only on DS packages.
 */
import { getCoreFamily, resolveSemanticColors } from "@ui-organized/utils";

const STORAGE_KEY = "ui-org-site-theme";
const DEFAULT_BRAND = "mars";
const NEUTRAL_FAMILY = "grey";

export type ThemeMode = "light" | "dark";

export interface SiteTheme {
  mode: ThemeMode;
  brand: string;
}

/** The only tokens the brand hue drives (matches the site's ThemeProvider). */
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

/** Read the site's stored brand + mode, falling back to the system scheme. */
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

/** Resolve just the brand-driven token hexes for a mode + brand. */
export function resolveBrandVars(mode: ThemeMode, brand: string): Record<string, string> {
  const all = resolveSemanticColors(mode, {
    brandRamp: getCoreFamily(brand),
    neutralRamp: getCoreFamily(NEUTRAL_FAMILY),
  });
  const out: Record<string, string> = {};
  for (const key of BRAND_TOKEN_KEYS) {
    if (all[key]) out[key] = all[key];
  }
  return out;
}
