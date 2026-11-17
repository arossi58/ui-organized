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

/** The theme's icon settings: `IconProvider`'s props, whichever library takes them. */
export interface IconSettings {
  library: string;
  style?: string;
  strokeAdjustment?: boolean;
  baseSize?: number;
  baseStroke?: number;
}

/**
 * The bundle's icon settings, for printing as another library's provider.
 *
 * `icons.ts` is React's, so for Svelte, Vue and Angular its values are what
 * matter, not the file. theme.json carries them as data under
 * `$extensions["com.ui-organized.theme-builder"].icons`, so that is read first;
 * an older bundle without it falls back to `icons.ts`, read without executing
 * it, as `parseFonts` reads `fonts.ts`.
 */
export function readIconSettings(files: Map<string, string>): IconSettings | undefined {
  const json = files.get(THEME_JSON);
  if (json) {
    try {
      const icons = (JSON.parse(json) as { $extensions?: Record<string, { icons?: unknown }> }).$extensions?.[
        "com.ui-organized.theme-builder"
      ]?.icons;
      const settings = iconSettingsFrom(icons as Record<string, unknown> | undefined);
      if (settings) return settings;
    } catch {
      // Not JSON we can read; icons.ts may still say.
    }
  }

  const source = files.get(ICONS_TS);
  if (!source) return undefined;
  // Only the exported literal: the header comment quotes code of its own.
  const literal = source.slice(Math.max(0, source.indexOf("export const iconConfig")));
  const field = (name: string): unknown => {
    const raw = new RegExp(`\\b${name}:\\s*("[^"]*"|true|false|[\\d.]+)`).exec(literal)?.[1];
    if (raw === undefined) return undefined;
    if (raw.startsWith('"')) return raw.slice(1, -1);
    return raw === "true" ? true : raw === "false" ? false : Number(raw);
  };
  return iconSettingsFrom({
    library: field("library"),
    style: field("style"),
    strokeAdjustment: field("strokeAdjustment"),
    baseSize: field("baseSize"),
    baseStroke: field("baseStroke"),
  });
}

/** The well-typed fields of a settings object; undefined without a library. */
function iconSettingsFrom(raw: Record<string, unknown> | undefined): IconSettings | undefined {
  if (!raw || typeof raw.library !== "string") return undefined;
  const settings: IconSettings = { library: raw.library };
  if (typeof raw.style === "string") settings.style = raw.style;
  if (typeof raw.strokeAdjustment === "boolean") settings.strokeAdjustment = raw.strokeAdjustment;
  if (typeof raw.baseSize === "number" && Number.isFinite(raw.baseSize)) settings.baseSize = raw.baseSize;
  if (typeof raw.baseStroke === "number" && Number.isFinite(raw.baseStroke)) settings.baseStroke = raw.baseStroke;
  return settings;
}
