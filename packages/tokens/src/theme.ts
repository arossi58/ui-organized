/**
 * Runtime theme switching.
 *
 * Themes are CSS `[data-theme="…"]` blocks in variables.css. Switching a theme
 * is just setting `data-theme` on <html> — the cascade re-resolves every
 * semantic `--color-*` custom property, so all components update instantly with
 * no re-render and no JS color math.
 *
 *   import "@ds/tokens/variables.css";
 *   import { initTheme, toggleTheme } from "@ds/tokens";
 *
 *   initTheme();                 // apply stored / system / default theme on load
 *   button.onclick = toggleTheme; // flip light ⇄ dark
 *
 * Custom themes built in the builder app export their own `[data-theme="…"]`
 * block; once that CSS is loaded, `setTheme("my-theme")` activates it.
 */

/** Built-in themes shipped in variables.css. Custom themes extend this at runtime. */
export const THEMES = ["dark", "light"] as const;
export type BuiltInTheme = (typeof THEMES)[number];
/** Any theme name — built-in or a custom theme loaded via additional CSS. */
export type ThemeName = BuiltInTheme | (string & {});

/** The theme used when nothing is stored and no system preference is found. */
export const DEFAULT_THEME: BuiltInTheme = "dark";

const ATTR = "data-theme";
const STORAGE_KEY = "ds-theme";

function rootEl(): HTMLElement | null {
  return typeof document !== "undefined" ? document.documentElement : null;
}

/** Current theme from the <html data-theme> attribute, or the default. */
export function getTheme(): ThemeName {
  return (rootEl()?.getAttribute(ATTR) as ThemeName) ?? DEFAULT_THEME;
}

/** Apply a theme and persist the choice. No-op outside the browser (SSR-safe). */
export function setTheme(theme: ThemeName): void {
  const el = rootEl();
  if (!el) return;
  el.setAttribute(ATTR, theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable (private mode / SSR) — attribute is still set */
  }
}

/** Flip between the two built-in themes. Returns the newly-applied theme. */
export function toggleTheme(): ThemeName {
  const next: BuiltInTheme = getTheme() === "light" ? "dark" : "light";
  setTheme(next);
  return next;
}

/**
 * Resolve and apply the startup theme, in priority order:
 *   1. a previously stored choice (localStorage)
 *   2. the OS `prefers-color-scheme`
 *   3. the supplied fallback (defaults to DEFAULT_THEME)
 * Call once, as early as possible, to avoid a flash of the wrong theme.
 */
export function initTheme(fallback: BuiltInTheme = DEFAULT_THEME): ThemeName {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }

  const system =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : null;

  const theme: ThemeName = stored || system || fallback;
  setTheme(theme);
  return theme;
}
