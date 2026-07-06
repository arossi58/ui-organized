import type { DtcgGroup, ProjectDocument } from "@ui-organized/schema";
import { flattenPaths, getTokenAtPath } from "../tree.js";

/**
 * Structural diff between two project documents — what the editor shows when a
 * re-pull finds the repo has changed. File-splitting keeps this small (per-set),
 * and the override model shrinks the collision surface further.
 */

export interface SetTokenDiff {
  added: string[];
  removed: string[];
  changed: string[];
}

export interface ProjectDiff {
  setsAdded: string[];
  setsRemoved: string[];
  setsChanged: string[];
  /** Per changed set: which token paths were added/removed/changed. */
  tokens: Record<string, SetTokenDiff>;
  /** Themes or modes differ. */
  themesOrModesChanged: boolean;
  hasChanges: boolean;
}

function diffTrees(a: DtcgGroup, b: DtcgGroup): SetTokenDiff {
  const aPaths = new Set(flattenPaths(a));
  const bPaths = new Set(flattenPaths(b));
  const added = [...bPaths].filter((p) => !aPaths.has(p));
  const removed = [...aPaths].filter((p) => !bPaths.has(p));
  const changed = [...aPaths].filter(
    (p) => bPaths.has(p) && JSON.stringify(getTokenAtPath(a, p)) !== JSON.stringify(getTokenAtPath(b, p)),
  );
  return { added, removed, changed };
}

export function diffProjects(local: ProjectDocument, remote: ProjectDocument): ProjectDiff {
  const localSets = new Map(local.sets.map((s) => [s.name, s.tokens]));
  const remoteSets = new Map(remote.sets.map((s) => [s.name, s.tokens]));

  const setsAdded = [...remoteSets.keys()].filter((n) => !localSets.has(n));
  const setsRemoved = [...localSets.keys()].filter((n) => !remoteSets.has(n));
  const setsChanged: string[] = [];
  const tokens: Record<string, SetTokenDiff> = {};

  for (const [name, localTokens] of localSets) {
    const remoteTokens = remoteSets.get(name);
    if (!remoteTokens) continue;
    const d = diffTrees(localTokens, remoteTokens);
    if (d.added.length || d.removed.length || d.changed.length) {
      setsChanged.push(name);
      tokens[name] = d;
    }
  }

  const themesOrModesChanged =
    JSON.stringify({ t: local.themes, m: local.modes }) !==
    JSON.stringify({ t: remote.themes, m: remote.modes });

  const hasChanges =
    setsAdded.length > 0 ||
    setsRemoved.length > 0 ||
    setsChanged.length > 0 ||
    themesOrModesChanged;

  return { setsAdded, setsRemoved, setsChanged, tokens, themesOrModesChanged, hasChanges };
}
