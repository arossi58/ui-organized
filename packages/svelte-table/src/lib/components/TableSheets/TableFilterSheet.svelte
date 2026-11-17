<!--
  Every filterable field at once, one accordion section each, so filtering on a
  phone is "open the field, pick the value" rather than "add a filter, choose
  its field, then pick the value".

  Each section edits a real condition. While the sheet is open every field has
  at least one, so its editor has something to write to: the sheet adds an
  empty draft for any field without one. A draft is an incomplete condition,
  which the filter model keeps but never applies, so drafts change nothing
  until they are given a value; the badge counts only complete conditions; and
  closing the sheet removes the drafts nobody filled in.
-->
<script lang="ts">
  import { untrack } from "svelte";
  import {
    Accordion,
    Button,
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetTitle,
    SheetTrigger,
  } from "@ui-organized/svelte";
  import type { AccordionItem } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";
  import TableFilterSheetCondition from "./TableFilterSheetCondition.svelte";
  import TableSheetButton from "./TableSheetButton.svelte";
  import { internalGlyph as glyph } from "@ui-organized/svelte";

  let { label = "Filter", class: className }: { label?: string; class?: string } = $props();
  const table = getTable();

  let open = $state(false);
  const fields = $derived(table.filters.fields);
  const conditions = $derived(table.filters.conditions);
  const applied = $derived(conditions.filter((c) => table.filters.describe(c).complete));
  const count = $derived(applied.length);

  // Re-run on every change while open, not just on opening: "Clear" empties a
  // field, and that field then needs a fresh draft to keep its editor.
  const missingKey = $derived(
    open
      ? fields
          .filter((field) => !conditions.some((c) => c.columnId === field.columnId))
          .map((field) => field.columnId)
          .join(",")
      : "",
  );
  $effect(() => {
    const key = missingKey;
    if (!key) return;
    untrack(() => {
      for (const columnId of key.split(",")) table.filters.add(columnId);
      // `filters.add` also marks the condition as being edited, which opens a
      // chip's popover in table mode. There are no chips here; undo it.
      table.filters.setEditing(null);
    });
  });

  const onOpenChange = (next: boolean) => {
    open = next;
    if (!next) {
      for (const condition of table.filters.conditions) {
        if (!table.filters.describe(condition).complete) table.filters.remove(condition.id);
      }
    }
  };

  const items = $derived<AccordionItem[]>(
    fields.map((field) => ({
      value: field.columnId,
      title: sectionTitle,
      content: sectionContent,
    })),
  );
  const fieldOf = (item: AccordionItem) => fields.find((f) => f.columnId === item.value);
  const conditionsOf = (item: AccordionItem) => conditions.filter((c) => c.columnId === item.value);
  const summaryOf = (item: AccordionItem) =>
    conditionsOf(item)
      .map((c) => table.filters.describe(c))
      .filter((d) => d.complete)
      .map((d) => `${d.relative} ${d.value}`)
      .join("; ");
</script>

{#snippet sectionTitle(item: AccordionItem)}
  {@const summary = summaryOf(item)}
  <span class="data-table__sheet-section-title">
    <span>{fieldOf(item)?.label}</span>
    <!-- What is applied stays readable with the section collapsed. -->
    {#if summary}<span class="data-table__sheet-section-summary">{summary}</span>{/if}
  </span>
{/snippet}

{#snippet sectionContent(item: AccordionItem)}
  <div class="data-table__sheet-section">
    {#each conditionsOf(item) as condition (condition.id)}
      <TableFilterSheetCondition {condition} fieldLabel={fieldOf(item)?.label ?? ""} />
    {/each}
  </div>
{/snippet}

{#if fields.length > 0}
  <Sheet {open} {onOpenChange}>
    <SheetTrigger>
      {#snippet asChild(props)}
        <TableSheetButton
          {...props()}
          icon={glyph("filter")}
          {label}
          {count}
          unit="applied"
          class={className}
        />
      {/snippet}
    </SheetTrigger>
    <SheetContent side="bottom" size="lg" class="data-table__sheet">
      <SheetTitle>{label}</SheetTitle>
      <div class="data-table__sheet-body">
        <!--
          Every section starts collapsed, so the whole list of fields fits on
          screen at once; each header says what it applies, so nothing is
          hidden by being closed. Open one to edit it.
        -->
        <Accordion multiple class="data-table__sheet-sections" {items}
        />
      </div>
      <SheetFooter>
        <Button
          intent="ghost"
          size="lg"
          disabled={count === 0}
          onclick={() => {
            for (const condition of applied) table.filters.remove(condition.id);
          }}
        >
          Clear all
        </Button>
        <SheetClose>
          {#snippet asChild(props)}
            <Button {...props()} intent="primary" size="lg">
              Done
            </Button>
          {/snippet}
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
{/if}
