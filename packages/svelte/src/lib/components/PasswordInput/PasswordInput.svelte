<script lang="ts">
  import { Field } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, passwordInputFieldStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { PasswordInputProps } from "./PasswordInput.types.js";
  // Shares the Input field surface/state styling; InputAffix.css layers on the
  // trailing show/hide toggle.
  import "@ui-organized/core/components/Input/Input.css";
  import "@ui-organized/core/components/Input/InputAffix.css";

  let {
    label,
    helperText,
    error,
    size,
    required,
    showToggle = true,
    class: className,
    disabled,
    value = $bindable(),
    ...inputProps
  }: PasswordInputProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);

  let visible = $state(false);
</script>

<Field.Root class={clsx(passwordInputFieldStyles({ size }), className)} invalid={isInvalid}>
  {#if label}
    <Field.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </Field.Label>
  {/if}
  <div class="input-affix">
    <Field.Input
      type={visible ? "text" : "password"}
      class={clsx("field__control", showToggle && "field__control--affix-end")}
      {required}
      {disabled}
      bind:value
      {...inputProps}
    />
    {#if showToggle}
      <!--
        A plain button rather than a Toggle: it reveals the field rather than
        changing its value, so it stays out of the form's tab-and-submit story
        and is named by what it will do next.
      -->
      <button
        type="button"
        class="input-affix__adornment input-affix__adornment--end input-affix__action"
        onclick={() => (visible = !visible)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        {disabled}
      >
        <Icon name={visible ? "eye-off" : "eye"} size={CONTROL_ICON_SIZE[size ?? "md"]} />
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
