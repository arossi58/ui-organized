<script lang="ts">
  import { clsx } from "clsx";
  import type { MouseEventHandler } from "svelte/elements";
  import { CONTROL_ICON_SIZE, CONTROL_TEXT_CLASS, buttonStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import Spinner from "../Spinner/Spinner.svelte";
  import type { ButtonProps } from "./Button.types.js";
  import "@ui-organized/core/components/Button/Button.css";

  let {
    intent,
    size = "md",
    icon,
    iconPosition = "left",
    loading = false,
    href,
    target,
    rel,
    download,
    type = "button",
    disabled,
    onclick,
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

  // While loading, the spinner takes the icon's slot, or the leading one when
  // there is no icon. It is decorative: the button itself is marked busy.
  const spinnerSide = $derived(icon ? iconPosition : "left");

  // Busy, not disabled: `disabled` would drop focus to the document the moment
  // the request starts. The click is swallowed here instead, which also stops a
  // submit button submitting its form a second time.
  const busy = $derived(
    loading ? ({ "aria-busy": "true", "aria-disabled": "true", "data-loading": "" } as const) : {},
  );
  const handleClick: MouseEventHandler<HTMLElement> | null | undefined = $derived(
    loading
      ? (event: MouseEvent) => event.preventDefault()
      : (onclick as MouseEventHandler<HTMLElement> | null | undefined),
  );

  // Inert (disabled or loading), an anchor keeps the link role but loses its
  // `href`, so it can't be followed, opened in a new tab or reached with Tab.
  const inertLink = $derived(loading || !!disabled);

  // `type` is deliberately absent: it is meaningful on <button> and meaningless
  // (or wrong) on the <a> an asChild snippet most often renders.
  const childProps = () => ({
    ...rest,
    ...busy,
    href,
    target,
    rel,
    download,
    disabled,
    onclick: handleClick,
    class: buttonClass,
  });
</script>

{#snippet content()}
  {#if loading}
    {#if spinnerSide === "left"}<Spinner {size} decorative />{/if}
  {:else if icon && iconPosition === "left"}<Icon name={icon} size={CONTROL_ICON_SIZE[size]} />{/if}
  {@render children?.()}
  {#if loading}
    {#if spinnerSide === "right"}<Spinner {size} decorative />{/if}
  {:else if icon && iconPosition === "right"}<Icon name={icon} size={CONTROL_ICON_SIZE[size]} />{/if}
{/snippet}

{#if asChild}
  {@render asChild(childProps, content)}
{:else if href !== undefined}
  <a
    class={buttonClass}
    href={inertLink ? undefined : href}
    {target}
    {rel}
    {download}
    role={inertLink ? "link" : undefined}
    aria-disabled={inertLink ? "true" : undefined}
    data-disabled={disabled ? "" : undefined}
    aria-busy={loading ? "true" : undefined}
    data-loading={loading ? "" : undefined}
    onclick={handleClick}
    {...rest as Record<string, unknown>}
  >
    {@render content()}
  </a>
{:else}
  <button {type} class={buttonClass} {disabled} {...busy} onclick={handleClick} {...rest}>
    {@render content()}
  </button>
{/if}
