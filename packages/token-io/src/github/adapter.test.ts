import { describe, it, expect } from "vitest";
import { SCHEMA_VERSION, type ProjectDocument } from "@ui-organized/schema";
import type { GitHubClient } from "./client.js";
import { readProject, commitProject, openPullRequest } from "./adapter.js";
import { projectToFiles } from "./serialize.js";
import type { RepoFile, RepoRef } from "./types.js";

const ref: RepoRef = { owner: "o", repo: "r", branch: "main" };

const doc: ProjectDocument = {
  version: SCHEMA_VERSION,
  meta: {
    name: "Sample",
    createdAt: "2026-06-28T00:00:00.000Z",
    updatedAt: "2026-06-28T00:00:00.000Z",
    schemaVersion: SCHEMA_VERSION,
  },
  sets: [{ name: "core", tokens: { color: { $type: "color", brand: { $value: "#3355ff" } } } }],
  themes: [{ name: "Default", selectedTokenSets: { core: "enabled" } }],
  modes: { light: {} },
};

function makeFake(seed: RepoFile[]) {
  const files = new Map(seed.map((f) => [f.path, f.content]));
  const calls: string[] = [];
  const branches = new Set<string>();
  const fake = {
    async getFile(_ref: RepoRef, path: string) {
      calls.push(`getFile ${path}`);
      return files.has(path) ? { content: files.get(path)!, sha: "sha" } : null;
    },
    async getBranchHead() {
      return { commitSha: "base-commit", treeSha: "base-tree" };
    },
    async getBranchSha(_ref: RepoRef, branch: string) {
      return branches.has(branch) ? "working-sha" : null;
    },
    async createBranch(_ref: RepoRef, branch: string) {
      calls.push(`createBranch ${branch}`);
      branches.add(branch);
    },
    async createBlob(_ref: RepoRef, content: string) {
      calls.push("createBlob");
      return `blob-${content.length}`;
    },
    async createTree(_ref: RepoRef, _base: string, entries: Array<{ path: string }>) {
      calls.push(`createTree ${entries.map((e) => e.path).join(",")}`);
      return "new-tree";
    },
    async createCommit() {
      calls.push("createCommit");
      return "new-commit";
    },
    async updateBranchRef(_ref: RepoRef, branch: string) {
      calls.push(`updateRef ${branch}`);
    },
    async createPullRequest(_ref: RepoRef, pr: { head: string; base: string }) {
      calls.push(`pr ${pr.head}->${pr.base}`);
      return { number: 7, url: "https://example/pull/7" };
    },
  };
  return { client: fake as unknown as GitHubClient, calls };
}

describe("readProject", () => {
  it("assembles a ProjectDocument from manifest + set files", async () => {
    const { client } = makeFake(projectToFiles(doc));
    const result = await readProject(client, ref);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual(doc);
  });

  it("errors when the manifest is absent", async () => {
    const { client } = makeFake([]);
    const result = await readProject(client, ref);
    expect(result.ok).toBe(false);
  });
});

describe("commitProject", () => {
  it("creates a working branch and commits only changed files", async () => {
    const { client, calls } = makeFake(projectToFiles(doc));
    const edited: ProjectDocument = {
      ...doc,
      sets: [{ name: "core", tokens: { color: { $type: "color", brand: { $value: "#ff0000" } } } }],
    };
    const result = await commitProject(client, ref, edited, {
      workingBranch: "uiorg/edit",
      message: "edit brand",
      previous: doc,
    });

    expect(result.commitSha).toBe("new-commit");
    expect(result.changedPaths).toEqual(["tokens/sets/core.json"]);
    expect(calls).toContain("createBranch uiorg/edit");
    expect(calls).toContain("createTree tokens/sets/core.json");
    expect(calls).toContain("createCommit");
    expect(calls).toContain("updateRef uiorg/edit");
  });

  it("is a no-op commit when nothing changed", async () => {
    const { client, calls } = makeFake(projectToFiles(doc));
    const result = await commitProject(client, ref, doc, {
      workingBranch: "uiorg/edit",
      message: "noop",
      previous: doc,
    });
    expect(result.changedPaths).toEqual([]);
    expect(calls).not.toContain("createCommit");
  });
});

describe("openPullRequest", () => {
  it("opens a PR from the working branch into the base branch", async () => {
    const { client, calls } = makeFake([]);
    const pr = await openPullRequest(client, ref, { workingBranch: "uiorg/edit", title: "Update tokens" });
    expect(pr).toEqual({ number: 7, url: "https://example/pull/7" });
    expect(calls).toContain("pr uiorg/edit->main");
  });
});
