/**
 * Per-framework samples.
 *
 * Two things are being defended here. First, that the derived Svelte/Vue/Angular
 * samples are actually valid in those frameworks — the syntax differences are
 * small enough to be plausible and wrong. Second, that coverage is honest: a
 * component a framework does not export must resolve to nothing, because the
 * only alternative anyone reaches for is showing React's sample under another
 * framework's name.
 */
import { describe, it, expect } from "vitest";
import { jsxFromArgs } from "../src/ai-context.js";
import {
  DOC_FRAMEWORKS,
  FRAMEWORK_INFO,
  frameworkSample,
  frameworkSymbol,
  frameworkUsage,
  importStatement,
  isDocFramework,
  parseAngularInputs,
  parseAngularSelectors,
  parseBarrelExports,
  resolveTarget,
  unsupportedArgs,
  type FrameworkSurface,
  type FrameworkTarget,
} from "../src/frameworks.js";

const SVELTE: FrameworkSurface = { exports: ["Button", "Card", "CardHeader", "IconProvider"] };
const VUE: FrameworkSurface = { exports: ["Button", "Icon", "IconProvider"] };
const ANGULAR: FrameworkSurface = {
  exports: ["UioButton", "UioTag", "UioCard", "UioSkeleton"],
  selectors: {
    UioButton: { element: "button", attribute: "uioButton" },
    UioTag: { element: "span", attribute: "uioTag" },
    UioCard: { element: "div", attribute: "uioCard" },
  },
  inputs: {
    UioButton: ["intent", "size", "disabled", "items", "label", "class"],
    UioTag: ["size"],
    UioCard: [],
  },
};

function target(framework: FrameworkTarget["framework"], codeName: string): FrameworkTarget {
  const surface = framework === "angular" ? ANGULAR : framework === "vue" ? VUE : SVELTE;
  const resolved = resolveTarget(framework, codeName, surface);
  if (!resolved) throw new Error(`${codeName} is not in the ${framework} fixture`);
  return resolved;
}

describe("the framework set", () => {
  it("names a package and a language for every framework", () => {
    for (const framework of DOC_FRAMEWORKS) {
      expect(FRAMEWORK_INFO[framework].packageName).toMatch(/^@ui-organized\//);
      expect(FRAMEWORK_INFO[framework].language).toBeTruthy();
    }
  });

  it("rejects anything that isn't one", () => {
    expect(isDocFramework("svelte")).toBe(true);
    expect(isDocFramework("solid")).toBe(false);
    expect(isDocFramework(undefined)).toBe(false);
  });
});

describe("reading a package's public surface", () => {
  it("takes value exports and leaves type exports alone", () => {
    const barrel = `
      export { Button } from "./components/Button/index.js";
      export type { ButtonProps } from "./components/Button/index.js";
      export {
        Card, CardHeader, CardBody,
      } from "./components/Card/index.js";
      export { default as IconProvider } from "./context/IconProvider.svelte";
      export { UioTag, type TagVariant } from "./lib/tag/tag.js";
    `;
    expect(parseBarrelExports(barrel)).toEqual([
      "Button",
      "Card",
      "CardHeader",
      "CardBody",
      "IconProvider",
      "UioTag",
    ]);
    expect(parseBarrelExports(barrel)).not.toContain("ButtonProps");
    expect(parseBarrelExports(barrel)).not.toContain("TagVariant");
  });

  it("reads a directive's real inputs, alias included", () => {
    const source = `
      @Directive({ selector: "label[uioSwitch]" })
      export class UioSwitch {
        readonly checked = model(false);
        readonly label = input<string | undefined>(undefined);
        // Written \`aria-label\` in a template, not \`ariaLabel\`.
        readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });
        protected readonly disabledInput = input(false, { alias: "disabled" });
      }

      @Directive({ selector: "[uioCardHeader]" })
      export class UioCardHeader {}
    `;
    expect(parseAngularInputs([source])).toEqual({
      UioSwitch: ["checked", "label", "aria-label", "disabled"],
      // Present and empty, not absent: a directive that takes no props is not
      // the same as one this parse never saw, and only the second means
      // "don't filter".
      UioCardHeader: [],
    });
  });

  it("reads the host element out of an Angular selector", () => {
    const source = `
      @Directive({
        selector: "button[uioButton], a[uioButton]",
        standalone: true,
      })
      export class UioButton {}

      @Directive({ selector: "[uioCard]", standalone: true })
      export class UioCard {}

      @Directive({ selector: "[uioCardHeader]", standalone: true })
      export class UioCardHeader {}
    `;
    expect(parseAngularSelectors([source])).toEqual({
      // The first alternative wins; `<button uioButton>` is the canonical form.
      UioButton: { element: "button", attribute: "uioButton" },
      // A bare attribute selector matches any element, so a sample has to pick
      // one — `div`, not a `<uio-card>` element that does not exist.
      UioCard: { element: "div", attribute: "uioCard" },
      UioCardHeader: { element: "div", attribute: "uioCardHeader" },
    });
  });

  it("reads a component that is its own element, and gives it no attribute", () => {
    // The overlays are written this way — they own the host that projects their
    // content. Rejecting the form made nine shipped, parity-tested components
    // read as "not available in Angular" on their own docs pages.
    const source = `
      @Component({ selector: "uio-dialog", standalone: true })
      export class UioDialog {}

      @Component({ selector: "uio-toast-region", standalone: true })
      export class UioToastRegion {}
    `;
    expect(parseAngularSelectors([source])).toEqual({
      UioDialog: { element: "uio-dialog" },
      UioToastRegion: { element: "uio-toast-region" },
    });
  });
});

describe("coverage", () => {
  it("matches an Angular export that differs only in the casing of an initialism", () => {
    // Angular's style guide capitalises an initialism as a word, so `QRCode` is
    // `UioQrCode`. Treating that as absent printed "not available in Angular"
    // over a component the parity gate compares against React on every run.
    const surface: FrameworkSurface = {
      exports: ["UioQrCode"],
      selectors: { UioQrCode: { element: "div", attribute: "uioQrCode" } },
    };
    expect(resolveTarget("angular", "QRCode", surface)?.symbol).toBe("UioQrCode");
  });

  it("follows the alias for a component Angular composes differently", () => {
    // `ToastProvider` has no Angular counterpart by design: the provider is a
    // root-injected service, and what a template writes is the region.
    const surface: FrameworkSurface = {
      exports: ["UioToaster", "UioToastRegion"],
      selectors: { UioToastRegion: { element: "uio-toast-region" } },
    };
    expect(resolveTarget("angular", "ToastProvider", surface)?.symbol).toBe("UioToastRegion");
  });

  it("still reports a class with no selector as unavailable", () => {
    // A service, a context or a token — something no template ever writes, so
    // there is no sample to generate for it.
    const surface: FrameworkSurface = { exports: ["UioToaster"], selectors: {} };
    expect(resolveTarget("angular", "Toaster", surface)).toBeUndefined();
  });

  it("prefixes Angular symbols and leaves the others alone", () => {
    expect(frameworkSymbol("angular", "Button")).toBe("UioButton");
    expect(frameworkSymbol("svelte", "Button")).toBe("Button");
    expect(frameworkSymbol("vue", "RadioGroup")).toBe("RadioGroup");
  });

  it("resolves a component the framework exports", () => {
    expect(resolveTarget("svelte", "Button", SVELTE)).toEqual({
      framework: "svelte",
      symbol: "Button",
    });
    expect(resolveTarget("angular", "Tag", ANGULAR)).toEqual({
      framework: "angular",
      symbol: "UioTag",
      selector: { element: "span", attribute: "uioTag" },
      inputs: ["size"],
    });
  });

  it("returns nothing for a component the framework does not ship", () => {
    // The whole point: no fallback to React, no nearest match. A caller that
    // gets `undefined` has to say so on the page.
    expect(resolveTarget("svelte", "Carousel", SVELTE)).toBeUndefined();
    expect(resolveTarget("vue", "Card", VUE)).toBeUndefined();
    expect(resolveTarget("angular", "Accordion", ANGULAR)).toBeUndefined();
  });

  it("returns nothing for an Angular export with no parsed selector", () => {
    // Exported but unparsed means we do not know which element it attaches to,
    // and a guessed `<div uioSkeleton>` on something that is really a `<span>`
    // is a sample that renders wrong with no error.
    expect(resolveTarget("angular", "Skeleton", ANGULAR)).toBeUndefined();
  });
});

describe("usage", () => {
  const args = { intent: "primary", size: "md", disabled: true, children: "Save" };
  const order = ["intent", "size", "disabled"];

  it("renders Svelte with a bare boolean and unquoted braces", () => {
    expect(frameworkUsage(target("svelte", "Button"), args, order)).toBe(
      '<Button intent="primary" size="md" disabled>Save</Button>',
    );
  });

  it("renders Vue with kebab-cased props and bound literals", () => {
    expect(frameworkUsage(target("vue", "Button"), args, order)).toBe(
      '<Button intent="primary" size="md" :disabled="true">Save</Button>',
    );
    expect(frameworkUsage(target("vue", "Button"), { iconPosition: "right" })).toBe(
      '<Button icon-position="right" />',
    );
  });

  it("puts the Angular directive on the caller's own element", () => {
    // Not `<uio-button>`: these are attribute directives, and a custom element
    // that does not exist renders as an unstyled unknown tag with no error.
    expect(frameworkUsage(target("angular", "Button"), args, order)).toBe(
      '<button uioButton intent="primary" size="md" [disabled]="true">Save</button>',
    );
  });

  it("never self-closes an Angular element", () => {
    // `<span uioTag />` is parsed as an unclosed `<span>` that swallows the rest
    // of the template.
    expect(frameworkUsage(target("angular", "Tag"), { size: "sm" })).toBe(
      '<span uioTag size="sm"></span>',
    );
    expect(frameworkUsage(target("angular", "Card"), {})).toBe("<div uioCard></div>");
  });

  it("spells Vue's IconProvider style prop icon-style", () => {
    // Vue reserves `style`: a `style="solid"` arrives as a parsed style object,
    // which is truthy, is not "solid", and renders outline icons silently.
    expect(frameworkUsage(target("vue", "IconProvider"), { style: "solid" })).toBe(
      '<IconProvider icon-style="solid" />',
    );
    // Every other framework keeps the React spelling.
    expect(frameworkUsage(target("svelte", "IconProvider"), { style: "solid" })).toBe(
      '<IconProvider style="solid" />',
    );
  });

  it("writes className as class outside React", () => {
    expect(frameworkUsage(target("svelte", "Button"), { className: "wide" })).toBe(
      '<Button class="wide" />',
    );
    expect(frameworkUsage(target("vue", "Button"), { className: "wide" })).toBe(
      '<Button class="wide" />',
    );
  });

  it("serializes object args as a template expression, not JSON", () => {
    // Single-quoted strings on purpose: the literal lands inside a
    // double-quoted attribute, where a JSON double quote would close it and
    // truncate the sample.
    const items = [{ value: "a", label: "A" }];
    expect(frameworkUsage(target("vue", "Button"), { items })).toBe(
      `<Button :items="[{ label: 'A', value: 'a' }]" />`,
    );
    expect(frameworkUsage(target("angular", "Button"), { items })).toBe(
      `<button uioButton [items]="[{ label: 'A', value: 'a' }]"></button>`,
    );
    expect(frameworkUsage(target("svelte", "Button"), { items })).toBe(
      `<Button items={[{ label: 'A', value: 'a' }]} />`,
    );
  });

  it("marks unprintable children as a comment the dialect understands", () => {
    const node = { $$typeof: Symbol.for("react.element"), type: "div" };
    expect(frameworkUsage(target("svelte", "Card"), { children: node })).toBe(
      "<Card><!-- content --></Card>",
    );
    expect(frameworkUsage(target("angular", "Card"), { children: node })).toBe(
      "<div uioCard><!-- content --></div>",
    );
  });

  it("notes dropped handlers as a comment, not a JS line comment", () => {
    const usage = frameworkUsage(target("svelte", "Button"), {
      children: "Go",
      onclick: () => {},
    });
    expect(usage).toBe("<Button>Go</Button>\n<!-- + your own event handlers -->");
  });

  it("escapes a quote rather than closing the attribute early", () => {
    expect(frameworkUsage(target("vue", "Button"), { label: 'a "quoted" word' })).toBe(
      '<Button label="a &quot;quoted&quot; word" />',
    );
  });

  it("drops an arg the component has no input for", () => {
    // Angular\'s UioTag in this fixture only takes `size`. An `intent` attribute
    // on a real `<span>` is not an error, not a warning, and has no effect —
    // exactly the failure a reader would never catch.
    expect(frameworkUsage(target("angular", "Tag"), { intent: "primary", size: "sm" })).toBe(
      '<span uioTag size="sm"></span>',
    );
  });

  it("reports which args were dropped, so a caller can refuse to render", () => {
    expect(unsupportedArgs(target("angular", "Tag"), { intent: "primary", size: "sm" })).toEqual([
      "intent",
    ]);
    expect(unsupportedArgs(target("angular", "Button"), { intent: "primary" })).toEqual([]);
    // No inputs known for a framework means "do not filter", not "takes nothing".
    expect(unsupportedArgs(target("svelte", "Button"), { anything: 1 })).toEqual([]);
  });

  it("filters on the name the framework actually uses", () => {
    // `className` is `class` in the template, and that is the name the input
    // list carries.
    expect(unsupportedArgs(target("angular", "Button"), { className: "wide" })).toEqual([]);
  });

  it("agrees with jsxFromArgs for React", () => {
    // The switcher must not change what the React docs have always shown.
    const cases: Array<Record<string, unknown>> = [
      args,
      { className: "wide", children: 3 },
      { config: { b: 1, a: 2 } },
      { children: { $$typeof: Symbol.for("react.element"), type: "div" } },
      { onClick: () => {}, children: "Go" },
      {
        intent: "destructive-ghost",
        size: "lg",
        icon: "arrow-right",
        iconPosition: "right",
        children: "A reasonably long button label here",
      },
    ];
    for (const c of cases) {
      expect(frameworkUsage({ framework: "react", symbol: "Button" }, c, order)).toBe(
        jsxFromArgs("Button", c, order),
      );
    }
  });
});

describe("complete samples", () => {
  it("wraps Svelte in a script block", () => {
    expect(frameworkSample(target("svelte", "Button"), { children: "Save" })).toBe(
      [
        '<script lang="ts">',
        '  import { Button } from "@ui-organized/svelte";',
        "</script>",
        "",
        "<Button>Save</Button>",
      ].join("\n"),
    );
  });

  it("wraps Vue in script setup plus a template", () => {
    expect(frameworkSample(target("vue", "Button"), { children: "Save" })).toBe(
      [
        '<script setup lang="ts">',
        'import { Button } from "@ui-organized/vue";',
        "</script>",
        "",
        "<template>",
        "  <Button>Save</Button>",
        "</template>",
      ].join("\n"),
    );
  });

  it("wraps Angular in a standalone component that imports the directive", () => {
    // Without the `imports` array the directive silently does nothing — the
    // element renders, unstyled, and nothing reports a problem.
    const sample = frameworkSample(target("angular", "Button"), { children: "Save" });
    expect(sample).toContain('import { Component } from "@angular/core";');
    expect(sample).toContain('import { UioButton } from "@ui-organized/angular";');
    expect(sample).toContain("imports: [UioButton],");
    expect(sample).toContain("<button uioButton>Save</button>");
  });

  it("lets React keep the manifest's own import line", () => {
    const sample = frameworkSample(
      { framework: "react", symbol: "Button" },
      { children: "Save" },
      [],
      { importStatement: "import { Button } from '@ui-organized/react';" },
    );
    expect(sample).toBe("import { Button } from '@ui-organized/react';\n\n<Button>Save</Button>");
  });

  it("builds an import line per framework", () => {
    expect(importStatement("svelte", ["Button"])).toBe(
      'import { Button } from "@ui-organized/svelte";',
    );
    expect(importStatement("angular", ["UioCard", "UioCardHeader"])).toBe(
      'import { UioCard, UioCardHeader } from "@ui-organized/angular";',
    );
  });
});
