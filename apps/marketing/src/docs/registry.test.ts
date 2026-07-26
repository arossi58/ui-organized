/**
 * The story ↔ manifest join, checked against the real story files and the real
 * manifest.
 *
 * This is the load-bearing test for the docs site: every page's prop table, AI
 * context block and status badge is only correct if the join is. It runs against
 * live data on purpose — a fixture would keep passing after someone renames a
 * component or retitles a story.
 */
import { describe, it, expect } from "vitest";
import {
  docsComponents,
  getDocsCategories,
  getDocsComponent,
  exampleStories,
  inspectStory,
  kebab,
  manifest,
} from "./registry";

describe("docs registry", () => {
  it("picks up every story file", () => {
    // 45 CSF files in apps/storybook/src/stories; a floor rather than an
    // equality so adding a component doesn't fail CI.
    expect(docsComponents.length).toBeGreaterThanOrEqual(45);
  });

  it("gives every component a unique slug", () => {
    const slugs = docsComponents.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every(Boolean)).toBe(true);
  });

  it("gives every component at least one story", () => {
    for (const component of docsComponents) {
      expect(component.stories.length, component.name).toBeGreaterThan(0);
    }
  });

  it("resolves every component to a manifest entry", () => {
    const unresolved = docsComponents.filter((c) => c.resolvedBy === "none");
    expect(unresolved.map((c) => `${c.name} (${c.storyTitle})`)).toEqual([]);
  });

  it("resolves the whole corpus the same way it did last review", () => {
    // A snapshot rather than a rule, because which signal wins is legitimately
    // per-component: most stories set `meta.component`, but exports wrapped in
    // forwardRef report no `.name` (Menu, Tag) and fall back to the title, and
    // Toast names its entry explicitly. What matters is that a change to any of
    // this shows up in review instead of silently re-pointing a docs page.
    const table = docsComponents
      .map((c) => `${c.name} → ${c.codeName ?? "UNRESOLVED"} (${c.resolvedBy})`)
      .join("\n");
    expect(table).toMatchSnapshot();
  });

  it("maps the Navigation story to NavItem, not Pagination", () => {
    // The Storybook Inspector's similarity matcher scores Navigation→Pagination
    // at 0.556, over its 0.55 threshold, and shows Pagination's props. Exact
    // matching on `meta.component` is what makes this right.
    const navigation = docsComponents.find((c) => c.name === "Navigation");
    expect(navigation?.codeName).toBe("NavItem");
  });

  it("looks up by slug", () => {
    expect(getDocsComponent("button")?.name).toBe("Button");
    expect(getDocsComponent("nope")).toBeUndefined();
    expect(getDocsComponent(undefined)).toBeUndefined();
  });
});

describe("story shapes", () => {
  const button = getDocsComponent("button")!;

  it("reads the component description from the story meta", () => {
    expect(button.description).toContain("Buttons trigger actions");
  });

  it("finds the Inspect story and its args", () => {
    const inspect = inspectStory(button);
    expect(inspect?.exportName).toBe("Inspect");
    expect(inspect?.args).toMatchObject({ intent: "primary", size: "md" });
  });

  it("gives every component an Inspect story to drive", () => {
    for (const component of docsComponents) {
      expect(inspectStory(component), component.name).toBeDefined();
    }
  });

  it("keeps the curated source snippets", () => {
    const allIntents = button.stories.find((s) => s.exportName === "AllIntents");
    expect(allIntents?.code).toContain('<Button intent="destructive-ghost">');
  });

  it("captions stories from their export name", () => {
    expect(button.stories.find((s) => s.exportName === "AllIntents")?.name).toBe("All intents");
  });

  it("excludes the Inspect story from the examples list", () => {
    expect(exampleStories(button).some((s) => s.isInspect)).toBe(false);
    expect(exampleStories(button).length).toBeGreaterThan(0);
  });

  it("exposes every story as a component, never a bare render function", () => {
    // Button's `Inspect` has args but no `render` — Storybook renders
    // `meta.component`, and so must we.
    //
    // It has to be a *component*: story render functions and the components
    // themselves both use hooks, so calling one from a page's render body runs
    // those hooks in the page's fiber. That made the page's hook count depend on
    // which component it was showing, and navigating Toast (no `meta.component`)
    // → Navigation (`NavItem`, which calls `useContext`) crashed the route with
    // "Rendered more hooks than during the previous render".
    for (const component of docsComponents) {
      for (const story of component.stories) {
        expect(typeof story.Story, `${component.name}/${story.exportName}`).toBe("function");
        expect(story).not.toHaveProperty("render");
      }
    }
  });

  it("carries the curated snippets across the whole corpus", () => {
    const withCode = docsComponents.flatMap((c) => c.stories).filter((s) => s.code);
    expect(withCode.length).toBeGreaterThan(60);
  });
});

describe("compound components", () => {
  it("finds Card's subcomponents", () => {
    const card = getDocsComponent("card")!;
    expect(card.related.map((r) => r.codeName)).toEqual(
      expect.arrayContaining(["CardHeader", "CardBody", "CardFooter"]),
    );
  });

  it("does not list a component as its own sibling", () => {
    for (const component of docsComponents) {
      expect(component.related.map((r) => r.codeName)).not.toContain(component.codeName);
    }
  });
});

describe("categories", () => {
  it("groups in Storybook's sidebar order", () => {
    const names = getDocsCategories().map((c) => c.name);
    expect(names.indexOf("Forms")).toBeLessThan(names.indexOf("Layout"));
    expect(names).toContain("Actions");
  });

  it("accounts for every component exactly once", () => {
    const total = getDocsCategories().reduce((n, c) => n + c.components.length, 0);
    expect(total).toBe(docsComponents.length);
  });
});

describe("manifest", () => {
  it("loads the real manifest", () => {
    expect(manifest.components.length).toBeGreaterThan(100);
    expect(manifest.manifestVersion).toBe(1);
  });
});

describe("kebab", () => {
  it("splits camel case", () => {
    expect(kebab("DateRangeInput")).toBe("date-range-input");
    expect(kebab("Button")).toBe("button");
    expect(kebab("Data Display")).toBe("data-display");
  });
});
