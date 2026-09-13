<script lang="ts">
  import { TagsInput as ArkTagsInput } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { tagsInputStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { TagsInputProps } from "./TagsInput.types.js";
  import "@ui-organized/core/components/TagsInput/TagsInput.css";

  /** Delete affordance inside a tag — always the small edge, at every control
   *  size, because it sits inside the chip rather than beside it. */
  const DELETE_ICON_SIZE = 12;

  let {
    label,
    helperText,
    error,
    value = $bindable(),
    defaultValue,
    onValueChange,
    placeholder,
    size,
    max,
    editable,
    delimiter,
    addOnPaste,
    required,
    disabled,
    readOnly,
    name,
    class: className,
  }: TagsInputProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
</script>

<ArkTagsInput.Root
  class={clsx(tagsInputStyles({ size }), className)}
  {value}
  {defaultValue}
  onValueChange={(details) => {
    value = details.value;
    onValueChange?.(details.value);
  }}
  {max}
  {editable}
  {delimiter}
  {addOnPaste}
  invalid={isInvalid}
  {required}
  {disabled}
  {readOnly}
  {name}
>
  {#if label}
    <ArkTagsInput.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </ArkTagsInput.Label>
  {/if}
  <ArkTagsInput.Control class="tags-input__control">
    <!--
      The tags are machine state, not children, so the list is read back from the
      context rather than mapped over the `value` prop — that keeps in-place
      editing (ItemInput) working on the machine's copy. The Svelte context part
      hands the api over as an accessor, hence `api()`.
    -->
    <ArkTagsInput.Context>
      {#snippet render(api)}
        {#each api().value as tag, index (`${tag}-${index}`)}
          <ArkTagsInput.Item {index} value={tag}>
            <ArkTagsInput.ItemPreview class="tags-input__tag">
              <ArkTagsInput.ItemText class="tags-input__tag-label">{tag}</ArkTagsInput.ItemText>
              <ArkTagsInput.ItemDeleteTrigger class="tags-input__tag-delete">
                <Icon name="close" size={DELETE_ICON_SIZE} />
              </ArkTagsInput.ItemDeleteTrigger>
            </ArkTagsInput.ItemPreview>
            <ArkTagsInput.ItemInput class="tags-input__tag-input" />
          </ArkTagsInput.Item>
        {/each}
      {/snippet}
    </ArkTagsInput.Context>
    <ArkTagsInput.Input class="tags-input__entry" {placeholder} />
  </ArkTagsInput.Control>
  {#if helperText && !isInvalid}
    <span class="field__description">{helperText}</span>
  {/if}
  {#if isInvalid && errorMessage}
    <FieldError message={errorMessage} />
  {/if}
  <ArkTagsInput.HiddenInput />
</ArkTagsInput.Root>
