#!/usr/bin/env node
/**
 * Does every publishable package's tarball contain the files its own
 * `exports` map points at?
 *
 * ── Why this needs a gate rather than a look ────────────────────────────────
 *
 * npm decides a tarball's contents from `files`, and **falls back to
 * `.gitignore` when there is no `files` field**. `@ui-organized/angular`'s
 * `styles.css` and `overlay.css` are generated at build time and therefore
 * gitignored, so without an explicit `files` list the two stylesheets its own
 * `exports` map advertises would be absent from the published package. The
 * install succeeds, the import resolves to nothing, and the first sign of
 * trouble is an unstyled app in someone else's project.
 *
 * Nothing else catches it. A workspace consumer resolves through symlinks to the
 * package directory, where every file exists whether or not it would be
 * published — so the smoke gates, the parity harness and every app in this repo
 * all pass against a package that would ship broken. The only way to know is to
 * pack it and look inside, which is what this does.
 *
 * Checks, per package:
 *   - `README.md` and `LICENSE` are present (both are in every `files` list, and
 *     a package published without them has no front page on npm)
 *   - something was emitted into `dist/`
 *   - every path in `exports`, `main` and `types` exists in the tarball,
 *     including wildcard subpaths like `./components/*`
 *
 * `pnpm pack` builds nothing, so run this after `pnpm build`.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

/** Every package that goes to npm. `private: true` ones are not listed. */
const PACKAGES = [
  "core",
  "react",
  "svelte",
  "vue",
  "angular",
  "table-core",
  "react-table",
  "vue-table",
  "svelte-table",
  "angular-table",
  "tokens",
  "utils",
  "cli",
];

/** Every file path an `exports` map points at, at any depth. */
function exportTargets(node, out = new Set()) {
  if (typeof node === "string") {
    if (node.startsWith("./")) out.add(node.slice(2));
  } else if (Array.isArray(node)) {
    for (const value of node) exportTargets(value, out);
  } else if (node && typeof node === "object") {
    for (const value of Object.values(node)) exportTargets(value, out);
  }
  return out;
}

/**
 * A wildcard target is satisfied by *any* file matching it, because the subpath
 * a consumer asks for is not knowable from here — `./components/*` promises that
 * `dist/components/<anything>` resolves, and the failure it guards against is
 * the directory being absent entirely.
 */
function satisfied(target, names) {
  if (!target.includes("*")) return names.has(target);
  const prefix = target.slice(0, target.indexOf("*"));
  return [...names].some((name) => name.startsWith(prefix) && name !== prefix);
}

let failures = 0;
const outDir = mkdtempSync(join(tmpdir(), "uio-pack-"));

process.stdout.write(`\nPacking ${PACKAGES.length} publishable packages…\n\n`);

try {
  for (const name of PACKAGES) {
    const pkgDir = join(repoRoot, "packages", name);
    let manifest;
    try {
      manifest = JSON.parse(await readFile(join(pkgDir, "package.json"), "utf8"));
    } catch {
      process.stdout.write(`  ✗ ${name.padEnd(15)} no package.json\n`);
      failures++;
      continue;
    }
    if (manifest.private) {
      process.stdout.write(`  ✗ ${name.padEnd(15)} still marked private\n`);
      failures++;
      continue;
    }

    try {
      execFileSync("pnpm", ["pack", "--pack-destination", outDir], {
        cwd: pkgDir,
        stdio: ["ignore", "pipe", "pipe"],
        encoding: "utf8",
      });
    } catch (error) {
      process.stdout.write(`  ✗ ${name.padEnd(15)} pnpm pack failed\n`);
      process.stdout.write(`      ${(error.stderr || error.message).split("\n")[0]}\n`);
      failures++;
      continue;
    }

    const tarball = readdirSync(outDir).find((file) =>
      file.startsWith(`${manifest.name.replace("@", "").replace("/", "-")}-`),
    );
    if (!tarball) {
      process.stdout.write(`  ✗ ${name.padEnd(15)} packed, but no tarball found\n`);
      failures++;
      continue;
    }

    // `tar tzf` rather than a dependency: this script lives at the repo root,
    // where the convention is `node:` builtins only.
    const names = new Set(
      execFileSync("tar", ["tzf", join(outDir, tarball)], { encoding: "utf8" })
        .split("\n")
        .filter((line) => line.startsWith("package/"))
        .map((line) => line.slice("package/".length))
        .filter(Boolean),
    );

    const problems = [];
    for (const required of ["README.md", "LICENSE"]) {
      if (!names.has(required)) problems.push(`missing ${required}`);
    }
    if (![...names].some((file) => file.startsWith("dist/"))) problems.push("nothing in dist/");

    const targets = exportTargets(manifest.exports);
    for (const field of ["main", "types", "module"]) {
      const value = manifest[field];
      if (typeof value === "string" && value.startsWith("./")) targets.add(value.slice(2));
    }
    for (const target of [...targets].sort()) {
      if (!satisfied(target, names)) problems.push(`exports → ./${target} is not in the tarball`);
    }

    const distCount = [...names].filter((file) => file.startsWith("dist/")).length;
    if (problems.length) {
      failures++;
      process.stdout.write(`  ✗ ${name.padEnd(15)} ${String(names.size).padStart(4)} files\n`);
      for (const problem of problems) process.stdout.write(`      • ${problem}\n`);
    } else {
      process.stdout.write(
        `  ✓ ${name.padEnd(15)} ${String(names.size).padStart(4)} files ` +
          `(${distCount} in dist), ${targets.size} exports targets all present\n`,
      );
    }
  }
} finally {
  rmSync(outDir, { recursive: true, force: true });
}

process.stdout.write(
  failures === 0
    ? "\n✓ every tarball carries what its exports map promises\n\n"
    : `\n✗ ${failures} package(s) would publish broken\n\n`,
);
process.exit(failures === 0 ? 0 : 1);
