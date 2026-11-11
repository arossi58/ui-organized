/**
 * `extractInspection` against a real CSSOM. Chromium rather than jsdom because
 * the bug this guards is engine behaviour: a shorthand containing `var()` lists
 * its longhands with empty values, which jsdom doesn't reproduce.
 */
import { resolve } from "node:path";
import { chromium, type Browser, type Page } from "@playwright/test";
import { build } from "esbuild";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PropSource } from "../src/inspect/extract.js";

const CSS = `
  :root { --c: rgb(1, 2, 3); --s: 4px; }
  body { font-size: 17px; line-height: 1.55; color: var(--c); }
  .shorthand { background: var(--c); border: 1px solid var(--c); padding: var(--s) var(--s);
    gap: var(--s); border-radius: var(--s); display: flex; }
  .logical { padding-inline: var(--s); padding-block: 0; border-color: var(--c);
    border-width: 1px; border-style: solid; }
  .literal { border: 1px solid #123456; padding: 7px; border-radius: 3px; background: #abcdef; }
  .keyword { border: 1px solid transparent; }
  .one-side { border-bottom: 1px solid var(--c); }
  .sides { border: 1px solid var(--c); border-left-color: #123456; }
  .parent { font-size: var(--s); }
  .low { padding: 9px; }
  .wins.wins { padding: var(--s); }
  .where:where(.x) { padding: 9px; }
  .where { padding: var(--s); }
  .important { padding: var(--s) !important; }
  .important.important { padding: 9px; }
  @media (max-width: 1px) { .inactive { padding: 9px; } }
  .inactive { padding: var(--s); }
`;

const HTML = `
  <div id="stage">
    <div id="shorthand" class="shorthand"></div>
    <div id="logical" class="logical"></div>
    <div id="literal" class="literal"></div>
    <div id="keyword" class="keyword"></div>
    <div id="one-side" class="one-side"></div>
    <div id="sides" class="sides"></div>
    <div id="inline" style="padding: 12px"></div>
    <div id="inline-var" style="padding: var(--s)"></div>
    <div id="parent" class="parent"><span id="child">text</span></div>
    <div id="page-text">text</div>
    <div id="cascade" class="low wins"></div>
    <div id="where" class="where x"></div>
    <div id="important" class="important"></div>
    <div id="inactive" class="inactive"></div>
    <svg id="icon" stroke="currentColor" fill="none"></svg>
  </div>`;

type Row = { source: PropSource; varName?: string; value: string; tokenable: boolean };

let browser: Browser;
let page: Page;
let read: Record<string, Record<string, Row> & { __hardcoded: number }>;

beforeAll(async () => {
  const bundle = await build({
    entryPoints: [resolve(import.meta.dirname, "../src/inspect/extract.ts")],
    bundle: true,
    format: "iife",
    globalName: "inspector",
    write: false,
  });
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.setContent(`<!doctype html><style>${CSS}</style>${HTML}`);
  await page.addScriptTag({ content: bundle.outputFiles[0]!.text });
  read = await page.evaluate(() => {
    const { nodes, elements } = (window as never as { inspector: { extractInspection: Function } })
      .inspector.extractInspection(window, [document.getElementById("stage")]);
    const out: Record<string, unknown> = {};
    nodes.forEach((node: { groups: { props: (Row & { property: string })[] }[]; hardcodedCount: number }, i: number) => {
      const rows: Record<string, unknown> = { __hardcoded: node.hardcodedCount };
      for (const group of node.groups) for (const p of group.props) rows[p.property] = p;
      out[(elements[i] as Element).id] = rows;
    });
    return out as never;
  });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

describe("extractInspection", () => {
  it("reads var() inside a shorthand as a token, not a literal", () => {
    const el = read.shorthand!;
    for (const prop of ["background", "border", "padding", "gap", "radius"]) {
      expect(el[prop]!.source, prop).toBe("token");
    }
    expect(el.border!.varName).toBe("--c");
    expect(el.padding!.varName).toBe("--s");
    expect(el.__hardcoded).toBe(0);
  });

  it("reads var() in logical and side shorthands as a token", () => {
    expect(read.logical!.padding!.source).toBe("token");
    expect(read.logical!.border!.source).toBe("token");
  });

  it("still flags real literals", () => {
    const el = read.literal!;
    for (const prop of ["background", "border", "padding", "radius"]) {
      expect(el[prop]!.source, prop).toBe("literal");
    }
    expect(el.__hardcoded).toBe(4);
  });

  it("does not flag keywords", () => {
    expect(read.keyword!.border!.source).toBe("keyword");
    expect(read.keyword!.__hardcoded).toBe(0);
  });

  it("reports the side of a border that actually paints", () => {
    const row = read["one-side"]!["border-bottom"]!;
    expect(row.source).toBe("token");
    expect(row.value).toBe("rgb(1, 2, 3)");
    expect(read["one-side"]!["border-top"]).toBeUndefined();
  });

  it("splits a border whose sides differ", () => {
    expect(read.sides!["border-top"]!.source).toBe("token");
    expect(read.sides!["border-left"]!.source).toBe("literal");
  });

  it("separates inline values from stylesheet literals", () => {
    expect(read.inline!.padding!.source).toBe("inline");
    expect(read.inline!.__hardcoded).toBe(0);
    expect(read["inline-var"]!.padding!.source).toBe("token");
  });

  it("names the token behind an inherited value", () => {
    expect(read.child!.size!.source).toBe("inherited");
    expect(read.child!.size!.varName).toBe("--s");
  });

  it("marks values that come from beyond the inspected root", () => {
    expect(read["page-text"]!.size!.source).toBe("page");
    expect(read["page-text"]!.color!.source).toBe("page");
    expect(read["page-text"]!.color!.varName).toBe("--c");
  });

  it("follows the cascade: specificity, :where, !important and inactive @media", () => {
    expect(read.cascade!.padding!.source).toBe("token");
    expect(read.where!.padding!.source).toBe("token");
    expect(read.important!.padding!.source).toBe("token");
    expect(read.inactive!.padding!.source).toBe("token");
  });

  it("reads SVG presentation attributes", () => {
    expect(read.icon!.stroke!.source).toBe("keyword");
  });
});
