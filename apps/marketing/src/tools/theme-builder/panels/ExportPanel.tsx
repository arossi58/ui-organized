import { useState } from "react";
import { useBuilderStore } from "../state/themeState";
import { useExport } from "../hooks/useExport";
import styles from "./ExportPanel.module.css";

export function ExportPanel() {
  const { themeName, setThemeName } = useBuilderStore();
  const { exportBundle } = useExport();
  const [status, setStatus] = useState<"idle" | "busy" | "success" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);

  async function handleExport() {
    setStatus("busy");
    const result = await exportBundle();
    if (result.ok) {
      setStatus("success");
      setErrors([]);
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
      setErrors(result.errors ?? []);
    }
  }

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Export Theme</h3>
        <p className={styles.hint}>
          Download a complete theme bundle — one config in three shapes:
        </p>
        <ul className={styles.steps}>
          <li><code>theme.json</code> — DTCG design tokens (code + Figma).</li>
          <li><code>theme.css</code> — ready-to-use CSS custom properties (web).</li>
          <li><code>icons.ts</code> — <code>IconProvider</code> config (library, size, stroke).</li>
        </ul>
      </section>

      <section className={styles.section}>
        <label className={styles.fieldLabel} htmlFor="theme-name">Theme name</label>
        <input
          id="theme-name"
          type="text"
          className={styles.textInput}
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          placeholder="My Theme"
        />
      </section>

      <button
        className={styles.downloadBtn}
        onClick={handleExport}
        type="button"
        disabled={status === "busy"}
      >
        {status === "busy" ? "Packaging…" : "Download theme bundle (.zip)"}
      </button>

      {status === "success" && (
        <div className={styles.successMsg}>
          ✓ Theme exported successfully!
        </div>
      )}

      {status === "error" && (
        <div className={styles.errorBox}>
          <strong>Export failed:</strong>
          <ul className={styles.errorList}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>How it works</h3>
        <ol className={styles.steps}>
          <li>
            <strong>Web</strong> — drop <code>theme.css</code> into your project and import
            it once at your app entry, after the component styles:
            <pre className={styles.codeBlock}>{`import '@ui-organized/react/styles.css'
import './styles/theme.css'`}</pre>
            The theme defaults to dark on <code>:root</code>; toggle with
            <code>data-theme="light"</code> / <code>"dark"</code> on <code>&lt;html&gt;</code>.
          </li>
          <li>
            <strong>Icons</strong> — wrap your app with the exported config so every
            icon inherits the library, reference size and stroke scaling:
            <pre className={styles.codeBlock}>{`import { iconConfig } from './icons'

<IconProvider {...iconConfig}>
  <App />
</IconProvider>`}</pre>
          </li>
          <li>
            <strong>Figma</strong> — import <code>theme.json</code> with the Tokens Studio
            plugin (or the Variables API); map <code>color.light</code> / <code>color.dark</code>
            to the two modes of a color collection.
          </li>
        </ol>
      </section>
    </div>
  );
}
