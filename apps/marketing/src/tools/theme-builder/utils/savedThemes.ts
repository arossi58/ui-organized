import { useSyncExternalStore } from "react";

/**
 * Themes saved in this browser, for coming back to later.
 *
 * Each entry holds the theme as the same DTCG object `theme.json` exports
 * (`buildThemeTokens`), and loads through the same `loadFromThemeJson` an
 * imported file does — so a saved theme can never drift from a downloaded one,
 * and the round trip is the one the export tests already cover.
 *
 * `localStorage` can be missing, full, or throw on access (private windows,
 * blocked site data). Every read and write is guarded and reported rather than
 * thrown: the builder works the same without it, and only this list is empty.
 */

export interface SavedTheme {
  id: string;
  name: string;
  /** Epoch ms. */
  savedAt: number;
  /** The exported DTCG token tree, as `theme.json` holds it. */
  theme: unknown;
}

/** Versioned, so a future change of shape can migrate rather than misread. */
export const SAVED_THEMES_KEY = "uio.theme-builder.saved-themes.v1";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function defaultStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function isSavedTheme(value: unknown): value is SavedTheme {
  const entry = value as Partial<SavedTheme> | null;
  return (
    !!entry &&
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.savedAt === "number" &&
    entry.theme !== undefined
  );
}

/** Newest first. Unreadable storage, or a corrupt entry, reads as absent. */
export function readSavedThemes(storage: StorageLike | null = defaultStorage()): SavedTheme[] {
  if (!storage) return [];
  try {
    const parsed: unknown = JSON.parse(storage.getItem(SAVED_THEMES_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter(isSavedTheme).sort((a, b) => b.savedAt - a.savedAt)
      : [];
  } catch {
    return [];
  }
}

export type SaveResult = { ok: true; theme: SavedTheme; replaced: boolean } | { ok: false; error: string };

function write(storage: StorageLike | null, themes: SavedTheme[]): string | null {
  if (!storage) return "This browser isn’t allowing saved data here.";
  try {
    storage.setItem(SAVED_THEMES_KEY, JSON.stringify(themes));
    notify();
    return null;
  } catch {
    return "Couldn’t save: the browser’s storage is full or blocked.";
  }
}

/**
 * Saves under `name`. A theme already saved under the same name (ignoring
 * case and surrounding space) is replaced, so saving again as you work updates
 * it rather than piling up copies.
 */
export function saveTheme(
  name: string,
  theme: unknown,
  storage: StorageLike | null = defaultStorage(),
  now: number = Date.now(),
): SaveResult {
  const label = name.trim() || "My Theme";
  const key = label.toLowerCase();
  const existing = readSavedThemes(storage);
  const previous = existing.find((entry) => entry.name.trim().toLowerCase() === key);
  const entry: SavedTheme = {
    id: previous?.id ?? `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: label,
    savedAt: now,
    theme,
  };
  const error = write(storage, [entry, ...existing.filter((saved) => saved !== previous)]);
  return error ? { ok: false, error } : { ok: true, theme: entry, replaced: Boolean(previous) };
}

export function deleteSavedTheme(
  id: string,
  storage: StorageLike | null = defaultStorage(),
): string | null {
  return write(
    storage,
    readSavedThemes(storage).filter((entry) => entry.id !== id),
  );
}

// ─── React binding ───────────────────────────────────────────────────────────

const listeners = new Set<() => void>();
let snapshot: SavedTheme[] | null = null;

function notify(): void {
  snapshot = null;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab saving or deleting fires `storage` here; this tab's own writes
  // go through `notify`, since `storage` never fires in the tab that wrote.
  const onStorage = (event: StorageEvent) => {
    if (event.key === SAVED_THEMES_KEY || event.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Cached between changes: `useSyncExternalStore` needs a stable snapshot. */
function getSnapshot(): SavedTheme[] {
  snapshot ??= readSavedThemes();
  return snapshot;
}

const EMPTY: SavedTheme[] = [];

/** The saved themes, newest first, kept current across tabs. */
export function useSavedThemes(): SavedTheme[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
