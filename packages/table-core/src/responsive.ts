/**
 * Responsive mode selection.
 *
 * The mode is *state*, not a media query, because the two trees are mutually
 * exclusive: rendering both and hiding one with a container query would double
 * the DOM and defeat virtualization on exactly the devices that can least afford
 * it. So the width is measured and one tree is rendered.
 */
import { CARD_BREAKPOINT } from "./styles.js";

export type TableMode = "table" | "cards";

export interface ResponsiveConfig {
  /** `auto` measures; `table` and `cards` pin the mode. Defaults to `auto`. */
  mode?: "auto" | TableMode;
  /** Width below which `auto` chooses cards. Defaults to `CARD_BREAKPOINT`. */
  breakpoint?: number;
}

export function resolveMode(config: ResponsiveConfig | undefined, width: number | null): TableMode {
  const mode = config?.mode ?? "auto";
  if (mode !== "auto") return mode;
  // Before the first measurement, assume the table: it is the correct answer on
  // every desktop and it means SSR output does not have to be thrown away on
  // hydration for the common case.
  if (width === null) return "table";
  return width < (config?.breakpoint ?? CARD_BREAKPOINT) ? "cards" : "table";
}

/**
 * Watches an element's width and reports it.
 *
 * SSR-guarded — `ResizeObserver` exists in neither Node nor jsdom by default, so
 * this returns a no-op unsubscribe rather than throwing, and `resolveMode`'s
 * null-width branch keeps the table rendering.
 */
export function watchWidth(element: Element | null, onWidth: (width: number) => void): () => void {
  if (!element || typeof ResizeObserver === "undefined") return () => {};
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      // `borderBoxSize` is not populated in every engine; `contentRect` is.
      onWidth(entry.contentRect.width);
    }
  });
  observer.observe(element);
  return () => observer.disconnect();
}
