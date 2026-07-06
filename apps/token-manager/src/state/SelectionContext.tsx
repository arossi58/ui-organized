import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { readProjectDocument, useReady, useDocVersion } from "../yjs/store.js";

/** Which projection the token editor shows. */
export type CenterView = "list" | "json";

/** Top-level navigation pages. */
export type AppPage = "tokens" | "themes" | "generators" | "export" | "sync";

interface Selection {
  /** Active top-level page. */
  page: AppPage;
  /** Active theme (set-status combination). */
  themeName: string;
  /** Active document mode driving resolution (NOT the app's light/dark chrome). */
  mode: string;
  /** The set the JSON view and "add token" target. */
  setName: string;
  /** Selected token path for the inspector, or null. */
  selectedPath: string | null;
  /** Editor projection (list table ⇄ JSON). */
  view: CenterView;
}

interface SelectionApi extends Selection {
  setPage: (page: AppPage) => void;
  setThemeName: (name: string) => void;
  setMode: (mode: string) => void;
  setSetName: (name: string) => void;
  setSelectedPath: (path: string | null) => void;
  setView: (view: CenterView) => void;
}

const SelectionContext = createContext<SelectionApi | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Selection>({
    page: "tokens",
    themeName: "",
    mode: "",
    setName: "",
    selectedPath: null,
    view: "list",
  });

  const api: SelectionApi = {
    ...state,
    setPage: (page) => setState((s) => ({ ...s, page })),
    setThemeName: (themeName) => setState((s) => ({ ...s, themeName })),
    setMode: (mode) => setState((s) => ({ ...s, mode })),
    setSetName: (setName) => setState((s) => ({ ...s, setName, selectedPath: null })),
    setSelectedPath: (selectedPath) => setState((s) => ({ ...s, selectedPath })),
    setView: (view) => setState((s) => ({ ...s, view })),
  };

  return <SelectionContext.Provider value={api}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionApi {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
}

/**
 * Keeps the selection valid against the live document: once IndexedDB has
 * loaded, fills in (or repairs) the active theme, mode, and set so they always
 * point at something that exists.
 */
export function useEnsureSelectionDefaults(): void {
  const ready = useReady();
  const version = useDocVersion();
  const selection = useSelection();

  useEffect(() => {
    if (!ready) return;
    const doc = readProjectDocument();
    const themeNames = doc.themes.map((t) => t.name);
    const modeNames = Object.keys(doc.modes);
    const setNames = doc.sets.map((s) => s.name);

    if (themeNames.length && !themeNames.includes(selection.themeName)) {
      selection.setThemeName(themeNames[0]!);
    }
    if (modeNames.length && !modeNames.includes(selection.mode)) {
      selection.setMode(modeNames[0]!);
    }
    if (setNames.length && !setNames.includes(selection.setName)) {
      selection.setSetName(setNames[0]!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, version, selection.themeName, selection.mode, selection.setName]);
}
