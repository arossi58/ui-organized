<script lang="ts">
  import { NumberInput, Field } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, numberFieldStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { NumberFieldProps } from "./NumberField.types.js";
  import "@ui-organized/core/components/NumberField/NumberField.css";

  let {
    value = $bindable(),
    defaultValue,
    onValueChange,
    min,
    max,
    step,
    format,
    placeholder,
    label,
    helperText,
    error,
    size = "md",
    disabled,
    readOnly,
    required,
    name,
    id,
    class: className,
  }: NumberFieldProps = $props();

  // The label sits on the Field, the input inside Ark's NumberInput — two
  // machines that would otherwise mint unrelated ids, leaving the label pointing
  // at nothing. Handing NumberInput the id the label uses is what ties them
  // together. React uses useId() here; this is Svelte's equivalent.
  const generatedId = $props.id();
  const fieldId = $derived(id ?? generatedId);

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
</script>

<Field.Root
  class={clsx(numberFieldStyles({ size }), className)}
  invalid={isInvalid}
  {disabled}
>
  {#if label}
    <Field.Label for={fieldId} class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </Field.Label>
  {/if}
  <!--
    Ark takes the value as a string and reports it as both, so the numeric facade
    is translated at the boundary: an empty string is the empty value, which the
    React package spells `null` and so does this one.
  -->
  <NumberInput.Root
    ids={{ input: fieldId }}
    value={value === undefined ? undefined : value === null ? "" : String(value)}
    defaultValue={defaultValue != null ? String(defaultValue) : undefined}
    onValueChange={(details) => {
      const next = details.value === "" ? null : details.valueAsNumber;
      value = next;
      onValueChange?.(next);
    }}
    {min}
    {max}
    {step}
    formatOptions={format}
    {disabled}
    {readOnly}
    {required}
    {name}
  >
    <NumberInput.Control class="number-field__group">
      <NumberInput.DecrementTrigger class="number-field__stepper" aria-label="Decrease">
        <Icon name="minus" size={CONTROL_ICON_SIZE[size]} />
      </NumberInput.DecrementTrigger>
      <NumberInput.Input class="field__control number-field__input" {placeholder} />
      <NumberInput.IncrementTrigger class="number-field__stepper" aria-label="Increase">
        <Icon name="plus" size={CONTROL_ICON_SIZE[size]} />
      </NumberInput.IncrementTrigger>
    </NumberInput.Control>
  </NumberInput.Root>
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
