import { GitHubClient, type RepoRef } from "@ui-organized/token-io";
import type { ProjectDocument } from "@ui-organized/schema";

/**
 * GitHub connection state for the session. The access token is held in a
 * module-level variable — **memory only**, never localStorage / URL (per
 * `07-github.md` security notes). It is lost on reload, which is the intended
 * behavior for a backendless client.
 */

let token: string | null = null;
let repo: RepoRef | null = null;
let workingBranch = "uiorganized/edit";
/** The last document read from the repo — the baseline for changed-file commits
 *  and pull diffs. The repo is canonical; this is not persisted. */
let baseline: ProjectDocument | null = null;

export function setToken(value: string): void {
  token = value;
}
export function clearConnection(): void {
  token = null;
  repo = null;
  baseline = null;
}
export function isConnected(): boolean {
  return token !== null && repo !== null;
}

export function setRepo(value: RepoRef): void {
  repo = value;
}
export function getRepo(): RepoRef | null {
  return repo;
}

export function setWorkingBranch(value: string): void {
  workingBranch = value;
}
export function getWorkingBranch(): string {
  return workingBranch;
}

export function setBaseline(doc: ProjectDocument | null): void {
  baseline = doc;
}
export function getBaseline(): ProjectDocument | null {
  return baseline;
}

/** Builds a client for the current token, or null if not authenticated. */
export function getClient(): GitHubClient | null {
  return token ? new GitHubClient({ token }) : null;
}
