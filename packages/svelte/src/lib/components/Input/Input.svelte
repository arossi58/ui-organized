<script lang="ts">
  import { Field } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { inputFieldStyles } from "@ui-organized/core";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { InputProps } from "./Input.types.js";
  import "@ui-organized/core/components/Input/Input.css";

  let {
    label,
    helperText,
    error,
    size,
    required,
    id,
    class: className,
    value = $bindable(),
    ...inputProps
  }: InputProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
</script>

<Field.Root class={clsx(inputFieldStyles({ size }), className)} invalid={isInvalid} {id}>
  {#if label}
    <Field.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </Field.Label>
  {/if}
  <Field.Input class="field__control" {required} bind:value {...inputProps} />
  {#if helperText && !isInvalid}
    <Field.HelperText class="field__description">{helperText}</Field.HelperText>
  {/if}
  {#if isInvalid && errorMessage}
    <!--
      Ark's ErrorText renders only while the Field is invalid, and `asChild`
      hands its props to whatever we render in its place — here the shared
      FieldError, so the message keeps its icon and its aria-describedby wiring.
    -->
    <Field.ErrorText>
      {#snippet asChild(props)}
        <FieldError {...props()} message={errorMessage} />
      {/snippet}
    </Field.ErrorText>
  {/if}
</Field.Root>
