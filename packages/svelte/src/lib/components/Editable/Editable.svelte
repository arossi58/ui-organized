<script lang="ts">
  import { Editable as ArkEditable } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { editableStyles } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { EditableProps } from "./Editable.types.js";
  import "@ui-organized/core/components/Editable/Editable.css";
  import { onMount } from "svelte";
  import { trackFocusModality } from "@ui-organized/core/focus-modality";

  // Text fields read pointer vs keyboard for a quiet focus state on click.
  onMount(() => trackFocusModality());

  let {
    label,
    helperText,
    error,
    value = $bindable(),
    defaultValue,
    onValueChange,
    onValueCommit,
    placeholder,
    size = "md",
    activationMode,
    submitMode,
    showControls = false,
    autoResize,
    maxLength,
    required,
    disabled,
    readOnly,
    name,
    class: className,
  }: EditableProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
</script>

<ArkEditable.Root
  class={clsx(editableStyles({ size }), className)}
  {value}
  {defaultValue}
  onValueChange={(details) => {
    value = details.value;
    onValueChange?.(details.value);
  }}
  onValueCommit={onValueCommit && ((details) => onValueCommit(details.value))}
  {placeholder}
  {activationMode}
  {submitMode}
  {autoResize}
  {maxLength}
  invalid={isInvalid}
  {required}
  {disabled}
  {readOnly}
  {name}
>
  {#if label}
    <ArkEditable.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </ArkEditable.Label>
  {/if}
  <ArkEditable.Area class="editable__area">
    <ArkEditable.Preview class="editable__preview" />
    <ArkEditable.Input class="editable__input" />
  </ArkEditable.Area>
  <!--
    Ark keeps the edit trigger and the submit/cancel pair mounted in opposite
    states, so the row swaps without any local state here.

    Each trigger *is* the library Button, projected through Ark's asChild.
  -->
  {#if showControls}
    <ArkEditable.Control class="editable__control">
      <ArkEditable.EditTrigger>
        {#snippet asChild(props)}
          <Button intent="ghost" {size} type="button" {...props()}>
            Edit
          </Button>
        {/snippet}
      </ArkEditable.EditTrigger>
      <ArkEditable.SubmitTrigger>
        {#snippet asChild(props)}
          <Button intent="secondary" {size} type="button" {...props()}>
            Save
          </Button>
        {/snippet}
      </ArkEditable.SubmitTrigger>
      <ArkEditable.CancelTrigger>
        {#snippet asChild(props)}
          <Button intent="ghost" {size} type="button" {...props()}>
            Cancel
          </Button>
        {/snippet}
      </ArkEditable.CancelTrigger>
    </ArkEditable.Control>
  {/if}
  {#if helperText && !isInvalid}
    <span class="field__description">{helperText}</span>
  {/if}
  {#if isInvalid && errorMessage}
    <FieldError message={errorMessage} />
  {/if}
</ArkEditable.Root>
