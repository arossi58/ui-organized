import { useState } from "react";
import { useBuilderStore, type ExportDefaultMode } from "../state/themeState";
import { useExport } from "../hooks/useExport";
import styles from "./ExportPanel.module.css";

const DEFAULT_MODES: Array<{ value: ExportDefaultMode; label: string; hint: string }> = [
  { value: "light", label: "Light", hint: "`:root` is light." },
  { value: "dark", label: "Dark", hint: "`:root` is dark." },
  { value: "system", label: "System", hint: "`:root` follows the OS setting." },
];

export function ExportPanel() {
  const { themeName, setThemeName, exportDefaultMode, setExportDefaultMode, icons } =
    useBuilderStore();
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

      <section className={styles.section}>
        <span className={styles.fieldLabel} id="default-mode-label">Default mode</span>
        <div className={styles.modeRow} role="radiogroup" aria-labelledby="default-mode-label">
          {DEFAULT_MODES.map((mode) => (
            <label key={mode.value} className={styles.modeOption}>
              <input
                type="radio"
                name="export-default-mode"
                value={mode.value}
                checked={exportDefaultMode === mode.value}
                onChange={() => setExportDefaultMode(mode.value)}
              />
              {mode.label}
            </label>
          ))}
        </div>
        <p className={styles.hint}>
          What a page renders as before any <code>data-theme</code> is set. Both modes
          always ship — this only decides the one on bare <code>:root</code>, so a light
          app doesn’t paint a dark first frame.
        </p>
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
            <strong>Apply it</strong> — point the CLI at the zip. It files everything where
            your project keeps things, and checks the theme before it writes:
            <pre className={styles.codeBlock}>{`npx @ui-organized/cli theme my-theme.zip`}</pre>
            No install step. It verifies the theme defines every token the components read,
            that the typefaces it names can load, and that nothing in your own CSS overrides
            it — then prints the import lines. Add <code>--dry-run</code> to look first.
          </li>
          <li>
            <strong>Or by hand</strong> — drop <code>theme.css</code> in and import it at your
            app entry, <em>after</em> the component styles:
            <pre className={styles.codeBlock}>{`import '@ui-organized/react/styles'
import './styles/theme.css'`}</pre>
            Order matters: both declare on <code>:root</code>, and that tie is decided by
            source order. The file is self-contained — it carries the layout constants
            (<code>--dimension-*</code>, <code>--z-index-*</code>) too, so no baseline
            stylesheet is required. Toggle modes with{" "}
            <code>data-theme="light"</code> / <code>"dark"</code> on <code>&lt;html&gt;</code>.
          </li>
          <li>
            <strong>Icons</strong> — install the library you picked, register it, and wrap
            your app with the exported config:
            <pre className={styles.codeBlock}>{`import '@ui-organized/react/icons/${icons.library}'
import { iconConfig } from './icons'

<IconProvider {...iconConfig}>
  <App />
</IconProvider>`}</pre>
            The subpath import is required — <code>@ui-organized/react</code> imports no icon
            package itself, which is what keeps the ones you didn’t choose out of your bundle.
          </li>
          <li>
            <strong>Fonts</strong> — <code>theme.css</code> names its typefaces but cannot
            load them. <code>fonts.ts</code> carries the <code>&lt;link&gt;</code> tags for
            your families; add them to your document head, or let the CLI print them.
          </li>
          <li>
            <strong>Figma</strong> — import <code>theme.json</code> with the
            <strong> UI Organized - Theme Import</strong> plugin. It builds Primitives,
            Semantic (Light/Dark, aliased), Scale and Typography collections. Edit the
            variables in Figma, export a fresh <code>theme.json</code> from the plugin, and
            load it back with <em>Import Theme</em> on the <strong>Color</strong> tab.
          </li>
        </ol>
      </section>
    </div>
  );
}
