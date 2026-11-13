import { describe, it, expect } from "vitest";
import { useBuilderStore } from "../../tools/theme-builder/state/themeState";
import { buildThemeCss } from "../../tools/theme-builder/utils/buildCss";
import { pageCss } from "./pageCss";

describe("Get started's page stylesheet", () => {
  it("only reads tokens a Theme Builder export declares", () => {
    // A name the theme doesn't declare resolves to nothing, and the page quietly
    // falls back to a white background and the browser's serif: the exact thing
    // the snippet is there to prevent.
    const used = [...pageCss("src/index.css").matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]!);
    const theme = buildThemeCss(useBuilderStore.getState());
    const declared = new Set([...theme.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]!));
    expect(used.length).toBeGreaterThan(0);
    expect(used.filter((name) => !declared.has(name))).toEqual([]);
  });
});
