<script lang="ts">
  import { clsx } from "clsx";
  import { COMPARISON_ICONS, chipStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { ChipProps } from "./Chip.types.js";
  import "@ui-organized/core/components/Chip/Chip.css";

  /** Icons render at 16px across every chip size, exactly as `Tag`'s do. */
  const ICON_SIZE = 16;

  let {
    variant,
    size = "md",
    label,
    detail,
    operator,
    operatorLabel,
    children,
    icon,
    dropdown = false,
    selected = false,
    incomplete = false,
    disabled = false,
    onremove,
    removeLabel,
    class: className,
    ...rest
  }: ChipProps = $props();

  // A chip that opens something is a button; a static token with only a dismiss
  // control is not. `disabled` counts — there is nothing to disable on a token,
  // and a real disabled control is what exempts the dimmed label from axe's
  // contrast rule.
  const interactive = $derived(rest.onclick !== undefined || dropdown || disabled);
</script>

{#snippet content()}
  {#if icon}<Icon name={icon} size={ICON_SIZE} class="chip__icon" />{/if}
  {#if label}<span class="chip__label">{label}</span>{/if}
  <!-- Drawn or spelled, never both. The markup is in-repo and generated from
       the designer's SVGs; nothing here is user-supplied. -->
  {#if operator}
    <span
      class="icon chip__operator"
      role={operatorLabel ? "img" : undefined}
      aria-label={operatorLabel}
      aria-hidden={operatorLabel ? undefined : true}
    >{@html COMPARISON_ICONS[operator]}</span>
  {:else if detail}
    <span class="chip__detail">{detail}</span>
  {/if}
  {#if children}<span class="chip__value">{@render children()}</span>{/if}
  {#if dropdown}<Icon name="chevron-down" size={ICON_SIZE} class="chip__caret" />{/if}
{/snippet}

<!-- Two SIBLING controls in a plain wrapper. A dismiss button inside the body
     would be a button inside a button: invalid HTML, and an axe
     `nested-interactive` violation. -->
<span
  class={clsx(
    chipStyles({ variant, size }),
    selected && "chip--selected",
    incomplete && "chip--incomplete",
    disabled && "chip--disabled",
    className,
  )}
>
  {#if interactive}
    <button type="button" class="chip__body" {disabled} {...rest}>{@render content()}</button>
  {:else}
    <span class="chip__body">{@render content()}</span>
  {/if}

  {#if onremove}
    <button
      type="button"
      class="chip__remove"
      aria-label={removeLabel}
      {disabled}
      onclick={onremove}
    >
      <Icon name="close" size={ICON_SIZE} />
    </button>
  {/if}
</span>
