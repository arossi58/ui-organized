import type { HTMLAttributes } from "react";
import type { ElementProps } from "@ui-organized/table-core";

/**
 * The one cast at the framework boundary.
 *
 * Core returns plain objects of `className` / `style` / `aria-*` / `data-*`,
 * typed against its own narrow `TableStyle` rather than React's
 * `CSSProperties` — which it cannot name without importing React. Rather than
 * pushing an `as` into all thirty spread sites, it lives here once, with the
 * reason attached.
 */
export function reactProps<E extends object = HTMLAttributes<HTMLElement>>(props: ElementProps): E {
  return props as unknown as E;
}
