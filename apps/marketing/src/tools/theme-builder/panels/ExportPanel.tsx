import { useState } from "react";
import { Link } from "react-router-dom";
import { Input, SegmentedControl } from "@ui-organized/react";
import { useBuilderStore, type ExportDefaultMode } from "../state/themeState";
import { useExport } from "../hooks/useExport";
import { SavedThemes } from "./SavedThemes";
import styles from "./ExportPanel.module.css";

const DEFAULT_MODES: Array<{ value: ExportDefaultMode; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ExportPanel() {
  const { themeName, setThemeName, exportDefaultMode, setExportDefaultMode } =
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
        <h3 className={styles.sectionTitle}>Export theme</h3>
        <p className={styles.hint}>
          Download a theme bundle: one config in three shapes.
        </p>
        <ul className={styles.steps}>
          <li><code>theme.json</code>: DTCG design tokens (code + Figma).</li>
          <li><code>theme.css</code>: ready-to-use CSS custom properties (web).</li>
          <li><code>icons.ts</code>: <code>IconProvider</code> config (library, size, stroke).</li>
        </ul>
      </section>

      <section className={styles.section}>
        <Input
          size="sm"
          label="Theme name"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          placeholder="My Theme"
        />
      </section>

      <section className={styles.section}>
        {/* SegmentedControl takes no visible label, so this one names it for
            sighted readers and `aria-label` does the same for assistive tech. */}
        <span className="field__label" aria-hidden="true">
          Default mode
        </span>
        <SegmentedControl
          size="sm"
          aria-label="Default mode"
          items={DEFAULT_MODES}
          value={exportDefaultMode}
          onValueChange={(v) => setExportDefaultMode(v as ExportDefaultMode)}
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
          ✓ Theme exported.
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

      <SavedThemes />

      {/* The setup steps live in the docs, once, rather than drifting here. */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Use your theme</h3>
        <ul className={styles.steps}>
          <li>
            <Link to="/docs/get-started#add-your-theme">Apply the theme</Link> with the CLI or
            by hand.
          </li>
          <li>
            <Link to="/docs/get-started#set-up-icons">Set up icons</Link> for the library you
            picked.
          </li>
          <li>
            <Link to="/docs/get-started#load-the-fonts">Load the fonts</Link> your theme names.
          </li>
          <li>
            <Link to="/docs/theming#design-code">Bring it into Figma</Link> and back.
          </li>
        </ul>
      </section>
    </div>
  );
}
