import { describe, it, expect } from "vitest";
import type { ComponentManifestEntry, PropDefinition } from "@ui-organized/code-connect/browser";
import {
  classifyProp,
  controlFromArgType,
  controlsFor,
  groupControls,
  parseEnumValues,
} from "../src/controls.js";
import { resolveStory } from "../src/manifest-resolver.js";
import { computeArgDrift, driftedPropNames } from "../src/arg-drift.js";

const prop = (o: Partial<PropDefinition> & { name: string; type: string }): PropDefinition => ({
  required: false,
  ...o,
});

const entry = (o: Partial<ComponentManifestEntry>): ComponentManifestEntry => ({
  figmaComponentKey: "", figmaComponentName: "", codeName: "", codePath: "",
  framework: "react", importStatement: "", props: [], usageSnippet: "",
  propSignatureHash: "", lastSyncedAt: "", status: "active", ...o,
});

describe("controls.parseEnumValues", () => {
  it("parses a string-literal union", () => {
    expect(parseEnumValues('"sm" | "md" | "lg"')).toEqual(["sm", "md", "lg"]);
  });
  it("rejects mixed / non-literal unions", () => {
    expect(parseEnumValues("string | boolean")).toBeNull();
    expect(parseEnumValues("React.ReactNode")).toBeNull();
  });
});

describe("controls.classifyProp", () => {
  it("maps types to Figma control kinds", () => {
    expect(classifyProp(prop({ name: "intent", type: '"a" | "b"' })).kind).toBe("variant");
    expect(classifyProp(prop({ name: "disabled", type: "boolean" })).kind).toBe("boolean");
    expect(classifyProp(prop({ name: "count", type: "number" })).kind).toBe("number");
    expect(classifyProp(prop({ name: "label", type: "string" })).kind).toBe("text");
    expect(classifyProp(prop({ name: "onClick", type: "() => void" })).kind).toBe("unsupported");
  });
  it("drops unsupported controls and groups icon props", () => {
    const controls = controlsFor([
      prop({ name: "size", type: '"sm" | "md"' }),
      prop({ name: "icon", type: "string" }),
      prop({ name: "iconPosition", type: '"left" | "right"' }),
      prop({ name: "onClick", type: "() => void" }),
    ]);
    expect(controls.map((c) => c.name)).toEqual(["size", "icon", "iconPosition"]);
    const sections = groupControls(controls);
    expect(sections.find((s) => s.title === "Icon")?.controls.map((c) => c.name)).toEqual([
      "icon",
      "iconPosition",
    ]);
  });
});

describe("controls.controlFromArgType (Args: cover story args beyond the manifest)", () => {
  it("maps Storybook control kinds to controls (full Controls parity)", () => {
    expect(controlFromArgType("size", { control: "select", options: ["sm", "md"] })?.kind).toBe("variant");
    expect(controlFromArgType("on", { control: "boolean" })?.kind).toBe("boolean");
    expect(controlFromArgType("n", { control: "number" })?.kind).toBe("number");
    expect(controlFromArgType("label", { control: "text" })?.kind).toBe("text");
    expect(controlFromArgType("hue", { control: "color" })?.kind).toBe("color");
    expect(controlFromArgType("data", { control: { type: "object" } })?.kind).toBe("object");
    const range = controlFromArgType("w", { control: { type: "range", min: 0, max: 10, step: 2 } });
    expect(range?.kind).toBe("range");
    expect(range?.max).toBe(10);
  });
  it("skips args with no usable control", () => {
    expect(controlFromArgType("onClick", { control: false })).toBeNull();
    expect(controlFromArgType("weird", {})).toBeNull();
  });
});

describe("manifest-resolver.resolveStory (§3)", () => {
  const entries = [
    entry({ codeName: "Button", figmaComponentKey: "k-btn", codePath: "packages/react/src/components/Button/Button.types.ts" }),
    entry({ codeName: "Badge", figmaComponentKey: "k-badge" }),
  ];

  it("3.1 explicit componentKey → exact", () => {
    const r = resolveStory(entries, { componentKey: "k-btn" });
    expect(r.confidence).toBe("exact");
    expect(r.source).toBe("explicit");
    expect(r.entry?.codeName).toBe("Button");
  });

  it("3.2 fallback by name → fuzzy, never exact", () => {
    const r = resolveStory(entries, { componentName: "Button" });
    expect(r.confidence).toBe("fuzzy");
    expect(r.source).toBe("fallback");
    expect(r.entry?.codeName).toBe("Button");
    expect(r.score).toBeGreaterThan(0);
  });

  it("falls back when an explicit key doesn't resolve", () => {
    const r = resolveStory(entries, { componentKey: "ghost", componentName: "Badge" });
    expect(r.source).toBe("fallback");
    expect(r.entry?.codeName).toBe("Badge");
  });

  it("3.3 no match → unmapped, entry null", () => {
    const r = resolveStory(entries, { componentName: "Zxqw" });
    expect(r.confidence).toBe("none");
    expect(r.entry).toBeNull();
  });
});

describe("arg-drift.computeArgDrift (§4/§6)", () => {
  const props = [prop({ name: "size", type: '"sm" | "md" | "lg"' }), prop({ name: "label", type: "string" })];

  it("flags a manifest prop missing from the story", () => {
    const drift = computeArgDrift(props, { size: { options: ["sm", "md", "lg"] } });
    expect(drift.find((d) => d.prop === "label")?.kind).toBe("missing-in-story");
  });

  it("flags an options mismatch on a variant", () => {
    const drift = computeArgDrift(props, {
      size: { options: ["sm", "md"] }, // story dropped "lg"
      label: { control: "text" },
    });
    expect(drift.find((d) => d.prop === "size")?.kind).toBe("options-mismatch");
    expect(driftedPropNames(drift).has("size")).toBe(true);
  });

  it("no drift when everything matches", () => {
    const drift = computeArgDrift(props, {
      size: { options: ["lg", "md", "sm"] }, // order-independent
      label: { control: "text" },
    });
    expect(drift).toHaveLength(0);
  });
});
