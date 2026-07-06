import { useMemo, useState } from "react";
import { Badge, Button } from "@ui-organized/react";
import { exportCss, exportResolvedTokens } from "@ui-organized/export";
import { useProjectDocument } from "../yjs/store.js";
import { useSelection } from "../state/SelectionContext.js";

export function ExportPage() {
  const doc = useProjectDocument();
  const selection = useSelection();
  const [copied, setCopied] = useState(false);

  const css = useMemo(
    () => exportCss(doc, { themeName: selection.themeName || undefined }),
    [doc, selection.themeName],
  );
  const tokens = useMemo(
    () => exportResolvedTokens(doc, { themeName: selection.themeName || undefined, mode: selection.mode || undefined }),
    [doc, selection.themeName, selection.mode],
  );

  function copy() {
    void navigator.clipboard?.writeText(css);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "variables.css";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tm-page-scroll">
      <div className="tm-page-inner">
        <header className="tm-page-head">
          <div>
            <h1 className="tm-page-title">Export</h1>
            <p className="tm-page-sub">
              CSS custom properties resolved by the same engine the editor and Figma push use.
              Mode-constant tokens on <code>:root</code>; mode-varying under <code>[data-theme]</code>.
            </p>
          </div>
          <div className="tm-row-controls">
            <Badge variant="info" size="sm" emphasized={false}>
              {tokens.length} tokens
            </Badge>
            <Button intent="tertiary" size="sm" onClick={copy}>
              {copied ? "Copied" : "Copy CSS"}
            </Button>
            <Button intent="primary" size="sm" icon="download" onClick={download}>
              Download
            </Button>
          </div>
        </header>

        <div className="tm-card">
          <span className="tm-card__title">variables.css</span>
          <pre className="tm-code">{css}</pre>
        </div>

        <div className="tm-card">
          <span className="tm-card__title">Resolved tokens</span>
          <div className="tm-table-wrap">
            <table className="tm-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Type</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t.path}>
                    <td className="tm-td--name">{t.path}</td>
                    <td>
                      <span className="tm-typecell">{t.type}</span>
                    </td>
                    <td className="tm-td--resolved">{t.css ?? JSON.stringify(t.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
