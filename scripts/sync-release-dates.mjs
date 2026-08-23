#!/usr/bin/env node
/**
 * Release date generator.
 *
 * Changesets writes each package's `CHANGELOG.md` with a `## <version>` heading
 * per release and no dates at all. The dates do exist — `changeset publish` tags
 * every release as `@ui-organized/<pkg>@<version>` — but only in git, and the
 * site's deploy checks out at the default `fetch-depth: 1`, so no tag is
 * readable at build time. This script bridges the two: it reads the tags here,
 * where the full history is, and writes them to a committed artifact the docs
 * changelog page imports like any other manifest.
 *
 *   manifest/release-dates.json
 *     { "@ui-organized/react": { "5.0.1": "2026-07-27", ... }, ... }
 *
 * Run after publishing a release, and commit the result:
 *   pnpm generate:release-dates
 *
 * Every `@ui-organized/*` tag is emitted, not just the two packages the docs
 * page reads today — the extra entries cost a few hundred bytes and mean adding
 * a package to the page later needs no change here.
 *
 * Pure Node (no dependencies). Idempotent: the output is fully sorted and the
 * file is only rewritten when its content actually changed, so re-running never
 * produces a diff on its own.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = resolve(ROOT, "manifest/release-dates.json");

/** `@ui-organized/react@5.0.1` → package `@ui-organized/react`, version `5.0.1`. */
const TAG = /^(@ui-organized\/[a-z0-9-]+)@(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;

function readTags() {
  // `%(creatordate)` resolves to the tag date for annotated tags and the commit
  // date for lightweight ones, so both kinds report the moment of the release.
  const out = execFileSync(
    "git",
    ["for-each-ref", "--format=%(refname:strip=2)|%(creatordate:short)", "refs/tags"],
    { cwd: ROOT, encoding: "utf8" },
  );

  const byPackage = {};
  for (const line of out.split("\n")) {
    const [ref, date] = line.split("|");
    const match = TAG.exec(ref ?? "");
    if (!match || !date) continue;

    const [, name, version] = match;
    (byPackage[name] ??= {})[version] = date;
  }
  return byPackage;
}

/** Sorted at every level so the committed file diffs cleanly release to release. */
function sortDeep(byPackage) {
  const sorted = {};
  for (const name of Object.keys(byPackage).sort()) {
    sorted[name] = Object.fromEntries(
      Object.entries(byPackage[name]).sort(([a], [b]) => compareVersions(b, a)),
    );
  }
  return sorted;
}

/** Newest first, numeric per segment — `10.0.0` must sort above `9.0.0`. */
function compareVersions(a, b) {
  const [aBase, aPre = ""] = a.split("-");
  const [bBase, bPre = ""] = b.split("-");
  const left = aBase.split(".").map(Number);
  const right = bBase.split(".").map(Number);

  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  // A prerelease sorts below its own release: 1.0.0-rc.1 < 1.0.0.
  if (aPre === bPre) return 0;
  if (!aPre) return 1;
  if (!bPre) return -1;
  return aPre < bPre ? -1 : 1;
}

const data = sortDeep(readTags());
const json = `${JSON.stringify(data, null, 2)}\n`;

let existing = null;
try {
  existing = readFileSync(OUT_PATH, "utf8");
} catch {
  // First run — no file yet.
}

const where = relative(ROOT, OUT_PATH);
const releases = Object.values(data).reduce((n, versions) => n + Object.keys(versions).length, 0);

if (existing === json) {
  console.log(`${where} already up to date (${releases} releases).`);
} else {
  writeFileSync(OUT_PATH, json);
  console.log(`Wrote ${where} — ${releases} releases across ${Object.keys(data).length} packages.`);
}
