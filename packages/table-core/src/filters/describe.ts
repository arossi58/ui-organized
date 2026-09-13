/**
 * Turning a condition into the words on a chip.
 *
 * This lives in core, not in the adapter, for the same reason the prop builders
 * do: it is the difference between two frameworks rendering the same table and
 * two frameworks rendering two slightly different products. The chip needs the
 * three parts separately (it styles them differently) and the accessible name
 * needs them joined, so both come out of one call.
 *
 * Core deliberately never calls `Intl`. Its output varies by ICU version, which
 * would make a visual baseline captured in the Linux container disagree with
 * one captured on a developer's machine — a flaky gate in exchange for prettier
 * dates. `TableFilterDef.formatValue` is the opt-in for apps that need it.
 */
import { operatorLabel } from "./operators.js";
import { isConditionComplete } from "./predicate.js";
import type {
  FilterOperatorCatalogue,
  TableFilterOption,
  TableFilterCondition,
  TableFilterType,
  TableFilterValue,
} from "./types.js";

/** Shown where a value is required but has not been supplied yet. */
export const VALUE_PLACEHOLDER = "…";

export interface DescribeContext {
  type: TableFilterType;
  /** The column's display name — `meta.filter.label`, or its header text. */
  columnLabel: string;
  catalogue: FilterOperatorCatalogue;
  /** Enum choices, so a chip shows "Platform" rather than a raw id. */
  options?: readonly TableFilterOption[];
  formatValue?: (value: TableFilterValue, condition: TableFilterCondition) => string;
  /** Values listed before collapsing to "+N". Defaults to 2. */
  maxValues?: number;
}

export interface ConditionDescription {
  /** "Team" */
  field: string;
  /** "is any of" */
  relative: string;
  /**
   * The comparison glyph to draw instead of `relative`, for the six operators
   * that have one. `relative` is still the glyph's accessible name, so a chip
   * that draws it does not lose the relation for anyone who cannot see it.
   */
  icon: string | undefined;
  /** "Platform, Growth +2" */
  value: string;
  /** "Team is any of Platform, Growth +2" — the accessible name. */
  text: string;
  /** How many values are hidden behind the "+N". */
  overflowCount: number;
  /** False while the condition still needs an operand, so a chip can say so. */
  complete: boolean;
}

function labelFor(
  value: TableFilterValue,
  ctx: DescribeContext,
  condition: TableFilterCondition,
): string {
  if (ctx.formatValue) return ctx.formatValue(value, condition);
  if (value === null || value === undefined || value === "") return VALUE_PLACEHOLDER;
  if (ctx.type === "boolean") return value ? "Yes" : "No";
  if (ctx.type === "enum") {
    const option = ctx.options?.find((entry) => entry.value === String(value));
    return option?.label ?? String(value);
  }
  return String(value);
}

function pluralize(count: number, unit: string): string {
  return `${count} ${unit}${Math.abs(count) === 1 ? "" : "s"}`;
}

function describeValues(
  condition: TableFilterCondition,
  ctx: DescribeContext,
): { value: string; overflowCount: number } {
  const operator = ctx.catalogue.get(condition.operator);
  if (!operator || operator.arity === "none") return { value: "", overflowCount: 0 };

  // "is in the last" + "7 days" reads as a sentence; the unit belongs with the
  // number, not with the operator.
  if (condition.operator === "in-last" || condition.operator === "in-next") {
    const count = Number(condition.values[0]);
    if (!Number.isFinite(count)) return { value: VALUE_PLACEHOLDER, overflowCount: 0 };
    return { value: pluralize(count, condition.unit ?? "day"), overflowCount: 0 };
  }

  if (operator.arity === "two") {
    const [from, to] = condition.values;
    // En dash, not a hyphen: this is a range, not a compound word.
    return {
      value: `${labelFor(from ?? null, ctx, condition)} – ${labelFor(to ?? null, ctx, condition)}`,
      overflowCount: 0,
    };
  }

  if (operator.arity === "many") {
    if (condition.values.length === 0) return { value: VALUE_PLACEHOLDER, overflowCount: 0 };
    const max = ctx.maxValues ?? 2;
    const shown = condition.values.slice(0, max).map((value) => labelFor(value, ctx, condition));
    const overflowCount = Math.max(0, condition.values.length - max);
    return {
      value: overflowCount > 0 ? `${shown.join(", ")} +${overflowCount}` : shown.join(", "),
      overflowCount,
    };
  }

  return { value: labelFor(condition.values[0] ?? null, ctx, condition), overflowCount: 0 };
}

export function describeCondition(
  condition: TableFilterCondition,
  ctx: DescribeContext,
): ConditionDescription {
  const operator = ctx.catalogue.get(condition.operator);
  const relative = operator ? operatorLabel(operator, ctx.type) : condition.operator;
  const { value, overflowCount } = describeValues(condition, ctx);

  return {
    field: ctx.columnLabel,
    relative,
    icon: operator?.icon,
    value,
    text: [ctx.columnLabel, relative, value].filter(Boolean).join(" "),
    overflowCount,
    complete: isConditionComplete(condition, ctx.catalogue),
  };
}

// ─── Announcements ───────────────────────────────────────────────────────────

export type FilterChangeKind = "added" | "removed" | "changed" | "cleared";

/**
 * One composed sentence for one live region.
 *
 * The result count rides along because the article asks for both — "display the
 * number of results" and a visible summary of what is applied — and a screen
 * reader user needs them in the same breath: the count is the whole point of
 * having removed the filter.
 */
export function filterAnnouncement(
  change: { kind: FilterChangeKind; description?: string },
  resultCount: number,
): string {
  const rows = `${resultCount} ${resultCount === 1 ? "result" : "results"}.`;
  switch (change.kind) {
    case "added":
      return `Filter added: ${change.description}. ${rows}`;
    case "removed":
      return `Filter removed: ${change.description}. ${rows}`;
    case "changed":
      return `Filter changed: ${change.description}. ${rows}`;
    case "cleared":
      return `All filters cleared. ${rows}`;
    default:
      return rows;
  }
}

/** "3 filters" — the visible counterpart to the announcement. */
export function filterSummary(count: number): string {
  if (count === 0) return "No filters";
  return `${count} ${count === 1 ? "filter" : "filters"}`;
}
