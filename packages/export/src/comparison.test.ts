import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";
import { resolve, type EffectiveDocument, type EffectiveToken } from "@ui-organized/resolver";

/**
 * Parity fixture (`11-export.md`): the resolver and Style Dictionary +
 * sd-transforms must agree where they can. Number math + references are the
 * unambiguous common ground (no unit/color-format divergence). Where they can't
 * agree (color format), the resolver is authoritative.
 */

register(StyleDictionary);

const FIXTURE = {
  ratio: {
    $type: "number",
    base: { $value: 8 },
    double: { $value: "{ratio.base} * 2" },
    expr: { $value: "2 + 3 * 4" },
  },
};

function resolverValues(): Record<string, number> {
  const tokens = new Map<string, EffectiveToken>([
    ["ratio.base", { path: "ratio.base", $type: "number", $value: 8 }],
    ["ratio.double", { path: "ratio.double", $type: "number", $value: "{ratio.base} * 2" }],
    ["ratio.expr", { path: "ratio.expr", $type: "number", $value: "2 + 3 * 4" }],
  ]);
  const doc: EffectiveDocument = { tokens };
  const result = resolve(doc);
  return {
    double: result.tokens.get("ratio.double")!.raw as number,
    expr: result.tokens.get("ratio.expr")!.raw as number,
  };
}

async function styleDictionaryNumbers(): Promise<number[]> {
  const dir = mkdtempSync(join(tmpdir(), "uiorg-sd-"));
  try {
    writeFileSync(join(dir, "tokens.json"), JSON.stringify(FIXTURE), "utf-8");
    const sd = new StyleDictionary({
      source: [join(dir, "tokens.json")],
      preprocessors: ["tokens-studio"],
      platforms: {
        css: {
          transformGroup: "tokens-studio",
          buildPath: join(dir, "out") + "/",
          files: [{ destination: "vars.css", format: "css/variables" }],
        },
      },
      log: { verbosity: "silent" },
    });
    await sd.buildAllPlatforms();
    const css = readFileSync(join(dir, "out", "vars.css"), "utf-8");
    return [...css.matchAll(/--[\w-]+:\s*([\d.]+)\s*;/g)].map((m) => parseFloat(m[1]!));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("resolver ↔ Style Dictionary parity", () => {
  it("resolves number math + references identically", async () => {
    const rv = resolverValues();
    expect(rv.double).toBe(16);
    expect(rv.expr).toBe(14);

    const sdNumbers = await styleDictionaryNumbers();
    expect(sdNumbers).toContain(16);
    expect(sdNumbers).toContain(14);
  });
});
