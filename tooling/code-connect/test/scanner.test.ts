import { describe, it, expect } from "vitest";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scanReact } from "../src/scanner/scan-react.js";
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

  it("deprecates (never deletes) a component removed from code", () => {
    const first = reconcile(null, scanned, now).manifest;
    const withoutButton = scanned.filter((s) => s.codeName !== "Button");
    const { manifest, changes } = reconcile(first, withoutButton, now);
    const btn = manifest.components.find((c) => c.figmaComponentName === "Button")!;
    expect(btn).toBeDefined();
    expect(btn.status).toBe("deprecated");
    expect(changes.find((c) => c.component === "Button")?.kind).toBe("deprecated");
  });
});
