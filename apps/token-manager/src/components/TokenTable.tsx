import { Badge, Button } from "@ui-organized/react";
import type { EffectiveToken, ResolveMiss, ResolveResult } from "@ui-organized/resolver";
import { removeToken } from "../yjs/store.js";
import { colorHex, formatResolved } from "../lib/resolvedFormat.js";
import { ValueEditor } from "./ValueEditor.js";

export type SortKey = "name" | "type" | "resolved";
export interface SortState {
  key: SortKey;
  dir: "asc" | "desc";
}

interface TokenTableProps {
  setName: string;
  rows: EffectiveToken[];
  paths: string[];
  result: ResolveResult;
  overriddenPaths: Set<string>;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  sort: SortState;
  onSortChange: (key: SortKey) => void;
}

export function TokenTable({
  setName,
  rows,
  paths,
  result,
  overriddenPaths,
  selectedPath,
  onSelect,
  sort,
  onSortChange,
}: TokenTableProps) {
  const missByPath = new Map<string, ResolveMiss>();
  for (const miss of result.misses) {
    if (miss.kind === "cycle") miss.cycle.forEach((p) => missByPath.set(p, miss));
    else missByPath.set(miss.path, miss);
  }

  if (rows.length === 0) {
    return <div className="tm-empty">No tokens match. Use “Add token”, or clear the filter.</div>;
  }

  return (
    <div className="tm-table-wrap">
      <table className="tm-table">
        <thead>
          <tr>
            <Th label="Token" col="name" sort={sort} onSortChange={onSortChange} />
            <Th label="Type" col="type" sort={sort} onSortChange={onSortChange} />
            <th>Value</th>
            <Th label="Resolved" col="resolved" sort={sort} onSortChange={onSortChange} />
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((token) => {
            const resolution = result.tokens.get(token.path);
            const miss = missByPath.get(token.path);
            const group = token.path.includes(".") ? token.path.slice(0, token.path.lastIndexOf(".") + 1) : "";
            const leaf = token.path.slice(token.path.lastIndexOf(".") + 1);
            return (
              <tr
                key={token.path}
                className={selectedPath === token.path ? "tm-tr--selected" : undefined}
                aria-selected={selectedPath === token.path}
                onClick={() => onSelect(token.path)}
              >
                <td className="tm-td--name">
                  <span className="tm-td__group">{group}</span>
                  {leaf}{" "}
                  {overriddenPaths.has(token.path) && (
                    <Badge variant="caution" size="sm" emphasized={false}>
                      override
                    </Badge>
                  )}
                </td>
                <td>
                  <span className="tm-typecell">{token.$type ?? "—"}</span>
                </td>
                <td className="tm-td--value" onClick={(e) => e.stopPropagation()}>
                  <ValueEditor
                    setName={setName}
                    path={token.path}
                    type={token.$type}
                    value={token.$value}
                    paths={paths}
                    resolvedHex={colorHex(resolution)}
                  />
                </td>
                <td className="tm-td--resolved">
                  <div className="tm-resolved">
                    {colorHex(resolution) && (
                      <span className="tm-swatch" style={{ background: colorHex(resolution) }} aria-hidden="true" />
                    )}
                    {miss ? (
                      <Badge variant="error" size="sm" emphasized={false}>
                        {miss.kind}
                      </Badge>
                    ) : (
                      <span className="tm-resolved__val">{resolution ? formatResolved(resolution) : "—"}</span>
                    )}
                    {resolution && resolution.references.length > 0 && (
                      <span className="tm-chain" title={resolution.references.join(" → ")}>
                        →{resolution.references[0]}
                        {resolution.references.length > 1 ? ` +${resolution.references.length - 1}` : ""}
                      </span>
                    )}
                  </div>
                </td>
                <td className="tm-td--actions" onClick={(e) => e.stopPropagation()}>
                  <Button
                    intent="ghost"
                    size="sm"
                    icon="trash"
                    aria-label={`Delete ${token.path}`}
                    onClick={() => removeToken(setName, token.path)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  label,
  col,
  sort,
  onSortChange,
}: {
  label: string;
  col: SortKey;
  sort: SortState;
  onSortChange: (key: SortKey) => void;
}) {
  const active = sort.key === col;
  return (
    <th className="tm-th--sortable" onClick={() => onSortChange(col)} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      {label}
      {active && <span className="tm-th__sort">{sort.dir === "asc" ? "▲" : "▼"}</span>}
    </th>
  );
}
