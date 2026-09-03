/**
 * The filter model: the article's **identifier + relative + value**.
 *
 * A filter used to be a `kind` and a value, with the comparison hard-coded per
 * kind — `text` always meant "contains", `number` always meant "between". That
 * conflated two independent things: what a field *is*, and what the user is
 * *asking about it*. Splitting them is what makes "is not", "is before" and
 * "is empty" expressible at all.
 *
 * Everything here is a plain JSON record by construction. That is not an
 * accident: it makes a filter set URL-encodable, usable as a cache key, and
 * translatable by a server consumer without narrowing a union first.
 */
/** One choice in an `enum` filter. */
export interface TableFilterOption {
  value: string;
  label: string;
}

// ─── Taxonomy ────────────────────────────────────────────────────────────────

/**
 * What the column's data *is*. The control shown follows from the type and the
 * operator together, never from the type alone.
 *
 * The old `select` and `multi` kinds are gone: they were an operator smuggled
 * into the type (`select` = `enum` + `is`, `multi` = `enum` + `is-any-of`),
 * which is exactly the conflation this model removes.
 */
export type TableFilterType = "text" | "number" | "date" | "enum" | "boolean";

/** The article's "relative" — the relation between identifier and value. */
export type BuiltInFilterOperator =
  // Universal
  | "is-empty"
  | "is-not-empty"
  | "is"
  | "is-not"
  // Sets
  | "is-any-of"
  | "is-none-of"
  // Text
  | "contains"
  | "not-contains"
  | "starts-with"
  | "ends-with"
  // Ordered (number and date)
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "not-between"
  // Relative dates
  | "in-last"
  | "in-next"
  | "is-today";

/**
 * The `(string & {})` tail is deliberate: it keeps autocomplete on the built-in
 * ids while letting a consumer's registered custom operator typecheck. A bare
 * `string` would lose the suggestions; a closed union would make custom
 * operators impossible.
 */
export type TableFilterOperator = BuiltInFilterOperator | (string & {});

/** How many operands an operator consumes. */
export type FilterOperatorArity = "none" | "one" | "two" | "many";

/** Operands are JSON primitives so a condition survives `JSON.stringify`. */
export type TableFilterValue = string | number | boolean | null;

export type TableFilterUnit = "day" | "week" | "month" | "year";

// ─── The condition ───────────────────────────────────────────────────────────

/**
 * One filter: identifier + relative + value. This is what a chip renders, what
 * the reducer stores, and what server mode reports.
 */
export interface TableFilterCondition {
  /**
   * Stable identity. Required rather than derived, because two conditions can
   * target the same column ("joined after X" and "joined before Y") and each
   * must be independently editable and removable.
   */
  id: string;
  columnId: string;
  operator: TableFilterOperator;
  /**
   * Operands, **always an array** — never a scalar-or-array union. One shape
   * means one code path in the predicate, in the description, and in every
   * server translator. The cost is a `values[0]` read.
   */
  values: TableFilterValue[];
  /** The unit for `in-last` / `in-next`. */
  unit?: TableFilterUnit;
}

// ─── The engineer's declaration ──────────────────────────────────────────────

export interface TableFilterDef {
  /** Data type. Inferred from the column's own values when omitted. */
  type?: TableFilterType;
  /** Restrict the offered operators, in menu order. Defaults to the type's set. */
  operators?: TableFilterOperator[];
  /** What a newly added condition starts on. Defaults to the first offered. */
  defaultOperator?: TableFilterOperator;
  /** Choices for `enum`. Derived from the column's facets when omitted. */
  options?: TableFilterOption[];
  /** Name in the Add-filter list and in the chip. Defaults to the header text. */
  label?: string;
  placeholder?: string;
  /** Ordering in the Add-filter list. Lower first; ties keep column order. */
  priority?: number;
  /** At most one condition on this column; adding a second replaces the first. */
  single?: boolean;
  /**
   * Force faceted counts on or off. Defaults to on below `FACET_ROW_LIMIT`
   * rows and off above it — counting is an O(rows) pass.
   */
  counts?: boolean;
  /**
   * Locale-aware display, when the defaults are not enough.
   *
   * Core never calls `Intl` itself: its output varies by ICU version, which
   * would make visual baselines disagree between the Linux container and a
   * developer's machine — a flaky gate for a cosmetic gain. This is the opt-in.
   */
  formatValue?: (value: TableFilterValue, condition: TableFilterCondition) => string;
}

/**
 * `true` means "filterable, everything inferred" — the cheap form, so marking a
 * column filterable is never a reason to skip it. `false` is accepted as an
 * explicit "not filterable" so a column can opt out of a shared column factory.
 */
export type TableFilterSetting = TableFilterDef | boolean;

/** Widens the `true` shorthand. The one place that shorthand is understood. */
export function normalizeFilterDef(
  setting: TableFilterSetting | undefined,
): TableFilterDef | undefined {
  if (setting === undefined || setting === false) return undefined;
  return setting === true ? {} : setting;
}

// ─── Operator definitions ────────────────────────────────────────────────────

/** Read once per filter pass, never per row. */
export interface FilterCompileContext {
  /** Injected, never read from the clock — that is what keeps core pure. */
  now: number;
  type: TableFilterType;
}

export interface FilterOperatorDef {
  id: TableFilterOperator;
  /** Shown in the operator picker and in the chip. The localization hook. */
  label: string;
  /**
   * The design system comparison glyph a chip draws instead of the label —
   * "equals", "contains", "starts-with" and so on.
   *
   * Deliberately a plain string rather than core's `ComparisonIconName`:
   * `@ui-organized/table-core` imports no framework *and* no component library,
   * so it names the glyph and the adapter resolves it. Only six operators have
   * one; the rest keep their words, because there is no glyph for "is in the
   * last 7 days" that anyone would read correctly.
   */
  icon?: string;
  /**
   * Per-type label override. `lt` is "is less than" for a number and "is
   * before" for a date — the same comparison, and it would read badly under one
   * name. An override beats duplicate operator ids, which would double every
   * predicate.
   */
  labelByType?: Partial<Record<TableFilterType, string>>;
  arity: FilterOperatorArity;
  /** Types this operator is offered for. */
  types: readonly TableFilterType[];
  /**
   * Whether this operator matches a cell that is null, undefined, `""` or NaN.
   *
   * A flag rather than a branch, so the decision is inspectable and testable
   * one operator at a time. It is `true` for `is-empty` and for the *negative*
   * operators: someone who writes "status is not active" plainly means to
   * include rows with no status. SQL's three-valued logic would disagree; we
   * are not writing SQL, and Airtable and Notion both behave this way.
   */
  matchesEmpty?: boolean;
  /**
   * Per-pass precompute: lowercase the needle, build a `Set`, resolve a
   * relative date. Runs once for the whole table, not once per row.
   */
  compile?: (condition: TableFilterCondition, ctx: FilterCompileContext) => unknown;
  /** The predicate. `prepared` is `compile`'s output, or the raw `values`. */
  test: (cellValue: unknown, prepared: unknown) => boolean;
}

/** Resolved operator definitions for one table. Never a global singleton. */
export interface FilterOperatorCatalogue {
  get: (id: TableFilterOperator) => FilterOperatorDef | undefined;
  /** Every operator offered for a type, in menu order. */
  forType: (type: TableFilterType) => FilterOperatorDef[];
  all: () => FilterOperatorDef[];
}
