/**
 * Site-wide theme: a brand colour + light/dark mode, applied to the document
 * root and shared with the nav's theme menu.
 *
 * Light/dark is driven by `data-theme` on `<html>`: the shipped
 * `@ds/tokens/variables.css` already defines every semantic token for both
 * themes against the default (grey) neutral the site uses, including the
 * *translucent* control surfaces (e.g. `--color-interactive-ui-default` is a
 * 6%-alpha tint), so we let that cascade own them untouched.
 *
 * Only the brand hue changes per the user's choice, so we override just the
 * brand-derived tokens inline — resolved through the design system's single
 * source of truth, `resolveSemanticColors` from `@ds/utils`. Overriding the
 * full set would replace those translucent surfaces with opaque hexes (the
 * resolver has no alpha), which inverts inputs/switches/secondary buttons
 * between light and dark — so we deliberately don't. `--site-orange` (the
 * marketing accent) is re-pointed at the brand primary so sections follow too.
 */

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCoreFamily, resolveSemanticColors } from "@ds/utils";
import { BRAND_OPTIONS, DEFAULT_BRAND, getBrandOption, type BrandOption } from "./brandOptions";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  brand: string;
  /** Resolved primary-colour hex of the active brand (swatch / accent). */
  brandHex: string;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setBrand: (name: string) => void;
  options: BrandOption[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "ui-org-site-theme";
/** The neutral family that drives surfaces, borders, and text. */
const NEUTRAL_FAMILY = "grey";

/**
 * The only semantic tokens the brand hue drives (per `semanticColorMap`): the
 * primary and tertiary interactive roles. Everything else is neutral/status and
 * is left to the shipped `[data-theme]` cascade so its alpha is preserved.
 */
const BRAND_TOKEN_KEYS = [
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

interface StoredTheme {
  mode: ThemeMode;
  brand: string;
}

function readStored(): StoredTheme {
  const fallback: StoredTheme = { mode: "light", brand: DEFAULT_BRAND };
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StoredTheme>;
    return {
      mode: parsed.mode === "dark" ? "dark" : "light",
      brand: getBrandOption(parsed.brand).name,
    };
  } catch {
    return fallback;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(readStored, []);
  const [mode, setMode] = useState<ThemeMode>(initial.mode);
  const [brand, setBrand] = useState<string>(initial.brand);

  // Apply to <html> before paint so brand + mode land together with no flash.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const option = getBrandOption(brand);
    const vars = resolveSemanticColors(mode, {
      brandRamp: getCoreFamily(brand),
      neutralRamp: getCoreFamily(NEUTRAL_FAMILY),
      brandShade: option.shade,
    });

    root.setAttribute("data-theme", mode);
    for (const key of BRAND_TOKEN_KEYS) {
      const value = vars[key];
      if (value) root.style.setProperty(key, value);
    }
    // Marketing accent → brand primary, so site sections follow the brand.
    root.style.setProperty("--site-orange", vars["--color-interactive-primary-default"] ?? option.hex);
  }, [mode, brand]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, brand }));
    } catch {
      /* storage unavailable (private mode) — the live attribute/vars still hold */
    }
  }, [mode, brand]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      brand,
      brandHex: getBrandOption(brand).hex,
      setMode,
      toggleMode: () => setMode((m) => (m === "dark" ? "light" : "dark")),
      setBrand,
      options: BRAND_OPTIONS,
    }),
    [mode, brand],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
