import { describe, it, expect } from "vitest";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scanReact, scanLibrary, LIBRARIES } from "../src/scanner/scan-react.js";
import { reconcile } from "../src/scanner/manifest-writer.js";
import type { ComponentManifest } from "../src/schema.js";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const scanned = scanReact(REPO);
const button = scanned.find((s) => s.codeName === "Button");

describe("scanReact", () => {
  it("finds the real component library", () => {
    expect(scanned.length).toBeGreaterThan(20);
  });

  it("extracts Button's real, component-specific props (not inherited DOM attrs)", () => {
    expect(button).toBeDefined();
    const names = button!.props.map((p) => p.name);
    expect(names).toContain("intent");
    expect(names).toContain("size");
    expect(names).not.toContain("onClick"); // inherited, not an own member
    const size = button!.props.find((p) => p.name === "size");
    expect(size?.type).toContain('"sm"');
    expect(size?.defaultValue).toBe("md");
  });

  it("produces the canonical import statement", () => {
    expect(button!.importStatement).toBe("import { Button } from '@ui-organized/react';");
  });
});

describe("reconcile", () => {
  const now = "2026-07-02T00:00:00.000Z";

  it("creates new components as draft with no Figma mapping", () => {
    const { manifest, changes } = reconcile(null, scanned, now);
    expect(manifest.components.every((c) => c.status === "draft")).toBe(true);
    expect(manifest.components.every((c) => c.figmaComponentKey === "")).toBe(true);
    expect(changes.every((c) => c.kind === "created")).toBe(true);
  });

  it("preserves a Figma mapping across a re-scan and keeps active status", () => {
    const first = reconcile(null, scanned, now).manifest;
    // Simulate a designer mapping Button in the plugin:
    const mapped: ComponentManifest = {
      ...first,
      components: first.components.map((c) =>
        c.figmaComponentName === "Button"
          ? { ...c, figmaComponentKey: "fig-btn", status: "active" as const }
          : c,
      ),
    };
    const { manifest } = reconcile(mapped, scanned, "2026-07-03T00:00:00.000Z");
    const btn = manifest.components.find((c) => c.figmaComponentName === "Button")!;
    expect(btn.figmaComponentKey).toBe("fig-btn");
    expect(btn.status).toBe("active");
  });

  it("deprecates (never deletes) a mapped component removed from code", () => {
    const first = reconcile(null, scanned, now).manifest;
    const mapped: ComponentManifest = {
      ...first,
      components: first.components.map((c) =>
        c.figmaComponentName === "Button"
          ? { ...c, figmaComponentKey: "fig-btn", status: "active" as const }
          : c,
      ),
    };
    const withoutButton = scanned.filter((s) => s.codeName !== "Button");
    const { manifest, changes } = reconcile(mapped, withoutButton, now);
    const btn = manifest.components.find((c) => c.figmaComponentName === "Button")!;
    expect(btn).toBeDefined();
    expect(btn.status).toBe("deprecated");
    expect(btn.figmaComponentKey).toBe("fig-btn");
    expect(changes.find((c) => c.component === "Button")?.kind).toBe("deprecated");
  });

  it("drops an unmapped component removed from code, even one already deprecated", () => {
    const first = reconcile(null, scanned, now).manifest;
    const stale: ComponentManifest = {
      ...first,
      components: first.components.map((c) =>
        c.codeName === "Card" ? { ...c, status: "deprecated" as const } : c,
      ),
    };
    const without = scanned.filter((s) => s.codeName !== "Button" && s.codeName !== "Card");
    const { manifest, changes } = reconcile(stale, without, "2026-07-03T00:00:00.000Z");
    expect(manifest.components.some((c) => c.codeName === "Button")).toBe(false);
    expect(manifest.components.some((c) => c.codeName === "Card")).toBe(false);
    expect(changes.find((c) => c.component === "Button")?.kind).toBe("removed");
    expect(changes.find((c) => c.component === "Card")?.kind).toBe("removed");
    // A removal is a change, so the timestamp moves with the files.
    expect(manifest.generatedAt).toBe("2026-07-03T00:00:00.000Z");
  });
});

describe("scanLibrary — Svelte and Vue, from their own source", () => {
  const svelte = scanLibrary(REPO, LIBRARIES.svelte);
  const vue = scanLibrary(REPO, LIBRARIES.vue);
  const byName = (list: typeof svelte, name: string) => list.find((s) => s.codeName === name);

  it("covers the same component set as React, bar React-only plumbing", () => {
    const react = new Set(scanned.map((s) => s.codeName));
    for (const list of [svelte, vue]) {
      const missing = [...react].filter((n) => !list.some((s) => s.codeName === n));
      expect(missing).toEqual(["TableProvider"]);
    }
  });

  it("keeps Vue's asChild, which React's scan skips as plumbing", () => {
    const names = byName(vue, "Button")!.props.map((p) => p.name);
    expect(names).toContain("asChild");
    expect(names).toContain("intent");
    expect(byName(vue, "Button")!.importStatement).toBe("import { Button } from '@ui-organized/vue';");
  });

  it("reports Vue's v-model prop, not React's", () => {
    const names = byName(vue, "Select")!.props.map((p) => p.name);
    expect(names).toContain("modelValue");
    expect(names).not.toContain("onValueChange");
  });

  it("reads props declared inside a .svelte file, with destructured defaults", () => {
    const actions = byName(svelte, "TableActions")!;
    expect(actions.codePath).toMatch(/TableActions\.svelte$/);
    expect(actions.props.map((p) => p.name)).toEqual(["actions", "class"]);
  });

  it("lists a Vue compound part that declares no props of its own", () => {
    const header = byName(vue, "CardHeader")!;
    expect(header.codePath).toMatch(/CardHeader\.vue$/);
    expect(header.props).toEqual([]);
  });
});

describe("scanAngular — signal inputs, through the type checker", async () => {
  const { scanAngular } = await import("../src/scanner/scan-angular.js");
  const angular = scanAngular(REPO);
  const byName = (name: string) => angular.find((s) => s.codeName === name);

  it("reads selectors from the decorator", () => {
    expect(byName("UioButton")!.selector).toBe("button[uioButton], a[uioButton]");
    expect(byName("UioTag")!.selector).toBe("span[uioTag]");
  });

  it("resolves an aliased input type to its literal union, with its default", () => {
    const variant = byName("UioTag")!.props.find((p) => p.name === "variant")!;
    expect(variant.type).toBe('"info" | "success" | "error" | "info-secondary" | "caution"');
    expect(variant.defaultValue).toBe("success");
    const intent = byName("UioButton")!.props.find((p) => p.name === "intent")!;
    expect(intent.type).toContain('"destructive-ghost"');
  });

  it("infers an untyped input's type from its default", () => {
    expect(byName("UioTag")!.props.find((p) => p.name === "emphasized")!.type).toBe("boolean");
  });

  it("marks input.required as required and imports from the table package", () => {
    const table = byName("UioDataTable")!;
    expect(table.props.find((p) => p.name === "columns")!.required).toBe(true);
    expect(table.importStatement).toBe("import { UioDataTable } from '@ui-organized/angular-table';");
  });

  it("never leaves a type unresolved", () => {
    expect(angular.flatMap((c) => c.props).filter((p) => p.type === "unknown" || p.type === "any")).toEqual([]);
  });
});
