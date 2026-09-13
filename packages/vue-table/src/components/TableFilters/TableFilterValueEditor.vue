<!--
  The value half of a condition editor.

  Which control appears follows from **type and operator together**, never from
  the type alone — that is the whole point of separating the two. A date column
  shows one date field for "is before", two for "is between", and a number plus a
  unit for "is in the last".
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import { clsx } from "clsx";
import {
  DateInput,
  Input,
  Listbox,
  NumberField,
  SearchInput,
  SegmentedControl,
  Select,
} from "@ui-organized/vue";
import {
  searchOptions,
  type FilterOperatorArity,
  type TableFilterCondition,
  type TableFilterValue,
} from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";

/** Options above this many get a search box — the article's "search in the panel". */
const SEARCHABLE_ABOVE = 8;

const props = defineProps<{
  condition: TableFilterCondition;
  arity: FilterOperatorArity;
  portalContainer?: HTMLElement | null;
}>();

const table = useTableContext();
const query = ref("");
const type = computed(() => table.filters.typeOf(props.condition));
const size = computed(() => table.size.value);

const set = (values: TableFilterValue[]) => table.filters.update(props.condition.id, { values });
const setAt = (index: number, value: TableFilterValue) => {
  const values = [...props.condition.values];
  while (values.length <= index) values.push(null);
  values[index] = value;
  set(values);
};

const booleanValue = computed(() => {
  const first = props.condition.values[0];
  return first === null || first === undefined ? undefined : String(first);
});

const options = computed(() => table.filters.optionsFor(props.condition));
const searchable = computed(() => options.value.length > SEARCHABLE_ABOVE);
const visible = computed(() => searchOptions(options.value, query.value));
const selected = computed(() => props.condition.values.map(String));

const numberAt = (index: number) =>
  typeof props.condition.values[index] === "number"
    ? (props.condition.values[index] as number)
    : null;
const stringAt = (index: number) => String(props.condition.values[index] ?? "");

const UNITS = [
  { value: "day", label: "days" },
  { value: "week", label: "weeks" },
  { value: "month", label: "months" },
  { value: "year", label: "years" },
];
const relative = computed(
  () => props.condition.operator === "in-last" || props.condition.operator === "in-next",
);
</script>

<template>
  <!-- `is empty` and `is today` take nothing, so there is nothing to render. -->
  <template v-if="arity === 'none'" />

  <SegmentedControl
    v-else-if="type === 'boolean'"
    :size="size"
    aria-label="Value"
    :items="[
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ]"
    :model-value="booleanValue"
    @update:model-value="(value: string) => set([value === 'true'])"
  />

  <template v-else-if="type === 'enum'">
    <SearchInput
      v-if="searchable"
      :size="size"
      aria-label="Search values"
      :model-value="query"
      @update:model-value="(value: string) => (query = value)"
    />
    <!--
      `label`, not `aria-label`: Listbox has a closed prop API, so an
      `aria-label` is silently dropped and the listbox ships unnamed — an
      `aria-input-field-name` violation that only shows up with the popover open,
      which the story-level axe gate never sees.

      The count rides in the label because `ListboxOption.label` is a string —
      which is also exactly what a screen reader reads out. A zero-count option
      would filter to nothing, and is never disabled while selected or the user
      could not untick it.
    -->
    <Listbox
      :size="size"
      class="data-table__filter-field data-table__filter-field--unlabelled"
      :selection-mode="arity === 'many' ? 'multiple' : 'single'"
      label="Value"
      :options="
        visible.map((option) => ({
          value: option.value,
          label: option.count > 0 ? `${option.label} · ${option.count}` : option.label,
          disabled: option.disabled,
        }))
      "
      :model-value="selected"
      empty-message="No matching values"
      @update:model-value="
        (values: string[]) => set(arity === 'many' ? values : values.slice(0, 1))
      "
    />
  </template>

  <template v-else-if="type === 'date'">
    <!-- "in the last 7 days" — a count and a unit, not a date. -->
    <div v-if="relative" class="data-table__filter-editor-value">
      <NumberField
        :size="size"
        label="Amount"
        :min="1"
        :model-value="numberAt(0)"
        @update:model-value="(value: number | null) => setAt(0, value)"
      />
      <Select
        :size="size"
        label="Unit"
        :portal-container="portalContainer"
        :model-value="condition.unit ?? 'day'"
        :options="UNITS"
        @update:model-value="
          (unit: string) =>
            table.filters.update(condition.id, {
              unit: unit as 'day' | 'week' | 'month' | 'year',
            })
        "
      />
    </div>
    <div v-else class="data-table__filter-editor-value">
      <DateInput
        :size="size"
        :label="arity === 'two' ? 'From' : 'Date'"
        :class="
          clsx(
            'data-table__filter-field',
            arity !== 'two' && 'data-table__filter-field--unlabelled',
          )
        "
        :model-value="stringAt(0)"
        @update:model-value="(value: string) => setAt(0, value || null)"
      />
      <DateInput
        v-if="arity === 'two'"
        :size="size"
        label="To"
        :model-value="stringAt(1)"
        @update:model-value="(value: string) => setAt(1, value || null)"
      />
    </div>
  </template>

  <div v-else-if="type === 'number'" class="data-table__filter-editor-value">
    <NumberField
      :size="size"
      :label="arity === 'two' ? 'Minimum' : 'Value'"
      :class="
        clsx('data-table__filter-field', arity !== 'two' && 'data-table__filter-field--unlabelled')
      "
      :placeholder="arity === 'two' ? undefined : 'Data'"
      :model-value="numberAt(0)"
      @update:model-value="(value: number | null) => setAt(0, value)"
    />
    <NumberField
      v-if="arity === 'two'"
      :size="size"
      label="Maximum"
      :model-value="numberAt(1)"
      @update:model-value="(value: number | null) => setAt(1, value)"
    />
  </div>

  <Input
    v-else
    :size="size"
    label="Value"
    class="data-table__filter-field data-table__filter-field--unlabelled"
    placeholder="Data"
    :model-value="stringAt(0)"
    @update:model-value="(value: string) => setAt(0, value)"
  />
</template>
