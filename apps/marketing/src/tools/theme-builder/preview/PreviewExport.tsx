import { useMemo, useState } from "react";
import { useExport } from "../hooks/useExport";
import styles from "./PreviewExport.module.css";

export function PreviewExport() {
  const { buildCss } = useExport();
  const css = useMemo(() => buildCss(), [buildCss]);
  const [copied, setCopied] = useState(false);

  const lineCount = useMemo(() => css.split("\n").length, [css]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <span className={styles.filename}>theme.css</span>
        <span className={styles.meta}>{lineCount} lines</span>
        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className={styles.code}>
        <code>{css}</code>
      </pre>
    </div>
  );
}
