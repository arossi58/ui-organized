<script lang="ts">
  import { Field, Select as ArkSelect, Portal, createListCollection } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, selectFieldStyles, OMIT_ARIA } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import SelectTrigger from "./SelectTrigger.svelte";
  import type { SelectProps } from "./Select.types.js";
  import "@ui-organized/core/components/Select/Select.css";

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
    variant,
    disabled,
    name,
    required,
    class: className,
    portalContainer,
  }: SelectProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
  const iconSize = $derived(CONTROL_ICON_SIZE[size ?? "md"]);

  // The ghost variant shows no label. It still renders one — visually hidden —
  // because Ark names the trigger, the listbox and the hidden <select> after the
  // Label part, and an `aria-label` on the trigger alone can neither replace a
  // dangling reference nor reach the other two.
  const isGhost = $derived(variant === "ghost");

  // Ark drives the dropdown off a collection rather than children; build it from
  // the `options` array (label -> display text, value -> form value).
  const collection = $derived(
    createListCollection({
      items: options,
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
      isItemDisabled: (item) => !!item.disabled,
    }),
  );
</script>

<Field.Root
  class={clsx(selectFieldStyles({ size, variant }), className)}
  invalid={isInvalid}
  {disabled}
>
  <!--
    Ark Select.Root renders a wrapping <div>; `display:contents` keeps the label,
    trigger and helper as direct flex children of the field.
  -->
  <!--
    `open` is passed as a plain prop rather than bound: Ark's Select.Root does
    not declare it bindable the way Popover and Dialog do. The local state is
    kept in step through onOpenChange instead, so `bind:open` still works on
    *this* component.
  -->
  <ArkSelect.Root
    class="select-field__control"
    {collection}
    value={value != null ? [value] : undefined}
    defaultValue={defaultValue != null ? [defaultValue] : undefined}
    onValueChange={(details) => {
      const next = details.value[0];
      if (next != null) {
        value = next;
        onValueChange?.(next);
      }
    }}
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
      <ArkSelect.Label class={isGhost ? "select-field__label--hidden" : "field__label"}>
        {label}
        {#if required && !isGhost}<span class="field__required" aria-hidden="true"></span>{/if}
      </ArkSelect.Label>
    {/if}
    <SelectTrigger hasLabel={!!label}>
      {#snippet children()}
        <ArkSelect.ValueText class="select-field__value" {placeholder} />
        <ArkSelect.Indicator class="select-field__icon">
          <Icon name="chevron-down" size={iconSize} />
        </ArkSelect.Indicator>
      {/snippet}
    </SelectTrigger>
    <Portal container={portalContainer ?? undefined}>
      <ArkSelect.Positioner class="select-positioner">
        <ArkSelect.Content
          class={clsx("select-popup", isGhost && "select-popup--ghost")}
          aria-labelledby={label ? undefined : OMIT_ARIA}
        >
          <!--
            Items sit directly in Content: with the default composite select,
            Content *is* the listbox, and Select.List is a second labelled
            wrapper meant for the non-composite mode. Between the listbox and its
            options it counts as a child that isn't an option, which a listbox
            may not have.
          -->
          {#each options as opt (opt.value)}
            <ArkSelect.Item item={opt} class="select-popup__item text-default-body-large">
              <ArkSelect.ItemText>{opt.label}</ArkSelect.ItemText>
              <ArkSelect.ItemIndicator class="select-popup__item-indicator">
                <Icon name="check" size={iconSize} />
              </ArkSelect.ItemIndicator>
            </ArkSelect.Item>
          {/each}
        </ArkSelect.Content>
      </ArkSelect.Positioner>
    </Portal>
    <ArkSelect.HiddenSelect aria-labelledby={label ? undefined : OMIT_ARIA} />
  </ArkSelect.Root>
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
