<!--
  A prominent message about the state of something.

  `role="alert"` is the component's own, not the caller's job: an alert that
  assistive technology does not announce is a coloured box.

  There is no Ark machine behind this one — Ark UI has no Alert primitive — so
  the markup here *is* the contract, and the parity gate compares it element for
  element against the React library's.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { alertStyles } from "@ui-organized/core";
  import type { CanonicalIconName } from "@ui-organized/utils";
  import Icon from "../Icon/Icon.svelte";
  import type { AlertProps } from "./Alert.types.js";
  import "@ui-organized/core/components/Alert/Alert.css";

  /** Each variant announces itself with its own glyph before anyone reads the text. */
  const VARIANT_ICONS: Record<NonNullable<AlertProps["variant"]>, CanonicalIconName> = {
    info:    "info",
    success: "check-circle",
    warning: "alert-triangle",
    error:   "alert-circle",
  };

  const ICON_SIZE = 20;

  let { variant = "info", title, children, onDismiss, class: className }: AlertProps = $props();
</script>

<div role="alert" class={clsx(alertStyles({ variant }), className)}>
  <span class="alert__icon">
    <Icon name={VARIANT_ICONS[variant]} size={ICON_SIZE} />
  </span>
  <div class="alert__body">
    {#if title}
      <div class="alert__title text-strong-body-medium">{title}</div>
    {/if}
    <div class="alert__message text-default-body-medium">{@render children()}</div>
  </div>
  {#if onDismiss}
    <button type="button" class="alert__dismiss" aria-label="Dismiss alert" onclick={() => onDismiss()}>
      <Icon name="close" size={ICON_SIZE} />
    </button>
  {/if}
</div>
