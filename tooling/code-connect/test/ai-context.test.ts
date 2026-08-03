/**
 * `buildAiContext()` — the payload a human pastes into a coding agent.
 *
 * Strategy: exactly ONE golden snapshot (Button), reviewed like prose, plus
 * invariants asserted across every real manifest entry. A legitimate prop change
 * should be a one-line snapshot update, not a forty-test cascade — so anything
 * that would be true of all 114 components is expressed as an invariant instead
 * of another snapshot.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAiContext,
  jsxFromArgs,
  expandPropType,
  humanizeLabel,
  packageFromImport,
} from "../src/ai-context.js";
import { USAGE_GUIDES } from "../src/usage/index.js";
import type { ComponentManifest, ComponentManifestEntry } from "../src/schema.js";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../src");

const manifest = JSON.parse(
  readFileSync(join(REPO, "manifest/components.json"), "utf8"),
) as ComponentManifest;

const byName = (name: string): ComponentManifestEntry => {
  const entry = manifest.components.find((c) => c.codeName === name);
  if (!entry) throw new Error(`No manifest entry for ${name}`);
  return entry;
};

/** Fixed meta so the snapshot never depends on a clock or a package bump. */
const META = {
  packageVersion: "4.1.0",
  setupImports: [
        "@ui-organized/tokens/variables.css",
        "@ui-organized/react/styles",
        // Registers the icon set. Omit it and every <Icon> renders nothing —
        // the library imports no icon package itself.
        "@ui-organized/react/icons/lucide",
      ],
  siteUrl: "https://uiorganized.com/docs/button",
  docUrl: "https://uiorganized.com/ai/Button.md",
  indexUrl: "https://uiorganized.com/llms.txt",
  componentCount: 114,
  generatedAt: "2026-07-25T00:00:00.000Z",
};

describe("buildAiContext — golden", () => {
  it("renders the full Button payload", () => {
    const result = buildAiContext({
      entry: byName("Button"),
      description:
        "Buttons trigger actions. Use `intent` to convey emphasis and tone, `size` for density.",
      liveArgs: { children: "Button", intent: "primary", size: "md" },
      typeValues: {
        CanonicalIconName: ["plus", "arrow-right", "download", "trash", "edit", "check", "close"],
      },
      examples: [
        {
          name: "AllIntents",
          code: '<Button intent="primary">Primary</Button>\n<Button intent="ghost">Ghost</Button>',
          source: "story-source-param",
        },
      ],
      staleness: { isStale: false, lastVerified: "2026-07-03T01:18:35.349Z" },
      meta: META,
    });

    expect(result.format).toBe("markdown");
    expect(result.text).toMatchSnapshot();
  });
});

describe("buildAiContext — invariants across every manifest entry", () => {
  const all = manifest.components;

  it("covers a non-trivial manifest", () => {
    expect(all.length).toBeGreaterThan(100);
  });

  it("never throws, for any entry, in any format", () => {
    for (const entry of all) {
      for (const format of ["markdown", "jsx", "prompt-url"] as const) {
        expect(() => buildAiContext({ entry }, format)).not.toThrow();
      }
    }
  });

  it("always reproduces the import statement verbatim", () => {
    for (const entry of all) {
      const { text } = buildAiContext({ entry, meta: META });
      expect(text, entry.codeName).toContain(entry.importStatement);
    }
  });

  it("mentions every prop the component declares", () => {
    for (const entry of all) {
      const { text } = buildAiContext({ entry, meta: META });
      for (const prop of entry.props) {
        expect(text, `${entry.codeName}.${prop.name}`).toContain(`\`${prop.name}\``);
      }
    }
  });

  it("never leaks a placeholder as a rendered value", () => {
    // `null` and `undefined` are legitimate inside type TEXT — `HTMLElement |
    // null`, `number | null`. What must never happen is one of them (or a
    // stringified object) reaching the page as a value an agent would copy.
    const leaks = [
      /=\{?"?(undefined|null|NaN)"?\}?/,
      /\[object Object\]/,
      /\|\s*(undefined|NaN)\s*\|/, // a table cell that is literally "undefined"
    ];
    for (const entry of all) {
      const { text } = buildAiContext({
        entry,
        liveArgs: { intent: undefined, size: "md", onClick: () => {} },
        meta: META,
      });
      for (const leak of leaks) {
        expect(text, `${entry.codeName} matched ${leak}`).not.toMatch(leak);
      }
    }
  });

  it("stays inside the context budget", () => {
    for (const entry of all) {
      const { approxTokens } = buildAiContext({ entry, meta: META });
      expect(approxTokens, entry.codeName).toBeLessThan(3000);
    }
  });

  it("never surfaces the `draft` status", () => {
    // Every entry is `draft` only because no Figma key is linked yet. Printing it
    // would make an agent distrust a component that is entirely correct.
    for (const entry of all) {
      const { text } = buildAiContext({ entry, meta: META });
      expect(text.toLowerCase(), entry.codeName).not.toContain("draft");
    }
  });

  it("warns about deprecation exactly when the entry is deprecated", () => {
    for (const entry of all) {
      const { data } = buildAiContext({ entry, meta: META });
      const warned = data.warnings.some((w) => /deprecated/i.test(w));
      expect(warned, entry.codeName).toBe(entry.status === "deprecated");
    }
  });

  it("is deterministic", () => {
    for (const entry of all.slice(0, 20)) {
      const a = buildAiContext({ entry, meta: META });
      const b = buildAiContext({ entry, meta: META });
      expect(a.text).toBe(b.text);
    }
  });
});

describe("buildAiContext — warnings", () => {
  it("emits no warnings for a clean, exact, fresh entry", () => {
    const { data } = buildAiContext({
      entry: byName("Button"),
      staleness: { isStale: false, lastVerified: "2026-07-03T01:18:35.349Z" },
    });
    expect(data.warnings).toEqual([]);
  });

  it("names the changed props when the mapping is stale", () => {
    const { text, data } = buildAiContext({
      entry: byName("Button"),
      staleness: {
        isStale: true,
        changedProps: ["iconPosition"],
        lastVerified: "2026-07-03T01:18:35.349Z",
      },
    });
    expect(data.warnings.join(" ")).toMatch(/STALE/);
    expect(text).toContain("⚠️");
  });

  it("never claims verification when confidence is fuzzy", () => {
    const { data } = buildAiContext({
      entry: byName("Button"),
      confidence: "fuzzy",
      resolutionNote: "name similarity 0.56",
    });
    expect(data.warnings.join(" ")).toContain("fuzzy confidence");
    expect(data.warnings.join(" ")).toContain("name similarity 0.56");
  });
});

describe("buildAiContext — compound components", () => {
  const card = byName("Card");
  const related = manifest.components.filter(
    (c) => c.codePath === card.codePath && c.codeName !== card.codeName,
  );

  it("has siblings to work with", () => {
    expect(related.map((r) => r.codeName)).toContain("CardHeader");
  });

  it("merges the import and adds a composition section", () => {
    const { text, data } = buildAiContext({ entry: card, related });
    expect(data.compositionImport).toContain("CardHeader");
    expect(text).toContain("## Composition — required");
    expect(text).toContain(data.compositionImport!);
  });

  it("never suggests flattening the structure onto the root", () => {
    const { text } = buildAiContext({ entry: card, related });
    expect(text).not.toContain("<Card title=");
  });

  it("lists each subcomponent", () => {
    const { data } = buildAiContext({ entry: card, related });
    expect(data.subcomponents?.map((s) => s.name)).toEqual(related.map((r) => r.codeName));
  });
});

describe("expandPropType", () => {
  it("expands an inline string-literal union", () => {
    const { values } = expandPropType({
      name: "size",
      type: '"sm" | "md" | "lg"',
      required: false,
    });
    expect(values).toEqual(["sm", "md", "lg"]);
  });

  it("leaves an open type unexpanded", () => {
    expect(expandPropType({ name: "children", type: "React.ReactNode", required: false }).values)
      .toBeUndefined();
  });

  it("resolves a named alias from typeValues", () => {
    const { values } = expandPropType(
      { name: "icon", type: "CanonicalIconName", required: false },
      { CanonicalIconName: ["plus", "trash"] },
    );
    expect(values).toEqual(["plus", "trash"]);
  });

  it("renders a long union as a fenced block, not a table cell", () => {
    const long = Array.from({ length: 40 }, (_, i) => `icon-${i}`);
    const { text } = buildAiContext({
      entry: byName("Button"),
      typeValues: { CanonicalIconName: long },
    });
    expect(text).toContain("is one of exactly these 40 values");
    expect(text).toContain("icon-39");
  });
});

describe("jsxFromArgs", () => {
  it("renders strings, booleans, numbers and children", () => {
    // With no explicit order, attributes sort alphabetically — insertion order
    // varies by caller and would make the output non-deterministic.
    expect(
      jsxFromArgs("Button", {
        children: "Save",
        intent: "primary",
        disabled: true,
        hidden: false,
        tabIndex: 2,
      }),
    ).toBe('<Button disabled intent="primary" tabIndex={2}>Save</Button>');
  });

  it("self-closes with no children", () => {
    expect(jsxFromArgs("Icon", { name: "plus" })).toBe('<Icon name="plus" />');
  });

  it("omits undefined and null", () => {
    expect(jsxFromArgs("Button", { intent: undefined, size: null })).toBe("<Button />");
  });

  it("omits functions and notes them once", () => {
    const jsx = jsxFromArgs("Button", { children: "Go", onClick: () => {}, onBlur: () => {} });
    expect(jsx).not.toContain("onClick");
    expect(jsx.match(/your own event handlers/g)).toHaveLength(1);
  });

  it("serializes objects with stable key order", () => {
    const a = jsxFromArgs("Chart", { config: { b: 1, a: 2 } });
    const b = jsxFromArgs("Chart", { config: { a: 2, b: 1 } });
    expect(a).toBe(b);
    expect(a).toContain('{"a":2,"b":1}');
  });

  it("survives a React element in args", () => {
    const el = { $$typeof: Symbol.for("react.element"), type: "div" };
    expect(() => jsxFromArgs("Card", { header: el })).not.toThrow();
    expect(jsxFromArgs("Card", { header: el })).toContain("ReactNode");
  });

  it("orders props by the manifest, then alphabetically", () => {
    const jsx = jsxFromArgs("Button", { zeta: "z", size: "md", intent: "primary", alpha: "a" }, [
      "intent",
      "size",
    ]);
    expect(jsx).toBe('<Button intent="primary" size="md" alpha="a" zeta="z" />');
  });

  it("breaks onto multiple lines past the width limit", () => {
    const jsx = jsxFromArgs("Button", {
      intent: "destructive-ghost",
      size: "lg",
      icon: "arrow-right",
      iconPosition: "right",
      children: "A reasonably long button label here",
    });
    expect(jsx.split("\n").length).toBeGreaterThan(1);
  });
});

describe("formats", () => {
  const entry = byName("Button");

  it("jsx returns only the snippet", () => {
    const { text } = buildAiContext(
      { entry, liveArgs: { children: "Save", intent: "primary" } },
      "jsx",
    );
    expect(text.trim()).toBe('<Button intent="primary">Save</Button>');
  });

  it("prompt-url is short and points at the fetchable spec", () => {
    const { text, approxTokens } = buildAiContext({ entry, meta: META }, "prompt-url");
    expect(text).toContain("https://uiorganized.com/ai/Button.md");
    expect(text).toContain("Do not invent props");
    expect(approxTokens).toBeLessThan(120);
  });

  it("prompt-url degrades to the import when no URL is known", () => {
    const { text } = buildAiContext({ entry }, "prompt-url");
    expect(text).toContain(entry.importStatement);
  });
});

describe("usage guidance", () => {
  const entry = byName("Button");
  const guide = USAGE_GUIDES.button!;

  it("has a guide to render", () => {
    expect(guide).toBeDefined();
  });

  it("carries the boundaries the prop table can't express", () => {
    const { text, data } = buildAiContext({ entry, usage: guide, meta: META });
    expect(text).toContain("## When to use");
    expect(text).toContain("## When NOT to use: pick a different component");
    expect(text).toContain("## Accessibility obligations");
    expect(text).toContain(guide.useWhen[0]);
    expect(data.usage).toBe(guide);
  });

  it("names the replacement component, not its slug", () => {
    const { text } = buildAiContext({ entry, usage: guide, meta: META });
    // `instead: ["switch", "toggle"]` has to read as the symbols you'd import.
    expect(text).toContain("`Switch`");
    expect(text).not.toContain("radio-group");
  });

  it("places the guidance before the props, where it can still change the choice", () => {
    const { text } = buildAiContext({ entry, usage: guide, meta: META });
    expect(text.indexOf("## When NOT to use")).toBeLessThan(text.indexOf("## Props"));
  });

  it("changes nothing for an entry with no guide", () => {
    const before = buildAiContext({ entry, meta: META }).text;
    const after = buildAiContext({ entry, usage: undefined, meta: META }).text;
    expect(after).toBe(before);
    expect(before).not.toContain("## When to use");
  });
});

describe("helpers", () => {
  it("packageFromImport reads the specifier", () => {
    expect(packageFromImport("import { Button } from '@ui-organized/react';")).toBe(
      "@ui-organized/react",
    );
    expect(packageFromImport("nonsense")).toBe("@ui-organized/react");
  });

  it("humanizeLabel makes a caption from a story export name", () => {
    expect(humanizeLabel("AllIntents")).toBe("All intents");
    expect(humanizeLabel("WithIcon")).toBe("With icon");
  });
});

describe("browser safety", () => {
  /** Type-only imports are erased by the bundler, so they can't drag Node in. */
  const stripTypeImports = (source: string): string =>
    source.replace(/import\s+type\s+[^;]*?from\s+["'][^"']+["']\s*;?/g, "");

  /** Follow runtime relative imports from a module and collect every source file. */
  function transitiveSources(entryFile: string): string[] {
    const seen = new Set<string>();
    const queue = [entryFile];
    while (queue.length) {
      const file = queue.pop()!;
      if (seen.has(file) || !existsSync(file)) continue;
      seen.add(file);
      const source = stripTypeImports(readFileSync(file, "utf8"));
      for (const m of source.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
        // Sources are authored with the `.js` extension for Node ESM.
        queue.push(resolve(dirname(file), m[1]!.replace(/\.js$/, ".ts")));
      }
    }
    return [...seen];
  }

  it("browser.ts pulls in no Node built-ins", () => {
    // One stray `node:fs` anywhere in this graph breaks the Storybook manager
    // bundle and the marketing build, and it would do so at bundle time with a
    // message that doesn't name this file.
    const files = transitiveSources(join(SRC, "browser.ts"));
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      expect(stripTypeImports(readFileSync(file, "utf8")), file).not.toMatch(/from\s+["']node:/);
    }
  });

  it("would catch a real Node import (guards the guard)", () => {
    // The crawler is only useful if it actually reaches the leaves; prove it by
    // pointing it at a module that legitimately uses node:fs.
    const files = transitiveSources(join(SRC, "mcp/manifest-loader.ts"));
    const offenders = files.filter((f) =>
      /from\s+["']node:/.test(stripTypeImports(readFileSync(f, "utf8"))),
    );
    expect(offenders.length).toBeGreaterThan(0);
  });
});
