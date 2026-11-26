import { describe, expect, it } from "vitest";
import {
  buildCodeLines,
  diffKindOf,
  lineNumberDigits,
  parseLineSpec,
  splitCodeLines,
  splitHighlightedLines,
} from "./codeLines.js";

describe("splitCodeLines", () => {
  it("splits on newlines, either kind", () => {
    expect(splitCodeLines("a\nb\r\nc")).toEqual(["a", "b", "c"]);
  });
  it("lets one trailing newline end the last line", () => {
    expect(splitCodeLines("a\nb\n")).toEqual(["a", "b"]);
    expect(splitCodeLines("a\n\n")).toEqual(["a", ""]);
  });
  it("keeps blank lines inside the code", () => {
    expect(splitCodeLines("a\n\nb")).toEqual(["a", "", "b"]);
  });
  it("treats empty code as one empty line", () => {
    expect(splitCodeLines("")).toEqual([""]);
  });
});

describe("parseLineSpec", () => {
  it("reads numbers and ranges", () => {
    expect([...parseLineSpec("1, 3-5,8")]).toEqual([1, 3, 4, 5, 8]);
  });
  it("reads a range either way round", () => {
    expect([...parseLineSpec("5-3")]).toEqual([3, 4, 5]);
  });
  it("takes an array of numbers", () => {
    expect([...parseLineSpec([2, 4])]).toEqual([2, 4]);
  });
  it("ignores what it cannot read", () => {
    expect([...parseLineSpec("x, 0, -2, 2")]).toEqual([2]);
    expect([...parseLineSpec([0, 1.5, 3])]).toEqual([3]);
    expect(parseLineSpec(undefined).size).toBe(0);
  });
});

describe("diffKindOf", () => {
  it("marks added and removed lines", () => {
    expect(diffKindOf("+ const a = 1;")).toBe("add");
    expect(diffKindOf("- const a = 0;")).toBe("remove");
    expect(diffKindOf("  unchanged")).toBeUndefined();
  });
  it("does not mark the file headers", () => {
    expect(diffKindOf("+++ b/file.ts")).toBeUndefined();
    expect(diffKindOf("--- a/file.ts")).toBeUndefined();
  });
});

describe("splitHighlightedLines", () => {
  const SHIKI =
    '<pre class="shiki" tabindex="0"><code><span class="line"><span style="color:var(--shiki-token-keyword)">const</span> a</span>\n' +
    '<span class="line"></span>\n<span class="line highlighted"><span>"&#x3C;b>"</span></span></code></pre>';

  it("unwraps each line of Shiki's output", () => {
    expect(splitHighlightedLines(SHIKI)).toEqual([
      '<span style="color:var(--shiki-token-keyword)">const</span> a',
      "",
      '<span>"&#x3C;b>"</span>',
    ]);
  });
  it("takes bare line spans without a pre", () => {
    expect(
      splitHighlightedLines('<span class="line">a</span>\n<span class="line">b</span>'),
    ).toEqual(["a", "b"]);
  });
  it("keeps a line that is not wrapped as it is", () => {
    expect(splitHighlightedLines("<b>a</b>\nb")).toEqual(["<b>a</b>", "b"]);
  });
});

describe("buildCodeLines", () => {
  it("returns plain lines without a highlighter", () => {
    expect(buildCodeLines({ code: "a\nb" })).toEqual([
      { content: "a", html: false, highlighted: false, diff: undefined },
      { content: "b", html: false, highlighted: false, diff: undefined },
    ]);
  });
  it("uses the highlighter's lines and passes it the language", () => {
    const calls: Array<[string, string | undefined]> = [];
    const lines = buildCodeLines({
      code: "a\nb\n",
      language: "ts",
      highlight: (code, language) => {
        calls.push([code, language]);
        return '<pre><code><span class="line"><i>a</i></span>\n<span class="line"><i>b</i></span>\n<span class="line"></span></code></pre>';
      },
    });
    expect(calls).toEqual([["a\nb\n", "ts"]]);
    expect(lines.map((l) => [l.content, l.html])).toEqual([
      ["<i>a</i>", true],
      ["<i>b</i>", true],
    ]);
  });
  it("falls back to text for a line the highlighter dropped", () => {
    const lines = buildCodeLines({ code: "a\nb", highlight: () => '<span class="line">A</span>' });
    expect(lines.map((l) => [l.content, l.html])).toEqual([
      ["A", true],
      ["b", false],
    ]);
  });
  it("marks highlighted lines and diff lines from the code's text", () => {
    const lines = buildCodeLines({
      code: " a\n+b\n-c",
      highlightLines: "1",
      diff: true,
      highlight: () => "<x/>\n<y/>\n<z/>",
    });
    expect(lines.map((l) => [l.highlighted, l.diff])).toEqual([
      [true, undefined],
      [false, "add"],
      [false, "remove"],
    ]);
  });
  it("ignores diff marks unless asked", () => {
    expect(buildCodeLines({ code: "+a" })[0]?.diff).toBeUndefined();
  });
});

describe("lineNumberDigits", () => {
  it("counts the widest number's digits", () => {
    expect([
      lineNumberDigits(0),
      lineNumberDigits(9),
      lineNumberDigits(10),
      lineNumberDigits(120),
    ]).toEqual([1, 1, 2, 3]);
  });
});
