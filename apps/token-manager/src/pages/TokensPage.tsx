import { useState } from "react";
import { Button, SearchInput, Toggle, ToggleGroup } from "@ui-organized/react";
import { flattenSet, type EffectiveToken, type ResolveResult } from "@ui-organized/resolver";
import { applyOverrides } from "@ui-organized/token-io";
import { useProjectDocument } from "../yjs/store.js";
import { useSelection, type CenterView } from "../state/SelectionContext.js";
import { useResolved } from "../state/useResolved.js";
import { SetsPanel } from "../components/SetsPanel.js";
import { TokenTable, type SortKey, type SortState } from "../components/TokenTable.js";
import { JsonView } from "../components/JsonView.js";
import { Inspector } from "../components/Inspector.js";
import { AddTokenDialog } from "../components/AddTokenDialog.js";
import { formatResolved } from "../lib/resolvedFormat.js";

function sortRows(rows: EffectiveToken[], sort: SortState, result: ResolveResult): EffectiveToken[] {
  const dir = sort.dir === "asc" ? 1 : -1;
  const key = (token: EffectiveToken): string => {
    if (sort.key === "type") return token.$type ?? "";
    if (sort.key === "resolved") {
      const r = result.tokens.get(token.path);
      return r ? formatResolved(r) : "";
    }
    return token.path;
  };
  return [...rows].sort((a, b) => {
    const av = key(a);
    const bv = key(b);
    return av < bv ? -dir : av > bv ? dir : 0;
  });
}

export function TokensPage() {
  const doc = useProjectDocument();
  const selection = useSelection();
  const { result, paths } = useResolved(selection.themeName, selection.mode);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "name", dir: "asc" });
  const [addOpen, setAddOpen] = useState(false);
  const [showSets, setShowSets] = useState(true);
  const [showInspector, setShowInspector] = useState(true);

  const set = doc.sets.find((s) => s.name === selection.setName);
  const overrides = doc.overrides ?? {};
  const overriddenPaths = new Set(Object.keys(overrides));

  let rows: EffectiveToken[] = [];
  if (set) {
    rows = flattenSet({ ...set, tokens: applyOverrides(set.tokens, overrides) });
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter((t) => t.path.toLowerCase().includes(q) || (t.$type ?? "").includes(q));
    rows = sortRows(rows, sort, result);
  }

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  return (
    <div className="tm-tokens">
      {showSets && <SetsPanel />}

      <section className="tm-pane tm-pane--main">
        <div className="tm-toolbar">
          <ToggleGroup
            value={[selection.view]}
            onValueChange={(v) => v[0] && selection.setView(v[0] as CenterView)}
          >
            <Toggle value="list">Table</Toggle>
            <Toggle value="json">JSON</Toggle>
          </ToggleGroup>

          {selection.view === "list" && (
            <div className="tm-toolbar__search">
              <SearchInput
                size="sm"
                placeholder="Filter tokens…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          <div className="tm-toolbar__spacer" />

          <Button intent="secondary" size="sm" icon="plus" disabled={!set} onClick={() => setAddOpen(true)}>
            Add token
          </Button>
          <Button intent="ghost" size="sm" aria-pressed={showSets} onClick={() => setShowSets((v) => !v)}>
            Sets
          </Button>
          <Button intent="ghost" size="sm" aria-pressed={showInspector} onClick={() => setShowInspector((v) => !v)}>
            Inspector
          </Button>
        </div>

        {selection.view === "list" ? (
          set ? (
            <TokenTable
              setName={set.name}
              rows={rows}
              paths={paths}
              result={result}
              overriddenPaths={overriddenPaths}
              selectedPath={selection.selectedPath}
              onSelect={selection.setSelectedPath}
              sort={sort}
              onSortChange={toggleSort}
            />
          ) : (
            <div className="tm-empty">Select a set to edit its tokens.</div>
          )
        ) : (
          <JsonView />
        )}
      </section>

      {showInspector && (
        <aside className="tm-pane tm-pane--inspector">
          <Inspector />
        </aside>
      )}

      <AddTokenDialog open={addOpen} onOpenChange={setAddOpen} setName={selection.setName} />
    </div>
  );
}
