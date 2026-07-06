import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { useMemo, useSyncExternalStore } from "react";
import {
  SCHEMA_VERSION,
  type DtcgGroup,
  type DtcgToken,
  type GeneratorRecipe,
  type ModeMap,
  type OverrideLayer,
  type PackInstance,
  type ProjectDocument,
  type ProjectMeta,
  type Theme,
  type ThemeSetStatus,
  type TokenSet,
} from "@ui-organized/schema";
import { deleteTokenAt, getTokenAt, setTokenAt } from "../lib/dtcgTree.js";
import { seedProjectDocument } from "./seed.js";

/**
 * The working document — a single Yjs `Y.Doc` persisted to IndexedDB.
 *
 * Layout: a root `Y.Map("project")` with `meta`/`modes`/`themes` plain values
 * and `sets` as a `Y.Array<Y.Map>` (each set Y.Map holds `name`, `tokens`, and
 * optional `$extensions`/`$description`). Token-tree edits replace a set's
 * `tokens` object; the JSON view writes the same field — one document, two
 * projections. Per-token CRDT granularity is a realtime-phase refinement
 * (deliberately deferred per the build sequence; this is offline-only).
 */

const ydoc = new Y.Doc();
const root = ydoc.getMap("project") as Y.Map<unknown>;
const persistence = new IndexeddbPersistence("ui-organized-token-manager", ydoc);
const undoManager = new Y.UndoManager(root, { captureTimeout: 350 });

// ─── Reactivity (useSyncExternalStore) ───────────────────────────────────────

let version = 0;
const listeners = new Set<() => void>();
ydoc.on("update", () => {
  version += 1;
  for (const listener of listeners) listener();
});
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
const getVersion = (): number => version;

/** Re-renders the caller whenever the document changes. */
export function useDocVersion(): number {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}

// ─── Readiness (IndexedDB load + first-run seed) ─────────────────────────────

let ready = false;
const readyListeners = new Set<() => void>();
persistence.whenSynced
  .then(() => {
    if (!root.has("sets")) writeProjectDocument(seedProjectDocument());
    ready = true;
    for (const listener of readyListeners) listener();
  })
  .catch(() => {
    // IndexedDB unavailable (e.g. private mode): fall back to an in-memory seed.
    if (!root.has("sets")) writeProjectDocument(seedProjectDocument());
    ready = true;
    for (const listener of readyListeners) listener();
  });

export function useReady(): boolean {
  return useSyncExternalStore(
    (cb) => {
      readyListeners.add(cb);
      return () => readyListeners.delete(cb);
    },
    () => ready,
    () => ready,
  );
}

// ─── Reads ───────────────────────────────────────────────────────────────────

function setsArray(): Y.Array<Y.Map<unknown>> {
  return root.get("sets") as Y.Array<Y.Map<unknown>>;
}

function readSets(): TokenSet[] {
  const arr = root.get("sets") as Y.Array<Y.Map<unknown>> | undefined;
  if (!arr) return [];
  return arr.toArray().map((m) => {
    const set: TokenSet = {
      name: (m.get("name") as string) ?? "",
      tokens: (m.get("tokens") as DtcgGroup) ?? {},
    };
    const ext = m.get("$extensions") as Record<string, unknown> | undefined;
    if (ext) set.$extensions = ext;
    const description = m.get("$description") as string | undefined;
    if (description) set.$description = description;
    return set;
  });
}

const FALLBACK_META: ProjectMeta = {
  name: "Untitled",
  createdAt: SCHEMA_VERSION,
  updatedAt: SCHEMA_VERSION,
  schemaVersion: SCHEMA_VERSION,
};

/** Reactive read of the whole document — re-renders on any change. */
export function useProjectDocument(): ProjectDocument {
  const version = useDocVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => readProjectDocument(), [version]);
}

export function readOverrides(): OverrideLayer {
  return (root.get("overrides") as OverrideLayer) ?? {};
}
function readRecipes(): GeneratorRecipe[] {
  return (root.get("recipes") as GeneratorRecipe[]) ?? [];
}
function readPacks(): PackInstance[] {
  return (root.get("packs") as PackInstance[]) ?? [];
}

/** The active pack's stored config (opaque to the store), or undefined. */
export function getPackConfig(): unknown {
  return readPacks()[0]?.config;
}

export function readProjectDocument(): ProjectDocument {
  const doc: ProjectDocument = {
    version: SCHEMA_VERSION,
    meta: (root.get("meta") as ProjectMeta) ?? FALLBACK_META,
    sets: readSets(),
    themes: (root.get("themes") as Theme[]) ?? [],
    modes: (root.get("modes") as ModeMap) ?? {},
  };
  const overrides = readOverrides();
  if (Object.keys(overrides).length) doc.overrides = overrides;
  const recipes = readRecipes();
  if (recipes.length) doc.recipes = recipes;
  const packs = readPacks();
  if (packs.length) doc.packs = packs;
  return doc;
}

function hasProvenance(token: DtcgToken | undefined): boolean {
  const ext = token?.$extensions;
  if (!ext) return false;
  return Object.values(ext).some(
    (v) => v !== null && typeof v === "object" && "generatedBy" in (v as object),
  );
}

function findSetMap(name: string): Y.Map<unknown> | undefined {
  const arr = root.get("sets") as Y.Array<Y.Map<unknown>> | undefined;
  return arr?.toArray().find((m) => m.get("name") === name);
}

function setTokens(name: string): DtcgGroup {
  return (findSetMap(name)?.get("tokens") as DtcgGroup) ?? {};
}

// ─── Writes (all transactional, so undo groups them) ─────────────────────────

function makeSetMap(set: TokenSet): Y.Map<unknown> {
  const m = new Y.Map<unknown>();
  m.set("name", set.name);
  m.set("tokens", set.tokens);
  if (set.$extensions) m.set("$extensions", set.$extensions);
  if (set.$description) m.set("$description", set.$description);
  return m;
}

function writeProjectDocument(doc: ProjectDocument): void {
  ydoc.transact(() => {
    root.set("meta", doc.meta);
    root.set("modes", doc.modes);
    root.set("themes", doc.themes);
    const arr = new Y.Array<Y.Map<unknown>>();
    root.set("sets", arr);
    arr.push(doc.sets.map(makeSetMap));
    root.set("overrides", doc.overrides ?? {});
    root.set("recipes", doc.recipes ?? []);
    root.set("packs", doc.packs ?? []);
  });
}

/** Replaces the entire working document (e.g. after reading from a repo). */
export function loadProjectDocument(doc: ProjectDocument): void {
  writeProjectDocument(doc);
}

function touchUpdated(): void {
  const meta = (root.get("meta") as ProjectMeta) ?? FALLBACK_META;
  root.set("meta", { ...meta, updatedAt: new Date().toISOString() });
}

function readThemes(): Theme[] {
  return ((root.get("themes") as Theme[]) ?? []).map((t) => ({
    ...t,
    selectedTokenSets: { ...t.selectedTokenSets },
  }));
}

/** Replaces a set's entire tokens tree (used by the JSON view). */
export function setSetTokens(setName: string, tokens: DtcgGroup): void {
  ydoc.transact(() => {
    findSetMap(setName)?.set("tokens", tokens);
    touchUpdated();
  });
}

/** Creates or replaces a single token at `path` within a set. */
export function upsertToken(setName: string, path: string, token: DtcgToken): void {
  setSetTokens(setName, setTokenAt(setTokens(setName), path, token));
}

/** Removes a token at `path` within a set (pruning empty groups). */
export function removeToken(setName: string, path: string): void {
  setSetTokens(setName, deleteTokenAt(setTokens(setName), path));
}

/** Updates only a token's `$value`, preserving its other fields. */
export function setTokenValue(setName: string, path: string, value: DtcgToken["$value"]): void {
  const tokens = setTokens(setName);
  const existing = getTokenAt(tokens, path);
  const next: DtcgToken = existing ? { ...existing, $value: value } : { $value: value };
  setSetTokens(setName, setTokenAt(tokens, path, next));
}

/**
 * Edits a token's value the right way: a **generated** token (has provenance)
 * gets a non-destructive override; an **authored** token is edited in place. This
 * is the edit→override flow — base is never mutated for generated tokens.
 */
export function editTokenValue(setName: string, path: string, value: DtcgToken["$value"]): void {
  if (hasProvenance(getTokenAt(setTokens(setName), path))) {
    setOverride(path, { $value: value });
  } else {
    setTokenValue(setName, path, value);
  }
}

export function setOverride(path: string, props: Record<string, unknown>): void {
  ydoc.transact(() => {
    const overrides = readOverrides();
    overrides[path] = { ...overrides[path], ...props };
    root.set("overrides", overrides);
    touchUpdated();
  });
}

export function clearOverride(path: string): void {
  ydoc.transact(() => {
    const overrides = readOverrides();
    delete overrides[path];
    root.set("overrides", overrides);
    touchUpdated();
  });
}

/**
 * Writes a generated foundation: the tokens (into `setName`), the recipes, the
 * pack instance, and the reconciled override layer — atomically. The set is added
 * to every theme so it resolves immediately.
 */
export function setFoundation(
  setName: string,
  tokens: DtcgGroup,
  recipes: GeneratorRecipe[],
  packs: PackInstance[],
  overrides: OverrideLayer,
): void {
  ydoc.transact(() => {
    const existing = findSetMap(setName);
    if (existing) existing.set("tokens", tokens);
    else setsArray().push([makeSetMap({ name: setName, tokens })]);

    const themes = readThemes();
    for (const theme of themes) {
      if (!(setName in theme.selectedTokenSets)) theme.selectedTokenSets[setName] = "enabled";
    }
    root.set("themes", themes);
    root.set("recipes", recipes);
    root.set("packs", packs);
    root.set("overrides", overrides);
    touchUpdated();
  });
}

export function addSet(name: string): void {
  ydoc.transact(() => {
    setsArray().push([makeSetMap({ name, tokens: {} })]);
    const themes = readThemes();
    for (const theme of themes) theme.selectedTokenSets[name] = "enabled";
    root.set("themes", themes);
    touchUpdated();
  });
}

export function renameSet(oldName: string, newName: string): void {
  ydoc.transact(() => {
    findSetMap(oldName)?.set("name", newName);
    const themes = readThemes();
    for (const theme of themes) {
      if (oldName in theme.selectedTokenSets) {
        theme.selectedTokenSets[newName] = theme.selectedTokenSets[oldName]!;
        delete theme.selectedTokenSets[oldName];
      }
    }
    root.set("themes", themes);
    touchUpdated();
  });
}

export function deleteSet(name: string): void {
  ydoc.transact(() => {
    const arr = setsArray();
    const index = arr.toArray().findIndex((m) => m.get("name") === name);
    if (index >= 0) arr.delete(index, 1);
    const themes = readThemes();
    for (const theme of themes) delete theme.selectedTokenSets[name];
    root.set("themes", themes);
    touchUpdated();
  });
}

export function reorderSets(from: number, to: number): void {
  const plain = readSets();
  if (from < 0 || from >= plain.length || to < 0 || to >= plain.length || from === to) return;
  const [moved] = plain.splice(from, 1);
  plain.splice(to, 0, moved!);
  ydoc.transact(() => {
    const arr = setsArray();
    arr.delete(0, arr.length);
    arr.push(plain.map(makeSetMap));
    touchUpdated();
  });
}

export function setThemeSetStatus(
  themeName: string,
  setName: string,
  status: ThemeSetStatus,
): void {
  ydoc.transact(() => {
    const themes = readThemes();
    const theme = themes.find((t) => t.name === themeName);
    if (theme) theme.selectedTokenSets[setName] = status;
    root.set("themes", themes);
    touchUpdated();
  });
}

export function addTheme(name: string): void {
  ydoc.transact(() => {
    const themes = readThemes();
    if (!themes.some((t) => t.name === name)) themes.push({ name, selectedTokenSets: {} });
    root.set("themes", themes);
    touchUpdated();
  });
}

export function renameTheme(oldName: string, newName: string): void {
  ydoc.transact(() => {
    const themes = readThemes();
    const theme = themes.find((t) => t.name === oldName);
    if (theme) theme.name = newName;
    root.set("themes", themes);
    touchUpdated();
  });
}

export function deleteTheme(name: string): void {
  ydoc.transact(() => {
    root.set("themes", readThemes().filter((t) => t.name !== name));
    touchUpdated();
  });
}

export function addMode(name: string): void {
  ydoc.transact(() => {
    const modes = { ...((root.get("modes") as ModeMap) ?? {}) };
    if (!(name in modes)) modes[name] = {};
    root.set("modes", modes);
    touchUpdated();
  });
}

export function removeMode(name: string): void {
  ydoc.transact(() => {
    const modes = { ...((root.get("modes") as ModeMap) ?? {}) };
    delete modes[name];
    root.set("modes", modes);
    touchUpdated();
  });
}

// ─── Undo / redo ─────────────────────────────────────────────────────────────

export const undo = (): void => {
  undoManager.undo();
};
export const redo = (): void => {
  undoManager.redo();
};

export function useUndoState(): { canUndo: boolean; canRedo: boolean } {
  useDocVersion(); // re-evaluate on every change
  return {
    canUndo: undoManager.canUndo(),
    canRedo: undoManager.canRedo(),
  };
}
