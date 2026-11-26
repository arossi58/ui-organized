import type { HTMLAttributes } from "svelte/elements";
import type { CodeHighlighter, CodeLineSpec } from "@ui-organized/core";

export interface CodeBlockProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "class" | "title" | "children"
> {
  /** The code, exactly as it is copied. */
  code: string;
  /** The language: passed to `highlight`, and shown in the header. */
  language?: string;
  /** What the code is for, such as a file name. Shown at the start of the header. */
  title?: string;
  /**
   * Turns the code into highlighted HTML; without it the code is plain text.
   * Shiki's `codeToHtml` works as is. The HTML is inserted as is, so pass only
   * a highlighter that escapes the code, as Shiki does.
   */
  highlight?: CodeHighlighter;
  /** Number the lines. Defaults to false. */
  lineNumbers?: boolean;
  /** Lines to mark: 1-based numbers, or a string such as "1,3-5". */
  highlightLines?: CodeLineSpec;
  /** Wrap long lines instead of scrolling sideways. Defaults to false. */
  wrap?: boolean;
  /** Scroll the code past this height: a number of pixels, or any CSS length. */
  maxHeight?: number | string;
  /** `terminal` is dark on any page, for shell commands. Defaults to 'default'. */
  variant?: "default" | "terminal";
  /** Colour lines that start with `+` or `-` as added or removed. Defaults to false. */
  diff?: boolean;
  /** Show a copy button in the header. Defaults to true. */
  copyable?: boolean;
  /** The copy button's label. Defaults to 'Copy'. */
  copyLabel?: string;
  /** The copy button's label just after copying. Defaults to 'Copied'. */
  copiedLabel?: string;
  class?: string;
}
