import { describe, it, expect } from "vitest";
import type {
  ComponentManifest,
  ComponentManifestEntry,
  LatestHashes,
} from "@ui-organized/code-connect/browser";
import { contextForEntry, entryId } from "@ui-organized/code-connect/browser";
import { pluginStaleness } from "../src/staleness-view.js";
import { applyMapping, entryForKey, findEntry, parseManifest, serializeManifest } from "../src/manifest-remote.js";
import { suggest } from "../src/matcher.js";
import { previewPayload } from "../src/preview.js";
import { mappingBranchName, prBody, commitMessage } from "../src/github-client.js";

const entry = (over: Partial<ComponentManifestEntry>): ComponentManifestEntry => ({
  figmaComponentKey: "",
  figmaComponentName: "",
  codeName: "Button",
  codePath: "packages/react/src/components/Button/Button.types.ts",
  framework: "react",
  importStatement: "import { Button } from '@ui-organized/react';",
  props: [{ name: "size", type: '"sm" | "md"', required: false }],
  usageSnippet: "<Button />",
  propSignatureHash: "sha256:abc",
  lastSyncedAt: "2026-07-02T00:00:00.000Z",
  status: "draft",
  ...over,
});

const manifest = (): ComponentManifest => ({
  manifestVersion: 1,
  generatedAt: "",
  components: [
    entry({ codeName: "Button" }),
    entry({ codeName: "CardHeader", codePath: "packages/react/src/components/Card/Card.types.ts" }),
  ],
});

describe("manifest-remote.applyMapping", () => {
  it("sets the pointer + name and flips draft → active, without mutating the input", () => {
    const m = manifest();
    const { manifest: out, entry: mapped, changed } = applyMapping(m, {
      codePath: "packages/react/src/components/Button/Button.types.ts",
      codeName: "Button",
      componentKey: "fig-123",
      figmaName: "Primary Button",
    });
    expect(changed).toBe(true);
    expect(mapped.figmaComponentKey).toBe("fig-123");
    expect(mapped.figmaComponentName).toBe("Primary Button");
    expect(mapped.status).toBe("active");
    // input untouched:
    expect(m.components[0]!.figmaComponentKey).toBe("");
  });

  it("reports changed:false when the mapping already matches", () => {
    const m = applyMapping(manifest(), {
      codePath: "packages/react/src/components/Button/Button.types.ts",
      codeName: "Button",
      componentKey: "fig-123",
      figmaName: "Primary Button",
    }).manifest;
    const again = applyMapping(m, {
      codePath: "packages/react/src/components/Button/Button.types.ts",
      codeName: "Button",
      componentKey: "fig-123",
      figmaName: "Primary Button",
    });
    expect(again.changed).toBe(false);
  });

  it("targets the right entry when several share a source file", () => {
    const found = findEntry(manifest(), "packages/react/src/components/Card/Card.types.ts", "CardHeader");
    expect(found?.codeName).toBe("CardHeader");
  });

  it("round-trips through parse/serialize with scanner formatting (2-space + trailing NL)", () => {
    const text = serializeManifest(manifest());
    expect(text.endsWith("\n")).toBe(true);
    expect(text).toContain('\n  "manifestVersion": 1');
    expect(parseManifest(text).components).toHaveLength(2);
  });

  it("resolves an entry by its Figma component key", () => {
    const m = applyMapping(manifest(), {
      codePath: "packages/react/src/components/Button/Button.types.ts",
      codeName: "Button",
      componentKey: "fig-xyz",
      figmaName: "B",
    }).manifest;
    expect(entryForKey(m, "fig-xyz")?.codeName).toBe("Button");
  });
});

describe("matcher.suggest", () => {
  it("ranks the closest-named component first and caps the list", () => {
    const s = suggest(manifest().components, "Card Header", ["size"], 3);
    expect(s[0]?.entry.codeName).toBe("CardHeader");
    expect(s.length).toBeLessThanOrEqual(3);
    expect(s[0]?.reason).toMatch(/name/);
  });
});

describe("preview parity", () => {
  it("Preview Payload is exactly contextForEntry (same builder the server uses)", () => {
    const e = entry({ figmaComponentKey: "fig-1", status: "active" });
    expect(previewPayload(e)).toBe(JSON.stringify(contextForEntry(e), null, 2));
  });
});

describe("staleness-view.pluginStaleness (§4.4)", () => {
  const e = entry({ codeName: "Button", propSignatureHash: "sha256:old" });
  const id = entryId(e.codePath, e.codeName);

  it("is 'unknown' (not fresh) when there's no scan artifact", () => {
    expect(pluginStaleness(e, null)).toEqual({ known: false, isStale: false, diff: [] });
  });

  it("reports fresh when the stored hash matches the latest scan", () => {
    const scan: LatestHashes = { generatedAt: "", hashes: { [id]: "sha256:old" } };
    expect(pluginStaleness(e, scan)).toMatchObject({ known: true, isStale: false });
  });

  it("flags stale and diffs props when the scan has moved on", () => {
    const scan: LatestHashes = {
      generatedAt: "",
      hashes: { [id]: "sha256:new" },
      props: { [id]: [{ name: "size", type: '"sm" | "md" | "lg"', required: false }] },
    };
    const r = pluginStaleness(e, scan);
    expect(r.isStale).toBe(true);
    expect(r.diff.find((d) => d.name === "size")?.change).toBe("type-changed");
  });
});

describe("github-client pure builders", () => {
  it("builds a stable, slugged branch name", () => {
    expect(mappingBranchName("CardHeader", 123)).toBe("figma-mapping/cardheader-123");
  });
  it("commit + PR body reference the real code target", () => {
    expect(commitMessage("Button")).toContain("Button");
    const body = prBody({ codeName: "Button", codePath: "a/b.ts", componentKey: "k", nodeName: "Btn" });
    expect(body).toContain("a/b.ts");
    expect(body).toContain("`k`");
  });
});
