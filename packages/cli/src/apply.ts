import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { FONTS_TS, ICONS_TS, THEME_CSS, THEME_JSON, type Bundle } from "./bundle.js";
import { display, type Project } from "./project.js";

/**
 * Writing the files.
 *
 * The interesting decisions here are about *not* writing: where the files
 * belong is detected rather than assumed, identical content is reported as
 * unchanged rather than rewritten (so running twice is genuinely a no-op), and
 * a dry run takes exactly the same path with the final write skipped — which is
 * what makes `--dry-run` trustworthy rather than a separate code path that can
 * drift from the real one.
 */

export type WriteStatus = "created" | "updated" | "unchanged";

export interface PlannedWrite {
  path: string;
  content: string;
  status: WriteStatus;
}

export interface ApplyPlan {
  writes: PlannedWrite[];
  /** Where theme.css will land — the anchor for the cascade check and advice. */
  themeCssPath: string;
}

export interface PlanOptions {
  /** Explicit destination directory for the stylesheet (`--out`). */
  out?: string;
}

/**
 * Decide what goes where, without touching the disk.
 *
 * `src/styles/theme.css` is this project's layout, not a standard — so an
 * existing theme.css wins, then `--out`, then a documented default.
 */
export function planApply(bundle: Bundle, project: Project, options: PlanOptions = {}): ApplyPlan {
  // An unzipped bundle sitting inside the project has a theme.css of its own,
  // and it is *shallower* than the app's more often than not. Detecting that one
  // would make the source its own destination — a copy onto itself, with the real
  // stylesheet left untouched and the run reporting success.
  const existing = isInside(project.existingThemeCss, bundle.source)
    ? undefined
    : project.existingThemeCss;

  const themeCssPath = options.out
    ? join(project.root, options.out, THEME_CSS)
    : (existing ?? join(project.root, "src", "styles", THEME_CSS));

  // The code artifacts sit beside the app's source, not beside the stylesheet:
  // `fonts.ts` and `icons.ts` are modules you import, and burying them in a
  // styles folder makes for odd import paths.
  const codeDir = options.out
    ? join(project.root, options.out)
    : project.entry
      ? dirname(project.entry)
      : join(project.root, "src");

  const writes: PlannedWrite[] = [plan(themeCssPath, bundle.files.get(THEME_CSS)!)];

  const fonts = bundle.files.get(FONTS_TS);
  if (fonts) writes.push(plan(join(codeDir, FONTS_TS), fonts));

  const icons = bundle.files.get(ICONS_TS);
  if (icons) writes.push(plan(join(codeDir, ICONS_TS), normaliseIcons(icons)));

  // theme.json is the canonical config and the thing the Figma plugin reads.
  // Kept next to the stylesheet so a re-export has an obvious home, but only
  // when the bundle carries one.
  const json = bundle.files.get(THEME_JSON);
  if (json) writes.push(plan(join(dirname(themeCssPath), THEME_JSON), json));

  return { writes, themeCssPath };
}

/** Is `path` inside `dir`? False for an undefined path or a non-directory source. */
function isInside(path: string | undefined, dir: string): boolean {
  if (!path) return false;
  const rel = relative(resolve(dir), resolve(path));
  // `isAbsolute`, not a "/" prefix test: `relative()` returns an absolute path
  // when the two are on different roots, and re-resolving it would just make it
  // absolute again and mask the answer.
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
}

function plan(path: string, content: string): PlannedWrite {
  let existing: string | undefined;
  try {
    existing = readFileSync(path, "utf8");
  } catch {
    /* not there yet */
  }
  const status: WriteStatus =
    existing === undefined ? "created" : existing === content ? "unchanged" : "updated";
  return { path, content, status };
}

/**
 * Repair an `icons.ts` from an older Theme Builder on the way in.
 *
 * It used to open with `import { IconProvider } from "@ui-organized/react";`
 * and never use it, which is a hard error under `noUnusedLocals` — the default
 * in the Vite React template. The generator no longer emits it, but bundles
 * exported before that fix are still sitting in Downloads folders, and silently
 * fixing one is better than handing someone a file that won't compile.
 */
export function normaliseIcons(source: string): string {
  const unusedImport = /^import \{ IconProvider \} from "@ui-organized\/react";\n/m;
  if (!unusedImport.test(source)) return source;
  if (/<IconProvider/.test(source.replace(/\/\*[\s\S]*?\*\//g, ""))) return source;
  return source.replace(unusedImport, "");
}

/** Execute a plan. Returns the writes that actually changed the disk. */
export function commit(plan: ApplyPlan): PlannedWrite[] {
  const changed = plan.writes.filter((w) => w.status !== "unchanged");
  for (const write of changed) {
    mkdirSync(dirname(write.path), { recursive: true });
    writeFileSync(write.path, write.content, "utf8");
  }
  return changed;
}

/** One line per file, for the report. */
export function describeWrite(project: Project, write: PlannedWrite): string {
  const mark = write.status === "created" ? "+" : write.status === "updated" ? "~" : "=";
  return `  ${mark} ${display(project, write.path)}${write.status === "unchanged" ? "  (unchanged)" : ""}`;
}
