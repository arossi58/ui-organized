import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { KbdPlatform } from "@ui-organized/core";

export interface KbdProps extends Omit<HTMLAttributes<HTMLElement>, "class" | "children"> {
  /**
   * The keys of a shortcut, pressed together: `["mod", "k"]`. `mod` is ⌘ on a
   * Mac and Ctrl elsewhere; named keys such as `shift` and `enter` are drawn
   * as the platform draws them.
   */
  keys?: string[];
  /** One key written out, for a key `keys` does not name. Ignored when `keys` is set. */
  children?: Snippet;
  /** Size. Defaults to `md`; `sm` sits beside body text and in menu rows. */
  size?: "sm" | "md";
  /**
   * Whose keys to draw. `auto` follows the reader's platform once mounted, and
   * draws `other` on the server and the first render. Defaults to `auto`.
   */
  platform?: KbdPlatform;
  class?: string;
}
