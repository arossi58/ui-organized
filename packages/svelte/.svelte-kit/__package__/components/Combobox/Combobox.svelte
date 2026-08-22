<script lang="ts">
  import {
    Combobox as ArkCombobox, Field, Portal, createListCollection, useFilter,
  } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, comboboxFieldStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { ComboboxProps } from "./Combobox.types.js";
  import "@ui-organized/core/components/Combobox/Combobox.css";

  let {
    options,
    value = $bindable(),
    defaultValue,
    onValueChange,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    placeholder,
    label,
    helperText,
    error,
    size,
    disabled,
    name,
    required,
    class: className,
    emptyMessage = "No results found.",
    portalContainer,
  }: ComboboxProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
  const iconSize = $derived(CONTROL_ICON_SIZE[size ?? "md"]);

  // Ark does not filter for us: mirror the input text and rebuild the collection
  // from the matching options. Rendering items from `collection.items` keeps the
  // rendered list and the machine's collection in step.
  //
  // React memoises `useFilter`'s options object at module scope so the memo key
  // stays stable. Svelte needs no such care — `$derived` tracks the values it
  // reads rather than an argument identity — so the options are inline here.
  const filter = useFilter({ sensitivity: "base" });
  let query = $state("");

  const collection = $derived(
    createListCollection({
      items: query.trim().length
        ? options.filter((o) => filter().contains(o.label, query))
        : options,
      itemToValue: (o) => o.value,
      itemToString: (o) => o.label,
      isItemDisabled: (o) => !!o.disabled,
    }),
  );
</script>

<Field.Root
  class={clsx(comboboxFieldStyles({ size }), className)}
  invalid={isInvalid}
  {disabled}
>
  <!--
    Ark Combobox.Root renders a wrapping <div>; `display:contents` keeps the
    label, control and helper as direct flex children of the field.
  -->
  <ArkCombobox.Root
    class="combobox-field__root"
    {collection}
    value={value != null ? [value] : undefined}
    defaultValue={defaultValue != null ? [defaultValue] : undefined}
    onValueChange={(details) => {
      value = details.value[0] ?? "";
      onValueChange?.(details.value[0] ?? "");
    }}
    onInputValueChange={(details) => (query = details.inputValue)}
    {open}
    {defaultOpen}
    onOpenChange={(details) => {
      open = details.open;
      onOpenChange?.(details.open);
    }}
    invalid={isInvalid}
    {disabled}
    {name}
    {required}
    positioning={{ placement: "bottom-start", gutter: 4, strategy: "fixed" }}
  >
    {#if label}
      <ArkCombobox.Label class="field__label">
        {label}
        {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
      </ArkCombobox.Label>
    {/if}
    <ArkCombobox.Control class="combobox-field__control">
      <ArkCombobox.Input class="field__control combobox-field__input" {placeholder} />
      <ArkCombobox.Trigger class="combobox-field__trigger" aria-label="Toggle options">
        <Icon name="chevron-down" size={iconSize} />
      </ArkCombobox.Trigger>
    </ArkCombobox.Control>
    <Portal container={portalContainer ?? undefined}>
      <ArkCombobox.Positioner class="combobox-positioner">
        <ArkCombobox.Content class="combobox-popup">
          <ArkCombobox.Empty class="combobox-popup__empty text-default-body-medium">
            {emptyMessage}
          </ArkCombobox.Empty>
          <!--
            Items sit directly in Content, which is itself the listbox —
            Combobox.List is a second labelled wrapper for the non-composite
            mode, and in between it reads as a child of the listbox that isn't an
            option.
          -->
          {#each collection.items as item (item.value)}
            <ArkCombobox.Item {item} class="combobox-popup__item text-default-body-large">
              <span class="combobox-popup__item-label">{item.label}</span>
              <ArkCombobox.ItemIndicator class="combobox-popup__item-indicator">
                <Icon name="check" size={iconSize} />
              </ArkCombobox.ItemIndicator>
            </ArkCombobox.Item>
          {/each}
        </ArkCombobox.Content>
      </ArkCombobox.Positioner>
    </Portal>
  </ArkCombobox.Root>
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
