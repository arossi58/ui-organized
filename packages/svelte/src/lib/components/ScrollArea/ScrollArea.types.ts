import type { Snippet } from "svelte";

/**
 * An inline style, in either dialect.
 *
 * A string is what a Svelte consumer writes. The record is React's spelling, and
 * it is accepted rather than rejected so that one props object drives the same
 * component in every library — the Vue package gets this for free from Vue's own
 * style normaliser, and the parity gate hands all three the same input.
 *
 * A number is written through unchanged, so give lengths their unit.
 */
export type StyleValue = string | Record<string, string | number>;

export interface ScrollAreaProps {
  /**
   * Which scrollbars to render. Defaults to 'vertical'.
   * The Root needs a bounded height/width (via `style` or `class`) to scroll.
   */
  orientation?: "vertical" | "horizontal" | "both";
  /** Inline styles applied to the Root — typically a `height`/`maxHeight`. */
  style?: StyleValue;
  class?: string;
  /** Scrollable content. */
  children?: Snippet;
}
