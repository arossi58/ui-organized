import type { ButtonHTMLAttributes } from "vue";
import type { CanonicalIconName } from "@ui-organized/utils";
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
    | "destructive-ghost";
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /** Icon rendered alongside the label; a canonical name or a component. */
  icon?: CanonicalIconName | IconComponent;
  /** Which side of the label the icon sits on. @default "left" */
  iconPosition?: "left" | "right";
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
