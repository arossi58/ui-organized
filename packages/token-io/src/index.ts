import {
  parseProjectDocument,
  type ProjectDocument,
  type Result,
} from "@ui-organized/schema";

/**
 * @ui-organized/token-io — reading and writing the project document.
 *
 * Phase 0 ships the canonical (de)serialization round-trip. Import adapters
 * (DTCG, Tokens Studio), the GitHub/Supabase stores, and the reconciler land in
 * their respective phases.
 */

/**
 * Serializes a project document to the canonical on-disk JSON form: 2-space
 * indentation and a trailing newline, so commits and diffs stay stable.
 */
export function serializeProjectDocument(doc: ProjectDocument): string {
  return JSON.stringify(doc, null, 2) + "\n";
}

/**
 * Parses serialized JSON back into a validated {@link ProjectDocument}. Returns a
 * typed `Result` — malformed JSON and schema-invalid documents both surface as a
 * typed error rather than throwing.
 */
export function deserializeProjectDocument(text: string): Result<ProjectDocument, Error> {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (cause) {
    return {
      ok: false,
      error: new Error("Project document is not valid JSON", {
        cause: cause instanceof Error ? cause : undefined,
      }),
    };
  }

  const parsed = parseProjectDocument(json);
  if (parsed.ok) return { ok: true, value: parsed.value };
  return { ok: false, error: parsed.error };
}

// Override layer + non-destructive regeneration (pack-agnostic).
export { applyOverrides, reconcileOverrides, hasStaleOverrides } from "./reconcile.js";
export type {
  OverrideClassification,
  StaleOverride,
  ReconcileReport,
  ReconcileResult,
} from "./reconcile.js";

// DTCG tree helpers.
export { getTokenAtPath, flattenPaths, mergeProps, stripProvenance } from "./tree.js";

// Import: arbitrary DTCG + Tokens Studio (with lossless re-export).
export { importDtcg, type ImportOptions } from "./import.js";
export {
  importTokensStudio,
  exportTokensStudio,
  type TokensStudioFile,
  type TokensStudioTheme,
} from "./tokens-studio.js";

// GitHub repo-as-store adapter.
export { GitHubClient, GitHubError } from "./github/client.js";
export type { FetchFn, GitHubClientOptions } from "./github/client.js";
export { readProject, commitProject, openPullRequest } from "./github/adapter.js";
export type { CommitOptions, CommitResult } from "./github/adapter.js";
export { projectToFiles, filesToProject } from "./github/serialize.js";
export { diffProjects } from "./github/diff.js";
export type { ProjectDiff, SetTokenDiff } from "./github/diff.js";
export {
  requestDeviceCode,
  pollDeviceTokenOnce,
  pollForDeviceToken,
  looksLikeToken,
} from "./github/auth.js";
export type { DeviceCode, PollResult } from "./github/auth.js";
export {
  MANIFEST_PATH,
  PROJECT_PATH,
  SETS_DIR,
  CONFIG_PATH,
  type RepoRef,
  type RepoFile,
  type RepoManifest,
} from "./github/types.js";
