import type { RepoRef } from "./types.js";

/**
 * A thin GitHub REST client over an injected `fetch` (so it's testable and
 * platform-agnostic — `fetch` is a global, not a DOM API). It holds the
 * repo-scoped token only in memory and never logs it.
 */

export type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

export interface GitHubClientOptions {
  token: string;
  /** Defaults to `globalThis.fetch`. Injected in tests. */
  fetchFn?: FetchFn;
  /** Defaults to `https://api.github.com`. */
  baseUrl?: string;
}

export class GitHubError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(`GitHub API ${status}: ${message}`);
    this.name = "GitHubError";
  }
}

/** UTF-8-safe base64 decode (Contents API returns base64). */
function decodeBase64Utf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export class GitHubClient {
  private readonly token: string;
  private readonly fetchFn: FetchFn;
  private readonly baseUrl: string;

  constructor(opts: GitHubClientOptions) {
    this.token = opts.token;
    this.fetchFn = opts.fetchFn ?? (globalThis.fetch.bind(globalThis) as FetchFn);
    this.baseUrl = opts.baseUrl ?? "https://api.github.com";
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const init: RequestInit = { method, headers };
    if (body !== undefined) init.body = JSON.stringify(body);
    const res = await this.fetchFn(`${this.baseUrl}${path}`, init);
    if (!res.ok) throw new GitHubError(res.status, await res.text());
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  private repoPath(ref: RepoRef, suffix: string): string {
    return `/repos/${ref.owner}/${ref.repo}${suffix}`;
  }

  /** Reads a file's decoded content + blob sha, or `null` if it doesn't exist. */
  async getFile(ref: RepoRef, path: string): Promise<{ content: string; sha: string } | null> {
    try {
      const data = await this.request<{ content: string; sha: string; encoding: string }>(
        "GET",
        this.repoPath(ref, `/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${ref.branch}`),
      );
      return { content: decodeBase64Utf8(data.content), sha: data.sha };
    } catch (error) {
      if (error instanceof GitHubError && error.status === 404) return null;
      throw error;
    }
  }

  /** Resolves a branch to its head commit sha and that commit's tree sha. */
  async getBranchHead(ref: RepoRef): Promise<{ commitSha: string; treeSha: string }> {
    const branch = await this.request<{ commit: { sha: string; commit: { tree: { sha: string } } } }>(
      "GET",
      this.repoPath(ref, `/branches/${encodeURIComponent(ref.branch)}`),
    );
    return { commitSha: branch.commit.sha, treeSha: branch.commit.commit.tree.sha };
  }

  /** Returns a branch's head sha, or `null` if the branch doesn't exist. */
  async getBranchSha(ref: RepoRef, branch: string): Promise<string | null> {
    try {
      const data = await this.request<{ object: { sha: string } }>(
        "GET",
        this.repoPath(ref, `/git/ref/heads/${encodeURIComponent(branch)}`),
      );
      return data.object.sha;
    } catch (error) {
      if (error instanceof GitHubError && error.status === 404) return null;
      throw error;
    }
  }

  async createBranch(ref: RepoRef, branch: string, sha: string): Promise<void> {
    await this.request("POST", this.repoPath(ref, "/git/refs"), {
      ref: `refs/heads/${branch}`,
      sha,
    });
  }

  async createBlob(ref: RepoRef, content: string): Promise<string> {
    const data = await this.request<{ sha: string }>("POST", this.repoPath(ref, "/git/blobs"), {
      content,
      encoding: "utf-8",
    });
    return data.sha;
  }

  async createTree(
    ref: RepoRef,
    baseTree: string,
    entries: Array<{ path: string; sha: string }>,
  ): Promise<string> {
    const data = await this.request<{ sha: string }>("POST", this.repoPath(ref, "/git/trees"), {
      base_tree: baseTree,
      tree: entries.map((e) => ({ path: e.path, mode: "100644", type: "blob", sha: e.sha })),
    });
    return data.sha;
  }

  async createCommit(
    ref: RepoRef,
    message: string,
    treeSha: string,
    parentSha: string,
  ): Promise<string> {
    const data = await this.request<{ sha: string }>("POST", this.repoPath(ref, "/git/commits"), {
      message,
      tree: treeSha,
      parents: [parentSha],
    });
    return data.sha;
  }

  async updateBranchRef(ref: RepoRef, branch: string, sha: string): Promise<void> {
    await this.request("PATCH", this.repoPath(ref, `/git/refs/heads/${encodeURIComponent(branch)}`), {
      sha,
      force: false,
    });
  }

  async createPullRequest(
    ref: RepoRef,
    pr: { title: string; head: string; base: string; body?: string },
  ): Promise<{ number: number; url: string }> {
    const data = await this.request<{ number: number; html_url: string }>(
      "POST",
      this.repoPath(ref, "/pulls"),
      pr,
    );
    return { number: data.number, url: data.html_url };
  }
}
