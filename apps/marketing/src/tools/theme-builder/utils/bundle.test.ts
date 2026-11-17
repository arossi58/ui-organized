import { afterEach, describe, it, expect } from "vitest";
import { useBuilderStore } from "../state/themeState";
import { buildReadme } from "./buildConfig";
import { BUNDLE_FILES, bundleFileName } from "./bundle";

const state = () => useBuilderStore.getState();

describe("bundleFileName", () => {
  it("names the default theme my-theme.zip, as the docs do", () => {
    // Not my-theme-theme.zip, which is what the default download used to be.
    expect(bundleFileName("My Theme")).toBe("my-theme.zip");
  });

  it("adds -theme to a name that doesn't end in it", () => {
    expect(bundleFileName("Kitchen Sink Teal")).toBe("kitchen-sink-teal-theme.zip");
  });

  it("doesn't double a name that is just 'Theme'", () => {
    expect(bundleFileName("Theme")).toBe("theme.zip");
  });

  it("falls back to the default for an empty or unsluggable name", () => {
    expect(bundleFileName("")).toBe("my-theme.zip");
    expect(bundleFileName("   ")).toBe("my-theme.zip");
    expect(bundleFileName("!!!")).toBe("my-theme.zip");
  });

  it("collapses punctuation and stray dashes", () => {
    expect(bundleFileName("  Acme & Co. -- Dark ")).toBe("acme-co-dark-theme.zip");
  });
});

describe("the bundle README names the zip the download produces", () => {
  const original = state().themeName;
  afterEach(() => state().setThemeName(original));

  it.each(["My Theme", "Kitchen Sink Teal", "Theme", ""])("for %j", (name) => {
    state().setThemeName(name);
    expect(buildReadme(state())).toContain(`npx @ui-organized/cli theme ${bundleFileName(name)}\n`);
  });
});

describe("BUNDLE_FILES", () => {
  it("lists the five files the zip carries, in the order it writes them", () => {
    expect(BUNDLE_FILES.map((f) => f.name)).toEqual([
      "theme.json",
      "theme.css",
      "icons.ts",
      "fonts.ts",
      "README.md",
    ]);
  });
});
