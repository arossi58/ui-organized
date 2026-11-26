import type { IconName } from "../Icon/Icon.types.js";
import type { ButtonHTMLAttributes } from "vue";
import type { ControlSize } from "@ui-organized/core";
import type { IconComponent } from "../../icons/registry.js";

export interface ButtonProps extends /* @vue-ignore */ Omit<ButtonHTMLAttributes, "class"> {
  /**
   * Visual style intent. Defaults to 'primary'.
   *
   * Spelled out rather than taken from cva's `ButtonVariants`, which widens
   * every variant with `null` — a value the recipe accepts but the component's
   * API should not.
   */
  intent?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "ghost"
    | "destructive"
    | "destructive-ghost"
    | "link"
    | "link-neutral";
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /** Icon rendered alongside the label; its native name in the active library, or a component. */
  icon?: IconName | IconComponent;
  /** Which side of the label the icon sits on. @default "left" */
  iconPosition?: "left" | "right";
  /**
   * Show a spinner and stop responding while an action runs. The spinner takes
   * the icon's place (or the leading edge when there is no icon), the button
   * keeps its focus and its label, and it is marked `aria-busy` and
   * `aria-disabled` rather than `disabled`, so focus is not lost mid-request.
   */
  loading?: boolean;
  /**
   * Render a real `<a href>` with the button's appearance, for an action that
   * navigates. Disabled or loading, the anchor drops its `href` and is marked
   * `aria-disabled`. For a router link, use `asChild` instead.
   */
  href?: string;
  /** Passed to the anchor when `href` is set. */
  target?: string;
  /** Passed to the anchor when `href` is set. */
  rel?: string;
  /** Passed to the anchor when `href` is set. */
  download?: boolean | string;
  /** @default "button" — so a button inside a form does not submit by accident. */
  type?: "button" | "submit" | "reset";
  /**
   * Render the slot's own root element as the button instead of a native
   * `<button>`, merging in the button's classes and attributes.
   *
   * This is Ark UI's Vue convention — a boolean, with the merged props landing
   * on the single root element the default slot renders. It is a third distinct
   * spelling of the same idea: React takes an element, Svelte takes a snippet.
   * Ark UI has no Button primitive, so this is what makes a CTA a real,
   * crawlable link while staying the library Button.
   */
  asChild?: boolean;
}
