import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getToken, parseTokens, renderTokensMarkdown, searchTokens } from "../src/tokens/catalog.js";

const CSS = `
:root {
  --grey-100: #fcfcfc;
  --grey-2400: #111111;
  --color-surface-base: var(--grey-2400);
  --spacing-space-04: 16px;
}
[data-theme="dark"] { --color-surface-base: var(--grey-2400); }
[data-theme="light"] { --color-surface-base: var(--grey-100); }
`;

describe("parseTokens", () => {
  const tokens = parseTokens(CSS);

  it("resolves var() chains per theme", () => {
    expect(tokens.find((t) => t.name === "--color-surface-base")).toMatchObject({
      value: "#111111",
      dark: "#111111",
      light: "#fcfcfc",
    });
  });

  it("omits theme values for a token that doesn't change", () => {
    expect(tokens.find((t) => t.name === "--spacing-space-04")).not.toHaveProperty("dark");
  });

  it("leaves the raw palette ungrouped", () => {
    expect(tokens.find((t) => t.name === "--grey-100")?.group).toBeNull();
  });
});

describe("searchTokens", () => {
  const tokens = parseTokens(CSS);

  it("finds tokens by purpose, not only by name", () => {
    expect(searchTokens(tokens, "padding").map((t) => t.name)).toEqual(["--spacing-space-04"]);
    expect(searchTokens(tokens, "background").map((t) => t.name)).toEqual(["--color-surface-base"]);
  });

  it("never returns the raw palette", () => {
    expect(searchTokens(tokens, "grey")).toEqual([]);
  });
});

describe("getToken", () => {
  const tokens = parseTokens(CSS);

  it("accepts a bare name or a var() reference", () => {
    expect(getToken(tokens, "spacing-space-04").found).toBe(true);
    expect(getToken(tokens, "var(--spacing-space-04)").found).toBe(true);
  });

  it("warns about a raw palette step", () => {
    expect(getToken(tokens, "--grey-100")).toMatchObject({ found: true, warning: expect.stringContaining("raw palette") });
  });

  it("rejects an invented token and offers real ones", () => {
    expect(getToken(tokens, "--space-04")).toMatchObject({
      found: false,
      suggestions: ["--spacing-space-04"],
    });
  });
});

describe("against the real token build", () => {
  const css = readFileSync(resolve(__dirname, "../../../packages/tokens/output/variables.css"), "utf8");
  const tokens = parseTokens(css);

  // The failure this stops: a new family ships, nothing documents it, and agents
  // are told by /ai/tokens.md that it doesn't exist.
  it("gives every token components consume a group, unless it's a palette step", () => {
    const contract = (
      JSON.parse(readFileSync(resolve(__dirname, "../../../packages/core/token-contract.json"), "utf8")) as {
        tokens: string[];
      }
    ).tokens;
    const palette = /^--(brand|[a-z]+-\d+$)/;
    const ungrouped = contract.filter(
      (name) => !palette.test(name) && tokens.find((t) => t.name === name)?.group == null,
    );
    expect(ungrouped).toEqual([]);
  });

  it("documents only names the stylesheet defines, and no raw palette", () => {
    const md = renderTokensMarkdown(tokens, "0.0.0");
    const names = new Set(tokens.map((t) => t.name));
    const rows = [...md.matchAll(/^\| `(--[\w-]+)`/gm)].map((m) => m[1]!);
    expect(rows.length).toBeGreaterThan(100);
    expect(rows.filter((name) => !names.has(name))).toEqual([]);
    expect(rows.filter((name) => /^--(grey|brand)-/.test(name))).toEqual([]);
  });
});

describe("getToken with Figma variable names", async () => {
  const { getToken: lookup, parseTokens: parse } = await import("../src/tokens/catalog.js");
  const { readFileSync: read } = await import("node:fs");
  const { resolve: res, dirname: dir } = await import("node:path");
  const { fileURLToPath: toPath } = await import("node:url");
  const tokens = parse(read(res(dir(toPath(import.meta.url)), "../../../packages/tokens/output/variables.css"), "utf8"));
  it.each([
    ["spacing/space-02", "--spacing-space-02"],
    ["--content/primary", "--color-content-primary"],
    ["var(--spacing\\/space-02,8px)", "--spacing-space-02"],
    ["component/radius/interactive", "--radius-interactive"],
  ])("%s → %s", (figma, css) => {
    const r = lookup(tokens, figma);
    expect(r.found && r.token.name).toBe(css);
  });
  it("rejects a Figma name with no token, with real suggestions", () => {
    const r = lookup(tokens, "spacing/space-200");
    expect(r.found).toBe(false);
  });
});
