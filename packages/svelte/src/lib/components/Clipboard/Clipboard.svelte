<script lang="ts">
  import { Clipboard as ArkClipboard } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, clipboardStyles } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import Icon from "../Icon/Icon.svelte";
  import type { ClipboardProps } from "./Clipboard.types.js";
  import "@ui-organized/core/components/Clipboard/Clipboard.css";

  let {
    value,
    label,
    helperText,
    variant = "input",
    size = "md",
    copyLabel = "Copy",
    copiedLabel = "Copied",
    timeout,
    onStatusChange,
    class: className,
  }: ClipboardProps = $props();

  const iconSize = $derived(CONTROL_ICON_SIZE[size]);
</script>

<ArkClipboard.Root
  class={clsx(clipboardStyles({ size, variant }), className)}
  {value}
  {timeout}
  onStatusChange={onStatusChange && ((details) => onStatusChange(details.copied))}
>
  {#if label}
    <ArkClipboard.Label class="field__label">{label}</ArkClipboard.Label>
  {/if}
  <ArkClipboard.Control class="clipboard__control">
    {#if variant === "input"}
      <ArkClipboard.Input class="clipboard__input" />
    {/if}
    <!--
      The trigger *is* the library Button: Ark hands its props to whatever the
      asChild snippet renders, so the copy control inherits every interactive
      token instead of restating them.
    -->
    <ArkClipboard.Trigger>
      {#snippet asChild(props)}
        <!--
          `class` is pulled out and handed over separately: Ark types the
          projected props in Svelte's own shapes, where it is a `ClassValue` that
          may be null, while the Button takes a string. Passing it through clsx
          merges it the way Ark's React `asChild` does, rather than dropping a
          class the Trigger might one day carry.
        -->
        {@const { class: arkClass, ...triggerProps } = props()}
        <Button intent="secondary" {size} class={clsx(arkClass)} {...triggerProps}>
          {#snippet children()}
            <!--
              The trigger swaps both its icon and its label on copy. Indicator
              renders its `copied` snippet in the copied state and its own
              children otherwise, so the swap costs no local state. The icon goes
              through an Indicator rather than the Button's `icon` prop because
              only the Indicator knows the state.
            -->
            <ArkClipboard.Indicator class="clipboard__indicator">
              {#snippet copied()}<Icon name="check" size={iconSize} />{/snippet}
              <Icon name="copy" size={iconSize} />
            </ArkClipboard.Indicator>
            <ArkClipboard.Indicator>
              {#snippet copied()}{copiedLabel}{/snippet}
              {copyLabel}
            </ArkClipboard.Indicator>
          {/snippet}
        </Button>
      {/snippet}
    </ArkClipboard.Trigger>
  </ArkClipboard.Control>
  {#if helperText}
    <span class="field__description">{helperText}</span>
  {/if}
</ArkClipboard.Root>
