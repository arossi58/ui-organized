import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Guards the property that makes the icon peers genuinely optional: **the main
 * entry must not reach any icon library.**
 *
 * It used to. `Icon` statically imported all three adapters, so `dist/index.mjs`
 * carried top-level imports for `lucide-react`, `@tabler/icons-react` and
 * `@heroicons/react`. `peerDependenciesMeta.optional` only silences npm's
 * install warning — at bundle time all three were hard requirements, and an app
 * using only Lucide failed its production build with 168 `MISSING_EXPORT` errors
 * for a library it never referenced.
 *
 * A source-level test rather than a build-output one, so it fails in the editor
 * rather than after a publish.
 */

const ICON_PACKAGES = ["lucide-react", "@tabler/icons-react", "@heroicons/react"];

/** Modules allowed to import an icon library — one per library, each a subpath entry. */
const ADAPTERS = new Set([
  "src/icons/lucide.ts",
  "src/icons/tabler.ts",
  "src/icons/heroicons.ts",
]);

function sourceFiles(dir = "src"): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".test.ts")) out.push(path);
  }
  return out.sort();
}

/**
 * Every module specifier `file` imports.
 *
 * Matches `from "…"` rather than trying to parse the whole statement: the icon
 * adapters import ~50 names across a dozen lines, and any newline-sensitive
 * pattern misses them — which would make this whole test vacuously pass. Also
 * catches bare side-effect imports (`import "./Icon.css"`).
 */
function importsOf(file: string): string[] {
  const src = readFileSync(file, "utf8");
  const fromClauses = [...src.matchAll(/\bfrom\s+["']([^"']+)["']/g)].map((m) => m[1]!);
  const sideEffects = [...src.matchAll(/^\s*import\s+["']([^"']+)["']/gm)].map((m) => m[1]!);
  return [...fromClauses, ...sideEffects];
}

/** Resolve a relative specifier (with its `.js` extension) back to a source path. */
function resolveLocal(from: string, spec: string): string | null {
  if (!spec.startsWith(".")) return null;
  const base = join(from, "..", spec).replace(/\.js$/, "");
  for (const ext of [".ts", ".tsx", "/index.ts", "/index.tsx"]) {
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
    for (const lib of ["lucide", "tabler", "heroicons"]) {
      const src = readFileSync(`src/icons/entry-${lib}.ts`, "utf8");
      expect(src, `entry-${lib} must register`).toContain("registerIconSet(");
    }
  });

  it("declares every subpath entry in package.json exports", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
      exports: Record<string, unknown>;
    };
    for (const lib of ["lucide", "tabler", "heroicons"]) {
      expect(pkg.exports[`./icons/${lib}`], `exports["./icons/${lib}"]`).toBeTruthy();
    }
  });

  it("keeps the registry on a global key so a duplicated module still shares state", () => {
    // The CJS build cannot code-split, so each entry inlines its own copy of this
    // module. A module-local Map would give `icons/lucide` and `Icon` different
    // registries and icons would silently never render.
    const src = readFileSync("src/icons/registry.ts", "utf8");
    expect(src).toContain("Symbol.for(");
    expect(src).toContain("globalThis");
  });
});
