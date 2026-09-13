/**
 * The operator catalogue: what each "relative" means, and which types offer it.
 *
 * Every operator is a **data record**, not a branch in a switch. That is what
 * makes the set extensible (a consumer registers one more), localizable (an app
 * passes translated labels), and inspectable — "does `is-not` match an empty
 * cell?" is a field you can read rather than a code path you have to trace.
 *
 * Each definition splits into `compile` and `test` because TanStack calls
 * `filterFn.resolveFilterValue` once per filter pass and `filterFn` once per
 * row. Lowercasing a needle, building a `Set` and resolving "last 7 days" all
 * belong in the first; the second is pure comparison that allocates nothing.
 */
import type {
  FilterOperatorCatalogue,
  FilterOperatorDef,
  TableFilterCondition,
  TableFilterOperator,
  TableFilterType,
  TableFilterValue,
} from "./types.js";

// ─── Cell normalization ──────────────────────────────────────────────────────

/** What every comparison operates on: a comparable primitive, or null. */
export type NormalizedValue = string | number | boolean | null;

/**
 * A cell is "empty" if it is nullish, blank, or a number that isn't one.
 *
 * `NaN` counts: a `number` column holding `"12px"` coerces to NaN, and treating
 * that as empty is what stops it silently satisfying an ordered comparison.
 */
export function isEmptyCell(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "number" && Number.isNaN(value))
  );
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * A `Date` is reduced using its **local** parts, not `toISOString()`.
 *
 * A date in a data table denotes a calendar day, and `toISOString()` is UTC —
 * so a `Date` built from local parts anywhere west of Greenwich reported the
 * *previous* day. That was a real bug in the filter this replaces.
 *
 * A string is only accepted if it actually looks like an ISO date. The old code
 * did `String(raw).slice(0, 10)` unconditionally, which turned
 * `"March 3, 2024"` into `"March 3, "` and compared that against ISO bounds —
 * returning wrong rows, silently.
 */
export function toIsoDay(value: unknown): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
  }
  const text = String(value);
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : null;
}

/** `Number("")` is 0, which is why the blank guard comes first. */
export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;
  const trimmed = value.trim();
  return trimmed === "" ? Number.NaN : Number(trimmed);
}

/**
 * Reduce any cell or operand to something comparable with `===`, `<` and `>`.
 *
 * ISO day strings sort lexicographically, which is why dates never need a
 * `Date` to be constructed per row — the single most important performance
 * decision in the predicate, on a 100,000-row table.
 *
 * `toLowerCase`, not `toLocaleLowerCase`: locale-aware lowering is
 * locale-dependent (Turkish dotless ı), so the same dataset would filter
 * differently in different browsers. Deterministic beats linguistically perfect.
 */
export function normalize(value: unknown, type: TableFilterType): NormalizedValue {
  if (isEmptyCell(value)) return null;
  switch (type) {
    case "number": {
      const n = toNumber(value);
      return Number.isNaN(n) ? null : n;
    }
    case "date":
      return toIsoDay(value);
    case "boolean":
      if (typeof value === "boolean") return value;
      if (value === "true") return true;
      if (value === "false") return false;
      return Boolean(value);
    default:
      return String(value).toLowerCase();
  }
}

function normalizeAll(values: readonly TableFilterValue[], type: TableFilterType) {
  return values.map((value) => normalize(value, type));
}

// ─── Compiled shapes ─────────────────────────────────────────────────────────

interface OneOperand {
  a: NormalizedValue;
  type: TableFilterType;
}
interface TwoOperands {
  a: NormalizedValue;
  b: NormalizedValue;
  type: TableFilterType;
}
interface SetOperand {
  set: Set<NormalizedValue>;
  type: TableFilterType;
}

const one = (c: TableFilterCondition, type: TableFilterType): OneOperand => ({
  a: normalize(c.values[0] ?? null, type),
  type,
});

const two = (c: TableFilterCondition, type: TableFilterType): TwoOperands => {
  const a = normalize(c.values[0] ?? null, type);
  const b = normalize(c.values[1] ?? null, type);
  // Tolerate a reversed range rather than silently matching nothing: a user who
  // types the bigger number first means the same thing.
  return a !== null && b !== null && a > b ? { a: b, b: a, type } : { a, b, type };
};

const many = (c: TableFilterCondition, type: TableFilterType): SetOperand => ({
  set: new Set(normalizeAll(c.values, type)),
  type,
});

/** An operand the user has not supplied yet must never exclude rows. */
const pending = (value: NormalizedValue) => value === null;

// ─── Relative dates ──────────────────────────────────────────────────────────

const MS_PER_DAY = 86_400_000;

function shiftDays(now: number, days: number): string {
  return toIsoDay(new Date(now + days * MS_PER_DAY)) ?? "";
}

/** Whole days per unit. Months and years are approximated deliberately — see below. */
const DAYS_PER_UNIT = { day: 1, week: 7, month: 30, year: 365 } as const;

/**
 * "In the last 7 days" spans today and the six days before it — inclusive at
 * both ends. That boundary is the classic off-by-one, so it is pinned by a test
 * with a frozen clock rather than left to reading.
 *
 * Months and years are 30 and 365 days. Calendar-exact arithmetic would need a
 * timezone-aware date library, and "last 3 months" is a rough span in every
 * product that offers it; being wrong by a day or two is expected, while
 * dragging a date library into a framework-free package is not.
 */
export function relativeRange(
  condition: TableFilterCondition,
  now: number,
  direction: -1 | 1,
): { from: string; to: string } | null {
  const count = toNumber(condition.values[0] ?? null);
  if (Number.isNaN(count) || count <= 0) return null;
  const span = Math.round(count * DAYS_PER_UNIT[condition.unit ?? "day"]) - 1;
  const today = toIsoDay(new Date(now)) ?? "";
  return direction === -1
    ? { from: shiftDays(now, -span), to: today }
    : { from: today, to: shiftDays(now, span) };
}

// ─── The built-in operators ──────────────────────────────────────────────────

const ALL_TYPES = ["text", "number", "date", "enum", "boolean"] as const;
const ORDERED = ["number", "date"] as const;
const TEXTUAL = ["text"] as const;

export const BUILT_IN_OPERATORS: readonly FilterOperatorDef[] = [
  // ── Presence ──────────────────────────────────────────────────────────────
  {
    id: "is-empty",
    label: "is empty",
    arity: "none",
    types: ALL_TYPES,
    matchesEmpty: true,
    test: (value) => isEmptyCell(value),
  },
  {
    id: "is-not-empty",
    label: "is not empty",
    arity: "none",
    types: ALL_TYPES,
    test: () => true, // The empty short-circuit already rejected empty cells.
  },

  // ── Equality ──────────────────────────────────────────────────────────────
  {
    id: "is",
    label: "is",
    icon: "equals",
    labelByType: { date: "is on" },
    arity: "one",
    types: ALL_TYPES,
    compile: (c, ctx) => one(c, ctx.type),
    test: (value, p) => {
      const { a, type } = p as OneOperand;
      return pending(a) || normalize(value, type) === a;
    },
  },
  {
    id: "is-not",
    label: "is not",
    arity: "one",
    types: ALL_TYPES,
    matchesEmpty: true,
    compile: (c, ctx) => one(c, ctx.type),
    test: (value, p) => {
      const { a, type } = p as OneOperand;
      return pending(a) || normalize(value, type) !== a;
    },
  },

  // ── Sets ──────────────────────────────────────────────────────────────────
  {
    id: "is-any-of",
    label: "is any of",
    icon: "is-any-of",
    arity: "many",
    types: ["text", "enum", "number"],
    compile: (c, ctx) => many(c, ctx.type),
    test: (value, p) => {
      const { set, type } = p as SetOperand;
      return set.size === 0 || set.has(normalize(value, type));
    },
  },
  {
    id: "is-none-of",
    label: "is none of",
    arity: "many",
    types: ["text", "enum", "number"],
    matchesEmpty: true,
    compile: (c, ctx) => many(c, ctx.type),
    test: (value, p) => {
      const { set, type } = p as SetOperand;
      return set.size === 0 || !set.has(normalize(value, type));
    },
  },

  // ── Text ──────────────────────────────────────────────────────────────────
  {
    id: "contains",
    label: "contains",
    icon: "contains",
    arity: "one",
    types: TEXTUAL,
    compile: (c) => one(c, "text"),
    test: (value, p) => {
      const { a } = p as OneOperand;
      return pending(a) || String(normalize(value, "text")).includes(a as string);
    },
  },
  {
    id: "not-contains",
    label: "does not contain",
    icon: "does-not-contain",
    arity: "one",
    types: TEXTUAL,
    matchesEmpty: true,
    compile: (c) => one(c, "text"),
    test: (value, p) => {
      const { a } = p as OneOperand;
      return pending(a) || !String(normalize(value, "text")).includes(a as string);
    },
  },
  {
    id: "starts-with",
    label: "starts with",
    icon: "starts-with",
    arity: "one",
    types: TEXTUAL,
    compile: (c) => one(c, "text"),
    test: (value, p) => {
      const { a } = p as OneOperand;
      return pending(a) || String(normalize(value, "text")).startsWith(a as string);
    },
  },
  {
    id: "ends-with",
    label: "ends with",
    icon: "ends-with",
    arity: "one",
    types: TEXTUAL,
    compile: (c) => one(c, "text"),
    test: (value, p) => {
      const { a } = p as OneOperand;
      return pending(a) || String(normalize(value, "text")).endsWith(a as string);
    },
  },

  // ── Ordered ───────────────────────────────────────────────────────────────
  {
    id: "gt",
    label: "is greater than",
    labelByType: { date: "is after" },
    arity: "one",
    types: ORDERED,
    compile: (c, ctx) => one(c, ctx.type),
    test: (value, p) => {
      const { a, type } = p as OneOperand;
      const v = normalize(value, type);
      return pending(a) || (v !== null && v > a!);
    },
  },
  {
    id: "gte",
    label: "is at least",
    labelByType: { date: "is on or after" },
    arity: "one",
    types: ORDERED,
    compile: (c, ctx) => one(c, ctx.type),
    test: (value, p) => {
      const { a, type } = p as OneOperand;
      const v = normalize(value, type);
      return pending(a) || (v !== null && v >= a!);
    },
  },
  {
    id: "lt",
    label: "is less than",
    labelByType: { date: "is before" },
    arity: "one",
    types: ORDERED,
    compile: (c, ctx) => one(c, ctx.type),
    test: (value, p) => {
      const { a, type } = p as OneOperand;
      const v = normalize(value, type);
      return pending(a) || (v !== null && v < a!);
    },
  },
  {
    id: "lte",
    label: "is at most",
    labelByType: { date: "is on or before" },
    arity: "one",
    types: ORDERED,
    compile: (c, ctx) => one(c, ctx.type),
    test: (value, p) => {
      const { a, type } = p as OneOperand;
      const v = normalize(value, type);
      return pending(a) || (v !== null && v <= a!);
    },
  },
  {
    // Inclusive at both ends. Stated here because it is the classic off-by-one,
    // and pinned by a test.
    id: "between",
    label: "is between",
    arity: "two",
    types: ORDERED,
    compile: (c, ctx) => two(c, ctx.type),
    test: (value, p) => {
      const { a, b, type } = p as TwoOperands;
      if (pending(a) || pending(b)) return true;
      const v = normalize(value, type);
      return v !== null && v >= a! && v <= b!;
    },
  },
  {
    id: "not-between",
    label: "is not between",
    arity: "two",
    types: ORDERED,
    matchesEmpty: true,
    compile: (c, ctx) => two(c, ctx.type),
    test: (value, p) => {
      const { a, b, type } = p as TwoOperands;
      if (pending(a) || pending(b)) return true;
      const v = normalize(value, type);
      return v === null || v < a! || v > b!;
    },
  },

  // ── Relative dates ────────────────────────────────────────────────────────
  {
    id: "in-last",
    label: "is in the last",
    arity: "one",
    types: ["date"],
    compile: (c, ctx) => relativeRange(c, ctx.now, -1),
    test: (value, p) => {
      if (p === null) return true;
      const { from, to } = p as { from: string; to: string };
      const v = toIsoDay(value);
      return v !== null && v >= from && v <= to;
    },
  },
  {
    id: "in-next",
    label: "is in the next",
    arity: "one",
    types: ["date"],
    compile: (c, ctx) => relativeRange(c, ctx.now, 1),
    test: (value, p) => {
      if (p === null) return true;
      const { from, to } = p as { from: string; to: string };
      const v = toIsoDay(value);
      return v !== null && v >= from && v <= to;
    },
  },
  {
    id: "is-today",
    label: "is today",
    arity: "none",
    types: ["date"],
    compile: (_c, ctx) => toIsoDay(new Date(ctx.now)),
    test: (value, p) => toIsoDay(value) === p,
  },
];

// ─── Default offerings ───────────────────────────────────────────────────────

/**
 * What each type offers *by default*, in menu order — most-used first, never
 * alphabetical.
 *
 * Deliberately narrower than the full catalogue. Eight text operators is
 * Airtable-grade and violates the article's own "know when to stop"; the rest
 * are one `meta.filter.operators` away for the tables that need them.
 */
export const DEFAULT_OPERATORS_BY_TYPE: Record<TableFilterType, TableFilterOperator[]> = {
  text: ["contains", "is", "is-not", "is-empty", "is-not-empty"],
  number: ["is", "gt", "gte", "lt", "lte", "between", "is-empty", "is-not-empty"],
  date: ["is", "lt", "gt", "between", "in-last", "is-empty", "is-not-empty"],
  enum: ["is-any-of", "is-none-of", "is-empty", "is-not-empty"],
  boolean: ["is"],
};

// ─── The catalogue ───────────────────────────────────────────────────────────

/**
 * Per-table, never a module-level registry.
 *
 * A mutable global would be shared by every table on the page, make core
 * stateful, break SSR, and leak between tests. Passing custom definitions in
 * also gives localization for free: an app hands over translated
 * `FilterOperatorDef`s and every label core produces changes with them.
 */
export function createOperatorCatalogue(
  extra: readonly FilterOperatorDef[] = [],
): FilterOperatorCatalogue {
  const byId = new Map<TableFilterOperator, FilterOperatorDef>();
  for (const def of BUILT_IN_OPERATORS) byId.set(def.id, def);
  // Later wins, so a custom definition can override a built-in of the same id.
  for (const def of extra) byId.set(def.id, def);

  return {
    get: (id) => byId.get(id),
    forType: (type) => [...byId.values()].filter((def) => def.types.includes(type)),
    all: () => [...byId.values()],
  };
}

/** Frozen, built-ins only. The default when a table registers nothing extra. */
export const DEFAULT_CATALOGUE: FilterOperatorCatalogue = createOperatorCatalogue();

/** The operators a column offers: its own list, or the type's default. */
export function operatorsFor(
  type: TableFilterType,
  catalogue: FilterOperatorCatalogue,
  declared?: readonly TableFilterOperator[],
): FilterOperatorDef[] {
  const ids = declared ?? DEFAULT_OPERATORS_BY_TYPE[type];
  return ids
    .map((id) => catalogue.get(id))
    .filter((def): def is FilterOperatorDef => def !== undefined && def.types.includes(type));
}

/** What a newly added condition starts on. */
export function defaultOperatorFor(
  type: TableFilterType,
  catalogue: FilterOperatorCatalogue,
  def?: { operators?: readonly TableFilterOperator[]; defaultOperator?: TableFilterOperator },
): TableFilterOperator {
  const offered = operatorsFor(type, catalogue, def?.operators);
  const declared = def?.defaultOperator;
  if (declared && offered.some((op) => op.id === declared)) return declared;
  return offered[0]?.id ?? "is";
}

/** How many operands the operator needs before it may filter. */
export function requiredOperands(arity: FilterOperatorDef["arity"]): number {
  switch (arity) {
    case "none":
      return 0;
    case "two":
      return 2;
    default:
      return 1;
  }
}

/** The label to show, honouring a per-type override. */
export function operatorLabel(def: FilterOperatorDef, type: TableFilterType): string {
  return def.labelByType?.[type] ?? def.label;
}

// ─── Type inference ──────────────────────────────────────────────────────────

/**
 * What `filter: true` resolves to, decided from the column's own values.
 *
 * Samples rather than a single value, because a leading `null` should not get a
 * vote. The first non-empty sample wins.
 *
 * Deliberately **not** inferred: `enum` from low-cardinality text. Cardinality
 * changes as data streams in, so the editor's whole shape would flip
 * mid-session. `enum` requires either declared `options` or an explicit `type`.
 */
export function inferFilterType(
  samples: readonly unknown[],
  declaredOptions?: readonly unknown[],
): TableFilterType {
  if (declaredOptions && declaredOptions.length > 0) return "enum";
  for (const sample of samples) {
    if (isEmptyCell(sample)) continue;
    if (typeof sample === "boolean") return "boolean";
    if (typeof sample === "number") return "number";
    if (sample instanceof Date) return "date";
    if (typeof sample === "string" && /^\d{4}-\d{2}-\d{2}/.test(sample)) return "date";
    return "text";
  }
  return "text";
}
