<!--
  One condition's editor (Figma 2298:726): the field name, the operator, the
  value, then a rule and a remove.

  The operator and value controls carry no visible labels — the title above names
  the field and each control's own content says the rest — but they keep real
  `<label>`s for assistive tech, hidden in CSS rather than omitted.
-->
<script lang="ts">
  import { Button, Divider, Select } from "@ui-organized/svelte";
  import type { TableFilterCondition } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { focusAfterRemoval } from "./useAutoFocusField.js";
  import TableFilterValueEditor from "./TableFilterValueEditor.svelte";

  let {
    condition,
    portalContainer,
  }: { condition: TableFilterCondition; portalContainer?: HTMLElement | null } = $props();

  const table = getTable();
  const operators = $derived(table.filters.operatorsFor(condition));
  const arity = $derived(table.filters.arityOf(condition));

  const remove = () => {
    table.filters.remove(condition.id);
    focusAfterRemoval(condition.id);
  };
</script>

<!--
  Portalled into the editor rather than to <body>: the popover is non-modal, so a
  popup outside its subtree reads as an outside click and dismisses the editor.
  Same escape Calendar uses for its year picker inside a date popover.
-->
<Select
  size={table.size}
  label="Condition"
  class="data-table__filter-field data-table__filter-field--unlabelled"
  {portalContainer}
  value={condition.operator}
  options={operators.map((operator) => ({ value: operator.id, label: operator.label }))}
  onValueChange={(operator) => table.filters.update(condition.id, { operator })}
/>

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
