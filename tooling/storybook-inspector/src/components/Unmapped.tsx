/**
 * Unmapped state (INSPECTOR.md §7): the story has no verified manifest mapping. We
 * never fabricate a panel from Storybook's inferred argTypes — instead we help the
 * user link it, by searching the SAME manifest (shared `searchEntries`) and
 * generating the exact `parameters` snippet to paste into the story file. We can't
 * write the file from a running Storybook, so we produce copy-paste text (§7).
 */
import { useMemo, useState } from "react";
import { searchEntries, type ComponentManifestEntry } from "@ui-organized/code-connect/browser";

function snippetFor(entry: ComponentManifestEntry): string {
  const keyLine = entry.figmaComponentKey
    ? `componentKey: "${entry.figmaComponentKey}"`
    : `/* ${entry.codeName} isn't Figma-mapped yet — map it in the Code Connect plugin first */`;
  return `parameters: {\n  figmaCodeConnect: { ${keyLine} },\n},`;
}

export function Unmapped({
  suggestedQuery,
  entries,
}: {
  suggestedQuery: string;
  entries: ComponentManifestEntry[];
}) {
  const [query, setQuery] = useState(suggestedQuery);
  const [picked, setPicked] = useState<ComponentManifestEntry | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const found = searchEntries(entries, { query });
    const byPath = new Map(entries.map((e) => [e.codePath, e]));
    return found.map((r) => byPath.get(r.codePath)).filter(Boolean) as ComponentManifestEntry[];
  }, [query, entries]);

  return (
    <div className="fcp-root">
      <div className="fcp-badge" data-tone="none">
        ○ No verified component mapping for this story.
      </div>
      <div style={{ padding: "0 12px" }}>
        <p className="fcp-empty" style={{ padding: "0 0 8px" }}>
          Link it by adding a <code>figmaCodeConnect</code> parameter. Search a component:
        </p>
        <input
          className="fcp-input"
          placeholder="Search components…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ marginTop: 6 }}>
          {results.slice(0, 6).map((e) => (
            <button
              key={e.codeName}
              type="button"
              className="fcp-row"
              style={{ width: "100%", textAlign: "left", cursor: "pointer", background: "none", border: "none" }}
              onClick={() => setPicked(e)}
            >
              <span className="fcp-row-label">
                <span>{e.codeName}</span>
              </span>
              <span className="fcp-row-control" style={{ color: "#8a8a8a" }}>
                {e.status}
              </span>
            </button>
          ))}
        </div>
      </div>
      {picked && (
        <>
          <p className="fcp-empty" style={{ padding: "8px 12px 0" }}>
            Paste into <code>{picked.codeName}.stories</code> default export:
          </p>
          <pre className="fcp-code">{snippetFor(picked)}</pre>
        </>
      )}
    </div>
  );
}
