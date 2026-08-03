/**
 * The usage guides, checked against the real registry and the real examples.
 *
 * Guidance is the one part of a docs page nothing generates, so nothing else can
 * catch it going wrong: a cross-reference to a component that no longer exists,
 * a rule claiming a live example that was never written, a sentence that quietly
 * assumes an industry. Each of those is a rule here.
 *
 * Imports the renderer directly rather than through the docs barrel — the barrel
 * pulls the whole page shell, and this file only needs the four content shapes.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import {
  COMPONENT_SLUGS,
  USAGE_GUIDES,
  type UsageGuide,
} from "@ui-organized/code-connect/usage";
import { docsComponents, getDocsComponent } from "../registry";
import {
  UsageAvoidList,
  UsageGuidanceGrid,
  UsageList,
  UsageRelatedList,
  UsageSummary,
} from "../components/UsageGuidance";
import { USAGE_EXAMPLES, usageExamplesFor } from "./examples";

/**
 * Components whose guidance hasn't been written yet.
 *
 * Empty, and meant to stay that way: every component in the registry has a
 * guide, and `USAGE_GUIDES` is a total `Record<ComponentSlug, UsageGuide>`, so a
 * new component fails `typecheck` before it reaches this file. The list survives
 * as the escape hatch for a deliberate, reviewed gap, which the assertion below
 * then holds to exactly what is listed here.
 */
const PENDING: string[] = [];

const guides = Object.entries(USAGE_GUIDES) as Array<[string, UsageGuide]>;
const written = guides.map(([slug]) => slug);

/** Every string a guide will ever render, flattened for the corpus-wide rules. */
function sentences(guide: UsageGuide): Array<[field: string, text: string]> {
  return [
    ["summary", guide.summary],
    ...guide.useWhen.map((t, i): [string, string] => [`useWhen[${i}]`, t]),
    ...guide.avoid.map((a, i): [string, string] => [`avoid[${i}]`, a.text]),
    ...guide.guidance.flatMap((g, i): Array<[string, string]> => [
      [`guidance[${i}].do`, g.do],
      [`guidance[${i}].dont`, g.dont],
    ]),
    ...guide.accessibility.map((t, i): [string, string] => [`accessibility[${i}]`, t]),
    ...(guide.content ?? []).map((t, i): [string, string] => [`content[${i}]`, t]),
    ...(guide.related ?? []).map((r, i): [string, string] => [`related[${i}]`, r.when]),
  ];
}

const words = (text: string) => text.trim().split(/\s+/).length;

describe("usage guides — coverage", () => {
  it("knows exactly the components the registry knows", () => {
    expect([...COMPONENT_SLUGS].sort()).toEqual(docsComponents.map((c) => c.slug).sort());
  });

  it("accounts for every component as written or pending", () => {
    expect([...written, ...PENDING].sort()).toEqual([...COMPONENT_SLUGS].sort());
  });

  it("keys each guide by its own slug, on a component that exists", () => {
    for (const [key, guide] of guides) {
      expect(guide.slug, key).toBe(key);
      expect(getDocsComponent(key), key).toBeDefined();
    }
  });

  it("names the manifest entry its docs page resolves to", () => {
    // The bridge the AI-docs generator walks: it only knows entries by codeName,
    // and `navigation` → `NavItem` can't be derived from the slug.
    for (const [slug, guide] of guides) {
      expect(guide.codeName, slug).toBe(getDocsComponent(slug)?.codeName);
    }
  });
});

describe("usage guides — cross-references", () => {
  it("points only at components that have a page", () => {
    for (const [slug, guide] of guides) {
      const referenced = [
        ...guide.avoid.flatMap((a) => a.instead ?? []),
        ...(guide.related ?? []).map((r) => r.slug),
      ];
      for (const target of referenced) {
        expect(getDocsComponent(target), `${slug} → ${target}`).toBeDefined();
      }
    }
  });

  it("never sends the reader back to the component they're reading about", () => {
    for (const [slug, guide] of guides) {
      const referenced = [
        ...guide.avoid.flatMap((a) => a.instead ?? []),
        ...(guide.related ?? []).map((r) => r.slug),
      ];
      expect(referenced, slug).not.toContain(slug);
    }
  });
});

describe("usage guides — shape", () => {
  it("stays inside the authored bounds", () => {
    for (const [slug, guide] of guides) {
      expect(words(guide.summary), `${slug} summary`).toBeGreaterThanOrEqual(15);
      expect(words(guide.summary), `${slug} summary`).toBeLessThanOrEqual(60);
      expect(guide.useWhen.length, `${slug} useWhen`).toBeGreaterThanOrEqual(2);
      expect(guide.useWhen.length, `${slug} useWhen`).toBeLessThanOrEqual(5);
      expect(guide.avoid.length, `${slug} avoid`).toBeGreaterThanOrEqual(2);
      expect(guide.avoid.length, `${slug} avoid`).toBeLessThanOrEqual(5);
      expect(guide.guidance.length, `${slug} guidance`).toBeGreaterThanOrEqual(2);
      expect(guide.guidance.length, `${slug} guidance`).toBeLessThanOrEqual(5);
      expect(guide.accessibility.length, `${slug} accessibility`).toBeGreaterThanOrEqual(1);
      expect(guide.accessibility.length, `${slug} accessibility`).toBeLessThanOrEqual(4);
    }
  });

  it("writes one bounded sentence per entry", () => {
    for (const [slug, guide] of guides) {
      for (const [field, text] of sentences(guide)) {
        const where = `${slug} ${field}`;
        expect(text.trim(), where).toBe(text);
        expect(text.length, where).toBeGreaterThan(0);
        expect(text.endsWith("."), `${where} — ends with a period`).toBe(true);
        // The summary is allowed two sentences; a bullet is one idea.
        if (field !== "summary") expect(words(text), where).toBeLessThanOrEqual(30);
      }
    }
  });

  it("states each rule twice rather than negating it", () => {
    for (const [slug, guide] of guides) {
      for (const pair of guide.guidance) {
        expect(pair.do.length, slug).toBeGreaterThan(0);
        expect(pair.dont.length, slug).toBeGreaterThan(0);
        expect(pair.dont, slug).not.toBe(pair.do);
      }
    }
  });

  it("says something different about every component", () => {
    const summaries = guides.map(([, guide]) => guide.summary);
    expect(new Set(summaries).size).toBe(summaries.length);
  });
});

describe("usage guides — renderability", () => {
  // `InlineMarkdown` is a non-parser: inline code, bold and emphasis only. Any
  // block construct in a string would print its own syntax on the page.
  const BLOCK_SYNTAX = [
    { name: "a line break", re: /\n/ },
    { name: "a list marker", re: /^\s*(?:[-*+]\s|\d+\.\s)/ },
    { name: "a heading", re: /^\s*#/ },
    { name: "a markdown link", re: /\[[^\]]*\]\([^)]*\)/ },
    // House style, and the one punctuation rule worth automating: an em dash
    // hides the join between two clauses. A colon, a comma or a full stop each
    // say which join it is.
    { name: "an em dash", re: /—/ },
  ];

  it("uses only the inline constructs the renderer supports", () => {
    for (const [slug, guide] of guides) {
      for (const [field, text] of sentences(guide)) {
        for (const { name, re } of BLOCK_SYNTAX) {
          expect(re.test(text), `${slug} ${field} contains ${name}`).toBe(false);
        }
      }
    }
  });

  it("closes every inline code span", () => {
    for (const [slug, guide] of guides) {
      for (const [field, text] of sentences(guide)) {
        const ticks = (text.match(/`/g) ?? []).length;
        expect(ticks % 2, `${slug} ${field} — unbalanced backticks`).toBe(0);
      }
    }
  });
});

describe("usage guides — neutrality", () => {
  /**
   * The system is meant to be usable by anyone, so guidance names the job and
   * never the domain: "a destructive action", not "deleting a patient record".
   * A short, reviewed list on purpose — a bloated one produces false positives,
   * and a lint people suppress is worse than no lint.
   */
  const BANNED = [
    "checkout", "cart", "invoice", "patient", "diagnosis", "student", "tenant",
    "shipping", "airline", "sku", "e-commerce", "ecommerce", "crm", "hipaa",
    "figma", "slack", "github", "google", "apple", "stripe", "material", "bootstrap",
  ];

  it("names the job, not an industry or a brand", () => {
    for (const [slug, guide] of guides) {
      for (const [field, text] of sentences(guide)) {
        for (const word of BANNED) {
          const hit = new RegExp(`\\b${word}\\b`, "i").test(text);
          expect(hit, `${slug} ${field} mentions "${word}"`).toBe(false);
        }
      }
    }
  });
});

describe("usage examples", () => {
  it("stages every rule that claims an example", () => {
    for (const [slug, guide] of guides) {
      const set = usageExamplesFor(slug);
      for (const pair of guide.guidance) {
        if (!pair.example) continue;
        expect(set[pair.example], `${slug} → ${pair.example}`).toBeDefined();
      }
    }
  });

  it("leaves no example nothing points at", () => {
    for (const [slug, set] of Object.entries(USAGE_EXAMPLES)) {
      const claimed = new Set(
        (USAGE_GUIDES[slug as keyof typeof USAGE_GUIDES]?.guidance ?? [])
          .map((g) => g.example)
          .filter(Boolean),
      );
      for (const id of Object.keys(set)) {
        expect(claimed.has(id), `${slug} example "${id}" is unreferenced`).toBe(true);
      }
    }
  });

  /**
   * Components that can only be shown text-only, each for a stated reason.
   *
   * The bar is high on purpose: "it was fiddly" isn't one. A component belongs
   * here only when a side-by-side card genuinely cannot hold it, which so far
   * means the transient overlay you must first trigger and which then covers the
   * page rather than the card it was raised from.
   */
  const TEXT_ONLY = new Set(["toast"]);

  it("shows at least two rules with the real component", () => {
    for (const [slug, guide] of guides) {
      if (TEXT_ONLY.has(slug)) continue;
      const live = guide.guidance.filter((g) => g.example).length;
      expect(live, `${slug} live examples`).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps the text-only exceptions honest", () => {
    for (const slug of TEXT_ONLY) {
      const guide = guides.find(([key]) => key === slug)?.[1];
      if (!guide) continue;
      const live = guide.guidance.filter((g) => g.example).length;
      // If someone works out how to stage it, the exception has to go.
      expect(live, `${slug} is listed as text-only but has examples`).toBe(0);
    }
  });
});

describe("usage guides — rendering", () => {
  it("renders every guide without throwing", () => {
    for (const [slug, guide] of guides) {
      const component = getDocsComponent(slug)!;
      const html = renderToStaticMarkup(
        createElement(
          MemoryRouter,
          null,
          createElement(UsageSummary, { text: guide.summary }),
          createElement(UsageList, { items: guide.useWhen }),
          createElement(UsageAvoidList, { items: guide.avoid }),
          createElement(UsageGuidanceGrid, {
            pairs: guide.guidance,
            examples: usageExamplesFor(slug),
            componentName: component.name,
          }),
          createElement(UsageList, { items: guide.accessibility }),
          createElement(UsageRelatedList, { items: guide.related ?? [] }),
        ),
      );
      expect(html.length, slug).toBeGreaterThan(0);
      // The cross-reference links resolve to real pages, not to raw slugs.
      for (const target of guide.avoid.flatMap((a) => a.instead ?? [])) {
        expect(html, `${slug} → ${target}`).toContain(`/docs/${target}`);
      }
    }
  });
});
