<!--
  One condition's value editor (Figma 2298:726): the value, then a rule and a
  remove. The field and the operator have segments of their own on the chip, so
  the editor carries only what the value segment opens.
-->
<script lang="ts">
  import { Button, Divider } from "@ui-organized/svelte";
  import type { TableFilterCondition } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { focusAfterRemoval } from "./useAutoFocusField.js";
  import TableFilterValueEditor from "./TableFilterValueEditor.svelte";

  let {
    condition,
    portalContainer,
  }: { condition: TableFilterCondition; portalContainer?: HTMLElement | null } = $props();

  const table = getTable();
  const arity = $derived(table.filters.arityOf(condition));

  const remove = () => {
    table.filters.remove(condition.id);
    focusAfterRemoval(condition.id);
  };
</script>

<TableFilterValueEditor {condition} {arity} {portalContainer} />

<Divider class="data-table__filter-editor-rule" />

<Button
  intent="ghost"
  size={table.size}
  icon="trash"
  class="data-table__filter-editor-remove"
  onclick={remove}
>
  Remove
</Button>
