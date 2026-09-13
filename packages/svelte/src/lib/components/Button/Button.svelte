<script lang="ts">
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, CONTROL_TEXT_CLASS, buttonStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { ButtonProps } from "./Button.types.js";
  import "@ui-organized/core/components/Button/Button.css";

  let {
    intent,
    size = "md",
    icon,
    iconPosition = "left",
    type = "button",
    class: className,
    children,
    asChild,
    ...rest
  }: ButtonProps = $props();

  // An icon with no label collapses to a square (see `.btn--icon-only`) whose
  // side matches the labelled-button height for the size, so icon buttons line
  // up with text buttons instead of rendering short and wide.
  const isIconOnly = $derived(icon != null && children === undefined);

  const buttonClass = $derived(
    clsx(
      CONTROL_TEXT_CLASS[size],
      buttonStyles({ intent, size }),
      isIconOnly && "btn--icon-only",
      className,
    ),
  );

  // `type` is deliberately absent: it is meaningful on <button> and meaningless
  // (or wrong) on the <a> an asChild snippet most often renders.
  const childProps = () => ({ ...rest, class: buttonClass });
</script>

{#snippet content()}
  {#if icon && iconPosition === "left"}<Icon name={icon} size={CONTROL_ICON_SIZE[size]} />{/if}
  {@render children?.()}
  {#if icon && iconPosition === "right"}<Icon name={icon} size={CONTROL_ICON_SIZE[size]} />{/if}
{/snippet}

{#if asChild}
  {@render asChild(childProps, content)}
{:else}
  <button {type} class={buttonClass} {...rest}>
    {@render content()}
  </button>
{/if}
