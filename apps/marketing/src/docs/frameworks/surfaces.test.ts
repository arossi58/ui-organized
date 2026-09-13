/**
 * Framework coverage and the samples derived from it, against the real packages
 * and the real story files.
 *
 * Deliberately not a fixture. The thing being defended is that the docs site's
 * claim about a component ("available in Svelte", "no Angular version yet") is
 * true of the library as it is right now, and a fixture would keep passing after
 * someone added or removed a component.
 *
 * The expected component lists below are floors, not equalities: Svelte and Vue
 * are being extended while this runs, and a test that fails because the library
 * grew is a test that gets deleted. What must not change silently is a framework
 * claiming a component it does not export, which the subset and gap assertions
 * catch either way.
 */
import { describe, it, expect } from "vitest";
import { DOC_FRAMEWORKS, type DocFramework } from "@ui-organized/code-connect/browser";
import { docsComponents, getDocsComponent, inspectStory } from "../registry";
import { coverageOf, frameworkSurfaces, targetFor } from "./surfaces";
import { exampleSnippet, gapFor, primarySnippet, reactExampleCode } from "./sample";

/** Documented components a framework ships, by manifest code name. */
function coveredNames(framework: DocFramework): string[] {
  return docsComponents
    .filter((c) => targetFor(framework, c.codeName))
    .map((c) => c.codeName!)
    .sort();
}

// `Field` is in both libraries but has no story file, so it has no docs page.
const SHARED = [
  "Accordion",
  "Avatar",
  "Button",
  "Card",
  "Checkbox",
  "Combobox",
  "Dialog",
  "Divider",
  "FieldError",
  "Icon",
  "Input",
  "Menu",
  "Popover",
  "Progress",
  "RadioGroup",
  "Select",
  "Skeleton",
  "Switch",
  "Tabs",
  "Tag",
  "TextArea",
  "ToastProvider",
  "Tooltip",
];

const ANGULAR = [
  "Alert",
  "Button",
  "Card",
  "Divider",
  "FieldError",
  "Icon",
  "Skeleton",
  "Switch",
  "Tag",
];

describe("coverage read from the packages", () => {
  it("reads every framework's public surface", () => {
    for (const framework of DOC_FRAMEWORKS) {
      expect(frameworkSurfaces[framework].exports.length, framework).toBeGreaterThan(5);
    }
    // If this is empty the Angular samples would fall back to `<div uioX>` for
    // everything, or vanish — either way the glob has stopped finding the
    // package and the page would be quietly wrong rather than broken.
    expect(Object.keys(frameworkSurfaces.angular.selectors ?? {}).length).toBeGreaterThan(5);
  });

  it("covers every documented component in React", () => {
    const uncovered = docsComponents
      .filter((c) => c.codeName && !targetFor("react", c.codeName))
      .map((c) => c.name);
    expect(uncovered).toEqual([]);
  });

  it("ships the Svelte and Vue components the packages export", () => {
    expect(coveredNames("svelte")).toEqual(expect.arrayContaining(SHARED));
    expect(coveredNames("vue")).toEqual(expect.arrayContaining(SHARED));
  });

  it("ships the nine Angular components", () => {
    expect(coveredNames("angular")).toEqual(expect.arrayContaining(ANGULAR));
  });

  it("never claims a component React does not have", () => {
    const react = new Set(coveredNames("react"));
    for (const framework of DOC_FRAMEWORKS) {
      for (const name of coveredNames(framework)) {
        expect(react.has(name), `${framework} claims ${name}`).toBe(true);
      }
    }
  });

  it("counts coverage off the live registry", () => {
    const angular = coverageOf("angular");
    expect(angular.covered).toBe(coveredNames("angular").length);
    expect(angular.total).toBe(docsComponents.filter((c) => c.codeName).length);
    expect(coverageOf("react").covered).toBe(angular.total);
    expect(angular.covered).toBeLessThan(angular.total);
  });
});

/**
 * Taken off the live registry, not named.
 *
 * This block used to hardcode `accordion` as the component Angular does not
 * ship. Angular shipped it, and the block then failed for the one reason this
 * file's header says it must not: the library grew. Picking whatever is still
 * missing keeps the assertion about the *behaviour* — an uncovered component
 * resolves to nothing rather than falling back to React — instead of about one
 * component's status on the day it was written.
 *
 * When Angular ships everything there is nothing left to assert and this skips,
 * which is the right signal rather than a failure.
 */
const unshipped = docsComponents.find(
  (c) => c.codeName && inspectStory(c) && !targetFor("angular", c.codeName),
);

describe.skipIf(!unshipped)("a component a framework does not ship", () => {
  const missing = unshipped!;
  const story = inspectStory(missing)!;

  it("resolves to nothing rather than to React", () => {
    expect(targetFor("angular", missing.codeName)).toBeUndefined();
  });

  it("shows no sample at all — never React's under an Angular label", () => {
    // The whole reason the switcher needs coverage: a mislabelled sample is
    // worse than a missing one, because a reader cannot tell it is wrong.
    expect(primarySnippet(missing, story, "angular")).toBeUndefined();
    for (const example of missing.stories) {
      expect(exampleSnippet(missing, example, "angular")).toBeUndefined();
    }
  });

  it("says so, with what the library does cover", () => {
    const gap = gapFor(missing, story, "angular")!;
    expect(gap.reason).toBe("missing-component");
    expect(gap.packageName).toBe("@ui-organized/angular");
    if (gap.reason !== "missing-component") throw new Error("unreachable");
    expect(gap.covered).toBeLessThan(gap.total);
  });

  it("reports no gap where the framework does ship it", () => {
    const accordion = getDocsComponent("accordion")!;
    const accordionStory = inspectStory(accordion)!;
    expect(gapFor(accordion, accordionStory, "svelte")).toBeUndefined();
    expect(gapFor(accordion, accordionStory, "react")).toBeUndefined();
    const button = getDocsComponent("button")!;
    expect(gapFor(button, inspectStory(button)!, "angular")).toBeUndefined();
  });
});

describe("an example the framework's component cannot express", () => {
  // Angular's `UioSwitch` has no `defaultChecked` — `model()` is uncontrolled
  // until something binds it, so the controlled/uncontrolled fork React
  // implements by hand does not arise. The story that sets it therefore has no
  // Angular form, and a sample with the prop dropped would sit under a "Checked"
  // heading showing a switch that is not.
  const switchDocs = getDocsComponent("switch")!;
  const checked = switchDocs.stories.find((s) => "defaultChecked" in s.args)!;

  it("has such a story to test against", () => {
    expect(checked).toBeDefined();
    expect(targetFor("angular", switchDocs.codeName)).toBeDefined();
  });

  it("shows no sample rather than one missing the prop", () => {
    expect(exampleSnippet(switchDocs, checked, "angular")).toBeUndefined();
    expect(primarySnippet(switchDocs, checked, "angular")).toBeUndefined();
  });

  it("names the prop instead of blaming the whole component", () => {
    const gap = gapFor(switchDocs, checked, "angular")!;
    expect(gap.reason).toBe("unsupported-props");
    if (gap.reason !== "unsupported-props") throw new Error("unreachable");
    expect(gap.symbol).toBe("UioSwitch");
    expect(gap.props).toContain("defaultChecked");
  });

  it("leaves the component's other examples alone", () => {
    const canonical = inspectStory(switchDocs)!;
    expect(primarySnippet(switchDocs, canonical, "angular")!.code).toContain("<label uioSwitch");
  });
});

describe("derived samples", () => {
  const button = getDocsComponent("button")!;
  const inspect = inspectStory(button)!;

  it("imports from the right package in each framework", () => {
    expect(primarySnippet(button, inspect, "svelte")!.code).toContain(
      'import { Button } from "@ui-organized/svelte";',
    );
    expect(primarySnippet(button, inspect, "vue")!.code).toContain(
      'import { Button } from "@ui-organized/vue";',
    );
    expect(primarySnippet(button, inspect, "angular")!.code).toContain(
      'import { UioButton } from "@ui-organized/angular";',
    );
    expect(primarySnippet(button, inspect, "react")!.code).toContain("@ui-organized/react");
  });

  it("writes Angular as a directive on a real button", () => {
    const angular = primarySnippet(button, inspect, "angular")!;
    expect(angular.code).toContain("<button uioButton");
    expect(angular.code).not.toContain("<uio-button");
    expect(angular.language).toBe("ts");
  });

  it("carries the canonical args into every framework", () => {
    for (const framework of DOC_FRAMEWORKS) {
      expect(primarySnippet(button, inspect, framework)!.code, framework).toContain(
        'intent="primary"',
      );
    }
  });

  it("leaves the React snippet exactly as it was", () => {
    // The switcher is additive: React's page must be byte-identical to before.
    for (const component of docsComponents) {
      for (const story of component.stories) {
        const expected = reactExampleCode(component, story);
        expect(primarySnippet(component, story, "react")?.code ?? "", component.name).toBe(
          expected,
        );
        expect(exampleSnippet(component, story, "react")?.code, component.name).toBe(story.code);
      }
    }
  });

  it("skips an example whose args are not the whole example", () => {
    // `AllIntents` renders five buttons; one derived instance under that
    // heading would be a caption that lies.
    const composed = button.stories.find((s) => !s.argsOnly && s.code)!;
    expect(composed).toBeDefined();
    expect(exampleSnippet(button, composed, "svelte")).toBeUndefined();
    expect(exampleSnippet(button, composed, "react")!.code).toBe(composed.code);
  });

  it("derives an example that is just the component and its props", () => {
    const plain = docsComponents
      .flatMap((c) => c.stories.map((s) => [c, s] as const))
      .find(([c, s]) => s.argsOnly && !s.isInspect && targetFor("svelte", c.codeName));
    expect(plain).toBeDefined();
    const [component, story] = plain!;
    expect(exampleSnippet(component, story, "svelte")!.code).toContain(`<${component.codeName}`);
  });

  it("gives every page either a sample or a stated reason", () => {
    // The invariant the whole feature rests on: no page ever shows a framework
    // tab that is simply blank, and no page shows React's code under another
    // framework's name.
    for (const framework of DOC_FRAMEWORKS) {
      for (const component of docsComponents) {
        const story = inspectStory(component);
        if (!story || !component.codeName) continue;
        const where = `${framework}/${component.name}`;
        const snippet = primarySnippet(component, story, framework);
        if (snippet) {
          expect(snippet.code, where).toBeTruthy();
          expect(gapFor(component, story, framework), where).toBeUndefined();
        } else {
          expect(gapFor(component, story, framework), where).toBeDefined();
        }
      }
    }
  });
});
