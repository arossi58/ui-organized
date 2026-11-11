import { describe, expect, it } from "vitest";
import { useBuilderStore } from "../state/themeState";
import { buildThemeTokens } from "./buildConfig";
import { SAVED_THEMES_KEY, deleteSavedTheme, readSavedThemes, saveTheme } from "./savedThemes";

/** An in-memory `localStorage`; the test environment is Node and has none. */
function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("saved themes", () => {
  it("saves, lists newest first, and replaces a theme saved under the same name", () => {
    const storage = memoryStorage();
    expect(saveTheme("Ocean", { a: 1 }, storage, 1).ok).toBe(true);
    expect(saveTheme("Forest", { b: 1 }, storage, 2).ok).toBe(true);

    const again = saveTheme("  ocean ", { a: 2 }, storage, 3);
    expect(again.ok && again.replaced).toBe(true);

    const list = readSavedThemes(storage);
    expect(list.map((entry) => entry.name)).toEqual(["ocean", "Forest"]);
    expect(list[0]!.theme).toEqual({ a: 2 });
    // Replacing keeps the entry's identity, so nothing keyed on it goes stale.
    expect(list[0]!.id).toBe(readSavedThemes(storage)[0]!.id);
  });

  it("falls back to a name when the theme has none", () => {
    const storage = memoryStorage();
    saveTheme("   ", {}, storage, 1);
    expect(readSavedThemes(storage)[0]!.name).toBe("My Theme");
  });

  it("deletes by id", () => {
    const storage = memoryStorage();
    saveTheme("Ocean", {}, storage, 1);
    saveTheme("Forest", {}, storage, 2);
    const forest = readSavedThemes(storage).find((entry) => entry.name === "Forest")!;
    expect(deleteSavedTheme(forest.id, storage)).toBeNull();
    expect(readSavedThemes(storage).map((entry) => entry.name)).toEqual(["Ocean"]);
  });

  it("reads missing, corrupt or foreign data as an empty list", () => {
    expect(readSavedThemes(null)).toEqual([]);
    expect(readSavedThemes(memoryStorage({ [SAVED_THEMES_KEY]: "{not json" }))).toEqual([]);
    expect(
      readSavedThemes(memoryStorage({ [SAVED_THEMES_KEY]: JSON.stringify([{ id: 1 }, "x"]) })),
    ).toEqual([]);
  });

  it("reports, rather than throws, when storage refuses the write", () => {
    const full = { getItem: () => null, setItem: () => { throw new Error("QuotaExceededError"); } };
    const result = saveTheme("Ocean", {}, full, 1);
    expect(result.ok).toBe(false);
    expect(saveTheme("Ocean", {}, null, 1).ok).toBe(false);
  });

  it("round-trips a theme through the store: save it, change it, load it back", () => {
    const storage = memoryStorage();
    const s = () => useBuilderStore.getState();
    s().setThemeName("Saved One");
    s().setSpacingBase(6);
    s().setExportDefaultMode("dark");
    saveTheme(s().themeName, buildThemeTokens(s()), storage, 1);

    s().setThemeName("Something else");
    s().setSpacingBase(8);
    s().setExportDefaultMode("light");

    s().loadFromThemeJson(readSavedThemes(storage)[0]!.theme);
    expect(s().themeName).toBe("Saved One");
    expect(s().spacingBaseUnit).toBe(6);
    expect(s().exportDefaultMode).toBe("dark");
  });
});
