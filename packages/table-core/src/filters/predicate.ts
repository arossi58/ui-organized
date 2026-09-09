/**
 * Evaluating conditions, in two stages.
 *
 * TanStack calls `filterFn.resolveFilterValue` **once per filter pass** and
 * `filterFn` **once per row**. That split is not an implementation detail to
 * work around — it is exactly the shape this needs, so the two map onto each
 * other directly:
 *
 *   compileConditions()  → once per pass. Lowercases needles, builds Sets,
 *                          resolves "last 7 days", reads the clock once.
 *   testCompiled()       → once per row. Pure comparison, allocates nothing.
 *
 * On a 100,000-row table that is the difference between resolving a relative
 * date once and resolving it a hundred thousand times.
 */
import type { FilterFn } from "@tanstack/table-core";
import { DEFAULT_CATALOGUE, isEmptyCell, relativeRange, requiredOperands } from "./operators.js";
import type {
  FilterCompileContext,
  FilterOperatorCatalogue,
  FilterOperatorDef,
  TableFilterCondition,
  TableFilterType,
} from "./types.js";

/** One condition, ready for the row loop. Opaque by design. */
export interface CompiledCondition {
  operator: FilterOperatorDef;
  prepared: unknown;
}

/**
 * A condition may only filter once it has every operand its operator needs.
 *
 * This is what replaces a "live vs apply on close" mode. Adding
 * "Role is any of ___" leaves the table untouched until a value is picked —
 * otherwise the table blanks the instant a filter is added, which reads as a
 * bug every single time.
 */
export function isConditionComplete(
  condition: TableFilterCondition,
  catalogue: FilterOperatorCatalogue = DEFAULT_CATALOGUE,
): boolean {
  const operator = catalogue.get(condition.operator);
  if (!operator) return false;
  const needed = requiredOperands(operator.arity);
  if (operator.arity === "many") return condition.values.length > 0;
  if (condition.values.length < needed) return false;
  for (let i = 0; i < needed; i += 1) {
    const value = condition.values[i];
    if (value === null || value === undefined || value === "") return false;
  }
  return true;
}

export function compileConditions(
  conditions: readonly TableFilterCondition[],
  catalogue: FilterOperatorCatalogue,
  ctx: FilterCompileContext,
): CompiledCondition[] {
  const compiled: CompiledCondition[] = [];
  for (const condition of conditions) {
    const operator = catalogue.get(condition.operator);
    // An unknown operator drops out rather than throwing: a filter restored
    // from a URL after an operator was removed should degrade to "no filter",
    // not take the table down.
    if (!operator) continue;
    if (!isConditionComplete(condition, catalogue)) continue;
    compiled.push({
      operator,
      prepared: operator.compile ? operator.compile(condition, ctx) : condition.values,
    });
  }
  return compiled;
}

/**
 * The per-row path.
 *
 * The empty short-circuit lives here rather than in each operator, so "does
 * this match a blank cell?" is one decision expressed as data
 * (`matchesEmpty`) instead of eighteen separate branches that can disagree.
 */
export function testCompiled(compiled: CompiledCondition, cellValue: unknown): boolean {
  if (isEmptyCell(cellValue)) return compiled.operator.matchesEmpty ?? false;
  return compiled.operator.test(cellValue, compiled.prepared);
}

/**
 * The single-shot form, for tests and for consumers filtering outside a table.
 * Built on the same two functions, so it can never disagree with the hot path.
 */
export function evaluateCondition(
  condition: TableFilterCondition,
  cellValue: unknown,
  options: {
    catalogue?: FilterOperatorCatalogue;
    type?: TableFilterType;
    now?: number;
  } = {},
): boolean {
  const catalogue = options.catalogue ?? DEFAULT_CATALOGUE;
  const [compiled] = compileConditions([condition], catalogue, {
    now: options.now ?? 0,
    type: options.type ?? "text",
  });
  // An incomplete or unknown condition compiles to nothing and excludes no row.
  return compiled ? testCompiled(compiled, cellValue) : true;
}

/**
 * The one filter function every filterable column gets.
 *
 * `autoRemove` is what keeps `columnFilters`, `column.getIsFiltered()` and
 * `table.resetColumnFilters()` honest without any bookkeeping of ours: TanStack
 * calls it on every write and drops the entry when it returns true.
 */
export function createColumnFilterFn(
  catalogue: FilterOperatorCatalogue,
  type: TableFilterType,
  now: () => number,
): FilterFn<any, any> {
  const filterFn: FilterFn<any, any> = (row, columnId, prepared) => {
    const value = row.getValue(columnId);
    for (const compiled of prepared as CompiledCondition[]) {
      // Conditions on one column are ANDed: "after X" and "before Y" together
      // mean a window, which is the only reading that isn't surprising.
      if (!testCompiled(compiled, value)) return false;
    }
    return true;
  };

  filterFn.resolveFilterValue = (value: unknown) =>
    compileConditions(value as TableFilterCondition[], catalogue, { now: now(), type });

  filterFn.autoRemove = (value: unknown) => !Array.isArray(value) || value.length === 0;

  return filterFn;
}

/**
 * Rewrite relative dates into concrete `between` conditions.
 *
 * Server mode reports `in-last` **unresolved** — `{ operator: "in-last",
 * values: [7], unit: "day" }` — because the server's clock is the authority and
 * "does the last 7 days include today?" is a policy it may already have. This is
 * the opt-out for consumers who would rather pin the range on the client, where
 * the user's timezone is known.
 */
export function resolveRelativeDates(
  conditions: readonly TableFilterCondition[],
  now: number,
): TableFilterCondition[] {
  return conditions.map((condition) => {
    if (condition.operator !== "in-last" && condition.operator !== "in-next") return condition;
    const range = relativeRange(condition, now, condition.operator === "in-last" ? -1 : 1);
    if (!range) return condition;
    const { unit: _unit, ...rest } = condition;
    return { ...rest, operator: "between", values: [range.from, range.to] };
  });
}
