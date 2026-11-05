/**
 * Runtime theme switching.
 *
 * Themes are CSS `[data-theme="…"]` blocks in variables.css. Switching a theme
 * is just setting `data-theme` on <html> — the cascade re-resolves every
 * semantic `--color-*` custom property, so all components update instantly with
 * no re-render and no JS color math.
 *
 *   import "@ui-organized/tokens/variables.css";
 *   import { initTheme, toggleTheme } from "@ui-organized/tokens";
 *
 *   initTheme();                  // stored choice, else follow the OS
 *   button.onclick = toggleTheme; // flip light ⇄ dark (and remember it)
 *   setTheme("system");           // forget the choice, follow the OS again
 *
 * The baseline `:root` in variables.css is DARK-first: with no `data-theme`, or
 * an unknown one, the page paints dark. A server-rendered light default must set
 * `data-theme="light"` on <html> itself.
 *
 * Custom themes built in the builder app export their own `[data-theme="…"]`
 * block; once that CSS is loaded, `setTheme("my-theme")` activates it.
 */

/** Built-in themes shipped in variables.css. Custom themes extend this at runtime. */
export const THEMES = ["dark", "light"] as const;
export type BuiltInTheme = (typeof THEMES)[number];
/** Any theme name — built-in or a custom theme loaded via additional CSS. */
export type ThemeName = BuiltInTheme | (string & {});
/** A theme, or `"system"` to follow the OS `prefers-color-scheme`. */
export type ThemePreference = ThemeName | "system";

/** The theme the baseline `:root` in variables.css paints when no `data-theme` is set. */
export const DEFAULT_THEME: BuiltInTheme = "dark";

export interface InitThemeOptions {
  /**
   * Used when nothing is stored and the OS reports no preference (or can't be
   * asked). Defaults to `"light"`, the conventional reading of `no-preference`.
   */
  fallback?: BuiltInTheme;
}

const ATTR = "data-theme";
const STORAGE_KEY = "ds-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const LIGHT_QUERY = "(prefers-color-scheme: light)";

function rootEl(): HTMLElement | null {
  return typeof document !== "undefined" ? document.documentElement : null;
}

function media(query: string): MediaQueryList | null {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(query)
    : null;
}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage unavailable (private mode / SSR)
  }
}

function applyAttr(theme: ThemeName): void {
  rootEl()?.setAttribute(ATTR, theme);
}

/** The OS preference, or `fallback` when it reports none. */
function systemTheme(fallback: BuiltInTheme): BuiltInTheme {
  if (media(DARK_QUERY)?.matches) return "dark";
  if (media(LIGHT_QUERY)?.matches) return "light";
  return fallback;
}

// While following the OS, the live query and its listener, so an explicit
// choice can detach them.
let following: { mq: MediaQueryList; onChange: () => void } | null = null;
let lastFallback: BuiltInTheme = "light";

function stopFollowing(): void {
  following?.mq.removeEventListener("change", following.onChange);
  following = null;
}

function followSystem(fallback: BuiltInTheme): BuiltInTheme {
  stopFollowing();
  lastFallback = fallback;
  const theme = systemTheme(fallback);
  applyAttr(theme);
  const mq = media(DARK_QUERY);
  if (mq && typeof mq.addEventListener === "function") {
    const onChange = () => applyAttr(systemTheme(fallback));
    mq.addEventListener("change", onChange);
    following = { mq, onChange };
  }
  return theme;
}

/** Current theme from the <html data-theme> attribute, or the baseline default. */
export function getTheme(): ThemeName {
  return (rootEl()?.getAttribute(ATTR) as ThemeName) ?? DEFAULT_THEME;
}

/**
 * Apply a theme and remember the choice. `"system"` forgets any stored choice
 * and follows the OS preference from then on. No-op outside the browser (SSR-safe).
 */
export function setTheme(theme: ThemePreference): void {
  if (!rootEl()) return;
  if (theme === "system") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable — following the OS still works */
    }
    followSystem(lastFallback);
    return;
  }
  stopFollowing();
  applyAttr(theme);
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
 *   2. the OS `prefers-color-scheme` — tracked live until an explicit `setTheme`
 *   3. `fallback` (default `"light"`) when the OS reports no preference
 *
 * Loading a page never writes a choice: only `setTheme`/`toggleTheme` persist,
 * so a visitor who never picks keeps following their OS across visits.
 * Call once, as early as possible, to avoid a flash of the wrong theme.
 *
 * Accepts the fallback positionally too (`initTheme("dark")`) for compatibility.
 */
export function initTheme(options: BuiltInTheme | InitThemeOptions = {}): ThemeName {
  const fallback = (typeof options === "string" ? options : options.fallback) ?? "light";
  if (!rootEl()) return fallback;

  const stored = readStored();
  if (stored) {
    stopFollowing();
    applyAttr(stored);
    return stored;
  }
  return followSystem(fallback);
}
