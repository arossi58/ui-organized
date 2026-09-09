import type { Action } from "svelte/action";

/**
 * Hand an element to a callback when it mounts, and `null` when it goes.
 *
 * React takes a callback ref for the root and the viewport because it needs a
 * *render* when the node appears; Vue binds a template ref and watches it.
 * Svelte 5 has `bind:this`, but a plain variable assignment is not something a
 * `$derived` elsewhere can watch — and the resize and scroll observers have to
 * re-run when the node arrives. An action calling into the api's own `$state` is
 * what makes that reactive.
 *
 * ```svelte
 * <div use:elementRef={table.rootRef}>
 * ```
 */
export const elementRef: Action<HTMLElement, (element: HTMLElement | null) => void> = (
  node,
  set,
) => {
  set?.(node);
  return {
    destroy: () => set?.(null),
  };
};
