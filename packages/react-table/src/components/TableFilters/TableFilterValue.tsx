import { useState } from "react";
import { clsx } from "clsx";
import {
  DateInput,
  Input,
  Listbox,
  NumberField,
  SearchInput,
  SegmentedControl,
  Select,
} from "@ui-organized/react";
import { searchOptions, type TableFilterValue } from "@ui-organized/table-core";
import { useTableContext } from "../../core/TableContext.js";
import type { TableFilterValueEditorProps } from "./TableFilters.types.js";

/** Options above this many get a search box — the article's "search in the panel". */
const SEARCHABLE_ABOVE = 8;

/**
 * The value half of a condition editor.
 *
 * Which control appears follows from **type and operator together**, never from
 * the type alone — that is the whole point of separating the two. A date column
 * shows one date field for "is before", two for "is between", and a number plus
 * a unit for "is in the last".
 */
export function TableFilterValueEditor({
  condition,
  arity,
  portalContainer,
}: TableFilterValueEditorProps) {
  const { filters, size } = useTableContext();
  const [query, setQuery] = useState("");
  const type = filters.typeOf(condition);

  const set = (values: TableFilterValue[]) => filters.update(condition.id, { values });
  const setAt = (index: number, value: TableFilterValue) => {
    const values = [...condition.values];
    while (values.length <= index) values.push(null);
    values[index] = value;
    set(values);
  };

  // `is empty` and `is today` take nothing, so there is nothing to render.
  if (arity === "none") return null;

  if (type === "boolean") {
    return (
      <SegmentedControl
        size={size}
        aria-label="Value"
        items={[
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ]}
        value={
          condition.values[0] === null || condition.values[0] === undefined
            ? undefined
            : String(condition.values[0])
        }
        onValueChange={(value) => set([value === "true"])}
      />
    );
  }

  if (type === "enum") {
    const options = filters.optionsFor(condition);
    const searchable = options.length > SEARCHABLE_ABOVE;
    const visible = searchOptions(options, query);
    const selected = condition.values.map(String);

    return (
      <>
        {searchable && (
          <SearchInput
            size={size}
            // Never a `ref` here: SearchInput spreads its props after its own
            // ref, so an external one silently breaks its clear button. Focus
            // is handled by `useAutoFocusField` on the popover instead.
            aria-label="Search values"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
          />
        )}
        <Listbox
          size={size}
          className="data-table__filter-field data-table__filter-field--unlabelled"
          selectionMode={arity === "many" ? "multiple" : "single"}
          // `label`, not `aria-label`: Listbox has a closed prop API, so an
          // `aria-label` is silently dropped and the listbox ships unnamed —
          // an `aria-input-field-name` violation that only shows up with the
          // popover open, which the story-level axe gate never sees.
          label="Value"
          // The count rides in the label because `ListboxOption.label` is a
          // string — which is also exactly what a screen reader reads out.
          options={visible.map((option) => ({
            value: option.value,
            label: option.count > 0 ? `${option.label} · ${option.count}` : option.label,
            // A zero-count option would filter to nothing. Never disabled while
            // selected, or the user could not untick it.
            disabled: option.disabled,
          }))}
          value={selected}
          onValueChange={(values) => set(arity === "many" ? values : values.slice(0, 1))}
          emptyMessage="No matching values"
        />
      </>
    );
  }

  if (type === "date") {
    // "in the last 7 days" — a count and a unit, not a date.
    if (condition.operator === "in-last" || condition.operator === "in-next") {
      return (
        <div className="data-table__filter-editor-value">
          <NumberField
            size={size}
            label="Amount"
            min={1}
            value={typeof condition.values[0] === "number" ? condition.values[0] : null}
            onValueChange={(value) => setAt(0, value)}
          />
          <Select
            size={size}
            label="Unit"
            portalContainer={portalContainer}
            value={condition.unit ?? "day"}
            options={[
              { value: "day", label: "days" },
              { value: "week", label: "weeks" },
              { value: "month", label: "months" },
              { value: "year", label: "years" },
            ]}
            onValueChange={(unit) =>
              filters.update(condition.id, { unit: unit as "day" | "week" | "month" | "year" })
            }
          />
        </div>
      );
    }

    return (
      <div className="data-table__filter-editor-value">
        <DateInput
          size={size}
          label={arity === "two" ? "From" : "Date"}
          className={clsx(
            "data-table__filter-field",
            arity !== "two" && "data-table__filter-field--unlabelled",
          )}
          value={String(condition.values[0] ?? "")}
          onChange={(event) => setAt(0, event.target.value || null)}
        />
        {arity === "two" && (
          <DateInput
            size={size}
            label="To"
            value={String(condition.values[1] ?? "")}
            onChange={(event) => setAt(1, event.target.value || null)}
          />
        )}
      </div>
    );
  }

  if (type === "number") {
    return (
      <div className="data-table__filter-editor-value">
        <NumberField
          size={size}
          label={arity === "two" ? "Minimum" : "Value"}
          className={clsx(
            "data-table__filter-field",
            arity !== "two" && "data-table__filter-field--unlabelled",
          )}
          placeholder={arity === "two" ? undefined : "Data"}
          value={typeof condition.values[0] === "number" ? condition.values[0] : null}
          onValueChange={(value) => setAt(0, value)}
        />
        {arity === "two" && (
          <NumberField
            size={size}
            label="Maximum"
            value={typeof condition.values[1] === "number" ? condition.values[1] : null}
            onValueChange={(value) => setAt(1, value)}
          />
        )}
      </div>
    );
  }

  return (
    <Input
      size={size}
      label="Value"
      className="data-table__filter-field data-table__filter-field--unlabelled"
      placeholder="Data"
      value={String(condition.values[0] ?? "")}
      onChange={(event) => setAt(0, event.target.value)}
    />
  );
}
