/**
 * The positioning bridge.
 *
 * Ark configures placement on the Root (`positioning`), but this library's API
 * keeps `side`/`align`/`sideOffset` on the Content — a descendant — so the value
 * has to travel *up*.
 *
 * React holds `useState` on the Root and the Content pushes into it from
 * `useLayoutEffect`. Svelte hands over an accessor. Vue's provide/inject can do
 * the same thing with a ref, and it must be a ref rather than a snapshot for the
 * same reason: a Content whose `side` later changed would otherwise go on being
 * positioned the old way, silently.
 *
 * Four components share this shape (Popover, Menu, ContextMenu, HoverCard), so
 * it lives here rather than being written out four times.
 */

import { inject, provide, ref, type InjectionKey, type Ref } from "vue";

/**
 * The placements zag accepts, spelled out rather than imported. The type lives
 * in @zag-js/popper, a transitive dependency of Ark rather than one this package
 * declares, and depending on it to reach one union would couple us to Ark's
 * internals for no benefit.
 */
export type Placement =
  | "top" | "top-start" | "top-end"
  | "right" | "right-start" | "right-end"
  | "bottom" | "bottom-start" | "bottom-end"
  | "left" | "left-start" | "left-end";

export interface Positioning {
  placement?: Placement;
  gutter?: number;
  offset?: { crossAxis?: number; mainAxis?: number };
}

const KEY: InjectionKey<Ref<Positioning>> = Symbol("ui-organized.anchoredPositioning");

/** Called by a Root. Returns the ref it should feed to Ark. */
export function providePositioning(initial: Positioning): Ref<Positioning> {
  const positioning = ref<Positioning>(initial);
  provide(KEY, positioning);
  return positioning;
}

/** Called by a Content to set the placement it wants. */
export function useAnchoredPositioning(): Ref<Positioning> | undefined {
  return inject(KEY, undefined);
}

/**
 * `side` + `align` collapse to one zag placement string, where a centred
 * alignment is spelled by leaving the suffix off entirely.
 */
export function toPlacement(
  side: "top" | "right" | "bottom" | "left",
  align: "start" | "center" | "end",
): Placement {
  return (align === "center" ? side : `${side}-${align}`) as Placement;
}
