<!--
  One condition, as a segmented chip (Figma 2462:2636): "Name | is greater than
  | 30". Each segment opens the control for the one parameter it shows — the
  field menu, the operator menu, the value editor — so changing a filter is one
  click on the part you mean rather than a trip through a form.

  Removal lives in the field menu and at the foot of the value editor, not in a
  dismiss button: a fourth 24px target in a row of segments is a coin-flip on
  touch, and an operator that takes no value ("is empty") has no value editor to
  put it in.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import {
    Chip,
    ChipSegment,
    Menu,
    MenuContent,
    MenuItem,
    MenuRadioGroup,
    MenuRadioItem,
    MenuSeparator,
    MenuTrigger,
    Popover,
    PopoverContent,
    PopoverTitle,
    PopoverTrigger,
  } from "@ui-organized/svelte";
  import { afterRowEntrance, type TableFilterCondition } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { autoFocusField, focusAfterRemoval } from "./useAutoFocusField.js";
  import TableFilterEditor from "./TableFilterEditor.svelte";
  import { internalGlyph as glyph } from "@ui-organized/svelte";

  let { condition, class: className }: { condition: TableFilterCondition; class?: string } =
    $props();
  const table = getTable();

  // Which chip's editor is open is filter state, not chip state: the chip that
  // opens is often the one the *header* just created, and removing an open
  // condition has to close its editor rather than leave a dangling id behind.
  const editing = $derived(table.filters.editing === condition.id);
  const setOpen = (next: boolean) => table.filters.setEditing(next ? condition.id : null);
  // The first chip arrives inside a row that is still animating open, so the
  // editor waits for the row to settle rather than open against a moving
  // anchor and jump. An existing chip settles at once.
  let settled = $state(false);
  $effect(() => {
    if (!editing) {
      settled = false;
      return;
    }
    const chip = document.querySelector(`[data-filter-id="${CSS.escape(condition.id)}"]`);
    return afterRowEntrance(chip, () => {
      settled = true;
    });
  });
  const open = $derived(editing && settled);
  // The two menus are this chip's alone, so they are local.
  let menu = $state<"field" | "operator" | null>(null);
  const setMenu = (name: "field" | "operator") => (next: boolean) => {
    menu = next ? name : null;
  };

  // The condition as it was when the editor opened, so Escape can revert it.
  let snapshot = $state<TableFilterCondition | null>(null);
  let editorEl = $state<HTMLElement | null>(null);

  $effect(() => autoFocusField(editorEl, open));

  $effect(() => {
    // Only when the editor opens — capturing on every change would defeat it.
    if (open) snapshot = condition;
  });

  const description = $derived(table.filters.describe(condition));
  const takesValue = $derived(table.filters.arityOf(condition) !== "none");

  const remove = () => {
    table.filters.remove(condition.id);
    focusAfterRemoval(condition.id);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !snapshot) return;
    // Ark closes on Escape anyway; this puts the value back first, so Escape
    // abandons the edit rather than committing it.
    table.filters.restore(snapshot);
  };
</script>

<!--
  The group's name is the whole sentence, so a screen reader moving into any one
  segment hears what the filter *is* before what the button does.
-->
<Chip
  class={clsx("data-table__filter-chip", className)}
  aria-label={`Filter: ${description.text}`}
  selected={editing || menu !== null}
  incomplete={!description.complete}
  data-column-id={condition.columnId}
  data-filter-id={condition.id}
>
  <Menu open={menu === "field"} onOpenChange={setMenu("field")}>
    <MenuTrigger>
      {#snippet asChild(props)}
        <ChipSegment {...(props() as Record<string, never>)} part="label">{description.field}</ChipSegment>
      {/snippet}
    </MenuTrigger>
    <MenuContent class="data-table__filter-picker">
      <MenuRadioGroup
        value={condition.columnId}
        onValueChange={(columnId) => table.filters.changeField(condition.id, columnId)}
      >
        {#each table.filters.fields as field (field.columnId)}
          <MenuRadioItem value={field.columnId}>{field.label}</MenuRadioItem>
        {/each}
      </MenuRadioGroup>
      <MenuSeparator />
      <MenuItem value="remove" icon={glyph("trash")} onSelect={remove}>Remove filter</MenuItem>
    </MenuContent>
  </Menu>

  <Menu open={menu === "operator"} onOpenChange={setMenu("operator")}>
    <MenuTrigger>
      {#snippet asChild(props)}
        <ChipSegment {...(props() as Record<string, never>)} part="operator">{description.relative}</ChipSegment>
      {/snippet}
    </MenuTrigger>
    <MenuContent class="data-table__filter-picker">
      <MenuRadioGroup
        value={condition.operator}
        onValueChange={(operator) => table.filters.update(condition.id, { operator })}
      >
        {#each table.filters.operatorsFor(condition) as operator (operator.id)}
          <MenuRadioItem value={operator.id}>{operator.label}</MenuRadioItem>
        {/each}
      </MenuRadioGroup>
    </MenuContent>
  </Menu>

  {#if takesValue}
    <Popover {open} onOpenChange={setOpen}>
      <PopoverTrigger>
        {#snippet asChild(props)}
          <ChipSegment {...(props() as Record<string, never>)} part="value">{description.value}</ChipSegment>
        {/snippet}
      </PopoverTrigger>
      <PopoverContent
        class="data-table__filter-editor-popup"
        side="bottom"
        align="start"
        onkeydown={onKeyDown}
      >
        <div bind:this={editorEl} class="data-table__filter-editor">
          <PopoverTitle class="data-table__filter-editor-title"
            >{description.field} {description.relative}</PopoverTitle
          >
          <TableFilterEditor {condition} portalContainer={editorEl} />
        </div>
      </PopoverContent>
    </Popover>
  {/if}
</Chip>
