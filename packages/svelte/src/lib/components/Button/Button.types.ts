import type { IconName } from "../Icon/Icon.types.js";
import type { ClassValue, HTMLButtonAttributes } from "svelte/elements";
import type { Snippet } from "svelte";
import type { ControlSize } from "@ui-organized/core";
import type { IconComponent } from "../../icons/registry.js";

/**
 * The props a polymorphic `asChild` snippet receives, as a function so the
 * consumer spreads them at the point of use. This is Ark UI's own convention —
 * matching it means a ui-organized Button composes with an Ark trigger exactly
 * the way an Ark part does.
 */
export type ButtonPropsFn = () => Record<string, unknown>;

export interface ButtonProps extends Omit<HTMLButtonAttributes, "class"> {
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
  /** Icon rendered alongside the label; its native name in the active library, or a component. */
  icon?: IconName | IconComponent;
  /** Which side of the label the icon sits on. @default "left" */
  iconPosition?: "left" | "right";
  /** @default "button" — so a button inside a form does not submit by accident. */
  type?: HTMLButtonAttributes["type"];
  /**
   * Merged after the recipe's classes. A `ClassValue`, the same as any element's
   * `class`, rather than a string: the Button is the most common receiver of an
   * Ark `asChild`, whose props arrive in Svelte's own shapes, and a narrower
   * type makes `<Button {...props()}>` fail to typecheck. See ../../types.ts.
   */
  class?: ClassValue | null;
  children?: Snippet;
  /**
   * Render something else as the button — an anchor, a router link — combining
   * its props and behaviour. Ark UI has no Button primitive, so this is what
   * makes a CTA a real, crawlable link while staying the library Button.
   *
   * Receives the props to spread *and* the button's own content, because the
   * content is not just `children`: it is the icon and the label in the order
   * `iconPosition` asks for. Ark's own `asChild` passes props alone, which is
   * right for its parts — they have no content of their own to contribute.
   * Dropping the second argument here would silently lose the icon.
   *
   * The label goes in the body beside the snippet, not inside it: Svelte
   * passes a body that is only a `{#snippet}` as that snippet and nothing
   * else, so with no label there `children` is unset, `content()` has nothing
   * to render, and the link comes out empty.
   *
   * ```svelte
   * <Button intent="primary">
   *   See pricing
   *   {#snippet asChild(props, content)}
   *     <a href="/pricing" {...props()}>{@render content()}</a>
   *   {/snippet}
   * </Button>
   * ```
   */
  asChild?: Snippet<[ButtonPropsFn, Snippet]>;
}
