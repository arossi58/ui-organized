<script lang="ts">
  import { Field } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { textAreaFieldStyles } from "@ui-organized/core";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { TextAreaProps } from "./TextArea.types.js";
  // Shares the Input field surface/state styling; TextArea.css layers on the
  // multi-line specifics (min-height, resize).
  import "@ui-organized/core/components/Input/Input.css";
  import "@ui-organized/core/components/TextArea/TextArea.css";

  let {
    label,
    helperText,
    error,
    size,
    resize = "both",
    required,
    class: className,
    value = $bindable(),
    ...textareaProps
  }: TextAreaProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
</script>

<Field.Root class={clsx(textAreaFieldStyles({ size }), className)} invalid={isInvalid}>
  {#if label}
    <Field.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </Field.Label>
  {/if}
  <Field.Textarea
    class="field__control textarea-field__control"
    {required}
    data-resize={resize}
    bind:value
    {...textareaProps}
  />
  {#if helperText && !isInvalid}
    <Field.HelperText class="field__description">{helperText}</Field.HelperText>
  {/if}
  {#if isInvalid && errorMessage}
    <Field.ErrorText>
      {#snippet asChild(props)}
        <FieldError {...props()} message={errorMessage} />
      {/snippet}
    </Field.ErrorText>
  {/if}
</Field.Root>
