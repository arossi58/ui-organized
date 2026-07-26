import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { readZip, UnsupportedZipError } from "./zip.js";

/**
 * A Theme Builder export, however it reached us — a `.zip` straight from the
 * browser's Downloads folder, or a directory someone already unzipped.
 */

export interface Bundle {
  /** Where it came from, for messages. */
  source: string;
  /** File name → text content. Binary entries are not expected in a theme bundle. */
  files: Map<string, string>;
}

/** The stylesheet, the only genuinely required file. */
export const THEME_CSS = "theme.css";
export const FONTS_TS = "fonts.ts";
export const ICONS_TS = "icons.ts";
export const THEME_JSON = "theme.json";

export class BundleError extends Error {}

export function loadBundle(source: string): Bundle {
  const stats = statSync(source, { throwIfNoEntry: false });
  if (!stats) throw new BundleError(`No such file or directory: ${source}`);

  const files = stats.isDirectory() ? readDirectory(source) : readArchive(source);

  if (!files.has(THEME_CSS)) {
    const found = [...files.keys()].sort().join(", ") || "nothing";
    throw new BundleError(
      `${source} has no ${THEME_CSS}. Found: ${found}.\n` +
        `Expected a Theme Builder export — the zip you get from the Export tab.`,
    );
  }

  return { source, files };
}

function readArchive(file: string): Map<string, string> {
  let entries;
  try {
    entries = readZip(readFileSync(file));
  } catch (error) {
    if (error instanceof UnsupportedZipError) {
      throw new BundleError(
        `Can't read ${file}: ${error.message}.\n` +
          `Unzip it yourself and point at the folder instead:\n` +
          `    uiorg theme <folder>`,
      );
    }
    throw error;
  }

  const files = new Map<string, string>();
  for (const entry of entries) {
    // Archives made on some systems nest everything under a top-level folder,
    // and macOS adds __MACOSX/ metadata. Flatten to base names — a theme bundle
    // is flat by construction, so there is nothing to collide.
    const name = entry.name.split("/").pop() ?? entry.name;
    if (!name || entry.name.startsWith("__MACOSX/") || name.startsWith("._")) continue;
    files.set(name, entry.data.toString("utf8"));
  }
  return files;
}

function readDirectory(dir: string): Map<string, string> {
  const files = new Map<string, string>();
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (!statSync(path).isFile()) continue;
    files.set(name, readFileSync(path, "utf8"));
  }
  return files;
}

// ─── Reading meaning out of the bundle ───────────────────────────────────────

/** Custom properties the theme declares, across every block in the file. */
export function declaredTokens(css: string): Set<string> {
  return new Set([...css.matchAll(/(?:^|[;{])\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]!));
}

/**
 * Font families the theme *names*, from its `--type-font-*` declarations.
 *
 * Only the first family in each stack: `'Oswald', sans-serif` names Oswald and
 * falls back to a generic, and the generic is not something anyone loads.
 */
export function namedFontFamilies(css: string): string[] {
  const families = new Set<string>();
  for (const [, stack] of css.matchAll(/--type-font-[\w-]+\s*:\s*([^;]+);/g)) {
    const first = stack!.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "");
    if (first) families.add(first);
  }
  return [...families];
}

export interface BundleFont {
  family: string;
  weights: number[];
  href: string;
}

/**
 * Parse `fonts.ts` without executing it.
 *
 * The file is generated and its shape is fixed, so a regex over the emitted
 * object literals is enough — and running arbitrary code out of a downloaded
 * archive to read three fields would be a poor trade.
 */
export function parseFonts(source: string): BundleFont[] {
  const fonts: BundleFont[] = [];
  const entry = /\{\s*family:\s*"([^"]+)",\s*weights:\s*\[([^\]]*)\],\s*href:\s*"([^"]+)",?\s*\}/g;
  for (const [, family, weights, href] of source.matchAll(entry)) {
    fonts.push({
      family: family!,
      weights: weights!
        .split(",")
        .map((w) => Number(w.trim()))
        .filter((w) => Number.isFinite(w)),
      href: href!,
    });
  }
  return fonts;
}

/** The icon library the bundle's `icons.ts` selects, if it has one. */
export function parseIconLibrary(source: string): string | undefined {
  return /library:\s*"([^"]+)"/.exec(source)?.[1];
}
