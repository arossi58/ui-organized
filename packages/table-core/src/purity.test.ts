/**
 * The framework boundary, asserted.
 *
 * ESLint bans the imports (see eslint.config.mjs); this asserts the other half —
 * that the *package* declares no framework dependency or peer. The two catch
 * different mistakes: lint catches `import { useState } from "react"`, and this
 * catches `"react": "^18"` quietly appearing in dependencies, which is how a
 * boundary erodes without a single import to point at.
 *
 * The cheapest proof that a Vue adapter is actually possible is that this stays
 * green.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

const FRAMEWORK = [
  "react",
  "react-dom",
  "vue",
  "svelte",
  "@angular/core",
  "@ui-organized/react",
  "@ui-organized/vue",
  "@ui-organized/svelte",
  "@ui-organized/angular",
  "@tanstack/react-table",
  "@tanstack/react-virtual",
  "@tanstack/vue-table",
  "@tanstack/svelte-table",
];

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry.name)) out.push(path);
  }
  return out;
}

describe("framework purity", () => {
  it("declares no framework dependency or peer", () => {
    for (const field of ["dependencies", "peerDependencies", "optionalDependencies"] as const) {
      const declared = Object.keys(pkg[field] ?? {});
      for (const name of FRAMEWORK) {
        expect(
          declared,
          `${name} must not be a ${field} of @ui-organized/table-core`,
        ).not.toContain(name);
      }
    }
  });

  it("imports no framework in any source file", () => {
    const offenders: string[] = [];
    // This file is excluded from its own scan: it names every banned module in
    // the list above, which is exactly what it is looking for.
    for (const file of sourceFiles("src").filter((f) => !f.endsWith("purity.test.ts"))) {
      const source = readFileSync(file, "utf8");
      // Matches `from "react"`, `from "react/jsx-runtime"`, `require("react")`.
      if (
        /(?:from|require\()\s*["'](react|react-dom|vue|svelte|@ui-organized\/react|@tanstack\/(?:react|vue|svelte)-)/.test(
          source,
        )
      ) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ships no framework import in the built bundle", () => {
    // Guarded: `turbo test` depends on dependencies' builds, not this package's,
    // so dist is legitimately absent on a cold run.
    if (!existsSync("dist/index.mjs")) return;
    const bundle = readFileSync("dist/index.mjs", "utf8");
    expect(bundle).not.toMatch(/from\s*["']react["']/);
    expect(bundle).not.toMatch(/from\s*["']@ui-organized\/react["']/);
  });
});
