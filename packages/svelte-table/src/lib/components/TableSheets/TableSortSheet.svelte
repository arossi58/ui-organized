<!--
  Card mode's sort control: a labelled button that opens a bottom sheet holding
  every sorting control, with the applied sort counted on the button.

  A menu anchored to a 36px icon is a desktop affordance. On a phone the menu
  covers the cards it is sorting; a sheet gives the controls the full width and
  puts them within thumb reach.
-->
<script lang="ts">
  import {
    Button,
    RadioGroup,
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetTitle,
    SheetTrigger,
  } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";
  import TableSheetButton from "./TableSheetButton.svelte";
  import { internalGlyph as glyph } from "@ui-organized/svelte";

  let { label = "Sort", class: className }: { label?: string; class?: string } = $props();
  const table = getTable();

  const columns = $derived(table.table.getAllLeafColumns().filter((c) => c.getCanSort()));
  const sorting = $derived(table.state.sorting ?? []);
  const active = $derived(sorting[0]);
  const activeId = $derived(active?.id ?? "");
  const direction = $derived(active?.desc ? "desc" : "asc");
  const triggerIcon = $derived(glyph(activeId ? (active?.desc ? "sort-desc" : "sort-asc") : "sort"));

  const headerOf = (column: (typeof columns)[number]) =>
    typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;
</script>

{#if columns.length > 0}
  <Sheet>
    <SheetTrigger>
      {#snippet asChild(props)}
        <TableSheetButton
          {...props()}
          icon={triggerIcon}
          {label}
          count={sorting.length}
          unit="applied"
          class={className}
        />
      {/snippet}
    </SheetTrigger>
    <SheetContent side="bottom" size="lg" class="data-table__sheet">
      <SheetTitle>{label}</SheetTitle>
      <div class="data-table__sheet-body">
        <RadioGroup
          label="Sort by"
          options={columns.map((column) => ({ value: column.id, label: headerOf(column) }))}
          value={activeId}
          onValueChange={(id) => table.table.setSorting([{ id, desc: direction === "desc" }])}
        />
        <!--
          Disabled rather than hidden, as in the desktop menu: the sheet keeps
          its shape, so the second visit finds the controls where they were.
          Nothing is checked until there is a sort to have a direction: a
          pre-ticked "Ascending" over nothing reads as a sort that is applied.
        -->
        <RadioGroup
          label="Direction"
          orientation="horizontal"
          disabled={!activeId}
          options={[
            { value: "asc", label: "Ascending" },
            { value: "desc", label: "Descending" },
          ]}
          value={activeId ? direction : ""}
          onValueChange={(next) => {
            if (activeId) table.table.setSorting([{ id: activeId, desc: next === "desc" }]);
          }}
        />
      </div>
      <SheetFooter>
        <Button
          intent="ghost"
          size="lg"
          disabled={!activeId}
          onclick={() => table.table.setSorting([])}
        >
          Clear sort
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
