/**
 * `toNativeName` against every icon the installed libraries actually ship.
 *
 * Both packages say which native name each export belongs to: lucide-react's
 * index re-exports each icon from a file named after it, and every Tabler
 * component is created with its own name. So this compares the converter with
 * the libraries themselves, not with our idea of them. Lucide's deprecated
 * aliases are skipped: `AlertCircle` points at `circle-alert`, and an app that
 * registers `{ AlertCircle }` names it `alert-circle`, which is what it imported.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { toNativeName } from "@ui-organized/core";

// Vitest runs from the package root, where pnpm links each dependency.
const pkgDir = (name: string) => join("node_modules", name);
const pascal = (n: string) =>
  n
    .split("-")
    .map((s) => s[0]!.toUpperCase() + s.slice(1))
    .join("");

/**
 * The exports whose names lose information going native → export: whether a
 * digit run was its own segment (`arrow-down-0-1` and `clock-10` both become
 * one run) or glued to a word (`brand-css3` vs `trash-2`). They are registered
 * by native name instead. Listed in full so a new miss fails here rather than
 * shipping as an icon that silently never resolves.
 */
const KNOWN_MISSES = new Set([
  // lucide
  "ArrowDown01", "ArrowDown10", "ArrowUp01", "ArrowUp10",
  // tabler
  "IconBrandAo3", "IconBrandAuth0", "IconBrandCss3", "IconBrandD3", "IconBrandFlightradar24",
  "IconBrandHtml5", "IconCrop11", "IconCrop11Filled", "IconCrop169", "IconCrop169Filled",
  "IconCrop32", "IconCrop32Filled", "IconCrop54", "IconCrop54Filled", "IconCrop75",
  "IconCrop75Filled", "IconMultiplier05x", "IconMultiplier15x", "IconSort09", "IconSort90",
  ...Array.from({ length: 10 }, (_, i) => [`IconSquareF${i}`, `IconSquareF${i}Filled`]).flat(),
]);

function mismatches(library: "lucide" | "tabler", pairs: [string, string][]) {
  return pairs
    .filter(([exportName, native]) => toNativeName(library, exportName) !== native)
    .map(([exportName, native]) => `${exportName} → ${toNativeName(library, exportName)}, is ${native}`)
    .filter((line) => !KNOWN_MISSES.has(line.split(" ")[0]!));
}

describe("toNativeName against the shipped catalogues", () => {
  it("recovers every primary lucide-react export", () => {
    const src = readFileSync(join(pkgDir("lucide-react"), "dist/esm/lucide-react.js"), "utf8");
    const pairs: [string, string][] = [];
    for (const m of src.matchAll(/export \{([^}]*)\} from '\.\/icons\/([^']*)\.js'/g)) {
      for (const e of m[1]!.matchAll(/default as (\w+)/g)) {
        if (e[1] === pascal(m[2]!)) pairs.push([e[1]!, m[2]!]);
      }
    }
    expect(pairs.length).toBeGreaterThan(1000);
    expect(mismatches("lucide", pairs)).toEqual([]);
  });

  it("recovers every @tabler/icons-react export", () => {
    const dir = join(pkgDir("@tabler/icons-react"), "dist/esm/icons");
    const pairs: [string, string][] = [];
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".mjs"))) {
      const m = readFileSync(join(dir, file), "utf8").match(/createReactComponent\("\w+", "([^"]+)"/);
      if (m) pairs.push([file.replace(/\.mjs$/, ""), m[1]!]);
    }
    expect(pairs.length).toBeGreaterThan(4000);
    expect(mismatches("tabler", pairs)).toEqual([]);
  });
});
