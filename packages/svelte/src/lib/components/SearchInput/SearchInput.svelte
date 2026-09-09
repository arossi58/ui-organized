<script lang="ts">
  import { Field } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, searchInputFieldStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { SearchInputProps } from "./SearchInput.types.js";
  // Shares the Input field surface/state styling; InputAffix.css layers on the
  // leading icon and clear button.
  import "@ui-organized/core/components/Input/Input.css";
  import "@ui-organized/core/components/Input/InputAffix.css";

  let {
    label,
    helperText,
    error,
    size,
    required,
    clearable = true,
    onClear,
    class: className,
    value = $bindable(),
    defaultValue,
    disabled,
    ...inputProps
  }: SearchInputProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);

  let inputEl = $state<HTMLInputElement | null>(null);

  // React has to mirror the value into state and re-sync it from an effect,
  // because a controlled input's value lives outside the component. `bind:value`
  // puts it here whether or not the consumer binds as well, so the clear button
  // can just be derived — no second copy to keep in step.
  const hasValue = $derived(String((value ?? defaultValue) ?? "").length > 0);
  const showClear = $derived(clearable && hasValue && !disabled);

  function clear() {
    if (inputEl) {
      // Assigning `.value` fires no event, so a consumer listening on `oninput`
      // rather than binding would never learn the field was cleared.
      inputEl.value = "";
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      inputEl.focus();
    }
    value = "";
    onClear?.();
  }
</script>

<Field.Root class={clsx(searchInputFieldStyles({ size }), className)} invalid={isInvalid}>
  {#if label}
    <Field.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </Field.Label>
  {/if}
  <div class="input-affix">
    <span class="input-affix__adornment input-affix__adornment--start" aria-hidden="true">
      <Icon name="search" size={CONTROL_ICON_SIZE[size ?? "md"]} />
    </span>
    <Field.Input
      bind:ref={inputEl}
      type="search"
      class={clsx(
        "field__control",
        "field__control--affix-start",
        showClear && "field__control--affix-end",
      )}
      {required}
      {disabled}
      bind:value
      {defaultValue}
      {...inputProps}
    />
    {#if showClear}
      <!--
        Out of the tab order: the field it clears is the next stop anyway, and a
        control that appears and disappears as you type would otherwise shift the
        tab sequence under the keyboard user mid-word.
      -->
      <button
        type="button"
        class="input-affix__adornment input-affix__adornment--end input-affix__action"
        onclick={clear}
        aria-label="Clear search"
        tabindex={-1}
      >
        <Icon name="close" size={CONTROL_ICON_SIZE[size ?? "md"]} />
      </button>
    {/if}
  </div>
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
