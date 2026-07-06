/**
 * Confidence / staleness / deprecation indicators (INSPECTOR.md §4, §6, §7). Uses
 * the same confidence + staleness model as the MCP server (values computed by the
 * shared core), never a reinvented one.
 */
import type { Confidence } from "@ui-organized/code-connect/browser";

export function StatusBadge({
  confidence,
  isStale,
  changedProps,
  deprecated,
}: {
  confidence: Confidence;
  isStale?: boolean;
  changedProps?: string[];
  deprecated?: boolean;
}) {
  return (
    <>
      {deprecated && (
        <div className="fcp-badge" data-tone="deprecated">
          ⛔ Deprecated component — kept for reference; prefer a current one.
        </div>
      )}
      {confidence === "exact" && !isStale && !deprecated && (
        <div className="fcp-badge" data-tone="exact">
          ● Verified mapping
        </div>
      )}
      {isStale && (
        <div className="fcp-badge" data-tone="stale">
          ▲ Stale — code changed since last sync
          {changedProps?.length ? `: ${changedProps.join(", ")}` : ""}
        </div>
      )}
    </>
  );
}
