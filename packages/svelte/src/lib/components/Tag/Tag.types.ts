import type { HTMLAttributes } from "svelte/elements";
import type { Snippet } from "svelte";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { IconComponent } from "../../icons/registry.js";
import type { ControlSize } from "@ui-organized/core";

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "class"> {
  /** Status color variant. */
  variant?: "success" | "info" | "info-secondary" | "caution" | "warning" | "error";
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /**
   * When true (default), renders a solid filled tag with high-contrast text.
   * When false, renders a subdued tinted-background tag with colored text.
   */
  emphasized?: boolean;
  /**
   * Optional icon rendered inside the tag — a canonical icon name or an icon
   * component. Rendered at 16px across every tag size, `spacing-01` from the
   * label.
   */
  icon?: CanonicalIconName | IconComponent;
  /** Which side of the label the icon sits on. Defaults to 'left'. */
  iconPosition?: "left" | "right";
  class?: string;
  children?: Snippet;
}
