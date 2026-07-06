/** Shared Figma-style row: label on the left (with description tooltip + default
 *  hint, like the Controls panel), control on the right, plus an inline drift
 *  warning traceable to this exact property (INSPECTOR.md §4). */
import type { ReactNode } from "react";

export function RowShell({
  label,
  description,
  defaultValue,
  drift,
  children,
}: {
  label: string;
  description?: string;
  defaultValue?: string;
  drift?: string;
  children: ReactNode;
}) {
  return (
    <div className="fcp-row">
      <div className="fcp-row-label">
        <span title={description ? `${label} — ${description}` : label}>{label}</span>
        {defaultValue != null && defaultValue !== "" && (
          <span className="fcp-default" title={`default: ${defaultValue}`}>= {defaultValue}</span>
        )}
        {drift && (
          <span className="fcp-drift" title={drift} aria-label={`drift: ${drift}`}>
            ⚠
          </span>
        )}
      </div>
      <div className="fcp-row-control">{children}</div>
    </div>
  );
}
