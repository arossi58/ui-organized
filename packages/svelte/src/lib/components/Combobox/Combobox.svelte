<script lang="ts" generics="M extends boolean = false">
  import {
    Combobox as ArkCombobox, Field, Portal, createListCollection, useFilter,
  } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, comboboxFieldStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import SelectedLabelSync from "./SelectedLabelSync.svelte";
  import ComboboxTags from "./ComboboxTags.svelte";
  import ComboboxMultiParts from "./ComboboxMultiParts.svelte";
  import type { ComboboxProps } from "./Combobox.types.js";
  // The shared field chrome, ahead of this component's own sheet, which may override it.
  import "@ui-organized/core/components/Field/Field.css";
  import "@ui-organized/core/components/Combobox/Combobox.css";
  import { glyph } from "../../icons/glyph.js";
  import { onMount } from "svelte";
  import { trackFocusModality } from "@ui-organized/core/focus-modality";

  // Text fields read pointer vs keyboard for a quiet focus state on click.
  onMount(() => trackFocusModality());

  let {
    multiple,
    clearLabel = "Clear all",
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
  }: ComboboxProps<M> = $props();
  let control = $state<HTMLElement | null>(null);

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
    {multiple}
    value={multiple ? (value as string[] | undefined) : value != null ? [value as string] : undefined}
    defaultValue={multiple
      ? (defaultValue as string[] | undefined)
      : defaultValue != null
        ? [defaultValue as string]
        : undefined}
    onValueChange={(details) => {
      if (multiple) {
        value = details.value as typeof value;
        (onValueChange as ((v: string[]) => void) | undefined)?.(details.value);
        return;
      }
      value = (details.value[0] ?? "") as typeof value;
      (onValueChange as ((v: string) => void) | undefined)?.(details.value[0] ?? "");
    }}
    selectionBehavior={multiple ? "clear" : undefined}
    closeOnSelect={multiple ? false : undefined}
    onInteractOutside={(event) => {
      // A click on a tag's remove button is inside the field, not outside the list.
      if (multiple && control?.contains(event.target as Node)) event.preventDefault();
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
    name={multiple ? undefined : name}
    required={multiple ? undefined : required}
    positioning={{ placement: "bottom-start", gutter: 4, strategy: "fixed" }}
  >
    {#if !multiple}<SelectedLabelSync {options} />{/if}
    {#if label}
      <ArkCombobox.Label class="field__label">
        {label}
        {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
      </ArkCombobox.Label>
    {/if}
    <ArkCombobox.Control class="combobox-field__control" bind:ref={control}>
      {#if multiple}<ComboboxTags {options} />{/if}
      <!--
        `aria-describedby` is passed in by hand because Ark Svelte's
        `Combobox.Input` does not read the Field context, where Ark React's does:

            // @ark-ui/react/dist/components/combobox/combobox-input.js
            const field = useFieldContext();
            return jsx(ark.input, { "aria-describedby": field?.ariaDescribedby, ...mergedProps });

        Without this the helper text is rendered but associated with nothing, so
        a screen reader never announces it — the field silently loses half its
        description. This is a wrapper gap, not a machine one: both zag versions
        are identical here, and the combobox machine never sets the attribute
        itself, which is exactly why React needs the Field fallback too.

        Six Ark Svelte parts have this gap. This one is pinned by the browser
        gate's `Combobox / helper text` scenario; the others are recorded in the
        roadmap because nothing renders them under a Field yet.

        Delete once Ark Svelte's part reads the context — the merge order makes
        that safe either way, since the machine supplies no competing value.
      -->
      {#if multiple}
        <ComboboxMultiParts part="input" {placeholder} />
      {:else}
        <Field.Context>
          {#snippet render(field)}
            <ArkCombobox.Input
              class="field__control combobox-field__input"
              {placeholder}
              aria-describedby={field()?.ariaDescribedby}
            />
          {/snippet}
        </Field.Context>
      {/if}
      {#if multiple}
        <ArkCombobox.ClearTrigger class="combobox-field__clear" aria-label={clearLabel}>
          <Icon name={glyph("close")} size={16} />
        </ArkCombobox.ClearTrigger>
      {/if}
      <ArkCombobox.Trigger class="combobox-field__trigger" aria-label="Toggle options">
        <Icon name={glyph("chevron-down")} size={iconSize} />
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
                <Icon name={glyph("check")} size={iconSize} />
              </ArkCombobox.ItemIndicator>
            </ArkCombobox.Item>
          {/each}
        </ArkCombobox.Content>
      </ArkCombobox.Positioner>
    </Portal>
    {#if multiple && name}<ComboboxMultiParts part="values" {name} />{/if}
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
