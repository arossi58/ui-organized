/**
 * Flagging layers (Connect.md §7): Layer 2 annotations, Layer 3 warnings log, and
 * Layer 4 verify. The verifier runs against a fixture manifest built from the real
 * scan, with a deprecated + a stale entry injected, and temp generated .tsx files.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scanReact } from "../src/scanner/scan-react.js";
import { hashProps } from "../src/hash.js";
import { entryId, MANIFEST_VERSION, type ComponentManifestEntry } from "../src/schema.js";
import { ManifestLoader } from "../src/mcp/manifest-loader.js";
import {
  ANNOTATION_MARKER,
  buildAnnotation,
  hasAnnotation,
  needsAnnotation,
} from "../src/flagging/annotation.js";
import { MappingWarningsCollector } from "../src/flagging/warnings-log.js";
import { verifyGeneratedCode } from "../src/flagging/verify.js";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

// ─── Layer 2 ──────────────────────────────────────────────────────────────────

describe("Layer 2 — annotation (§7.2)", () => {
  it("requires annotation below exact confidence or when stale", () => {
    expect(needsAnnotation("exact", false)).toBe(false);
    expect(needsAnnotation("exact", true)).toBe(true);
    expect(needsAnnotation("fuzzy", false)).toBe(true);
    expect(needsAnnotation("none", false)).toBe(true);
  });

  it("builds a detectable annotation carrying the confidence + reason", () => {
    const a = buildAnnotation({ codeName: "CardHeader", confidence: "fuzzy", figmaNodeName: "Header/V2" });
    expect(a).toContain(ANNOTATION_MARKER);
    expect(a).toMatch(/confidence: fuzzy/);
    expect(a).toContain("CardHeader");
    expect(hasAnnotation(a)).toBe(true);
    expect(hasAnnotation("// just a normal comment")).toBe(false);
  });

  it("names changed props when stale", () => {
    const a = buildAnnotation({ codeName: "Button", confidence: "exact", isStale: true, changedProps: ["size"] });
    expect(a).toMatch(/stale/);
    expect(a).toContain("size");
  });
});

// ─── Layer 3 ──────────────────────────────────────────────────────────────────

describe("Layer 3 — mapping-warnings.json (§7.3)", () => {
  it("collects warnings + dedupes stale mappings and serializes", () => {
    const c = new MappingWarningsCollector("https://figma.com/file/abc");
    expect(c.isClean()).toBe(true);
    c.addWarning({
      figmaNodeId: "1:2",
      figmaNodeName: "Mystery",
      confidence: "none",
      resolution: "asked_user",
      warningText: "no match",
    });
    c.addStaleUsed("fig-btn", ["size"]);
    c.addStaleUsed("fig-btn", ["size"]); // deduped
    const log = c.build("2026-07-02T00:00:00.000Z");
    expect(c.isClean()).toBe(false);
    expect(log.warnings).toHaveLength(1);
    expect(log.staleMappingsUsed).toHaveLength(1);
    expect(c.serialize("2026-07-02T00:00:00.000Z").endsWith("\n")).toBe(true);
  });
});

// ─── Layer 4 ──────────────────────────────────────────────────────────────────

describe("Layer 4 — verify-generated-code (§7.4)", () => {
  let loader: ManifestLoader;
  let dir: string;

  beforeAll(() => {
    const scanned = scanReact(REPO);
    const button = scanned.find((s) => s.codeName === "Button")!;
    const badge = scanned.find((s) => s.codeName === "Badge")!;

    const base = (o: Partial<ComponentManifestEntry>): ComponentManifestEntry => ({
      figmaComponentKey: "", figmaComponentName: "", codeName: "", codePath: "",
      framework: "react", importStatement: "", props: [], usageSnippet: "",
      propSignatureHash: "", lastSyncedAt: "", status: "active", ...o,
    });

    const staleButtonProps = button.props.filter((p) => p.name !== "iconPosition");
    const components = [
      base({ figmaComponentKey: "k-badge", figmaComponentName: "Badge", codeName: "Badge",
        codePath: badge.codePath, importStatement: badge.importStatement, props: badge.props,
        propSignatureHash: badge.propSignatureHash }),
      base({ figmaComponentKey: "k-btn", figmaComponentName: "Button", codeName: "Button",
        codePath: button.codePath, importStatement: button.importStatement, props: staleButtonProps,
        propSignatureHash: hashProps(staleButtonProps) }), // stale vs latest
      base({ figmaComponentName: "OldThing", codeName: "OldThing",
        codePath: "packages/react/src/components/OldThing/OldThing.types.ts", status: "deprecated",
        propSignatureHash: "sha256:old" }),
    ];

    dir = mkdtempSync(join(tmpdir(), "cc-verify-"));
    writeFileSync(join(dir, "components.json"),
      JSON.stringify({ manifestVersion: MANIFEST_VERSION, generatedAt: "", components }));
    writeFileSync(join(dir, "latest-hashes.json"), JSON.stringify({
      generatedAt: "",
      hashes: {
        [entryId(badge.codePath, "Badge")]: badge.propSignatureHash,
        [entryId(button.codePath, "Button")]: button.propSignatureHash, // differs → Button stale
      },
      props: {
        [entryId(badge.codePath, "Badge")]: badge.props,
        [entryId(button.codePath, "Button")]: button.props,
      },
    }));
    loader = new ManifestLoader(dir);
  });

  const write = (name: string, src: string) => {
    const p = join(dir, name);
    writeFileSync(p, src);
    return p;
  };

  it("passes clean, correct usage of a current component", () => {
    const f = write("ok.tsx", `import { Badge } from '@ui-organized/react';\nexport const A = () => <Badge variant="info" size="md" />;\n`);
    expect(verifyGeneratedCode([f], loader, dir)).toHaveLength(0);
  });

  it("flags a hallucinated component import", () => {
    const f = write("halluc.tsx", `import { SuperButton } from '@ui-organized/react';\nexport const A = () => <SuperButton />;\n`);
    const found = verifyGeneratedCode([f], loader, dir);
    expect(found.some((x) => x.kind === "unresolved-import" && x.severity === "error")).toBe(true);
  });

  it("flags a prop not in the component's signature", () => {
    const f = write("badprop.tsx", `import { Badge } from '@ui-organized/react';\nexport const A = () => <Badge glow="bright" onClick={() => {}} className="x" />;\n`);
    const found = verifyGeneratedCode([f], loader, dir);
    const unknown = found.filter((x) => x.kind === "unknown-prop");
    expect(unknown).toHaveLength(1);
    expect(unknown[0]!.message).toContain("glow");
  });

  it("flags a stale-mapping usage that lacks a Layer 2 annotation", () => {
    const f = write("stale.tsx", `import { Button } from '@ui-organized/react';\nexport const A = () => <Button intent="primary" />;\n`);
    const found = verifyGeneratedCode([f], loader, dir);
    expect(found.some((x) => x.kind === "missing-annotation")).toBe(true);
  });

  it("accepts a stale-mapping usage WITH an annotation", () => {
    const f = write("annotated.tsx",
      `import { Button } from '@ui-organized/react';\n` +
      `export const A = () => (\n  // ${ANNOTATION_MARKER} — STALE (confidence: exact, stale)\n  <Button intent="primary" />\n);\n`);
    const found = verifyGeneratedCode([f], loader, dir);
    expect(found.some((x) => x.kind === "missing-annotation")).toBe(false);
  });

  it("warns (not errors) on a deprecated component import", () => {
    const f = write("dep.tsx", `import { OldThing } from '@ui-organized/react';\nexport const A = () => {\n  // ${ANNOTATION_MARKER} deprecated\n  return <OldThing />;\n};\n`);
    const found = verifyGeneratedCode([f], loader, dir);
    expect(found.some((x) => x.kind === "deprecated-import" && x.severity === "warning")).toBe(true);
  });
});
