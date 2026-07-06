import { describe, it, expect } from "vitest";
import { SCHEMA_VERSION, type ProjectDocument } from "@ui-organized/schema";
import { projectToFiles, filesToProject } from "./serialize.js";
import { MANIFEST_PATH, PROJECT_PATH } from "./types.js";

const doc: ProjectDocument = {
  version: SCHEMA_VERSION,
  meta: {
    name: "Sample",
    createdAt: "2026-06-28T00:00:00.000Z",
    updatedAt: "2026-06-28T00:00:00.000Z",
    schemaVersion: SCHEMA_VERSION,
  },
  sets: [
    { name: "Core Set", tokens: { color: { $type: "color", brand: { $value: "#3355ff" } } } },
    { name: "semantic", tokens: { color: { $type: "color", text: { $value: "{color.brand}" } } } },
  ],
  themes: [{ name: "Default", selectedTokenSets: { "Core Set": "source", semantic: "enabled" } }],
  modes: { light: {} },
  overrides: { "color.brand": { $value: "#1144ee" } },
};

describe("projectToFiles", () => {
  const files = projectToFiles(doc);
  const paths = files.map((f) => f.path);

  it("splits each set into its own file (slugged), plus manifest + project", () => {
    expect(paths).toContain(MANIFEST_PATH);
    expect(paths).toContain(PROJECT_PATH);
    expect(paths).toContain("tokens/sets/core-set.json");
    expect(paths).toContain("tokens/sets/semantic.json");
  });

  it("keeps overrides/meta in project.json, not the manifest", () => {
    const project = JSON.parse(files.find((f) => f.path === PROJECT_PATH)!.content);
    expect(project.overrides).toEqual({ "color.brand": { $value: "#1144ee" } });
    const manifest = JSON.parse(files.find((f) => f.path === MANIFEST_PATH)!.content);
    expect(manifest.overrides).toBeUndefined();
    expect(manifest.sets.map((s: { name: string }) => s.name)).toEqual(["Core Set", "semantic"]);
  });
});

describe("filesToProject", () => {
  it("round-trips a project document through files", () => {
    const result = filesToProject(projectToFiles(doc));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual(doc);
  });

  it("errors when the manifest is missing", () => {
    const result = filesToProject([{ path: PROJECT_PATH, content: "{}" }]);
    expect(result.ok).toBe(false);
  });

  it("errors when a referenced set file is missing", () => {
    const files = projectToFiles(doc).filter((f) => f.path !== "tokens/sets/semantic.json");
    const result = filesToProject(files);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("semantic.json");
  });
});
