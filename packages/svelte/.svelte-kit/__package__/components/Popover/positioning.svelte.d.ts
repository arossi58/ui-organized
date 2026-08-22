/**
 * The positioning bridge.
 *
 * Ark configures placement on the Root (`positioning`), but this library's API
 * keeps `side`/`align`/`sideOffset` on the Content — which is a descendant. So
 * the value has to travel *up*, and the two frameworks get there differently.
 *
 * React has no way to do it during render, so the Root holds `useState` and the
 * Content pushes into it from `useLayoutEffect`, re-running whenever the props
 * change.
 *
 * Svelte needs no effect, but it does need care: what the Content puts on the
 * context is an *accessor*, not a value. Handing over a plain object would
 * capture the props as they were at initialisation, and a Content whose `side`
 * later changed would go on being positioned the old way — silently, since
 * nothing throws and the popup still opens. Passing a function keeps the read
 * lazy, so the Root's `$derived` re-runs like any other reactive dependency.
 *
 * Four components share this shape (Popover, Menu, ContextMenu, HoverCard), so
 * it lives here rather than being written out four times.
 */
/**
 * The placements zag accepts, spelled out rather than imported.
 *
 * The type lives in @zag-js/popper, which is a transitive dependency of Ark
 * rather than one this package declares — and depending on it directly to reach
 * one union would couple us to Ark's internals for no benefit. It is exactly the
 * set `side` x `align` produces, so `toPlacement` is total over it.
 */
export type Placement = "top" | "top-start" | "top-end" | "right" | "right-start" | "right-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end";
export interface Positioning {
    placement?: Placement;
    gutter?: number;
    offset?: {
        crossAxis?: number;
        mainAxis?: number;
    };
}
export interface PositioningHolder {
    /** Read inside a `$derived` on the Root; re-runs when the Content's props change. */
    read: () => Positioning;
}
/** Called by a Root. Returns the holder whose `read()` it should feed to Ark. */
export declare function providePositioning(fallback: Positioning): PositioningHolder;
/**
 * Called by a Content during initialisation. The accessor is invoked lazily by
 * the Root, so later prop changes are picked up.
 */
export declare function setAnchoredPositioning(accessor: () => Positioning): void;
/**
 * `side` + `align` collapse to one zag placement string, where a centred
 * alignment is spelled by leaving the suffix off entirely.
 */
export declare function toPlacement(side: "top" | "right" | "bottom" | "left", align: "start" | "center" | "end"): Placement;
//# sourceMappingURL=positioning.svelte.d.ts.map