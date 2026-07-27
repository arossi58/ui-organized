#!/usr/bin/env node
/**
 * Release gate: does the *packed artifact* work the way a user runs it?
 *
 * This exists because `@ui-organized/cli@0.2.0` shipped completely
 * non-functional — every invocation produced no output and exit 0 — and the
 * whole unit suite was green. The bug was in the entry-point guard:
 *
 *     if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
 *
 * npm installs bins as symlinks, Node resolves `import.meta.url` through the
 * real path while `argv[1]` holds the symlink path, so the guard was always
 * false and `main()` never ran.
 *
 * No unit test could have caught it. Importing `main()` and calling it passes
 * whether or not the guard works — the guard is precisely the code an
 * import-based test bypasses. The only test that catches this class of bug packs
 * the tarball, installs it, and runs the bin **through the symlink** the way npx
 * does. So that is what this does.
 *
 * Failure mode being guarded against is silence, so every assertion checks for
 * *output*, not just an exit code.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, lstatSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const pkgRoot = new URL("..", import.meta.url).pathname;
const work = mkdtempSync(join(tmpdir(), "uiorg-smoke-"));
let failures = 0;

const check = (name, ok, detail = "") => {
  process.stdout.write(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}\n`);
  if (!ok) failures++;
};

/**
 * Context, not an assertion.
 *
 * A separate marker on purpose: an earlier version rendered this as `✓` while
 * its own message said the condition was absent, so a run that proved nothing
 * looked like a run that proved something. If a line isn't a pass/fail, it must
 * not wear a tick.
 */
const note = (text) => process.stdout.write(`  · ${text}\n`);

/** Run a command, capturing stdout/stderr and the exit code rather than throwing. */
function attempt(file, args, options = {}) {
  try {
    const stdout = execFileSync(file, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options });
    return { code: 0, stdout, stderr: "" };
  } catch (error) {
    return {
      code: typeof error.status === "number" ? error.status : 1,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? "",
    };
  }
}

try {
  // Pre-flight. Without this, an unbuilt package produces six cascading
  // failures that all look like CLI bugs — which is exactly what happened when
  // this first ran in CI, where nothing builds `@ui-organized/cli` (no other
  // workspace depends on it, so it isn't in any build filter's closure). The
  // `test:smoke` script now builds first; this is the guard for when that
  // stops being true.
  const built = join(pkgRoot, "dist", "cli.js");
  if (!existsSync(built)) {
    process.stderr.write(
      `\n✗ ${built} doesn't exist — the package isn't built.\n` +
        `  Run \`pnpm build\` in packages/cli first. This script cannot test an artifact that hasn't been produced.\n\n`,
    );
    process.exit(1);
  }

  process.stdout.write("\nPacking and installing the real artifact…\n");

  const packed = execFileSync("npm", ["pack", "--pack-destination", work, "--silent"], {
    cwd: pkgRoot,
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .pop();
  const tarball = join(work, packed);

  const app = join(work, "app");
  execFileSync("npm", ["init", "-y"], { cwd: work, stdio: "ignore" });
  execFileSync("mkdir", ["-p", app]);
  execFileSync("npm", ["init", "-y"], { cwd: app, stdio: "ignore" });
  execFileSync("npm", ["install", "--silent", "--no-audit", "--no-fund", tarball], {
    cwd: app,
    stdio: "ignore",
  });

  const bin = join(app, "node_modules", ".bin", "uiorg");
  check("the bin is installed", existsSync(bin), existsSync(bin) ? "" : `expected ${bin}`);

  // npm links bins rather than copying them, and it was the link that broke the
  // tool — so on POSIX this is a real assertion: if the bin isn't a symlink, the
  // run below isn't exercising the condition the bug needed. Windows gets .cmd
  // shims instead, which is legitimate, so there it's reported and not asserted.
  if (existsSync(bin)) {
    const linked = lstatSync(bin).isSymbolicLink();
    if (process.platform === "win32") {
      note("bin is a shim, not a symlink (Windows) — the original bug's condition isn't reproducible here");
    } else {
      check("the bin is a symlink — the condition that broke it", linked, linked ? "" : "npm copied it; this run proves less than it should");
    }
  }

  const help = attempt(bin, ["--help"]);
  check("`uiorg --help` prints help through the bin", help.stdout.includes("uiorg — UI Organized"), `exit ${help.code}, ${help.stdout.length} bytes`);
  check("`uiorg --help` exits 0", help.code === 0, `exit ${help.code}`);

  // Not just "prints something version-shaped": it has to match the package it
  // came from. A hardcoded constant reported 0.1.0 from a 0.2.0 tarball.
  const declared = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8")).version;
  const version = attempt(bin, ["--version"]);
  check(
    "`uiorg --version` matches the packed package.json",
    version.stdout.trim() === declared,
    `reported ${version.stdout.trim() || "(nothing)"}, packed ${declared}`,
  );

  // No arguments must be loud. When this exited 0 in silence, a completely
  // broken CLI was indistinguishable from a working one.
  const bare = attempt(bin, []);
  check("`uiorg` with no arguments prints usage", (bare.stdout + bare.stderr).includes("Usage"));
  check("`uiorg` with no arguments exits non-zero", bare.code !== 0, `exit ${bare.code}`);

  const unknown = attempt(bin, ["nonsense"]);
  check("an unknown command exits non-zero", unknown.code !== 0, `exit ${unknown.code}`);

  // A real run, so the gate covers more than argument parsing.
  const missing = attempt(bin, ["theme", join(work, "does-not-exist.zip")]);
  check("a missing bundle is reported, not swallowed", (missing.stdout + missing.stderr).length > 0 && missing.code !== 0, `exit ${missing.code}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}

process.stdout.write(
  failures === 0
    ? "\n✓ The packed CLI works through the bin symlink.\n\n"
    : `\n✗ ${failures} smoke check${failures > 1 ? "s" : ""} failed — do not publish.\n\n`,
);
process.exit(failures === 0 ? 0 : 1);
