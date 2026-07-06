import type { DtcgGroup, ProjectDocument } from "@ui-organized/schema";
import { parseProjectDocument, type Result } from "@ui-organized/schema";
import {
  MANIFEST_PATH,
  PROJECT_PATH,
  SETS_DIR,
  type RepoFile,
  type RepoManifest,
} from "./types.js";

/**
 * Splits a {@link ProjectDocument} into repo files and reassembles it. Sets live
 * in separate files (the primary merge-safety strategy — two people editing
 * different sets never collide); `manifest.json` indexes them; `project.json`
 * holds meta + the optional pack/recipe/override layers.
 */

function json(value: unknown): string {
  return JSON.stringify(value, null, 2) + "\n";
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "set";
}

/** Serializes a project document into the repo-as-store file set. */
export function projectToFiles(doc: ProjectDocument): RepoFile[] {
  const files: RepoFile[] = [];
  const used = new Set<string>();

  const manifest: RepoManifest = {
    version: doc.version,
    sets: [],
    themes: doc.themes,
    modes: doc.modes,
  };

  for (const set of doc.sets) {
    let base = slug(set.name);
    let file = `${SETS_DIR}/${base}.json`;
    let n = 2;
    while (used.has(file)) file = `${SETS_DIR}/${base}-${n++}.json`;
    used.add(file);

    const entry: RepoManifest["sets"][number] = { name: set.name, file };
    if (set.$description) entry.$description = set.$description;
    if (set.$extensions) entry.$extensions = set.$extensions;
    manifest.sets.push(entry);

    files.push({ path: file, content: json(set.tokens) });
  }

  files.push({ path: MANIFEST_PATH, content: json(manifest) });

  const project: Record<string, unknown> = { version: doc.version, meta: doc.meta };
  if (doc.packs) project.packs = doc.packs;
  if (doc.recipes) project.recipes = doc.recipes;
  if (doc.overrides) project.overrides = doc.overrides;
  files.push({ path: PROJECT_PATH, content: json(project) });

  return files;
}

/**
 * Reassembles a {@link ProjectDocument} from repo files, validating the result.
 * Returns a typed `Result` — missing/invalid files surface as a typed error.
 */
export function filesToProject(files: RepoFile[]): Result<ProjectDocument, Error> {
  const map = new Map(files.map((f) => [f.path, f.content]));

  const manifestRaw = map.get(MANIFEST_PATH);
  if (!manifestRaw) return { ok: false, error: new Error(`Missing ${MANIFEST_PATH}`) };
  const projectRaw = map.get(PROJECT_PATH);
  if (!projectRaw) return { ok: false, error: new Error(`Missing ${PROJECT_PATH}`) };

  let manifest: RepoManifest;
  let project: Record<string, unknown>;
  try {
    manifest = JSON.parse(manifestRaw) as RepoManifest;
    project = JSON.parse(projectRaw) as Record<string, unknown>;
  } catch (cause) {
    return { ok: false, error: new Error("Invalid manifest/project JSON", { cause: asError(cause) }) };
  }

  const sets: ProjectDocument["sets"] = [];
  for (const entry of manifest.sets ?? []) {
    const tokensRaw = map.get(entry.file);
    if (tokensRaw === undefined) {
      return { ok: false, error: new Error(`Missing set file ${entry.file} for "${entry.name}"`) };
    }
    let tokens: DtcgGroup;
    try {
      tokens = JSON.parse(tokensRaw) as DtcgGroup;
    } catch (cause) {
      return { ok: false, error: new Error(`Invalid JSON in ${entry.file}`, { cause: asError(cause) }) };
    }
    const set: ProjectDocument["sets"][number] = { name: entry.name, tokens };
    if (entry.$description) set.$description = entry.$description;
    if (entry.$extensions) set.$extensions = entry.$extensions;
    sets.push(set);
  }

  const assembled: Record<string, unknown> = {
    version: (project.version as string) ?? manifest.version,
    meta: project.meta,
    sets,
    themes: manifest.themes ?? [],
    modes: manifest.modes ?? {},
  };
  if (project.packs) assembled.packs = project.packs;
  if (project.recipes) assembled.recipes = project.recipes;
  if (project.overrides) assembled.overrides = project.overrides;

  const parsed = parseProjectDocument(assembled);
  return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, error: parsed.error };
}

function asError(cause: unknown): Error | undefined {
  return cause instanceof Error ? cause : undefined;
}
