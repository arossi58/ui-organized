import type { IconName } from "../Icon/Icon.types.js";
import type { IconComponent } from "../../icons/registry.js";

export interface TagGroupProps {
  /** The short label in the inner pill: "New", "Beta", "v6.2". The default slot is the message. */
  tag: string;
  /** Colour of the pill and its tag. Defaults to 'brand'. */
  variant?: "brand" | "neutral" | "success" | "info" | "info-secondary" | "caution" | "error";
  /** `md` (12px text) or `lg` (14px). Defaults to 'md'. */
  size?: "md" | "lg";
  /** Whether the tag comes before the message or after it. Defaults to 'leading'. */
  tagPosition?: "leading" | "trailing";
  /** Renders the whole pill as a real `<a>`, with a trailing chevron. */
  href?: string;
  /** Passed to the anchor when `href` is set. */
  target?: string;
  /** Passed to the anchor when `href` is set. */
  rel?: string;
  /** A trailing icon. Defaults to a chevron when `href` is set, and none otherwise. */
  icon?: IconName | IconComponent;
}
