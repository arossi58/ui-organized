/**
 * `semanticColorMap` is a hand-maintained mirror of the semantic color JSON in
 * `@ui-organized/tokens`, and nothing generates it. UPDATING-TOKENS.md says a
 * semantic color change goes in both places; this is the check that notices when
 * only one of them got it. Forget the map and the Theme Builder previews and
 * exports a different theme from the one `variables.css` ships, with every test
 * that reads only one side still green.
 *
 * Dark is the base layer (`packages/tokens/src/semantic`), light the override
 * (`src/themes/light`). Paths are relative to the package root, which is
 * vitest's cwd.
 *
 * The one deliberate difference is alpha. The JSON writes a translucent token
 * as an 8-digit hex (`#ffffff1a`) or `rgba()`; the map keeps only its base color and
 * `resolveSemanticColors` re-applies the alpha (`TOKEN_ALPHA`). Those tokens are
 * checked through the resolver instead, which is what the builder emits.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { semanticColorMap } from "./semanticColorMap.js";
import { resolveSemanticColors } from "./semanticResolve.js";
import { getCoreFamily } from "./families.js";

const MODES = {
  dark: join("..", "tokens", "src", "semantic"),
  light: join("..", "tokens", "src", "themes", "light"),
} as const;

const FILES = [
  "color-border.json",
  "color-content.json",
  "color-interactive.json",
  "color-status.json",
  "color-surface.json",
];

type Node = { $value?: unknown; [key: string]: unknown };

const RGBA = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/;

/** `{ "--color-surface-primary": "grey.2200" | "#ffffff1a" }`, in the map's notation. */
function readJson(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (node: Node, path: string[]) => {
    if ("$value" in node) {
      const value = String(node.$value);
      // `{grey.2200}` is a reference; the map writes it bare.
      out[`--${path.join("-")}`] = /^\{[a-z]+\.\d+\}$/.test(value) ? value.slice(1, -1) : value;
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (!key.startsWith("$") && child && typeof child === "object") {
        walk(child as Node, [...path, key]);
      }
    }
  };
  for (const file of FILES) walk(JSON.parse(readFileSync(join(dir, file), "utf8")), []);
  return out;
}

/** A color with alpha below 1, as `{ rgb, alpha }`; an opaque one gives null. */
function translucent(value: string): { rgb: number[]; alpha: number } | null {
  const hex = /^#([0-9a-f]{6})([0-9a-f]{2})$/i.exec(value);
  if (hex) {
    const alpha = parseInt(hex[2]!, 16) / 255;
    const rgb = [0, 2, 4].map((i) => parseInt(hex[1]!.slice(i, i + 2), 16));
    return alpha < 1 ? { rgb, alpha } : null;
  }
  const fn = RGBA.exec(value);
  if (fn) {
    const alpha = Number(fn[4]);
    return alpha < 1 ? { rgb: [Number(fn[1]), Number(fn[2]), Number(fn[3])], alpha } : null;
  }
  return null;
}

describe.each(Object.entries(MODES))("semanticColorMap.%s", (mode, dir) => {
  const json = readJson(dir);
  const map = semanticColorMap[mode as keyof typeof MODES];
  const alphaTokens = Object.keys(json).filter((name) => translucent(json[name]!));

  it("declares the same tokens as the JSON", () => {
    expect(Object.keys(map).sort()).toEqual(Object.keys(json).sort());
  });

  it("matches the JSON for every opaque token", () => {
    const drift = Object.keys(json)
      .filter((name) => !alphaTokens.includes(name) && map[name] !== json[name])
      .map((name) => `${name}: map ${map[name]}, JSON ${json[name]}`);
    expect(drift).toEqual([]);
  });

  it("resolves every translucent token to the JSON's color and alpha", () => {
    // Guards the exclusion above: if the JSON gains a translucent token the
    // resolver doesn't re-apply alpha to, it comes out opaque and fails here.
    expect(alphaTokens.length).toBeGreaterThan(0);
    const resolved = resolveSemanticColors(mode as keyof typeof MODES, {
      brandRamp: getCoreFamily("cerulean"),
      neutralRamp: getCoreFamily("grey"),
      brandShade: "1400",
    });
    const drift: string[] = [];
    for (const name of alphaTokens) {
      const want = translucent(json[name]!)!;
      const m = RGBA.exec(resolved[name] ?? "");
      const rgb = m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [];
      // The JSON stores alpha in 1/255 steps, the map's table in hundredths.
      const alphaOk = m ? Math.abs(Number(m[4]) - want.alpha) <= 1 / 255 : false;
      if (rgb.join() !== want.rgb.join() || !alphaOk) {
        drift.push(`${name}: resolved ${resolved[name]}, JSON ${json[name]}`);
      }
    }
    expect(drift).toEqual([]);
  });
});
