<script lang="ts">
  import { Clipboard as ArkClipboard } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, clipboardStyles } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import Icon from "../Icon/Icon.svelte";
  import type { ClipboardProps } from "./Clipboard.types.js";
  import "@ui-organized/core/components/Clipboard/Clipboard.css";
  import { glyph } from "../../icons/glyph.js";

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
          Spread whole, `class` included: the Button types it as a `ClassValue`,
          the shape Ark projects it in, and merges it after its own classes the
          way Ark's React `asChild` does, so a class the Trigger might one day
          carry is kept rather than dropped.
        -->
        <Button intent="secondary" {size} {...props()}>
          {#snippet children()}
            <!--
              The trigger swaps both its icon and its label on copy. Indicator
              renders its `copied` snippet in the copied state and its own
              children otherwise, so the swap costs no local state. The icon goes
              through an Indicator rather than the Button's `icon` prop because
              only the Indicator knows the state.
            -->
            <ArkClipboard.Indicator class="clipboard__indicator">
              {#snippet copied()}<Icon name={glyph("check")} size={iconSize} />{/snippet}
              <Icon name={glyph("copy")} size={iconSize} />
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
