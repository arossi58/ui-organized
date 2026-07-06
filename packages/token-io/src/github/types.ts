import type { ModeMap, Theme } from "@ui-organized/schema";

/**
 * GitHub adapter types and the repo-as-store layout. This module is pure: it uses
 * `fetch` (a platform global, not a DOM API) and no React/Yjs.
 */

/** Coordinates of a repo + branch. */
export interface RepoRef {
  owner: string;
  repo: string;
  branch: string;
}

/** A file to read from / write to the repo (content is the serialized string). */
export interface RepoFile {
  path: string;
  content: string;
}

/** Repo-as-store paths (see `07-github.md`). */
export const MANIFEST_PATH = "tokens/manifest.json";
export const PROJECT_PATH = "tokens/project.json";
export const SETS_DIR = "tokens/sets";
export const CONFIG_PATH = ".uiorganized.json";

/**
 * `manifest.json` — the index the editor reads first: the set → file map (in
 * precedence order), themes, and modes.
 */
export interface RepoManifest {
  version: string;
  sets: Array<{
    name: string;
    /** Repo-root-relative path to the set's token file. */
    file: string;
    $description?: string;
    $extensions?: Record<string, unknown>;
  }>;
  themes: Theme[];
  modes: ModeMap;
}
