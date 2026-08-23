<!-- A two-state button that can be on or off. -->
<script lang="ts">
  import { Toggle as ArkToggle, ToggleGroup as ArkToggleGroup } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, CONTROL_TEXT_CLASS, toggleStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { ToggleProps } from "./Toggle.types.js";
  import "@ui-organized/core/components/Toggle/Toggle.css";

  let {
    pressed = $bindable(),
    defaultPressed,
    onPressedChange,
    value,
    size = "md",
    icon,
    class: className,
    children,
    ...rest
  }: ToggleProps = $props();

  // An icon with no label collapses to a square (see `.toggle--icon-only`) whose
  // side matches the labelled height for the size, mirroring the Button so icon
  // toggles line up with text toggles instead of rendering short and wide.
  //
  // React can inspect its children and treat `""` or `false` as absent; a Svelte
  // snippet is opaque, so "no label" is spelled the only way it can be — the
  // snippet was never passed. Same rule the Button uses.
  const isIconOnly = $derived(icon != null && children === undefined);

  const toggleClass = $derived(
    clsx(
      CONTROL_TEXT_CLASS[size],
      toggleStyles({ size }),
      isIconOnly && "toggle--icon-only",
      className,
    ),
  );
</script>

{#snippet content()}
  {#if icon}<Icon name={icon} size={CONTROL_ICON_SIZE[size]} />{/if}
  {@render children?.()}
{/snippet}

<!--
  Ark splits the standalone toggle (Toggle.Root) from the group item
  (ToggleGroup.Item). A `value` marks a group item — it derives its pressed state
  from the parent group rather than holding its own.
-->
{#if value !== undefined}
  <ArkToggleGroup.Item {value} class={toggleClass} {...rest}>
    {@render content()}
  </ArkToggleGroup.Item>
{:else}
  <ArkToggle.Root
    bind:pressed
    {defaultPressed}
    onPressedChange={(next) => {
      pressed = next;
      onPressedChange?.(next);
    }}
    class={toggleClass}
    {...rest}
  >
    {@render content()}
  </ArkToggle.Root>
{/if}
