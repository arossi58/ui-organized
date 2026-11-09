import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { fetchFrame, parseFigmaUrl } from "../src/figma/rest.js";
import { resolveFrame, resolveProps, type ResolveContext } from "../src/figma/resolve.js";
import { libraryComponents, planSync } from "../src/figma/sync.js";
import type { FigmaDocument, FigmaNode } from "../src/figma/types.js";
import { reconcile } from "../src/scanner/manifest-writer.js";
import type { ComponentManifest, ComponentManifestEntry } from "../src/schema.js";
import { cssVarToFigmaVariable, figmaVariableIndex, parseTokens } from "../src/tokens/catalog.js";

function entry(codeName: string, key: string, props: ComponentManifestEntry["props"] = []): ComponentManifestEntry {
  return {
    figmaComponentKey: key,
    figmaComponentName: codeName,
    codeName,
    codePath: `packages/react/src/components/${codeName}.types.ts`,
    framework: "react",
    importStatement: `import { ${codeName} } from '@ui-organized/react';`,
    props,
    usageSnippet: "",
    propSignatureHash: "h",
    lastSyncedAt: "",
    status: key ? "active" : "draft",
  };
}

const button = entry("Button", "set-button", [
  { name: "intent", type: '"primary" | "ghost"', required: false, defaultValue: "primary" },
  { name: "size", type: '"sm" | "md"', required: false, defaultValue: "md" },
  { name: "iconPosition", type: '"left" | "right"', required: false, defaultValue: "left" },
  { name: "icon", type: "CanonicalIconName | IconComponent", required: false },
]);
const card = entry("Card", "set-card");
const cardBody = entry("CardBody", "");
const all = [button, card, cardBody];

const ctx: ResolveContext = {
  byKey: (key) => all.find((e) => e.figmaComponentKey === key),
  byName: (name) => all.find((e) => e.codeName === name),
  variableIndex: new Map([
    ["spacing/space-04", "--spacing-space-04"],
    ["surface/base", "--color-surface-base"],
  ]),
  variableNames: { "lib-key-spacing": "spacing/space-04", "VariableID:9:1": "surface/base" },
};

const doc = (document: FigmaNode, extra: Partial<FigmaDocument> = {}): FigmaDocument => ({
  document,
  components: {
    "1:1": { key: "variant-key", name: "intent=ghost, size=sm", componentSetId: "1:0" },
    "2:1": { key: "other-key", name: "Promo Banner" },
    "3:1": { key: "card-variant", name: "padding=md", componentSetId: "3:0" },
  },
  componentSets: { "1:0": { key: "set-button", name: "Button" }, "3:0": { key: "set-card", name: "Card" } },
  ...extra,
});

const instance = (properties: Record<string, string | boolean>, componentId = "1:1"): FigmaNode => ({
  id: "i",
  name: "Button",
  type: "INSTANCE",
  componentId,
  componentProperties: Object.fromEntries(
    Object.entries(properties).map(([k, value]) => [k, { type: "VARIANT" as const, value }]),
  ),
  children: [{ id: "t", name: "label", type: "TEXT", characters: "Save" }],
});

describe("resolveFrame", () => {
  it("resolves an instance through its set's key, because a variant's key differs", () => {
    const out = resolveFrame(doc(instance({ intent: "ghost", size: "sm", state: "default" })), ctx);
    expect(out.code).toContain('<Button intent="ghost" size="sm">Save</Button>');
    expect(out.imports).toEqual(["Button"]);
    expect(out.unmapped).toEqual([]);
  });

  it("omits default values and never sends internal layers", () => {
    const node = instance({ intent: "primary" });
    node.children!.push({ id: "v", name: "deep-internal-layer", type: "VECTOR" });
    const { code } = resolveFrame(doc(node), ctx);
    expect(code).toContain("<Button>Save</Button>");
    expect(code).not.toContain("deep-internal-layer");
  });

  it("drops a value outside the code's union and says so", () => {
    const out = resolveFrame(doc(instance({ intent: "banana" })), ctx);
    expect(out.code).not.toContain("banana");
    expect(out.warnings.join()).toContain('"banana" isn\'t valid for "intent"');
  });

  it("flags an unmapped instance and still shows its content", () => {
    const out = resolveFrame(doc(instance({}, "2:1")), ctx);
    expect(out.unmapped).toEqual(["Button"]);
    expect(out.code).toContain("CODE CONNECT");
    expect(out.code).toContain("Save");
    expect(out.imports).toEqual([]);
  });

  it("treats a detached frame as layout, never as the component it resembles", () => {
    const out = resolveFrame(doc({ id: "f", name: "Button", type: "FRAME" }), ctx);
    expect(out.imports).toEqual([]);
    expect(out.code).toBe("<div />");
  });

  it("uses tokens only for bound values and reports hand-set ones", () => {
    const frame: FigmaNode = {
      id: "f",
      name: "Panel",
      type: "FRAME",
      layoutMode: "VERTICAL",
      itemSpacing: 16,
      paddingTop: 13,
      fills: [{ boundVariables: { color: { id: "VariableID:9:1" } } }],
      strokes: [{ color: { r: 1, g: 0, b: 0 } }],
      boundVariables: { itemSpacing: { id: "VariableID:lib-key-spacing/5:5" } },
    };
    const out = resolveFrame(doc(frame), ctx);
    expect(out.code).toContain('gap: "var(--spacing-space-04)"');
    expect(out.code).toContain('background: "var(--color-surface-base)"');
    expect(out.code).not.toContain("13");
    expect(out.unbound).toEqual([
      { node: "Panel", property: "paddingTop" },
      { node: "Panel", property: "strokes" },
    ]);
  });

  it("reports a variable it can't name rather than guessing", () => {
    const frame: FigmaNode = {
      id: "f",
      name: "Panel",
      type: "FRAME",
      itemSpacing: 16,
      boundVariables: { itemSpacing: { id: "VariableID:unknown/1:1" } },
    };
    const out = resolveFrame(doc(frame), ctx);
    expect(out.code).toBe("<div />");
    expect(out.warnings.join()).toContain("couldn't be named");
  });

  it("descends into a compound component's slots", () => {
    const node: FigmaNode = {
      id: "c",
      name: "Card",
      type: "INSTANCE",
      componentId: "3:1",
      children: [
        { id: "b", name: "body", type: "FRAME", children: [instance({ intent: "ghost" })] },
        { id: "x", name: "shadow-layer", type: "VECTOR" },
      ],
    };
    const { code, imports } = resolveFrame(doc(node), ctx);
    expect(imports).toEqual(["Button", "Card", "CardBody"]);
    expect(code).toBe(
      `import { Button, Card, CardBody } from "@ui-organized/react";\n\n<Card>\n  <CardBody>\n    <Button intent="ghost">Save</Button>\n  </CardBody>\n</Card>`,
    );
  });

  it("skips hidden layers", () => {
    const frame: FigmaNode = {
      id: "f",
      name: "F",
      type: "FRAME",
      children: [{ id: "t", name: "T", type: "TEXT", characters: "Secret", visible: false }],
    };
    expect(resolveFrame(doc(frame), ctx).code).not.toContain("Secret");
  });
});

describe("resolveProps", () => {
  it("applies the folds FIGMA-PARITY §7 documents", () => {
    expect(resolveProps(button, { state: "disabled", "icon-trailing": true, "icon-leading": false }).attrs).toEqual([
      "disabled",
      'iconPosition="right"',
    ]);
  });

  it("strips Figma's property suffix and takes children as content", () => {
    expect(resolveProps(button, { "children#12:0": "Go" }).content).toBe("Go");
  });

  it("won't guess an icon, but passes on what Figma used", () => {
    const out = resolveProps(button, { "icon#1:2": "5:5" }, () => "trash");
    expect(out.attrs).toEqual([]);
    expect(out.warnings.join()).toContain('Figma uses "trash"');
  });

  it("escapes values that would break an attribute", () => {
    const entryWithTitle = entry("X", "k", [{ name: "title", type: "string", required: false }]);
    expect(resolveProps(entryWithTitle, { title: 'a "b"' }).attrs).toEqual(['title={"a \\"b\\""}']);
  });
});

describe("planSync", () => {
  const manifest = (components: ComponentManifestEntry[]): ComponentManifest => ({
    manifestVersion: 1,
    generatedAt: "t",
    components,
  });
  const set = (name: string, key = `k-${name}`, properties = {}) => ({ name, key, properties });

  it("links exact names only and marks them active", () => {
    const { manifest: next, report } = planSync(manifest([entry("Button", ""), entry("Tag", "")]), [
      set("Button"),
      set("Buton"),
    ]);
    expect(next.components[0]).toMatchObject({ figmaComponentKey: "k-Button", status: "active" });
    expect(next.components[1]).toMatchObject({ figmaComponentKey: "", status: "draft" });
    expect(report).toMatchObject({ linked: ["Button"], figmaOnly: ["Buton"], codeOnly: ["Tag"] });
  });

  it("is a no-op when run again", () => {
    const once = planSync(manifest([entry("Button", "")]), [set("Button")]).manifest;
    const twice = planSync(once, [set("Button")]);
    expect(twice.manifest).toEqual(once);
    expect(twice.report.changed).toEqual([]);
  });

  it("honours overrides and Figma-only components", () => {
    const { report } = planSync(manifest([entry("NavItem", "")]), [set("Nav Item"), set("Toast")], {
      components: { "Nav Item": "NavItem" },
      figmaOnly: ["Toast"],
    });
    expect(report).toMatchObject({ linked: ["NavItem"], figmaOnly: [] });
  });

  it("never links a deprecated component", () => {
    const old = { ...entry("Old", ""), status: "deprecated" as const };
    const { manifest: next, report } = planSync(manifest([old]), [set("Old")]);
    expect(next.components[0]!.figmaComponentKey).toBe("");
    expect(report.figmaOnly).toEqual(["Old"]);
  });

  it("keeps a link whose Figma component has gone, and reports it", () => {
    const { manifest: next, report } = planSync(manifest([entry("Button", "gone")]), []);
    expect(next.components[0]!.figmaComponentKey).toBe("gone");
    expect(report.linkGone).toEqual(["Button"]);
  });

  it("reports drift both ways and exempts documented folds", () => {
    const code = entry("Button", "", [{ name: "size", type: '"sm" | "md"', required: false }]);
    const { manifest: next, report } = planSync(manifest([code]), [
      set("Button", "k", {
        size: { type: "VARIANT", variantOptions: ["sm", "xl"] },
        state: { type: "VARIANT", variantOptions: ["default"] },
        "children#1:0": { type: "TEXT" },
        mystery: { type: "BOOLEAN" },
      }),
    ]);
    expect(report.drift).toEqual([
      'Button.size: Figma value "xl" isn\'t in the code',
      'Button.size: code value "md" isn\'t in Figma',
      'Button: Figma property "mystery" has no prop',
    ]);
    expect(next.components[0]!.props[0]!.figmaVariantMapping).toBe("size");
  });
});

describe("libraryComponents", () => {
  it("takes sets and standalone components, not variants or internals", () => {
    const document: FigmaNode = {
      id: "0",
      name: "doc",
      type: "DOCUMENT",
      children: [
        { id: "s", name: "Button", type: "COMPONENT_SET", children: [{ id: "v", name: "size=sm", type: "COMPONENT" }] },
        { id: "c", name: "Divider", type: "COMPONENT" },
        { id: "i", name: "_Menu/Item", type: "COMPONENT" },
      ],
    };
    expect(libraryComponents(document, (n) => `key-${n.id}`).map((c) => c.name)).toEqual(["Button", "Divider"]);
  });
});

describe("parseFigmaUrl", () => {
  it("reads the file and node", () => {
    expect(parseFigmaUrl("https://www.figma.com/design/abc/Lib?node-id=1-2")).toEqual({ fileKey: "abc", nodeId: "1:2" });
  });
  it("prefers a branch key", () => {
    expect(parseFigmaUrl("https://www.figma.com/design/abc/branch/def/Lib")).toEqual({ fileKey: "def" });
  });
  it("rejects anything else", () => {
    expect(parseFigmaUrl("https://evil.example/design/abc")).toBeNull();
    expect(parseFigmaUrl("nope")).toBeNull();
  });
});

describe("variable names", () => {
  it("keeps a leaf's inner dashes", () => {
    expect(cssVarToFigmaVariable("--color-interactive-destructive-default-ghost")).toBe(
      "interactive/destructive-default-ghost",
    );
  });
  it("maps the documented families", () => {
    expect(cssVarToFigmaVariable("--spacing-space-04")).toBe("spacing/space-04");
    expect(cssVarToFigmaVariable("--border-radius-02")).toBe("radius/02");
    expect(cssVarToFigmaVariable("--Button-Small-vertical")).toBe("component/button/small-vertical");
    expect(cssVarToFigmaVariable("--grey-100")).toBeNull();
  });
  it("indexes only real semantic tokens", () => {
    const index = figmaVariableIndex(parseTokens(":root { --color-surface-base: #000; --grey-100: #fff; }"));
    expect([...index]).toEqual([["surface/base", "--color-surface-base"]]);
  });
});

describe("fetchFrame", () => {
  const respond = (body: unknown): Response => new Response(JSON.stringify(body));

  it("re-downloads a node only when the file's version moves", async () => {
    let version = "1";
    const nodeRequests: string[] = [];
    const fetcher = (async (url: string) => {
      if (String(url).includes("depth=1")) return respond({ version });
      nodeRequests.push(String(url));
      return respond({ nodes: { "1:2": { document: { id: "1:2", name: "F", type: "FRAME" } } } });
    }) as typeof fetch;

    await fetchFrame("cachefile", "1:2", "t", fetcher);
    await fetchFrame("cachefile", "1:2", "t", fetcher);
    expect(nodeRequests).toHaveLength(1);
    version = "2";
    await fetchFrame("cachefile", "1:2", "t", fetcher);
    expect(nodeRequests).toHaveLength(2);
  });

  it("explains a refused token", async () => {
    const fetcher = (async () => new Response("", { status: 403 })) as unknown as typeof fetch;
    await expect(fetchFrame("f", "1:2", "t", fetcher)).rejects.toThrow(/FIGMA_TOKEN was refused/);
  });
});

describe("a sync followed by a scan", () => {
  it("keeps the link and the active status", () => {
    const code = entry("Button", "", [{ name: "size", type: '"sm"', required: false }]);
    const synced = planSync({ manifestVersion: 1, generatedAt: "t", components: [code] }, [
      { name: "Button", key: "k", properties: { size: { type: "VARIANT", variantOptions: ["sm"] } } },
    ]).manifest;
    const { manifest } = reconcile(
      synced,
      [{ ...code, propSignatureHash: "h" } as unknown as Parameters<typeof reconcile>[1][number]],
      "later",
    );
    expect(manifest.components[0]).toMatchObject({ figmaComponentKey: "k", status: "active" });
  });
});

describe("against the real token build", () => {
  const css = readFileSync(resolve(__dirname, "../../../packages/tokens/output/variables.css"), "utf8");
  const index = figmaVariableIndex(parseTokens(css));

  it("resolves the variable names FIGMA-PARITY documents", () => {
    expect(index.get("surface/base")).toBe("--color-surface-base");
    expect(index.get("interactive/destructive-default-ghost")).toBe("--color-interactive-destructive-default-ghost");
    expect(index.get("spacing/space-04")).toBe("--spacing-space-04");
    expect(index.get("radius/02")).toBe("--border-radius-02");
    expect(index.get("size/body-medium")).toBe("--type-size-body-medium");
    expect(index.get("component/button/small-vertical")).toBe("--Button-Small-vertical");
  });

  it("gives every semantic token a distinct variable name", () => {
    const semantic = parseTokens(css).filter((t) => t.group && cssVarToFigmaVariable(t.name));
    expect(index.size).toBe(semantic.length);
  });
});
