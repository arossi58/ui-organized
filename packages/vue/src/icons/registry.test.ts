import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Guards the two properties that make the icon peers genuinely optional and the
 * subpath registration survivable.
 *
 * **The main entry must not reach any icon library.** React's `Icon` once
 * statically imported all three adapters, so its `dist/index.mjs` carried
 * top-level imports for every icon package at once. `peerDependenciesMeta.optional`
 * only silences npm's install warning — at bundle time all three were hard
 * requirements, and an app using only Lucide failed its production build with
 * 168 `MISSING_EXPORT` errors for a library it never referenced.
 *
 * **`sideEffects` must cover the entry modules.** The same package then shipped
 * `sideEffects: ["**\/*.css"]`, telling bundlers the JS here is pure — and a
 * side-effect-only import of a module the bundler believes is pure is exactly
 * what tree shaking deletes. Icons rendered in `vite dev` and vanished in
 * `vite build`, with the build staying green.
 *
 * Source-level tests rather than build-output ones, so they fail in the editor
 * rather than after a publish.
 */

const ICON_PACKAGES = ["@lucide/vue", "@tabler/icons-vue", "@heroicons/vue"];

/** Modules allowed to import an icon library — one per library, each a subpath entry. */
const ADAPTERS = new Set([
  "src/icons/lucide.ts",
  "src/icons/tabler.ts",
  "src/icons/heroicons.ts",
]);

const LIBRARIES = ["lucide", "tabler", "heroicons"];

function sourceFiles(dir = "src"): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.(ts|vue)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) out.push(path);
  }
  return out.sort();
}

/**
 * Every module specifier `file` imports.
 *
 * Matches `from "…"` rather than trying to parse the whole statement: the icon
 * adapters import ~55 names across a dozen lines, and any newline-sensitive
 * pattern misses them — which would make this whole test vacuously pass. Also
 * catches bare side-effect imports (`import "./Icon.css"`).
 *
 * Comments are dropped first, so prose that names an icon package as an example
 * is not read as an import of it. Whole-line `//` only, so a URL inside a string
 * survives.
 */
function importsOf(file: string): string[] {
  const src = readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  const fromClauses = [...src.matchAll(/\bfrom\s+["']([^"']+)["']/g)].map((m) => m[1]!);
  const sideEffects = [...src.matchAll(/^\s*import\s+["']([^"']+)["']/gm)].map((m) => m[1]!);
  return [...fromClauses, ...sideEffects];
}

/** Resolve a relative specifier (with its `.js` extension) back to a source path. */
function resolveLocal(from: string, spec: string): string | null {
  if (!spec.startsWith(".")) return null;
  const base = join(from, "..", spec).replace(/\.js$/, "");
  for (const ext of ["", ".ts", ".vue", "/index.ts"]) {
    const candidate = base + ext;
    try {
      readFileSync(candidate);
      return candidate;
    } catch {
      /* try the next shape */
    }
  }
  return null;
}

/** Every module reachable from an entry, following relative imports. */
function reachableFrom(entry: string): Set<string> {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const spec of importsOf(file)) {
      const local = resolveLocal(file, spec);
      if (local) queue.push(local);
    }
  }
  return seen;
}

/** package.json `sideEffects` globs, in the subset of glob webpack applies to them. */
function matchesAnySideEffect(patterns: string[], path: string): boolean {
  return patterns.some((pattern) => {
    const source = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*\//g, "(?:.*/)?")
      .replace(/\*/g, "[^/]*");
    return new RegExp(`^${source}$`).test(path);
  });
}

describe("icon library isolation", () => {
  it("keeps every icon library out of the main entry's module graph", () => {
    const reachable = reachableFrom("src/index.ts");
    const offenders: string[] = [];
    for (const file of reachable) {
      for (const spec of importsOf(file)) {
        if (ICON_PACKAGES.some((pkg) => spec === pkg || spec.startsWith(`${pkg}/`))) {
          offenders.push(`${file} imports ${spec}`);
        }
      }
    }
    expect(offenders, "src/index.ts must not reach any icon library").toEqual([]);
  });

  it("confines each icon library to exactly one adapter module", () => {
    const importers = new Map<string, string[]>();
    for (const file of sourceFiles()) {
      for (const spec of importsOf(file)) {
        const pkg = ICON_PACKAGES.find((p) => spec === p || spec.startsWith(`${p}/`));
        if (pkg) importers.set(pkg, [...(importers.get(pkg) ?? []), file]);
      }
    }
    for (const [pkg, files] of importers) {
      const unique = [...new Set(files)];
      expect(unique.length, `${pkg} is imported from ${unique.join(", ")}`).toBe(1);
      expect(ADAPTERS.has(unique[0]!), `${pkg} imported from ${unique[0]}`).toBe(true);
    }
    // All three are still adapted — this would otherwise pass by deleting them.
    expect([...importers.keys()].sort()).toEqual([...ICON_PACKAGES].sort());
  });

  it("exposes one subpath entry per library, each registering itself", () => {
    for (const lib of LIBRARIES) {
      const src = readFileSync(`src/icons/entry-${lib}.ts`, "utf8");
      expect(src, `entry-${lib} must register`).toContain("registerIconSet(");
    }
  });

  it("declares every subpath entry in package.json exports, and builds one", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
      exports: Record<string, Record<string, string>>;
    };
    // Vite's lib build takes a single entry unless it is told otherwise, so an
    // adapter that is exported but not listed here would 404 at install time.
    const config = readFileSync("vite.config.ts", "utf8");
    for (const lib of LIBRARIES) {
      const entry = pkg.exports[`./icons/${lib}`];
      expect(entry, `exports["./icons/${lib}"]`).toBeTruthy();
      expect(entry!.import).toBe(`./dist/icons/entry-${lib}.js`);
      expect(config, `vite.config.ts must build icons/entry-${lib}`).toContain(
        `"icons/entry-${lib}"`,
      );
    }
  });

  it("marks every subpath entry as having side effects", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { sideEffects: string[] };
    for (const lib of LIBRARIES) {
      const built = `./dist/icons/entry-${lib}.js`;
      expect(
        matchesAnySideEffect(pkg.sideEffects, built),
        `${built} is not covered by sideEffects, so bundlers will drop its registerIconSet call ` +
          `in production builds only`,
      ).toBe(true);
    }
  });

  it("keeps the registry on a global key so a duplicated module still shares state", () => {
    // A CJS or non-splitting build inlines its own copy of this module into each
    // entry. A module-local Map would give `icons/lucide` and `Icon` different
    // registries and icons would silently never render.
    const src = readFileSync("src/icons/registry.ts", "utf8");
    expect(src).toContain("Symbol.for(");
    expect(src).toContain("globalThis");
  });
});
