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
import { getContext, setContext } from "svelte";
const KEY = Symbol("ui-organized.anchoredPositioning");
/** Called by a Root. Returns the holder whose `read()` it should feed to Ark. */
export function providePositioning(fallback) {
    let accessor = $state(null);
    const holder = {
        read: () => accessor?.() ?? fallback,
    };
    setContext(KEY, {
        set(next) {
            accessor = next;
        },
    });
    return holder;
}
/**
 * Called by a Content during initialisation. The accessor is invoked lazily by
 * the Root, so later prop changes are picked up.
 */
export function setAnchoredPositioning(accessor) {
    getContext(KEY)?.set(accessor);
}
/**
 * `side` + `align` collapse to one zag placement string, where a centred
 * alignment is spelled by leaving the suffix off entirely.
 */
export function toPlacement(side, align) {
    return (align === "center" ? side : `${side}-${align}`);
}
