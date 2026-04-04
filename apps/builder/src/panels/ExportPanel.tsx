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
          Download a <code>theme.json</code> compatible with the design system's
          Style Dictionary pipeline. Drop it into your project and run the transform script.
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
        Download theme.json
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
          <li>Click <strong>Download theme.json</strong> to export your configuration.</li>
          <li>
            Drop <code>theme.json</code> and the two Figma export files into the root of your repo
            (alongside <code>package.json</code>).
          </li>
          <li>
            Run: <code>pnpm --filter @ds/tokens transform</code> to generate DTCG token files.
          </li>
          <li>
            Run: <code>pnpm --filter @ds/tokens build</code> to compile CSS custom properties.
          </li>
          <li>
            In your Vite project, add the plugin:
            <pre className={styles.codeBlock}>{`import { themePlugin } from '@ds/react-vite'

export default {
  plugins: [
    themePlugin({ config: './theme.json' })
  ]
}`}</pre>
          </li>
        </ol>
      </section>
    </div>
  );
}
