import type { DtcgGroup, OverrideLayer } from "@ui-organized/schema";
import { getTokenAtPath, mergeProps } from "./tree.js";

/**
 * Non-destructive regeneration — the three-way merge (generated base ↔ user
 * overrides ↔ new base). A pure function with exhaustive classification; the
 * editor only renders the result and collects decisions on stale cases.
 *
 * Classification is override-vs-new-base (no previous base needed):
 *  - **redundant**: the override now equals the newly generated value → auto-clear
 *    (a silent no-op; reported as absorbed).
 *  - **reapplied**: the override still differs → keep it.
 *  - **stale**: the targeted token no longer exists, or its `$type`/shape changed
 *    → surface to the user, never auto-discard.
 */

export type OverrideClassification = "reapplied" | "redundant" | "stale";

export interface StaleOverride {
  path: string;
  reason: "missing" | "shape-changed";
}

export interface ReconcileReport {
  /** Overrides kept because they still differ from the new base. */
  reapplied: string[];
  /** Overrides cleared because the new base already matches them. */
  redundant: string[];
  /** Overrides needing a user decision (kept until decided). */
  stale: StaleOverride[];
}

export interface ReconcileResult {
  /** The override layer after reconciliation (redundant dropped, others kept). */
  overrides: OverrideLayer;
  report: ReconcileReport;
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Applies the override layer onto a generated base, producing the effective
 * tokens to resolve. Overrides whose target token is missing are skipped
 * (they are stale; {@link reconcileOverrides} reports them).
 */
export function applyOverrides(base: DtcgGroup, overrides: OverrideLayer): DtcgGroup {
  let result = base;
  for (const [path, props] of Object.entries(overrides)) {
    result = mergeProps(result, path, props);
  }
  return result;
}

/**
 * Classifies every override against a freshly generated base and returns the
 * reconciled override layer plus a report. Redundant overrides are dropped;
 * reapplied and stale ones are kept (stale flagged for the user).
 */
export function reconcileOverrides(
  base: DtcgGroup,
  overrides: OverrideLayer,
): ReconcileResult {
  const next: OverrideLayer = {};
  const report: ReconcileReport = { reapplied: [], redundant: [], stale: [] };

  for (const [path, props] of Object.entries(overrides)) {
    const token = getTokenAtPath(base, path);

    if (!token) {
      report.stale.push({ path, reason: "missing" });
      next[path] = props;
      continue;
    }

    // Shape change: the override carries a $type that no longer matches.
    if (typeof props.$type === "string" && props.$type !== token.$type) {
      report.stale.push({ path, reason: "shape-changed" });
      next[path] = props;
      continue;
    }

    const tokenRecord = token as unknown as Record<string, unknown>;
    const allEqual = Object.entries(props).every(([prop, value]) =>
      deepEqual(tokenRecord[prop], value),
    );

    if (allEqual) {
      report.redundant.push(path); // absorbed — drop from next
    } else {
      report.reapplied.push(path);
      next[path] = props;
    }
  }

  return { overrides: next, report };
}

/** True when a reconcile report has stale overrides that need a user decision. */
export function hasStaleOverrides(report: ReconcileReport): boolean {
  return report.stale.length > 0;
}
