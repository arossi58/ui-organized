/**
 * The condition list as a reducer.
 *
 * The reducer is the portable half — what happens when a second condition lands
 * on a column, when `single` is set, when an operator change shrinks the arity,
 * when the escape hatch writes `columnFilters` directly. All of it is worth
 * exactly one implementation, and none of it needs a renderer to test.
 *
 * **The binding is not portable, and deliberately so.** React binds this with
 * `useReducer`, not with `useSyncExternalStore` the way `createEditStore` and
 * `createDetailStore` are bound. `useSyncExternalStore` updates are always
 * urgent — React cannot defer them by design — while filtering is wrapped in
 * `startTransition` precisely so re-filtering 100,000 rows never blocks a
 * keystroke. Edit and detail state are cheap and local, so urgency costs them
 * nothing; filtering is the most expensive state change the table has.
 * `createFilterStore` still ships, for adapters with no scheduler of their own.
 */
import { createStore, type Store } from "../state.js";
import { DEFAULT_CATALOGUE, defaultOperatorFor, operatorsFor, requiredOperands } from "./operators.js";
import type {
  FilterOperatorCatalogue,
  TableFilterCondition,
  TableFilterDef,
  TableFilterOperator,
  TableFilterType,
  TableFilterUnit,
  TableFilterValue,
} from "./types.js";

export interface TableFilterState {
  /** Applied conditions, in the order added. Incomplete ones are kept and simply do not filter. */
  conditions: TableFilterCondition[];
  /** Whether chips past the collapse limit are shown. */
  expanded: boolean;
  /**
   * The condition whose editor is open, if any.
   *
   * State, not a UI detail: the chip that opens is not always the chip that was
   * clicked. Adding a filter from the header opens the chip it just created —
   * in a *different* component, one that has no way to know an add happened —
   * and removing the condition being edited has to close the editor rather than
   * leave a dangling id behind.
   */
  editingId: string | null;
  /**
   * Monotonic id source. A counter rather than `crypto.randomUUID` so ids are
   * deterministic — which is what keeps visual baselines and test assertions
   * stable — and per-state rather than module-level, so nothing leaks between
   * tables or between tests.
   */
  nextId: number;
}

export const INITIAL_FILTER_STATE: TableFilterState = {
  conditions: [],
  expanded: false,
  editingId: null,
  nextId: 1,
};

export type TableFilterAction =
  | {
      type: "add";
      columnId: string;
      operator: TableFilterOperator;
      values?: TableFilterValue[];
      unit?: TableFilterUnit;
      /** Replace any existing condition on this column instead of appending. */
      single?: boolean;
    }
  | {
      type: "update";
      id: string;
      /** Move the condition to another column — the chip's field segment. */
      columnId?: string;
      operator?: TableFilterOperator;
      values?: TableFilterValue[];
      unit?: TableFilterUnit;
      /** With `columnId`: the target column takes one condition, so drop its others. */
      single?: boolean;
    }
  /** Put a condition back exactly as it was — Escape in an open editor. */
  | { type: "restore"; condition: TableFilterCondition }
  | { type: "remove"; id: string }
  | { type: "clear-column"; columnId: string }
  | { type: "clear" }
  /** The TanStack escape hatch wrote `columnFilters` directly. */
  | { type: "replace"; conditions: TableFilterCondition[] }
  | { type: "set-expanded"; expanded: boolean }
  /** Open a condition's editor, or close whichever one is open. */
  | { type: "set-editing"; id: string | null };

/**
 * Carry as much of the old value across an operator change as still makes
 * sense. Switching "is between 3 and 7" to "is greater than" should keep the 3,
 * not silently clear the field the user just filled in.
 */
export function coerceValues(
  values: readonly TableFilterValue[],
  from: TableFilterOperator | undefined,
  to: TableFilterOperator,
  catalogue: FilterOperatorCatalogue,
): TableFilterValue[] {
  const target = catalogue.get(to);
  if (!target) return [...values];
  const source = from ? catalogue.get(from) : undefined;

  if (target.arity === "none") return [];
  if (target.arity === "many") {
    // From a single operand, the old value becomes the first member.
    if (source?.arity === "many") return [...values];
    return values[0] === undefined || values[0] === null ? [] : [values[0]];
  }
  const needed = requiredOperands(target.arity);
  const kept = values.slice(0, needed);
  while (kept.length < needed) kept.push(null);
  return kept;
}

/** Either end of a field change, as `retargetCondition` needs to see it. */
export interface RetargetColumn {
  columnId: string;
  type: TableFilterType;
  def?: Pick<TableFilterDef, "operators" | "defaultOperator" | "single">;
}

/**
 * What a condition becomes when its chip's field segment picks another column.
 *
 * Kept in core so four adapters cannot disagree about it. The rule is to keep
 * whatever still means the same thing: "Age is greater than 30" moved to
 * "Score" stays "is greater than 30", because both are numbers and the new
 * column offers the operator. Anything else starts over on the new column's
 * default operator with no value, rather than carrying across a value that
 * would silently mean something different — an enum id from one column is
 * never a valid option on another, so enums always start over.
 */
export function retargetCondition(
  condition: TableFilterCondition,
  from: Pick<RetargetColumn, "type">,
  to: RetargetColumn,
  catalogue: FilterOperatorCatalogue = DEFAULT_CATALOGUE,
): Extract<TableFilterAction, { type: "update" }> {
  const keeps =
    from.type === to.type &&
    to.type !== "enum" &&
    operatorsFor(to.type, catalogue, to.def?.operators).some((op) => op.id === condition.operator);

  return {
    type: "update",
    id: condition.id,
    columnId: to.columnId,
    operator: keeps ? condition.operator : defaultOperatorFor(to.type, catalogue, to.def),
    values: keeps ? [...condition.values] : [],
    single: to.def?.single,
  };
}

export function createFilterReducer(catalogue: FilterOperatorCatalogue = DEFAULT_CATALOGUE) {
  return function filterReducer(
    state: TableFilterState,
    action: TableFilterAction,
  ): TableFilterState {
    switch (action.type) {
      case "add": {
        const condition: TableFilterCondition = {
          id: `f${state.nextId}`,
          columnId: action.columnId,
          operator: action.operator,
          values: action.values ?? [],
          ...(action.unit ? { unit: action.unit } : {}),
        };
        const kept = action.single
          ? state.conditions.filter((c) => c.columnId !== action.columnId)
          : state.conditions;
        // A filter arrives with no value chosen, so the editor opens with it.
        // Adding one and then having to click it is two steps for one intent.
        return {
          ...state,
          conditions: [...kept, condition],
          editingId: condition.id,
          nextId: state.nextId + 1,
        };
      }

      case "update": {
        let changed = false;
        const mapped = state.conditions.map((condition) => {
          if (condition.id !== action.id) return condition;
          const columnId = action.columnId ?? condition.columnId;
          const operator = action.operator ?? condition.operator;
          const values =
            action.values ??
            (action.operator && action.operator !== condition.operator
              ? coerceValues(condition.values, condition.operator, action.operator, catalogue)
              : condition.values);
          const unit = action.unit ?? condition.unit;
          if (
            columnId === condition.columnId &&
            operator === condition.operator &&
            values === condition.values &&
            unit === condition.unit
          ) {
            return condition;
          }
          changed = true;
          return { ...condition, columnId, operator, values, ...(unit ? { unit } : {}) };
        });
        // A column that takes one condition loses its others when another
        // condition moves onto it — the same rule `add` applies with `single`.
        const conditions =
          changed && action.columnId && action.single
            ? mapped.filter((c) => c.id === action.id || c.columnId !== action.columnId)
            : mapped;
        // The row-model memo is keyed on the array reference, so a no-op has to
        // return the identical state or every keystroke re-filters the table.
        return changed ? { ...state, conditions } : state;
      }

      case "restore": {
        const index = state.conditions.findIndex((c) => c.id === action.condition.id);
        if (index === -1) return state;
        const conditions = [...state.conditions];
        conditions[index] = action.condition;
        return { ...state, conditions };
      }

      case "remove": {
        const conditions = state.conditions.filter((c) => c.id !== action.id);
        if (conditions.length === state.conditions.length) return state;
        return { ...state, conditions, editingId: closeIfGone(state.editingId, conditions) };
      }

      case "clear-column": {
        const conditions = state.conditions.filter((c) => c.columnId !== action.columnId);
        if (conditions.length === state.conditions.length) return state;
        return { ...state, conditions, editingId: closeIfGone(state.editingId, conditions) };
      }

      case "clear":
        return state.conditions.length === 0
          ? state
          : { ...state, conditions: [], expanded: false, editingId: null };

      case "replace": {
        if (sameConditions(state.conditions, action.conditions)) return state;
        // Ids arriving from outside are honoured; anything without one gets a
        // fresh id so a chip can still address it.
        let nextId = state.nextId;
        const conditions = action.conditions.map((condition) =>
          condition.id ? condition : { ...condition, id: `f${nextId++}` },
        );
        return {
          ...state,
          conditions,
          editingId: closeIfGone(state.editingId, conditions),
          nextId,
        };
      }

      case "set-expanded":
        return state.expanded === action.expanded ? state : { ...state, expanded: action.expanded };

      case "set-editing":
        return state.editingId === action.id ? state : { ...state, editingId: action.id };

      default:
        return state;
    }
  };
}

/** An editor cannot stay open on a condition that no longer exists. */
function closeIfGone(
  editingId: string | null,
  conditions: readonly TableFilterCondition[],
): string | null {
  if (editingId === null) return null;
  return conditions.some((condition) => condition.id === editingId) ? editingId : null;
}

/** The reducer with the built-in operators. */
export const filterReducer = createFilterReducer();

/** For adapters with no scheduler of their own — see the note at the top. */
export function createFilterStore(
  catalogue: FilterOperatorCatalogue = DEFAULT_CATALOGUE,
): Store<TableFilterState, TableFilterAction> {
  return createStore(INITIAL_FILTER_STATE, createFilterReducer(catalogue));
}

// ─── TanStack interop ────────────────────────────────────────────────────────

/** What TanStack stores: one entry per column, holding that column's conditions. */
export interface ColumnFilterEntry {
  id: string;
  value: TableFilterCondition[];
}

/**
 * Group conditions by column. The inverse of `fromColumnFilters`, and the round
 * trip is the identity — which is the strongest argument that a condition list
 * belongs in the column's filter value rather than in a parallel store.
 */
export function toColumnFilters(conditions: readonly TableFilterCondition[]): ColumnFilterEntry[] {
  const byColumn = new Map<string, TableFilterCondition[]>();
  for (const condition of conditions) {
    const list = byColumn.get(condition.columnId);
    if (list) list.push(condition);
    else byColumn.set(condition.columnId, [condition]);
  }
  return [...byColumn.entries()].map(([id, value]) => ({ id, value }));
}

/** Flatten TanStack's grouped form back to the list the chips render from. */
export function fromColumnFilters(
  entries: readonly { id: string; value: unknown }[],
): TableFilterCondition[] {
  const conditions: TableFilterCondition[] = [];
  for (const entry of entries) {
    if (!Array.isArray(entry.value)) continue;
    for (const condition of entry.value as TableFilterCondition[]) {
      // Trust the columnId on the entry over the one on the condition: a
      // consumer calling `column.setFilterValue()` will not have set it.
      conditions.push({ ...condition, columnId: entry.id });
    }
  }
  return conditions;
}

function sameConditions(
  a: readonly TableFilterCondition[],
  b: readonly TableFilterCondition[],
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i]!;
    const right = b[i]!;
    if (
      left.id !== right.id ||
      left.columnId !== right.columnId ||
      left.operator !== right.operator ||
      left.unit !== right.unit ||
      left.values.length !== right.values.length ||
      left.values.some((value, index) => value !== right.values[index])
    ) {
      return false;
    }
  }
  return true;
}

/** Conditions targeting one column, in order. */
export function conditionsForColumn(
  conditions: readonly TableFilterCondition[],
  columnId: string,
): TableFilterCondition[] {
  return conditions.filter((condition) => condition.columnId === columnId);
}
