import { cva, type VariantProps } from "class-variance-authority";

/**
 * Code to read and copy: a header with a title, the language and a copy
 * button, over the code's lines. Highlighting is the caller's: pass a
 * `highlight` function (Shiki's `codeToHtml` works as is), or the code shows
 * as plain text.
 */
export const codeBlockStyles = cva("code-block", {
  variants: {
    variant: {
      default: "code-block--default",
      terminal: "code-block--terminal",
    },
    lineNumbers: {
      true: "code-block--line-numbers",
      false: "",
    },
    wrap: {
      true: "code-block--wrap",
      false: "",
    },
    diff: {
      true: "code-block--diff",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    lineNumbers: false,
    wrap: false,
    diff: false,
  },
});

export type CodeBlockVariants = VariantProps<typeof codeBlockStyles>;
export type CodeBlockVariant = "default" | "terminal";

/** The title's type class. */
export const CODE_BLOCK_TITLE_CLASS = "text-strong-body-small";

/**
 * The theme a block forces on itself: a terminal is dark on any page. The
 * token stylesheet scopes its dark values to `[data-theme="dark"]`, so the
 * attribute alone re-themes the block and the copy button inside it.
 */
export function codeBlockTheme(variant: CodeBlockVariant = "default"): "dark" | undefined {
  return variant === "terminal" ? "dark" : undefined;
}

/** `maxHeight` as CSS: a number is pixels. */
export function codeBlockMaxHeight(maxHeight?: number | string): string | undefined {
  return typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
}
