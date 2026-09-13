<!--
  The value half of a condition editor.

  Which control appears follows from **type and operator together**, never from
  the type alone — that is the whole point of separating the two. A date column
  shows one date field for "is before", two for "is between", and a number plus a
  unit for "is in the last".
-->
<script lang="ts">
  import { clsx } from "clsx";
  import {
    DateInput,
    Input,
    Listbox,
    NumberField,
    SearchInput,
    SegmentedControl,
    Select,
  } from "@ui-organized/svelte";
  import {
    searchOptions,
    type FilterOperatorArity,
    type TableFilterCondition,
    type TableFilterValue,
  } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";

  /** Options above this many get a search box — the article's "search in the panel". */
  const SEARCHABLE_ABOVE = 8;

  let {
    condition,
    arity,
    portalContainer,
  }: {
    condition: TableFilterCondition;
    arity: FilterOperatorArity;
    portalContainer?: HTMLElement | null;
  } = $props();

  const table = getTable();
  let query = $state("");
  const type = $derived(table.filters.typeOf(condition));
  const size = $derived(table.size);

  const set = (values: TableFilterValue[]) => table.filters.update(condition.id, { values });
  const setAt = (index: number, value: TableFilterValue) => {
    const values = [...condition.values];
    while (values.length <= index) values.push(null);
    values[index] = value;
    set(values);
  };

  const booleanValue = $derived.by(() => {
    const first = condition.values[0];
    return first === null || first === undefined ? undefined : String(first);
  });

  const options = $derived(table.filters.optionsFor(condition));
  const searchable = $derived(options.length > SEARCHABLE_ABOVE);
  const visible = $derived(searchOptions(options, query));
  const selected = $derived(condition.values.map(String));

  const numberAt = (index: number) =>
    typeof condition.values[index] === "number" ? (condition.values[index] as number) : null;
  const stringAt = (index: number) => String(condition.values[index] ?? "");

  const UNITS = [
    { value: "day", label: "days" },
    { value: "week", label: "weeks" },
    { value: "month", label: "months" },
    { value: "year", label: "years" },
  ];
  const relative = $derived(
    condition.operator === "in-last" || condition.operator === "in-next",
  );
</script>

<!-- `is empty` and `is today` take nothing, so there is nothing to render. -->
{#if arity === "none"}
  <!-- nothing -->
{:else if type === "boolean"}
  <SegmentedControl
    {size}
    aria-label="Value"
    items={[
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ]}
    value={booleanValue}
    onValueChange={(value) => set([value === "true"])}
  />
{:else if type === "enum"}
  {#if searchable}
    <SearchInput
      {size}
      aria-label="Search values"
      value={query}
      oninput={(event) => (query = event.currentTarget.value)}
      onClear={() => (query = "")}
    />
  {/if}
  <!--
    `label`, not `aria-label`: Listbox has a closed prop API, so an `aria-label`
    is silently dropped and the listbox ships unnamed — an
    `aria-input-field-name` violation that only shows up with the popover open,
    which the story-level axe gate never sees.

    The count rides in the label because `ListboxOption.label` is a string —
    which is also exactly what a screen reader reads out. A zero-count option
    would filter to nothing, and is never disabled while selected or the user
    could not untick it.
  -->
  <Listbox
    {size}
    class="data-table__filter-field data-table__filter-field--unlabelled"
    selectionMode={arity === "many" ? "multiple" : "single"}
    label="Value"
    options={visible.map((option) => ({
      value: option.value,
      label: option.count > 0 ? `${option.label} · ${option.count}` : option.label,
      disabled: option.disabled,
    }))}
    value={selected}
    emptyMessage="No matching values"
    onValueChange={(values) => set(arity === "many" ? values : values.slice(0, 1))}
  />
{:else if type === "date"}
  <!-- "in the last 7 days" — a count and a unit, not a date. -->
  {#if relative}
    <div class="data-table__filter-editor-value">
      <NumberField
        {size}
        label="Amount"
        min={1}
        value={numberAt(0)}
        onValueChange={(value) => setAt(0, value)}
      />
      <Select
        {size}
        label="Unit"
        {portalContainer}
        value={condition.unit ?? "day"}
        options={UNITS}
        onValueChange={(unit) =>
          table.filters.update(condition.id, {
            unit: unit as "day" | "week" | "month" | "year",
          })}
      />
    </div>
  {:else}
    <div class="data-table__filter-editor-value">
      <DateInput
        {size}
        label={arity === "two" ? "From" : "Date"}
        class={clsx(
          "data-table__filter-field",
          arity !== "two" && "data-table__filter-field--unlabelled",
        )}
        value={stringAt(0)}
        oninput={(event) => setAt(0, event.currentTarget.value || null)}
      />
      {#if arity === "two"}
        <DateInput
          {size}
          label="To"
          value={stringAt(1)}
          oninput={(event) => setAt(1, event.currentTarget.value || null)}
        />
      {/if}
    </div>
  {/if}
{:else if type === "number"}
  <div class="data-table__filter-editor-value">
    <NumberField
      {size}
      label={arity === "two" ? "Minimum" : "Value"}
      class={clsx(
        "data-table__filter-field",
        arity !== "two" && "data-table__filter-field--unlabelled",
      )}
      placeholder={arity === "two" ? undefined : "Data"}
      value={numberAt(0)}
      onValueChange={(value) => setAt(0, value)}
    />
    {#if arity === "two"}
      <NumberField
        {size}
        label="Maximum"
        value={numberAt(1)}
        onValueChange={(value) => setAt(1, value)}
      />
    {/if}
  </div>
{:else}
  <Input
    {size}
    label="Value"
    class="data-table__filter-field data-table__filter-field--unlabelled"
    placeholder="Data"
    value={stringAt(0)}
    oninput={(event) => setAt(0, event.currentTarget.value)}
  />
{/if}
