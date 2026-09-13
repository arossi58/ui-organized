<!--
  Reusable inline error message for form controls (Input, Select, …).

  Renders a filled alert icon followed by the message on a subdued error-tinted
  pill. Use it standalone, or as the `asChild` target of an Ark `Field.ErrorText`
  so the message stays wired to the control through `aria-describedby`.

  Takes either a `children` snippet or a plain `message` string. React can accept
  `children` as a string and test it for emptiness; a Svelte snippet is opaque,
  so the components that pass an error message they got as a string pass it as
  `message` and the emptiness check keeps working.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import Icon from "../Icon/Icon.svelte";
  import type { FieldErrorProps } from "./FieldError.types.js";
  import "@ui-organized/core/components/FieldError/FieldError.css";

  let { children, message, class: className, ...rest }: FieldErrorProps = $props();

  const empty = $derived(!children && (message == null || message === ""));
</script>

{#if !empty}
  <span class={clsx("field-error", "text-emphasis-caption", className)} {...rest}>
    <Icon name="alert-circle" size={12} class="field-error__icon" />
    {#if children}{@render children()}{:else}{message}{/if}
  </span>
{/if}
