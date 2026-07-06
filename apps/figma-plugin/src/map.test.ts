import { describe, it, expect } from "vitest";
import { SCHEMA_VERSION, type ProjectDocument } from "@ui-organized/schema";
import { buildPushPlan, figmaName, collectionFor, figmaType, type PushPlan, type ReconcileOp } from "./map.js";
import { hashValue, type StoredManifest } from "./manifest-store.js";

/** The token path an op concerns, regardless of op kind. */
function opPath(op: ReconcileOp): string {
  return op.op === "create" || op.op === "update" ? op.variable.path : op.path;
}

const meta = {
  name: "x",
  createdAt: "2026-06-28T00:00:00.000Z",
  updatedAt: "2026-06-28T00:00:00.000Z",
  schemaVersion: SCHEMA_VERSION,
};

function makeDoc(blackHex = "#0a0a0a", includeWhite = true): ProjectDocument {
  const primitives: Record<string, unknown> = {
    color: { $type: "color", black: { $value: blackHex }, ...(includeWhite ? { white: { $value: "#ffffff" } } : {}) },
    spacing: { $type: "dimension", "space-04": { $value: "4px" } },
  };
  return {
    version: SCHEMA_VERSION,
    meta,
    sets: [
      { name: "primitives", tokens: primitives as ProjectDocument["sets"][number]["tokens"] },
      {
        name: "semantic-light",
        $extensions: { mode: "light" },
        tokens: { color: { $type: "color", text: { $value: "{color.black}" } } },
      },
      {
        name: "semantic-dark",
        $extensions: { mode: "dark" },
        tokens: { color: { $type: "color", text: { $value: "{color.white}" } } },
      },
    ],
    themes: [
      { name: "Default", selectedTokenSets: { primitives: "source", "semantic-light": "enabled", "semantic-dark": "enabled" } },
    ],
    modes: { light: {}, dark: {} },
  };
}

/** Simulate the manifest the sandbox would store after applying a plan's creates. */
function manifestFromPlan(plan: PushPlan): StoredManifest {
  const manifest: StoredManifest = {};
  for (const op of plan.ops) {
    if (op.op !== "create") continue;
    const hashByMode: Record<string, string> = {};
    for (const [mode, value] of Object.entries(op.variable.valuesByMode)) hashByMode[mode] = hashValue(value);
    manifest[op.variable.path] = {
      id: `id:${op.variable.path}`,
      collection: op.variable.collection,
      name: op.variable.name,
      type: op.variable.type,
      hashByMode,
    };
  }
  return manifest;
}

describe("naming + types", () => {
  it("derives Figma-legal names and collections", () => {
    expect(figmaName("color.brand.500")).toBe("brand/500");
    expect(collectionFor("color.brand.500")).toBe("color");
    expect(figmaName("spacing.space-04")).toBe("space-04");
  });

  it("normalizes known typos", () => {
    expect(collectionFor("dimesnion.md")).toBe("dimension");
    expect(figmaName("color.icon-seconadry")).toBe("icon-secondary");
  });

  it("maps DTCG types to Figma variable types (composites skipped)", () => {
    expect(figmaType("color")).toBe("COLOR");
    expect(figmaType("dimension")).toBe("FLOAT");
    expect(figmaType("fontFamily")).toBe("STRING");
    expect(figmaType("typography")).toBeNull();
  });
});

describe("buildPushPlan — first push", () => {
  const plan = buildPushPlan(makeDoc(), {});

  it("creates every variable, with collections and modes", () => {
    expect(plan.ops.every((o) => o.op === "create")).toBe(true);
    expect(new Set(plan.collections)).toEqual(new Set(["color", "spacing"]));
    expect(plan.modes).toEqual(["light", "dark"]);
  });

  it("emits references as aliases and orders targets first", () => {
    const text = plan.ops.find((o) => o.op === "create" && o.variable.path === "color.text");
    expect(text?.op === "create" && text.variable.valuesByMode.light).toEqual({ kind: "alias", path: "color.black" });
    expect(text?.op === "create" && text.variable.valuesByMode.dark).toEqual({ kind: "alias", path: "color.white" });
    expect(plan.aliasOrder.indexOf("color.black")).toBeLessThan(plan.aliasOrder.indexOf("color.text"));
    expect(plan.aliasOrder.indexOf("color.white")).toBeLessThan(plan.aliasOrder.indexOf("color.text"));
  });

  it("converts colors to RGBA and dimensions to floats", () => {
    const black = plan.ops.find((o) => o.op === "create" && o.variable.path === "color.black");
    expect(black?.op === "create" && black.variable.valuesByMode.light?.kind).toBe("color");
    const space = plan.ops.find((o) => o.op === "create" && o.variable.path === "spacing.space-04");
    expect(space?.op === "create" && space.variable.valuesByMode.light).toEqual({ kind: "float", value: 4 });
  });
});

describe("buildPushPlan — reconciliation", () => {
  it("is all no-ops when nothing changed (matched by stored id)", () => {
    const first = buildPushPlan(makeDoc(), {});
    const manifest = manifestFromPlan(first);
    const second = buildPushPlan(makeDoc(), manifest);
    expect(second.ops.every((o) => o.op === "noop")).toBe(true);
  });

  it("updates only the changed variable in place", () => {
    const manifest = manifestFromPlan(buildPushPlan(makeDoc(), {}));
    const plan = buildPushPlan(makeDoc("#111111"), manifest); // black changed
    const black = plan.ops.find((o) => opPath(o) === "color.black");
    expect(black?.op).toBe("update");
    if (black?.op === "update") expect(black.changedModes.sort()).toEqual(["dark", "light"]);
    // the alias variable that points at black is unchanged (pointer, not value)
    const text = plan.ops.find((o) => opPath(o) === "color.text");
    expect(text?.op).toBe("noop");
  });

  it("flags a removed token as an orphan (never auto-deleted)", () => {
    const manifest = manifestFromPlan(buildPushPlan(makeDoc(), {}));
    const plan = buildPushPlan(makeDoc("#0a0a0a", false), manifest); // white removed
    const orphan = plan.ops.find((o) => o.op === "orphan");
    expect(orphan?.op === "orphan" && orphan.path).toBe("color.white");
  });
});
