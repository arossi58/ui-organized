import type { ProjectDocument, Result } from "@ui-organized/schema";
import type { GitHubClient } from "./client.js";
import { filesToProject, projectToFiles } from "./serialize.js";
import { MANIFEST_PATH, PROJECT_PATH, type RepoFile, type RepoManifest, type RepoRef } from "./types.js";

/**
 * High-level repo-as-store operations. Reading assembles a {@link ProjectDocument}
 * from the manifest + set files; committing writes only changed files to a
 * short-lived working branch via the git-data API; opening a PR is a separate,
 * caller-confirmed step (never auto-merged).
 */

/** Reads the project document from a repo branch. */
export async function readProject(
  client: GitHubClient,
  ref: RepoRef,
): Promise<Result<ProjectDocument, Error>> {
  const manifestFile = await client.getFile(ref, MANIFEST_PATH);
  if (!manifestFile) {
    return { ok: false, error: new Error(`No ${MANIFEST_PATH} in ${ref.owner}/${ref.repo}@${ref.branch}`) };
  }
  let manifest: RepoManifest;
  try {
    manifest = JSON.parse(manifestFile.content) as RepoManifest;
  } catch (cause) {
    return { ok: false, error: new Error("Invalid manifest.json", { cause: cause instanceof Error ? cause : undefined }) };
  }

  const projectFile = await client.getFile(ref, PROJECT_PATH);
  if (!projectFile) return { ok: false, error: new Error(`No ${PROJECT_PATH}`) };

  const files: RepoFile[] = [
    { path: MANIFEST_PATH, content: manifestFile.content },
    { path: PROJECT_PATH, content: projectFile.content },
  ];
  for (const entry of manifest.sets ?? []) {
    const file = await client.getFile(ref, entry.file);
    if (!file) return { ok: false, error: new Error(`Missing set file ${entry.file} for "${entry.name}"`) };
    files.push({ path: entry.file, content: file.content });
  }

  return filesToProject(files);
}

export interface CommitOptions {
  /** Short-lived branch the editor commits to (created from `ref.branch`). */
  workingBranch: string;
  message: string;
  /** Previous document, so only changed files are committed. */
  previous?: ProjectDocument;
}

export interface CommitResult {
  commitSha: string;
  changedPaths: string[];
}

/**
 * Commits changed files to a working branch (created off `ref.branch` if needed).
 * Uses blobs → tree (`base_tree`) → commit → ref update so only changed files are
 * written and the rest of the tree is preserved.
 */
export async function commitProject(
  client: GitHubClient,
  ref: RepoRef,
  doc: ProjectDocument,
  opts: CommitOptions,
): Promise<CommitResult> {
  const baseHead = await client.getBranchHead(ref);
  const existing = await client.getBranchSha(ref, opts.workingBranch);
  if (!existing) await client.createBranch(ref, opts.workingBranch, baseHead.commitSha);

  const workingRef: RepoRef = { ...ref, branch: opts.workingBranch };
  const workingHead = await client.getBranchHead(workingRef);

  const files = projectToFiles(doc);
  const changed = opts.previous ? changedFiles(files, projectToFiles(opts.previous)) : files;
  if (changed.length === 0) return { commitSha: workingHead.commitSha, changedPaths: [] };

  const entries: Array<{ path: string; sha: string }> = [];
  for (const file of changed) {
    entries.push({ path: file.path, sha: await client.createBlob(workingRef, file.content) });
  }
  const treeSha = await client.createTree(workingRef, workingHead.treeSha, entries);
  const commitSha = await client.createCommit(workingRef, opts.message, treeSha, workingHead.commitSha);
  await client.updateBranchRef(workingRef, opts.workingBranch, commitSha);

  return { commitSha, changedPaths: changed.map((f) => f.path) };
}

function changedFiles(next: RepoFile[], previous: RepoFile[]): RepoFile[] {
  const previousMap = new Map(previous.map((f) => [f.path, f.content]));
  return next.filter((f) => previousMap.get(f.path) !== f.content);
}

/**
 * Opens a PR from the working branch into `ref.branch`. A **permissioned action**
 * — the caller must have confirmed with the user first.
 */
export async function openPullRequest(
  client: GitHubClient,
  ref: RepoRef,
  opts: { workingBranch: string; title: string; body?: string },
): Promise<{ number: number; url: string }> {
  return client.createPullRequest(ref, {
    title: opts.title,
    head: opts.workingBranch,
    base: ref.branch,
    ...(opts.body !== undefined ? { body: opts.body } : {}),
  });
}
