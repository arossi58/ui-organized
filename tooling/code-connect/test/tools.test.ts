/**
 * Tool behavior — with an emphasis on the anti-hallucination guarantees (§6.4).
 * The fixture manifest is built from the REAL scan so hashes and live re-scans line
 * up, then a few entries are perturbed to exercise stale / deprecated / no-match.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scanReact } from "../src/scanner/scan-react.js";
import { hashProps } from "../src/hash.js";
import { ManifestLoader } from "../src/mcp/manifest-loader.js";
import {
  buildComponentContext,
  searchComponents,
  validateMapping,
  listStale,
} from "../src/mcp/tools.js";
import { MANIFEST_VERSION, entryId, type ComponentManifestEntry } from "../src/schema.js";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
let loader: ManifestLoader;

beforeAll(() => {
  const scanned = scanReact(REPO);
  const badge = scanned.find((s) => s.codeName === "Badge")!;
  const button = scanned.find((s) => s.codeName === "Button")!;

  // Perturb Button: store props with one removed → stored hash lags current code.
  const staleProps = button.props.filter((p) => p.name !== "iconPosition");

  const base = (over: Partial<ComponentManifestEntry>): ComponentManifestEntry => ({
    figmaComponentKey: "",
    figmaComponentName: "",
    codeName: "",
    codePath: "",
    framework: "react",
    importStatement: "",
    props: [],
    usageSnippet: "",
    propSignatureHash: "",
    lastSyncedAt: "2026-07-01T00:00:00.000Z",
    status: "active",
    ...over,
  });

  const components: ComponentManifestEntry[] = [
    base({
      figmaComponentKey: "fig-badge",
      figmaComponentName: "Badge",
      codeName: "Badge",
      codePath: badge.codePath,
      importStatement: badge.importStatement,
      props: badge.props,
      propSignatureHash: badge.propSignatureHash, // matches latest → current
    }),
    base({
      figmaComponentKey: "fig-button",
      figmaComponentName: "Button",
      codeName: "Button",
      codePath: button.codePath,
      importStatement: button.importStatement,
      props: staleProps,
      propSignatureHash: hashProps(staleProps), // lags real code → stale
    }),
    base({
      figmaComponentKey: "fig-old",
      figmaComponentName: "OldWidget",
      codeName: "OldWidget",
      codePath: "packages/react/src/components/OldWidget/OldWidget.types.ts",
      status: "deprecated",
      propSignatureHash: "sha256:deadbeefdeadbeef",
    }),
  ];

  const dir = mkdtempSync(join(tmpdir(), "code-connect-"));
  writeFileSync(
    join(dir, "components.json"),
    JSON.stringify({ manifestVersion: MANIFEST_VERSION, generatedAt: "", components }),
  );
  writeFileSync(
    join(dir, "latest-hashes.json"),
    JSON.stringify({
      generatedAt: "",
      hashes: {
        [entryId(badge.codePath, "Badge")]: badge.propSignatureHash,
        // real current → differs from stored:
        [entryId(button.codePath, "Button")]: button.propSignatureHash,
      },
      props: {
        [entryId(badge.codePath, "Badge")]: badge.props,
        [entryId(button.codePath, "Button")]: button.props, // full set → diff vs stale
      },
    }),
  );
  loader = new ManifestLoader(dir);
});

describe("get_component_context — anti-hallucination (§6.4)", () => {
  it("resolves a current mapping as exact with no warning", () => {
    const r = buildComponentContext(loader, { figmaComponentKey: "fig-badge" });
    expect(r.found).toBe(true);
    expect(r.confidence).toBe("exact");
    expect(r.staleness?.isStale).toBe(false);
    expect(r.warning).toBeUndefined();
    expect(r.entry?.importStatement).toContain("@ui-organized/react");
  });

  it("NEVER fabricates on an unknown key — returns found:false and tells the agent not to invent", () => {
    const r = buildComponentContext(loader, { figmaComponentKey: "does-not-exist" });
    expect(r.found).toBe(false);
    expect(r.confidence).toBe("none");
    expect(r.entry).toBeUndefined();
    expect(r.warning).toMatch(/do not invent/i);
  });

  it("refuses to resolve a bare node id and directs the caller to the component key", () => {
    const r = buildComponentContext(loader, { figmaNodeId: "12:345" });
    expect(r.found).toBe(false);
    expect(r.warning).toMatch(/pluginData|component key/i);
  });

  it("flags a stale mapping, names what changed, but still returns real data", () => {
    const r = buildComponentContext(loader, { figmaComponentKey: "fig-button" });
    expect(r.found).toBe(true);
    expect(r.staleness?.isStale).toBe(true);
    expect(r.staleness?.changedProps).toContain("iconPosition"); // cheap diff, no re-scan
    expect(r.warning).toMatch(/stale/i);
    expect(r.entry).toBeDefined();
  });

  it("resolves a deprecated mapping with a warning rather than 404ing (§6.4.5)", () => {
    const r = buildComponentContext(loader, { figmaComponentKey: "fig-old" });
    expect(r.found).toBe(true);
    expect(r.entry?.status).toBe("deprecated");
    expect(r.warning).toMatch(/deprecated/i);
  });
});

describe("search_components", () => {
  it("finds a component by name and scores it", () => {
    const { results } = searchComponents(loader, { query: "button" });
    const btn = results.find((r) => r.componentKey === "fig-button");
    expect(btn).toBeDefined();
    expect(btn!.score).toBe(1); // normalized exact name match
    expect(btn!.confidence).toBe("exact");
  });

  it("returns nothing for a nonsense query (no confidence inflation, §6.4.3)", () => {
    expect(searchComponents(loader, { query: "zzqqxx" }).results).toHaveLength(0);
  });

  it("respects the status filter", () => {
    const { results } = searchComponents(loader, { query: "widget", status: "deprecated" });
    expect(results.some((r) => r.componentKey === "fig-old")).toBe(true);
  });
});

describe("validate_mapping (live re-scan)", () => {
  it("passes a current mapping with an empty diff", () => {
    const r = validateMapping(loader, { figmaComponentKey: "fig-badge" });
    expect(r.isValid).toBe(true);
    expect(r.diff ?? []).toHaveLength(0);
  });

  it("fails a stale mapping and reports the exact prop diff", () => {
    const r = validateMapping(loader, { figmaComponentKey: "fig-button" });
    expect(r.isValid).toBe(false);
    expect(r.currentHash).not.toBe(r.storedHash);
    expect(r.diff?.some((d) => d.name === "iconPosition" && d.change === "added")).toBe(true);
  });

  it("returns a warning for an unmapped key", () => {
    const r = validateMapping(loader, { figmaComponentKey: "nope" });
    expect(r.isValid).toBe(false);
    expect(r.warning).toBeDefined();
  });
});

describe("list_stale", () => {
  it("lists only drifted mappings", () => {
    const { staleEntries } = listStale(loader);
    const keys = staleEntries.map((e) => e.componentKey);
    expect(keys).toContain("fig-button");
    expect(keys).not.toContain("fig-badge");
  });
});
