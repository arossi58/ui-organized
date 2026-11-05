import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { indexSource, normalizeKey, type CopyEntry, type FileRole } from "./indexer.ts";
import { encodeEntry, replaceRange } from "./writer.ts";

const ROOTS: { dir: string; role: FileRole; suffix: RegExp }[] = [
  { dir: "apps/marketing/src", role: "site", suffix: /\.(tsx?|jsx?)$/ },
  { dir: "tooling/code-connect/src/usage/guides", role: "guide", suffix: /\.ts$/ },
  { dir: "apps/storybook/src/stories", role: "story", suffix: /\.stories\.tsx$/ },
];

const EXCLUDED = /\.(test|spec)\.|\.d\.ts$/;

export type SaveResult =
  | { ok: true; entry: CopyEntry; previousRaw: string }
  | { ok: false; status: number; error: string };

/** Reads and writes copy under one repo root, re-parsing only files that changed. */
export function createStore(repoRoot: string) {
  const cache = new Map<string, { mtimeMs: number; entries: CopyEntry[] }>();

  const roleOf = (file: string): FileRole | undefined => {
    if (file.split("/").includes("..") || EXCLUDED.test(file)) return undefined;
    return ROOTS.find((root) => file.startsWith(`${root.dir}/`) && root.suffix.test(file))?.role;
  };

  const absolute = (file: string): string | undefined => {
    const path = resolve(repoRoot, file);
    return roleOf(file) && path.startsWith(resolve(repoRoot) + sep) ? path : undefined;
  };

  const entriesFor = (file: string): CopyEntry[] => {
    const path = absolute(file);
    if (!path) return [];
    const { mtimeMs } = statSync(path);
    const cached = cache.get(file);
    if (cached?.mtimeMs === mtimeMs) return cached.entries;
    let entries: CopyEntry[] = [];
    try {
      entries = indexSource(file, readFileSync(path, "utf8"), roleOf(file));
    } catch {
      // A file mid-edit in another window doesn't parse. It has no copy until it does.
    }
    cache.set(file, { mtimeMs, entries });
    return entries;
  };

  const allFiles = (): string[] => {
    const files: string[] = [];
    for (const root of ROOTS) {
      const base = join(repoRoot, root.dir);
      for (const name of readdirSync(base, { recursive: true }) as string[]) {
        const file = relative(repoRoot, join(base, name)).split(sep).join("/");
        if (roleOf(file) && statSync(join(repoRoot, file)).isFile()) files.push(file);
      }
    }
    return files.sort();
  };

  const index = (): CopyEntry[] => allFiles().flatMap(entriesFor);

  /** Returns the matches for the first candidate that has any. */
  const match = (candidates: string[]): CopyEntry[] => {
    const entries = index();
    for (const candidate of candidates) {
      const key = normalizeKey(candidate);
      const hits = key ? entries.filter((entry) => entry.key === key) : [];
      if (hits.length) return hits;
    }
    return [];
  };

  /** Parses before writing: a save can't leave a file that doesn't compile. */
  const commit = (file: string, role: FileRole, next: string, start: number): SaveResult | CopyEntry => {
    let entries: CopyEntry[];
    try {
      entries = indexSource(file, next, role);
    } catch (error) {
      return { ok: false, status: 422, error: `That text would break ${file}: ${(error as Error).message}` };
    }
    writeFileSync(absolute(file)!, next);
    cache.delete(file);
    return entries.find((entry) => entry.start === start) ?? {
      file, start, end: start, line: 0, kind: "string", raw: "", text: "", key: "",
    };
  };

  const save = (file: string, start: number, end: number, expected: string, text: string): SaveResult => {
    const path = absolute(file);
    const role = roleOf(file);
    if (!path || !role) return { ok: false, status: 403, error: `${file} is outside the editable files.` };
    if (!text.trim()) return { ok: false, status: 422, error: "Text can't be empty. Delete it in code instead." };

    const source = readFileSync(path, "utf8");
    const entry = indexSource(file, source, role).find((e) => e.start === start && e.end === end);
    if (!entry || entry.raw !== expected) {
      return { ok: false, status: 409, error: `${file} changed since this text was loaded. Click it again.` };
    }
    const raw = encodeEntry(entry, text, source);
    const result = commit(file, role, replaceRange(source, start, end, raw), start);
    return "ok" in result ? result : { ok: true, entry: result, previousRaw: entry.raw };
  };

  /** Finds the string by content, since other saves may have moved its offset. */
  const undo = (file: string, currentRaw: string, previousRaw: string): SaveResult => {
    const path = absolute(file);
    const role = roleOf(file);
    if (!path || !role) return { ok: false, status: 403, error: `${file} is outside the editable files.` };

    const source = readFileSync(path, "utf8");
    const hits = indexSource(file, source, role).filter((e) => e.raw === currentRaw);
    if (hits.length !== 1) {
      return { ok: false, status: 409, error: `Can't find that text in ${file} any more. Use git to restore it.` };
    }
    const [entry] = hits;
    const result = commit(file, role, replaceRange(source, entry.start, entry.end, previousRaw), entry.start);
    return "ok" in result ? result : { ok: true, entry: result, previousRaw: currentRaw };
  };

  return { index, match, save, undo };
}
