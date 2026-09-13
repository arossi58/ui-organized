<!--
  One condition, as a chip that opens its own editor (Figma 2298:376).

  No dismiss button on the chip itself: removal lives inside the editor, where
  the design puts it. That keeps the chip a single target the whole width of the
  words it shows — a 20px-tall pill with a second 20px hit area inside it is a
  coin-flip on touch.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import {
    Chip,
    Popover,
    PopoverContent,
    PopoverTitle,
    PopoverTrigger,
  } from "@ui-organized/svelte";
  import type { ComparisonIconName } from "@ui-organized/svelte";
  import type { TableFilterCondition } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { autoFocusField } from "./useAutoFocusField.js";
  import TableFilterEditor from "./TableFilterEditor.svelte";

  let { condition, class: className }: { condition: TableFilterCondition; class?: string } =
    $props();
  const table = getTable();

  // Which chip is open is filter state, not chip state: the chip that opens is
  // often the one the *header* just created, and removing an open condition has
  // to close its editor rather than leave a dangling id behind.
  const open = $derived(table.filters.editing === condition.id);
  const setOpen = (next: boolean) => table.filters.setEditing(next ? condition.id : null);

  // The condition as it was when the editor opened, so Escape can revert it.
  let snapshot = $state<TableFilterCondition | null>(null);
  let editorEl = $state<HTMLElement | null>(null);

  $effect(() => autoFocusField(editorEl, open));

  $effect(() => {
    // Only when the editor opens — capturing on every change would defeat it.
    if (open) snapshot = condition;
  });

  const description = $derived(table.filters.describe(condition));

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !snapshot) return;
    // Ark closes on Escape anyway; this puts the value back first, so Escape
    // abandons the edit rather than committing it.
    table.filters.restore(snapshot);
  };
</script>

<Popover {open} onOpenChange={setOpen}>
  <!--
    The design system `Chip`. Every prop but `class` lands on its body, so the
    trigger's `id`, click handler and `aria-expanded` attach to the button that
    opens the popover rather than to a wrapper.

    Left at its default size, whatever the table's density: `md` is the size
    Figma draws a filter chip at, and these describe the table rather than being
    part of it — a row of 40px chips would outweigh the header above.
  -->
  <PopoverTrigger>
    {#snippet asChild(props)}
      <Chip
        {...(props() as Record<string, never>)}
        class={clsx("data-table__filter-chip", className)}
        label={description.field}
        operator={description.icon as ComparisonIconName | undefined}
        operatorLabel={description.relative}
        detail={description.relative}
        selected={open}
        incomplete={!description.complete}
        data-column-id={condition.columnId}
        data-filter-id={condition.id}
      >
        {description.value}
      </Chip>
    {/snippet}
  </PopoverTrigger>
  <PopoverContent
    class="data-table__filter-editor-popup"
    side="bottom"
    align="start"
    onkeydown={onKeyDown}
  >
    <div bind:this={editorEl} class="data-table__filter-editor">
      <PopoverTitle class="data-table__filter-editor-title">{description.field}</PopoverTitle>
      <TableFilterEditor {condition} portalContainer={editorEl} />
    </div>
  </PopoverContent>
</Popover>
