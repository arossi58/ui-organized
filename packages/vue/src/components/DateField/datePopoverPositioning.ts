/**
 * Ark popover positioning that anchors the calendar to the *field* (or the
 * start/end row) rather than to the small trigger button, and floats it below,
 * left-aligned. Set on the controlled `Popover.Root` alongside `initialFocusEl`.
 *
 * The anchor arrives as an accessor rather than an element, because the element
 * does not exist yet when the Root is initialised — reading it lazily inside
 * `getAnchorRect` is what lets one object be built once and stay correct.
 *
 * React's version also merges the preview-container overrides from
 * `useContainedPositioning()`. That context is a docs-site concern living in the
 * React package's `preview/`, and has no counterpart here; the placement, gutter
 * and strategy — the part that is the component's own behaviour — are identical.
 */
export interface DatePopoverPositioning {
  placement: "bottom-start";
  gutter: number;
  strategy: "fixed";
  getAnchorRect: () => { x: number; y: number; width: number; height: number } | null;
}

export function datePopoverPositioning(
  anchor: () => HTMLElement | null,
): DatePopoverPositioning {
  return {
    placement: "bottom-start",
    gutter: 6,
    strategy: "fixed",
    getAnchorRect: () => {
      const r = anchor()?.getBoundingClientRect();
      return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null;
    },
  };
}
