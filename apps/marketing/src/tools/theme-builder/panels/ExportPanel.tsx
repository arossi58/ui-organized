import { useRef, useState, type ChangeEvent } from "react";
import { useBuilderStore } from "../state/themeState";
import { useExport } from "../hooks/useExport";
import styles from "./ExportPanel.module.css";

export function ExportPanel() {
  const { themeName, setThemeName, loadFromThemeJson } = useBuilderStore();
  const { exportBundle } = useExport();
  const [status, setStatus] = useState<"idle" | "busy" | "success" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importError, setImportError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const theme = JSON.parse(await file.text());
      loadFromThemeJson(theme);
      setImportStatus("success");
      setImportError("");
      setTimeout(() => setImportStatus("idle"), 3000);
    } catch (err) {
      setImportStatus("error");
      setImportError(err instanceof Error ? err.message : String(err));
    } finally {
      e.target.value = ""; // allow re-selecting the same file
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
        <h3 className={styles.sectionTitle}>Import Theme</h3>
        <p className={styles.hint}>
          Load a <code>theme.json</code> back into the builder — a previous export, or one
          round-tripped from Figma via the <strong>UI Organized - Theme Import</strong> plugin.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleImport}
        />
        <button className={styles.downloadBtn} type="button" onClick={() => fileRef.current?.click()}>
          Load theme.json…
        </button>
        {importStatus === "success" && (
          <div className={styles.successMsg}>✓ Theme loaded into the builder.</div>
        )}
        {importStatus === "error" && (
          <div className={styles.errorBox}>
            <strong>Couldn't load:</strong> {importError}
          </div>
        )}
      </section>

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
            <strong>Figma</strong> — import <code>theme.json</code> with the
            <strong> UI Organized - Theme Import</strong> plugin. It builds Primitives,
            Semantic (Light/Dark, aliased), Scale and Typography collections. Edit the
            variables in Figma, export a fresh <code>theme.json</code> from the plugin, and
            load it back here with <em>Import Theme</em> above.
          </li>
        </ol>
      </section>
    </div>
  );
}
