/**
 * The lines a CodeBlock renders. Pure string work with no DOM, so every
 * library splits, marks and numbers lines the same way.
 */

/** How a diff line changed. */
export type CodeDiffKind = "add" | "remove";

/**
 * Turns code into highlighted HTML. Shiki's `codeToHtml` output works as is: a
 * `<pre><code>` of `<span class="line">` elements, one per line, separated by
 * newlines. Bare line spans work too.
 *
 * The HTML is inserted as is in every library, so pass only a highlighter that
 * escapes the code, as Shiki does.
 */
export type CodeHighlighter = (code: string, language?: string) => string;

/** Lines to mark: 1-based numbers, or a string of numbers and ranges such as "1,3-5". */
export type CodeLineSpec = readonly number[] | string;

export interface CodeLine {
  /** The line's text, or its inner HTML when `html` is true. */
  content: string;
  html: boolean;
  /** Marked by `highlightLines`. */
  highlighted: boolean;
  /** In a diff, whether the line was added or removed. */
  diff?: CodeDiffKind;
}

/** The code's lines. One trailing newline ends the last line rather than starting an empty one. */
export function splitCodeLines(code: string): string[] {
  const lines = code.split(/\r?\n/);
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

/** The 1-based line numbers a spec names. Unreadable parts are ignored; a range may run either way. */
export function parseLineSpec(spec?: CodeLineSpec): Set<number> {
  const lines = new Set<number>();
  if (spec == null) return lines;
  if (typeof spec !== "string") {
    for (const n of spec) if (Number.isInteger(n) && n > 0) lines.add(n);
    return lines;
  }
  for (const part of spec.split(",")) {
    const range = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(part);
    if (!range) continue;
    const a = Number(range[1]);
    const b = range[2] === undefined ? a : Number(range[2]);
    for (let n = Math.min(a, b); n <= Math.max(a, b); n++) if (n > 0) lines.add(n);
  }
  return lines;
}

/**
 * Whether a unified-diff line was added (`+`) or removed (`-`). The file
 * headers `+++` and `---` are neither.
 */
export function diffKindOf(line: string): CodeDiffKind | undefined {
  if (line.startsWith("+++") || line.startsWith("---")) return undefined;
  if (line.startsWith("+")) return "add";
  if (line.startsWith("-")) return "remove";
  return undefined;
}

const LINE_WRAPPER = /^<span class="line(?:\s[^"]*)?"[^>]*>([\s\S]*)<\/span>$/;

/** Each line's inner HTML, from a highlighter's output. */
export function splitHighlightedLines(html: string): string[] {
  let body = html;
  const open = /<code[^>]*>/.exec(body);
  if (open) {
    const start = open.index + open[0].length;
    const end = body.lastIndexOf("</code>");
    body = body.slice(start, end < start ? undefined : end);
  }
  return body.split("\n").map((line) => LINE_WRAPPER.exec(line)?.[1] ?? line);
}

export interface BuildCodeLinesOptions {
  code: string;
  language?: string;
  highlight?: CodeHighlighter;
  highlightLines?: CodeLineSpec;
  diff?: boolean;
}

/**
 * The lines to render. With a highlighter, each line carries its HTML; a line
 * the highlighter did not return falls back to its text. Diff marks always
 * come from the code's own text, so they hold whatever the highlighter does.
 */
export function buildCodeLines({
  code,
  language,
  highlight,
  highlightLines,
  diff,
}: BuildCodeLinesOptions): CodeLine[] {
  const text = splitCodeLines(code);
  const html = highlight ? splitHighlightedLines(highlight(code, language)) : undefined;
  const marked = parseLineSpec(highlightLines);
  return text.map((line, i) => {
    const lineHtml = html?.[i];
    return {
      content: lineHtml ?? line,
      html: lineHtml !== undefined,
      highlighted: marked.has(i + 1),
      diff: diff ? diffKindOf(line) : undefined,
    };
  });
}

/** How many digits the widest line number has, for the gutter's width. */
export function lineNumberDigits(lineCount: number): number {
  return String(Math.max(1, lineCount)).length;
}
