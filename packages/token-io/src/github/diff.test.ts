import { describe, it, expect } from "vitest";
import { SCHEMA_VERSION, type ProjectDocument } from "@ui-organized/schema";
import { diffProjects } from "./diff.js";

const meta = {
  name: "d",
  createdAt: "2026-06-28T00:00:00.000Z",
  updatedAt: "2026-06-28T00:00:00.000Z",
  schemaVersion: SCHEMA_VERSION,
};

function doc(sets: ProjectDocument["sets"], themes: ProjectDocument["themes"] = []): ProjectDocument {
  return { version: SCHEMA_VERSION, meta, sets, themes, modes: {} };
}

describe("diffProjects", () => {
  it("reports added, removed, and changed sets with token-level detail", () => {
    const local = doc([
      { name: "core", tokens: { color: { $type: "color", brand: { $value: "#111111" }, old: { $value: "#222222" } } } },
      { name: "gone", tokens: {} },
    ]);
    const remote = doc([
      { name: "core", tokens: { color: { $type: "color", brand: { $value: "#999999" }, added: { $value: "#333333" } } } },
      { name: "new", tokens: {} },
    ]);

    const d = diffProjects(local, remote);
    expect(d.setsAdded).toEqual(["new"]);
    expect(d.setsRemoved).toEqual(["gone"]);
    expect(d.setsChanged).toEqual(["core"]);
    expect(d.tokens.core).toEqual({
      added: ["color.added"],
      removed: ["color.old"],
      changed: ["color.brand"],
    });
    expect(d.hasChanges).toBe(true);
  });

  it("reports no changes for identical documents", () => {
    const a = doc([{ name: "core", tokens: { color: { $type: "color", brand: { $value: "#111111" } } } }]);
    const b = doc([{ name: "core", tokens: { color: { $type: "color", brand: { $value: "#111111" } } } }]);
    expect(diffProjects(a, b).hasChanges).toBe(false);
  });

  it("flags theme/mode changes", () => {
    const a = doc([], [{ name: "Default", selectedTokenSets: {} }]);
    const b = doc([], [{ name: "Renamed", selectedTokenSets: {} }]);
    expect(diffProjects(a, b).themesOrModesChanged).toBe(true);
  });
});
