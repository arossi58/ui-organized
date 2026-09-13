/**
 * The block markdown renderer, checked against the real changelog bodies it
 * exists to render — plus the pending changeset, whose GFM table lands in
 * `packages/react/CHANGELOG.md` on the next release.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { MarkdownBlocks, parseBlocks } from "./MarkdownBlocks";
import { getChangelogs } from "../changelog";

const render = (markdown: string) =>
  renderToStaticMarkup(createElement(MarkdownBlocks, { markdown }));

const [react, tokens] = getChangelogs();
const release = (pkg: typeof react, version: string) =>
  pkg.releases.find((item) => item.version === version);

describe("parseBlocks", () => {
  it("separates paragraphs, fences and lists", () => {
    const blocks = parseBlocks("Intro line.\n\n```ts\nconst a = 1;\n```\n\n- one\n- two\n");
    expect(blocks.map((block) => block.kind)).toEqual(["paragraph", "code", "list"]);
  });

  it("reads the fence's language and leaves a bare fence as text", () => {
    const [tagged] = parseBlocks("```jsonc\n{}\n```");
    const [bare] = parseBlocks("```\nplain\n```");
    expect(tagged).toMatchObject({ kind: "code", language: "jsonc", code: "{}" });
    expect(bare).toMatchObject({ kind: "code", language: "text", code: "plain" });
  });

  it("only treats pipe rows as a table when the GFM rule row follows", () => {
    const table = parseBlocks("| A | B |\n| --- | --- |\n| 1 | 2 |");
    expect(table[0]).toMatchObject({ kind: "table", head: ["A", "B"], rows: [["1", "2"]] });
    // Without the rule row it is prose that happens to contain pipes.
    expect(parseBlocks("| not | a table |")[0].kind).toBe("paragraph");
  });

  it("nests a two-space sub-bullet under the item above it", () => {
    const [list] = parseBlocks("- parent\n  - child\n- sibling\n");
    expect(list).toMatchObject({
      kind: "list",
      items: [
        { text: "parent", children: ["child"] },
        { text: "sibling", children: [] },
      ],
    });
  });

  it("joins a wrapped list item rather than dropping the tail", () => {
    const [list] = parseBlocks("- a claim that continues\n  onto the next line\n");
    expect(list).toMatchObject({ items: [{ text: "a claim that continues onto the next line" }] });
  });

  it("ends an unterminated fence at the text, not by swallowing the rest", () => {
    const blocks = parseBlocks("```ts\nconst a = 1;");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ kind: "code", code: "const a = 1;" });
  });
});

describe("MarkdownBlocks", () => {
  it("routes fenced code through the kit's CodeBlock, copy button and all", () => {
    const html = render("```ts\nconst a = 1;\n```");
    expect(html).toContain("<pre");
    expect(html).toContain("const a = 1;");
    expect(html).toContain("ts");
    expect(html).toContain("Copy");
  });

  it("renders a table with the docs table classes", () => {
    const html = render("| Token | Was |\n| --- | --- |\n| `--z-index-popover` | `1000` |");
    expect(html).toContain("<table");
    expect(html).toContain("<th>Token</th>");
    expect(html).toContain("<code>--z-index-popover</code>");
  });

  it("renders inline code, bold and links through renderInline", () => {
    const html = render("Use **`intent`** and see [the docs](https://example.com).");
    expect(html).toContain("<strong><code>intent</code></strong>");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer"');
  });

  it("renders a blockquote as a quote, not a paragraph", () => {
    expect(render("> an aside")).toContain("<blockquote");
  });

  it("leaves no literal fence or pipe markup in a real entry", () => {
    const body = release(react, "5.0.1")?.groups[0].entries[0].body ?? "";
    expect(body).not.toBe("");
    const html = render(body);
    expect(html).not.toContain("```");
    // Both of the entry's fences (```ts and ```jsonc) become code blocks.
    expect(html.match(/<pre/g)?.length).toBe(2);
  });

  it("renders a real entry's sub-bullets as a list", () => {
    const body = release(tokens, "3.3.0")?.groups[0].entries[0].body ?? "";
    const html = render(body);
    expect(html).toContain("<ul>");
    expect(html).toContain("<strong><code>@ui-organized/react</code></strong>");
    expect(html).not.toContain("**");
  });

  it("renders every entry in both changelogs without leaving raw markers", () => {
    for (const pkg of [react, tokens]) {
      for (const item of pkg.releases) {
        for (const group of item.groups) {
          for (const entry of group.entries) {
            const html = render(entry.body);
            expect(html, `${pkg.slug}@${item.version}`).not.toContain("```");
          }
        }
      }
    }
  });
});
