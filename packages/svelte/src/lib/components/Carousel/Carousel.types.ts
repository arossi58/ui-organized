import type { Snippet } from "svelte";
import type { ControlSize } from "@ui-organized/core";

export interface CarouselSlide {
  /** Unique id across the carousel. */
  id: string;
  /**
   * Slide contents. A string, or a snippet for anything richer.
   *
   * React takes a ReactNode here, which can be either. Svelte has no single
   * type that covers both, so the union is explicit and the component renders
   * whichever it was given.
   */
  content?: string | Snippet;
}

export interface CarouselProps {
  /** The slides, in order. */
  slides: CarouselSlide[];
  /** Accessible label for the carousel region. */
  label?: string;
  /** Index of the visible page. Bindable: `bind:page`. */
  page?: number;
  /** Initial page index for the uncontrolled case. Defaults to 0. */
  defaultPage?: number;
  /** Called with the new index whenever the visible page changes. */
  onPageChange?: (page: number) => void;
  /** How many slides are visible at once. Defaults to 1. */
  slidesPerPage?: number;
  /** Gap between slides. Defaults to the space-04 token. */
  spacing?: string;
  /**
   * Wraps from the last slide back to the first.
   *
   * Deliberately has no default: the machine derives one from `autoplay`, and
   * writing `loop = false` here would replace that derivation with a decision
   * the caller never made.
   */
  loop?: boolean;
  /** Advances on a timer. Pass a number for a custom interval in milliseconds. */
  autoplay?: boolean | { delay: number };
  /** Scroll direction. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Size variant, driving control and indicator scale. Defaults to 'md'. */
  size?: ControlSize;
  /** Visual treatment. `minimal` hides the previous/next buttons. Defaults to 'default'. */
  variant?: "default" | "minimal";
  /** Shows the dot indicators below the slides. Defaults to true. */
  showIndicators?: boolean;
  class?: string;
}
