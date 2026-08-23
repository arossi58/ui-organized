<!--
  A standing list of options — the always-visible sibling of Select. Nothing is
  portalled here, so the whole component is one subtree.
-->
<script lang="ts">
  import { Listbox as ArkListbox, createListCollection } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, listboxStyles, type ControlSize } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { ListboxProps, ListboxOption } from "./Listbox.types.js";
  import "@ui-organized/core/components/Listbox/Listbox.css";

  let {
    options,
    label,
    value = $bindable(),
    defaultValue,
    onValueChange,
    selectionMode,
    size = "md",
    variant,
    emptyMessage = "No options",
    disabled,
    class: className,
  }: ListboxProps = $props();

  const iconSize = $derived(CONTROL_ICON_SIZE[size as ControlSize]);

  // Ark drives the list off a collection rather than children, the same way
  // Select does — `options` is the single source for both.
  const collection = $derived(
    createListCollection({
      items: options,
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
      isItemDisabled: (item) => !!item.disabled,
    }),
  );

  /**
   * Options in declaration order, bucketed by `group`. Ungrouped options keep a
   * `null` bucket so a partially grouped list still renders every option once,
   * in the order it was given.
   */
  const groups = $derived.by<[string | null, ListboxOption[]][]>(() => {
    const buckets = new Map<string | null, ListboxOption[]>();
    for (const option of options) {
      const key = option.group ?? null;
      const bucket = buckets.get(key);
      if (bucket) bucket.push(option);
      else buckets.set(key, [option]);
    }
    return [...buckets];
  });
</script>

<!--
  One bucket of options, rendered without a wrapper of its own. A snippet rather
  than the markup twice over, because the grouped and ungrouped branches render
  identical items and writing it twice is how the two drift.
-->
{#snippet bucket(items: ListboxOption[])}
  {#each items as item (item.value)}
    <ArkListbox.Item {item} class="listbox__item">
      <!--
        ── Why the element is pinned ─────────────────────────────────────────

        `@ark-ui/svelte` is on 5.24 while React is on 5.37, and Ark changed this
        part's default element in between: a `<span>` here, a `<div>` there. One
        stylesheet styles all three libraries, so the tag it is written against
        cannot be whichever Ark version a package happens to install.

        The difference is invisible *today* — `.listbox__item` is a flex row, and
        a flex item is blockified whatever its display was, so the span's
        `overflow: hidden` and its ellipsis still work. That is the trap rather
        than the reassurance: the day the row stops being a flex container the
        truncation silently stops working in one library only.
      -->
      <ArkListbox.ItemText>
        {#snippet asChild(project)}
          <div {...project()} class="listbox__item-text">{item.label}</div>
        {/snippet}
      </ArkListbox.ItemText>
      <ArkListbox.ItemIndicator class="listbox__item-indicator">
        <Icon name="check" size={iconSize} />
      </ArkListbox.ItemIndicator>
    </ArkListbox.Item>
  {/each}
{/snippet}

<ArkListbox.Root
  class={clsx(listboxStyles({ size, variant }), className)}
  {collection}
  {value}
  {defaultValue}
  onValueChange={(details) => {
    value = details.value;
    onValueChange?.(details.value);
  }}
  {selectionMode}
  {disabled}
>
  {#if label}
    <ArkListbox.Label class="listbox__label">{label}</ArkListbox.Label>
  {/if}
  <ArkListbox.Content class="listbox__content">
    {#each groups as [group, groupItems] (group ?? "")}
      {#if group != null}
        <ArkListbox.ItemGroup class="listbox__group">
          <ArkListbox.ItemGroupLabel class="listbox__group-label">
            {group}
          </ArkListbox.ItemGroupLabel>
          {@render bucket(groupItems)}
        </ArkListbox.ItemGroup>
      {:else}
        <!--
          An ungrouped bucket must not be wrapped in an ItemGroup — that would
          announce a group with no name to a screen reader.
        -->
        {@render bucket(groupItems)}
      {/if}
    {/each}
    <ArkListbox.Empty class="listbox__empty">{emptyMessage}</ArkListbox.Empty>
  </ArkListbox.Content>
</ArkListbox.Root>
