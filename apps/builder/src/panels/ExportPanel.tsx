import { useState } from "react";
import { useBuilderStore } from "../state/themeState";
import { useExport } from "../hooks/useExport";
import styles from "./ExportPanel.module.css";

export function ExportPanel() {
  const { themeName, setThemeName } = useBuilderStore();
  const { exportConfig } = useExport();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);

  function handleExport() {
    const result = exportConfig();
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
          Download a ready-to-use <code>theme.css</code> — CSS custom properties for
          light and dark modes, resolved from your chosen brand and neutral families.
          Drop it into your project and import it; no build step required.
        </p>
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
      >
        Download theme.css
      </button>

      {status === "success" && (
        <div className={styles.successMsg}>
          ✓ Theme exported successfully!
        </div>
      )}

      {status === "error" && (
        <div className={styles.errorBox}>
          <strong>Validation failed:</strong>
          <ul className={styles.errorList}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>How it works</h3>
        <ol className={styles.steps}>
          <li>Click <strong>Download theme.css</strong> to export your theme.</li>
          <li>
            Drop <code>theme.css</code> into your project (e.g. <code>src/styles/</code>).
          </li>
          <li>
            Import it once at your app entry, after the component styles:
            <pre className={styles.codeBlock}>{`import '@ui-organized/react/styles.css'
import './styles/theme.css'`}</pre>
          </li>
          <li>
            The theme defaults to dark on <code>:root</code>. Toggle modes by setting
            <code>data-theme="light"</code> or <code>data-theme="dark"</code> on
            <code>&lt;html&gt;</code>.
          </li>
        </ol>
      </section>
    </div>
  );
}
