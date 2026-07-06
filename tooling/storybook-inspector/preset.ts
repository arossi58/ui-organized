/**
 * Storybook addon preset (INSPECTOR.md §7). For consumers that add this addon via
 * the `addons: []` array, this registers the manager entry AND serves the shared
 * manifest artifacts as static files so the manager UI (a different context than
 * the preview iframe) can fetch them in both local dev and a built/deployed
 * Storybook.
 *
 * In this monorepo the app instead imports the manager entry directly from its
 * `.storybook/manager.ts` and sets `staticDirs` in `.storybook/main.ts` — either
 * path works; this preset is the packaged one.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export function managerEntries(entry: string[] = []): string[] {
  return [...entry, join(here, "dist/manager.js")];
}

interface StaticDir {
  from: string;
  to: string;
}

export function staticDirs(dirs: StaticDir[] = []): StaticDir[] {
  // Repo-root manifest/ → served at /inspector-manifest (see manifest-source.ts).
  return [...dirs, { from: join(here, "../../manifest"), to: "/inspector-manifest" }];
}
