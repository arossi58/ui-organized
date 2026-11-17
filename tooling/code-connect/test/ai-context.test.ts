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
import { derivePropHints } from "../src/ai-context-rules.js";
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
      // Storybook lists a few icon names as control options. `IconName` is open,
      // so they must not come out as "exactly these values".
      typeValues: {
        IconName: ["plus", "arrow-right", "download", "trash", "edit", "check", "close"],
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
      // Outside code spans: a referenced type may well have a member named
      // `draft` (the table's `EditState` does), and that isn't the status.
      const prose = text.replace(/`[^`\n]*`/g, "");
      expect(prose.toLowerCase(), entry.codeName).not.toContain("draft");
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
      { name: "size", type: "ControlSize", required: false },
      { ControlSize: ["sm", "md", "lg"] },
    );
    expect(values).toEqual(["sm", "md", "lg"]);
  });

  it("never closes an open type, alone or as a union arm", () => {
    const typeValues = { IconName: ["plus", "trash"] };
    expect(
      expandPropType({ name: "name", type: "IconName", required: false }, typeValues).values,
    ).toBeUndefined();
    expect(
      expandPropType(
        { name: "icon", type: "IconName | IconComponent", required: false },
        typeValues,
      ).values,
    ).toBeUndefined();
  });

  it("renders a long union as a fenced block, not a table cell", () => {
    const long = Array.from({ length: 40 }, (_, i) => `tone-${i}`);
    const { text } = buildAiContext({
      entry: {
        ...byName("Button"),
        props: [...byName("Button").props, { name: "tone", type: "ToneName", required: false }],
      },
      typeValues: { ToneName: long },
    });
    expect(text).toContain("is one of exactly these 40 values");
    expect(text).toContain("tone-39");
  });
});

describe("referenced types", () => {
  it("writes out Select's option type right after its prop table", () => {
    const { text, data } = buildAiContext({ entry: byName("Select") });
    const line = "- `SelectOption` is `{ value: string; label: string; disabled?: boolean }`";
    expect(text).toContain(`The types named above:\n\n${line}`);
    expect(data.referencedTypes).toEqual({ SelectOption: "{ value: string; label: string; disabled?: boolean }" });
    // After the table, before the pass-through note that closes the section.
    expect(text.indexOf(line)).toBeGreaterThan(text.indexOf("| `options` |"));
    expect(text.indexOf(line)).toBeLessThan(text.indexOf("Beyond the props above"));
  });

  const entryWith = (props: ComponentManifestEntry["props"], referencedTypes: Record<string, string>) => ({
    ...byName("Select"),
    props,
    referencedTypes,
  });

  it("follows the types a shape names, and leaves out ones no shown prop reaches", () => {
    const { data } = buildAiContext({
      entry: entryWith([{ name: "steps", type: "TourStep[]", required: true }], {
        TourStep: "{ title: string; actions?: TourStepAction[] }",
        TourStepAction: "{ label: string }",
        Unrelated: "{ x: number }",
      }),
    });
    expect(Object.keys(data.referencedTypes!)).toEqual(["TourStep", "TourStepAction"]);
  });

  it("doesn't repeat a type the table already expands", () => {
    const { text, data } = buildAiContext({
      entry: entryWith([{ name: "size", type: "ControlSize", required: false }], { ControlSize: '"sm" | "md"' }),
      typeValues: { ControlSize: ["sm", "md"] },
    });
    expect(data.referencedTypes).toBeUndefined();
    expect(text).not.toContain("The types named above");
  });

  it("isn't fooled by a type name inside a string literal", () => {
    const { data } = buildAiContext({
      entry: entryWith([{ name: "mode", type: '"Row" | "cell"', required: false }], { Row: "{ id: string }" }),
    });
    expect(data.referencedTypes).toBeUndefined();
  });

  it("keeps a template literal type readable inside a code span", () => {
    // `data-${string}`, spelled so it isn't read as a template placeholder.
    const shape = "{ [key: `data-$" + "{string}`]: string }";
    const { text } = buildAiContext({
      entry: entryWith([{ name: "attrs", type: "DataAttrs", required: false }], { DataAttrs: shape }),
    });
    expect(text).toContain(`- \`DataAttrs\` is \`\` ${shape} \`\``);
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

  it("names cross-references as the target library exports them", () => {
    const angular = { framework: "angular" as const, symbol: "UioButton" };
    const surface = {
      exports: ["UioButton", "UioSwitch", "UioMenu", "UioToolbar", "UioTag"],
      selectors: {
        UioButton: { element: "button", attribute: "uioButton" },
        UioSwitch: { element: "uio-switch" },
        UioMenu: { element: "uio-menu" },
        UioToolbar: { element: "div", attribute: "uioToolbar" },
        UioTag: { element: "span", attribute: "uioTag" },
      },
    };
    const { text } = buildAiContext({ entry, usage: guide, target: angular, surface });
    // A shipped neighbour under its own name; one the surface lacks is left out
    // rather than named under React's.
    expect(text).toContain("Use `UioSwitch` instead.");
    expect(text).not.toContain("Toggle`");
    // Without a surface, the library's prefix is still applied.
    expect(buildAiContext({ entry, usage: guide, target: angular }).text).toContain(
      "Use `UioSwitch` or `UioToggle` instead.",
    );
  });
});

/**
 * One guide reaches all four libraries' specs and the docs site's Usage tab
 * unchanged, so React's spelling in it is wrong three times out of four:
 * "pass one to `render`" sent Vue agents to a prop Vue doesn't have.
 */
describe("usage guides are written for every library", () => {
  const REACT_SYNTAX: [string, RegExp][] = [
    ["a JSX expression attribute", /=\{/],
    ["`className`", /\bclassName\b/],
    ["`onClick`", /\bonClick\b/],
    ["React's `render` prop", /`render`/],
    ["a JSX component tag", /<[A-Z][A-Za-z]*[\s/>]/],
  ];

  function strings(value: unknown): string[] {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return value.flatMap(strings);
    if (value && typeof value === "object") return Object.values(value).flatMap(strings);
    return [];
  }

  const offenders = (text: string) =>
    REACT_SYNTAX.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);

  it("contains no React-only syntax", () => {
    const found = Object.entries(USAGE_GUIDES).flatMap(([slug, guide]) =>
      strings(guide).flatMap((text) => offenders(text).map((label) => `${slug}: ${label} in "${text}"`)),
    );
    expect(found).toEqual([]);
  });

  it("would catch the sentences that shipped (guards the guard)", () => {
    expect(offenders("so pass one to `render` to keep the button's appearance")).toEqual(["React's `render` prop"]);
    expect(offenders("and `animated={false}` turns it off outright")).toEqual(["a JSX expression attribute"]);
    expect(offenders("wrap it in `<Tooltip>`")).toEqual(["a JSX component tag"]);
  });
});

describe("derivePropHints per library", () => {
  const button = byName("Button");
  const iconHint = (framework?: "react" | "svelte" | "vue" | "angular") =>
    derivePropHints(button, framework).find((hint) => hint.startsWith("`icon`"))!;

  it("writes the icon component in each library's binding syntax", () => {
    expect(iconHint()).toContain("`icon={CircleAlert}`");
    expect(iconHint("svelte")).toContain("`icon={CircleAlert}`");
    expect(iconHint("vue")).toContain('`:icon="CircleAlert"`');
    expect(iconHint("vue")).not.toContain("={");
    // Angular takes a name only.
    expect(iconHint("angular")).toContain('`icon="circle-alert"`');
    expect(iconHint("angular")).not.toContain("={");
  });

  it("gives a name pair every library's Lucide and Tabler adapters ship, and no Heroicons", () => {
    for (const framework of ["react", "svelte", "vue", "angular"] as const) {
      expect(iconHint(framework)).toContain('Lucide `"circle-alert"` is Tabler\'s `"alert-circle"`');
      expect(iconHint(framework)).not.toMatch(/heroicons/i);
    }
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

describe("buildAiContext — other frameworks", () => {
  const button = byName("Button");
  const svelte = { framework: "svelte" as const, symbol: "Button" };
  const vue = { framework: "vue" as const, symbol: "Button" };
  const angular = {
    framework: "angular" as const,
    symbol: "UioButton",
    selector: { element: "button", attribute: "uioButton" },
    inputs: ["intent", "size", "class", "loading"],
    outputs: [],
  };

  it("imports from the framework's own package, never React's", () => {
    for (const target of [svelte, vue]) {
      const { text, data } = buildAiContext({ entry: button, target }, "markdown");
      expect(data.package).toBe(`@ui-organized/${target.framework}`);
      expect(text).toContain(`import { Button } from "@ui-organized/${target.framework}";`);
      expect(text).not.toContain("@ui-organized/react");
    }
  });

  it("writes the current state in the framework's markup", () => {
    const liveArgs = { children: "Save", intent: "primary" };
    expect(buildAiContext({ entry: button, target: vue, liveArgs }, "jsx").text).toBe(
      '<Button intent="primary">Save</Button>\n',
    );
    expect(buildAiContext({ entry: button, target: angular, liveArgs }, "jsx").text).toBe(
      '<button uioButton intent="primary">Save</button>\n',
    );
  });

  it("never falls back to the React usage snippet", () => {
    const { data } = buildAiContext({ entry: button, target: svelte });
    expect(data.examples).toEqual([]);
  });

  it("lists Angular's real inputs, with React's types where the names match", () => {
    const { text, data } = buildAiContext({ entry: button, target: angular });
    expect(data.component).toBe("UioButton");
    expect(data.props.map((p) => p.name)).toEqual(["intent", "size", "loading"]);
    expect(data.props[0]!.type).toBe(button.props.find((p) => p.name === "intent")!.type);
    expect(text).toContain("## Inputs — complete (3 own inputs)");
    expect(text).toContain("This directive declares no outputs.");
    expect(text).toContain("`<button uioButton>`");
  });

  it("names the library's conventions", () => {
    expect(buildAiContext({ entry: button, target: vue }).text).toContain("@value-change");
    expect(buildAiContext({ entry: button, target: svelte }).text).toContain("bind:value");
  });

  it("leaves React output unchanged when the target is React", () => {
    const plain = buildAiContext({ entry: button, meta: META });
    const targeted = buildAiContext({
      entry: button,
      meta: META,
      target: { framework: "react", symbol: "Button" },
    });
    expect(targeted.text).toBe(plain.text);
  });
});
