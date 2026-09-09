import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface ToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  /** Layout orientation. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  class?: string;
  children?: Snippet;
}

/**
 * Written out in full rather than aliased to a shared private interface.
 * svelte-package emits no `.d.ts` at all for a component whose props alias a
 * type it cannot re-export, so `Toolbar`'s group would ship untyped — see
 * Card.types.ts, which has exactly that problem.
 */
export interface ToolbarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  class?: string;
  children?: Snippet;
}
