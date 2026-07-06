import { Badge, Button, Divider } from "@ui-organized/react";
import { flattenSet } from "@ui-organized/resolver";
import { clearOverride, useProjectDocument } from "../yjs/store.js";
import { useSelection } from "../state/SelectionContext.js";
import { useResolved, selectSetsForMode } from "../state/useResolved.js";
import { getTokenAt } from "../lib/dtcgTree.js";
import { formatResolved } from "../lib/resolvedFormat.js";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="tm-inspector__field">
      <span className="tm-inspector__key">{label}</span>
      <span className="tm-inspector__value">{children}</span>
    </div>
  );
}

export function Inspector() {
  const doc = useProjectDocument();
  const selection = useSelection();
  const { result } = useResolved(selection.themeName, selection.mode);
  const path = selection.selectedPath;

  if (!path) {
    return (
      <div className="tm-section">
        <span className="tm-pane__heading">Inspector</span>
        <p className="tm-muted" style={{ marginTop: 8 }}>
          Select a token to inspect its resolved value, reference chain, and provenance.
        </p>
      </div>
    );
  }

  const set = doc.sets.find((s) => s.name === selection.setName);
  const token = set ? getTokenAt(set.tokens, path) : undefined;
  const resolution = result.tokens.get(path);
  const miss = result.misses.find((m) =>
    m.kind === "cycle" ? m.cycle.includes(path) : m.path === path,
  );

  const theme = doc.themes.find((t) => t.name === selection.themeName);
  const activeSets = theme ? selectSetsForMode(doc, theme, selection.mode) : [];
  let winningSet: string | undefined;
  for (const s of activeSets) if (flattenSet(s).some((t) => t.path === path)) winningSet = s.name;

  const extensionKeys = token?.$extensions ? Object.keys(token.$extensions) : [];
  const override = doc.overrides?.[path];

  return (
    <div className="tm-section">
      <span className="tm-pane__heading">Inspector</span>
      <div style={{ marginTop: 12 }}>
        <Field label="Path">{path}</Field>
        <Field label="Type">{token?.$type ?? resolution?.$type ?? "—"}</Field>
        <Field label="Authored value">
          {token ? (typeof token.$value === "string" ? token.$value : JSON.stringify(token.$value)) : "—"}
        </Field>

        <Divider spacing="md" />

        <Field label={`Resolved (${selection.mode || "—"})`}>
          {miss ? (
            <Badge variant="error" size="sm" emphasized={false}>
              {miss.kind}
            </Badge>
          ) : resolution ? (
            formatResolved(resolution)
          ) : (
            "—"
          )}
        </Field>
        {resolution && resolution.references.length > 0 && (
          <Field label="Reference chain">{resolution.references.join(" → ")}</Field>
        )}
        <Field label="Winning set">{winningSet ?? "— (not in an active set for this mode)"}</Field>

        <Divider spacing="md" />

        <Field label="Provenance">
          {extensionKeys.length > 0 ? `generated · $extensions: ${extensionKeys.join(", ")}` : "authored"}
        </Field>

        {override && (
          <Field label="Override">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span>{typeof override.$value === "string" ? override.$value : JSON.stringify(override)}</span>
              <Button intent="ghost" size="sm" onClick={() => clearOverride(path)}>
                Revert
              </Button>
            </div>
          </Field>
        )}
      </div>
    </div>
  );
}
