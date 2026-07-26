import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { readZip, UnsupportedZipError } from "../src/zip.js";

/**
 * The zip reader is dependency-free, which means its correctness is ours rather
 * than a library's. The fixture is a real Theme Builder export produced by
 * JSZip — including its data descriptors, which is the detail a naive reader
 * gets wrong (it writes zeroed sizes in the local header and the real values in
 * the central directory, so trusting the local header yields empty files with
 * no error at all).
 */

const FIXTURE = join(import.meta.dirname, "fixtures", "kitchen-sink-teal-theme.zip");
const archive = readFileSync(FIXTURE);

describe("readZip", () => {
  it("reads every entry of a real Theme Builder bundle", () => {
    const entries = readZip(archive);
    expect(entries.map((e) => e.name).sort()).toEqual([
      "README.md",
      "fonts.ts",
      "icons.ts",
      "theme.css",
      "theme.json",
    ]);
    for (const entry of entries) expect(entry.data.length).toBeGreaterThan(0);
  });

  it("produces byte-identical output to unzip(1)", () => {
    // The strongest available oracle: the reference implementation everyone else
    // uses. Skipped where `unzip` isn't installed rather than silently weakened.
    let dir: string;
    try {
      dir = mkdtempSync(join(tmpdir(), "uiorg-zip-"));
      execFileSync("unzip", ["-q", FIXTURE, "-d", dir], { stdio: "ignore" });
    } catch {
      return;
    }
    try {
      const mine = new Map(readZip(archive).map((e) => [e.name, e.data]));
      const theirs = readdirSync(dir);
      expect(theirs.sort()).toEqual([...mine.keys()].sort());
      for (const name of theirs) {
        expect(mine.get(name), name).toEqual(readFileSync(join(dir, name)));
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("parses the same content when the archive is read twice", () => {
    expect(readZip(archive)).toEqual(readZip(archive));
  });

  it("names the problem rather than mis-parsing a non-zip", () => {
    expect(() => readZip(Buffer.from("this is not a zip file, it is prose"))).toThrow(
      UnsupportedZipError,
    );
    expect(() => readZip(Buffer.alloc(4))).toThrow(/too small/);
  });

  it("rejects a truncated archive instead of returning partial data", () => {
    // Silently returning half a theme would be worse than failing.
    expect(() => readZip(archive.subarray(0, Math.floor(archive.length / 2)))).toThrow(
      UnsupportedZipError,
    );
  });
});
