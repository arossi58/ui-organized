<script lang="ts">
  import { PinInput as ArkPinInput } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { pinInputStyles } from "@ui-organized/core";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { PinInputProps } from "./PinInput.types.js";
  import "@ui-organized/core/components/PinInput/PinInput.css";

  const DEFAULT_LENGTH = 4;

  let {
    label,
    helperText,
    error,
    length = DEFAULT_LENGTH,
    size,
    variant,
    value = $bindable(),
    defaultValue,
    onValueChange,
    onValueComplete,
    type = "numeric",
    mask,
    otp,
    placeholder,
    blurOnComplete,
    required,
    disabled,
    readOnly,
    name,
    class: className,
  }: PinInputProps = $props();

  // The machine models the value as one string per cell; the public API is the
  // whole code as a single string. Same boundary coercion `Select` does for
  // `string ↔ string[]`, for the same reason: the array is an implementation
  // detail of the parts, not something a caller should have to assemble.
  function toCells(code: string | undefined, count: number): string[] | undefined {
    if (code == null) return undefined;
    return Array.from({ length: count }, (_, i) => code[i] ?? "");
  }

  const cellIndexes = $derived(Array.from({ length }, (_, i) => i));

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
</script>

<ArkPinInput.Root
  class={clsx(pinInputStyles({ size, variant }), className)}
  count={length}
  value={toCells(value, length)}
  defaultValue={toCells(defaultValue, length)}
  onValueChange={(details) => {
    const next = details.value.join("");
    value = next;
    onValueChange?.(next);
  }}
  onValueComplete={onValueComplete && ((details) => onValueComplete(details.value.join("")))}
  {type}
  {mask}
  {otp}
  {placeholder}
  {blurOnComplete}
  invalid={isInvalid}
  {required}
  {disabled}
  {readOnly}
  {name}
>
  {#if label}
    <ArkPinInput.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </ArkPinInput.Label>
  {/if}
  <ArkPinInput.Control class="pin-input__control">
    {#each cellIndexes as index (index)}
      <ArkPinInput.Input {index} class="pin-input__cell" />
    {/each}
  </ArkPinInput.Control>
  {#if helperText && !isInvalid}
    <span class="field__description">{helperText}</span>
  {/if}
  {#if isInvalid && errorMessage}
    <FieldError message={errorMessage} />
  {/if}
  <ArkPinInput.HiddenInput />
</ArkPinInput.Root>
