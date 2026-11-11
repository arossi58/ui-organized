import { cva } from "class-variance-authority";

/**
 * One variant, one size. The chip used to ship `outline`/`subtle` and
 * `sm`/`md`/`lg`; the segmented design (Figma 2462:2636) draws exactly one, so
 * there is nothing left to vary. Still a recipe rather than a bare string so the
 * four libraries keep asking core for the class instead of spelling it.
 */
export const chipStyles = cva("chip");

/** The three parts of a chip's sentence, each its own segment. */
export type ChipSegmentPart = "label" | "operator" | "value";

export const chipSegmentStyles = cva("chip__segment", {
  variants: {
    part: {
      label: "chip__segment--label",
      operator: "chip__segment--operator",
      value: "chip__segment--value",
    },
  },
  defaultVariants: { part: "value" },
});
