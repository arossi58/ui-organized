import type { KbdPlatform } from "@ui-organized/core";

export interface KbdProps {
  /**
   * The keys of a shortcut, pressed together: `["mod", "k"]`. `mod` is ⌘ on a
   * Mac and Ctrl elsewhere; named keys such as `shift` and `enter` are drawn
   * as the platform draws them. Without it, the default slot is one key.
   */
  keys?: string[];
  /** Size. Defaults to `md`; `sm` sits beside body text and in menu rows. */
  size?: "sm" | "md";
  /**
   * Whose keys to draw. `auto` follows the reader's platform once mounted, and
   * draws `other` on the server and the first render. Defaults to `auto`.
   */
  platform?: KbdPlatform;
}
