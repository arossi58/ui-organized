import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { run } from "../src/index.js";

/**
 * Argument-level behaviour.
 *
 * These deliberately do NOT cover "does the bin actually execute" — an
 * import-based test calls `run` directly and so bypasses the entry point
 * entirely, which is precisely how a completely non-functional CLI shipped with
 * a green suite. That gap is covered by `scripts/smoke.mjs`, which runs the
 * packed tarball through npm's bin symlink.
 */

function capture() {
  const out: string[] = [];
  const err: string[] = [];
  vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    out.push(String(chunk));
    return true;
  });
  vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
    err.push(String(chunk));
    return true;
  });
  return { stdout: () => out.join(""), stderr: () => err.join("") };
}

afterEach(() => vi.restoreAllMocks());

describe("argument handling", () => {
  it("prints help and exits non-zero when given nothing to do", async () => {
    // Exit 0 in silence is the failure mode that let a broken CLI look like
    // caller error. Being given no command is a usage error, not a success.
    const io = capture();
    const code = await run([]);
    expect(code).not.toBe(0);
    expect(io.stderr()).toContain("Usage");
  });

  it("prints help to stdout and exits 0 when help is asked for", async () => {
    for (const flag of ["--help", "-h"]) {
      const io = capture();
      expect(await run([flag])).toBe(0);
      expect(io.stdout()).toContain("uiorg — UI Organized");
      vi.restoreAllMocks();
    }
  });

  it("reports the version from package.json, not a hardcoded literal", async () => {
    // A constant here silently drifted: 0.2.0 shipped reporting 0.1.0.
    const declared = (
      JSON.parse(readFileSync(join(import.meta.dirname, "..", "package.json"), "utf8")) as {
        version: string;
      }
    ).version;
    const io = capture();
    expect(await run(["--version"])).toBe(0);
    expect(io.stdout().trim()).toBe(declared);
  });

  it("rejects an unknown command with usage and a non-zero code", async () => {
    const io = capture();
    expect(await run(["nonsense"])).not.toBe(0);
    expect(io.stderr()).toContain("Unknown command");
  });

  it("rejects an unknown option rather than ignoring it", async () => {
    const io = capture();
    expect(await run(["theme", "x.zip", "--nope"])).not.toBe(0);
    expect(io.stderr()).toContain("--nope");
  });

  it("asks for a bundle when the command is given without one", async () => {
    const io = capture();
    expect(await run(["theme"])).not.toBe(0);
    expect(io.stderr()).toContain("Which bundle");
  });
});
