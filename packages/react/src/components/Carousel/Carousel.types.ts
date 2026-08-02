import type * as React from "react";

export interface CarouselSlide {
  /** Unique id across the carousel. */
  id: string;
  /** Slide contents. */
  content: React.ReactNode;
}

export interface CarouselProps {
  /** The slides, in order. */
  slides: CarouselSlide[];
  /** Accessible label for the carousel region. */
  label?: string;
  /** Controlled page index. */
  page?: number;
  /** Initial page index for the uncontrolled case. Defaults to 0. */
  defaultPage?: number;
  /** Called with the new index whenever the visible page changes. */
  onPageChange?: (page: number) => void;
  /** How many slides are visible at once. Defaults to 1. */
  slidesPerPage?: number;
  /** Gap between slides. Defaults to the space-04 token. */
  spacing?: string;
  /** Wraps from the last slide back to the first. Defaults to false. */
  loop?: boolean;
  /** Advances on a timer. Pass a number for a custom interval in milliseconds. */
  autoplay?: boolean | { delay: number };
  /** Scroll direction. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Size variant, driving control and indicator scale. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Visual treatment. `minimal` hides the previous/next buttons. Defaults to 'default'. */
  variant?: "default" | "minimal";
  /** Shows the dot indicators below the slides. Defaults to true. */
  showIndicators?: boolean;
  className?: string;
}
