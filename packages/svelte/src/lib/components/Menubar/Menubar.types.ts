import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface MenubarProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  /** Layout orientation. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  class?: string;
  children?: Snippet;
}
