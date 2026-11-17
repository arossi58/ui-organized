#!/usr/bin/env node
/**
 * Is every publishable package's current version actually on npm?
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `@ui-organized/mcp@6.0.0` never reached npm, and nothing said so. Its version
 * was bumped by hand, outside `changeset version`, in the same PR that added a
 * changeset — and the Release workflow publishes only when no changesets are
 * pending, so no run could ever have published that state. The next `changeset
 * version` moved the whole group to 6.1.0 and 6.0.0 was skipped for good, while
 * `uiorg init` went on writing a `@ui-organized/mcp@6.0.0` pin that 404s.
 *
 * The hand bump itself is now refused twice (mcp's own build, and the
 * fixed-group check in `quality:lint`). This is the check from the other end. A
 * green Release run says the workflow finished, not that the registry has what
 * this commit says was published, and the manual check that existed was a
 * hand-kept list of names that did not include mcp. This asks the registry.
 *
 * ── What it checks ──────────────────────────────────────────────────────────
 *
 * Every workspace package without `"private": true` — the rule `changeset
 * publish` itself applies — at the version in its `package.json`. Derived, not
 * listed, for the reason `check-tarballs.mjs` gives: a list kept in step by hand
 * falls out of step. Read from pnpm rather than from `packages/` alone, because
 * `packs/ui-organized` publishes too.
 *
 * A version the registry does not have yet is asked about again for two
 * minutes before it counts as missing: a publish can take a moment to become
 * visible.
 *
 *   node scripts/check-published.mjs          # or: pnpm check:published
 */

import { spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const ATTEMPTS = 7;
const WAIT_MS = 20_000;

function publishablePackages() {
  const result = spawnSync("pnpm", ["list", "--recursive", "--depth", "-1", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status !== 0 || !result.stdout) {
    process.stderr.write(`✗ pnpm could not list the workspace\n${result.stderr ?? ""}\n`);
    process.exit(1);
  }
  return JSON.parse(result.stdout)
    .filter((pkg) => pkg.name && pkg.version && !pkg.private)
    .map(({ name, version }) => ({ name, version }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * `present`, `missing`, or `error` with the reason. A registry that could not be
 * asked is not a registry that said no, and the output keeps them apart.
 */
function lookUp({ name, version }) {
  const result = spawnSync("npm", ["view", `${name}@${version}`, "version", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  let answer;
  try {
    answer = JSON.parse(result.stdout || "null");
  } catch {
    answer = undefined;
  }
  if (result.status === 0 && answer === version) return { state: "present" };
  if (answer?.error?.code === "E404") return { state: "missing" };
  const reason =
    answer?.error?.summary ?? (result.stderr || result.error?.message || "no output").trim();
  return { state: "error", reason: reason.split("\n")[0] };
}

const packages = publishablePackages();
process.stdout.write(`\nChecking ${packages.length} publishable packages on npm…\n\n`);

let pending = packages;
const results = new Map();
for (let attempt = 1; attempt <= ATTEMPTS && pending.length; attempt++) {
  if (attempt > 1) {
    process.stdout.write(
      `  … ${pending.length} not visible yet, asking again in ${WAIT_MS / 1000}s ` +
        `(attempt ${attempt} of ${ATTEMPTS})\n`,
    );
    await sleep(WAIT_MS);
  }
  for (const pkg of pending) results.set(pkg.name, { ...pkg, ...lookUp(pkg) });
  pending = pending.filter((pkg) => results.get(pkg.name).state !== "present");
}

let failures = 0;
process.stdout.write("\n");
for (const { name, version, state, reason } of results.values()) {
  const id = `${name}@${version}`;
  if (state === "present") {
    process.stdout.write(`  ✓ ${id}\n`);
    continue;
  }
  failures++;
  process.stdout.write(
    state === "missing"
      ? `  ✗ ${id} is not on npm\n`
      : `  ✗ ${id} could not be checked: ${reason}\n`,
  );
}

process.stdout.write(
  failures === 0
    ? `\n✓ npm has every publishable package at the version this commit says\n\n`
    : `\n✗ ${failures} package(s) are not on npm at the version this commit says\n\n`,
);
process.exit(failures === 0 ? 0 : 1);
