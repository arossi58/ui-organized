import { useState } from "react";
import { Tag, Button, Input, NumberField, Select, Divider } from "@ui-organized/react";
import { NEUTRAL_PRESETS, type UiOrganizedConfig } from "@ui-organized/pack-ui-organized";
import type { ReconcileReport } from "@ui-organized/token-io";
import { clearOverride, useProjectDocument } from "../yjs/store.js";
import { useSelection } from "../state/SelectionContext.js";
import {
  currentConfig,
  FOUNDATION_SET,
  generateFoundationProject,
  regenerateFoundationProject,
} from "../generators/foundation.js";

export function GeneratorsPanel() {
  const doc = useProjectDocument();
  const selection = useSelection();
  const [config, setConfig] = useState<UiOrganizedConfig>(() => currentConfig());
  const [report, setReport] = useState<ReconcileReport | null>(null);

  const exists = doc.sets.some((s) => s.name === FOUNDATION_SET);

  function handleGenerate() {
    generateFoundationProject(config);
    setReport(null);
    selection.setSetName(FOUNDATION_SET);
    selection.setView("list");
  }

  function handleRegenerate() {
    setReport(regenerateFoundationProject(config));
    selection.setSetName(FOUNDATION_SET);
    selection.setView("list");
  }

  return (
    <div className="tm-card">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="tm-card__title">Generators</span>
        <Tag variant="info" size="sm" emphasized={false}>
          UI Organized pack
        </Tag>
      </div>

      <div className="tm-stack" style={{ marginTop: 12 }}>
        <Input
          size="sm"
          label="Brand color"
          value={config.brand}
          onChange={(e) => setConfig({ ...config, brand: e.target.value })}
          spellCheck={false}
        />
        <Select
          size="sm"
          label="Neutral preset"
          options={NEUTRAL_PRESETS.map((n) => ({ value: n, label: n }))}
          value={config.neutral}
          onValueChange={(neutral) =>
            setConfig({ ...config, neutral: neutral as UiOrganizedConfig["neutral"] })
          }
        />
        <NumberField
          size="sm"
          label="Base font size (px)"
          value={config.typography.baseSize}
          min={8}
          onValueChange={(n) =>
            setConfig({ ...config, typography: { ...config.typography, baseSize: n ?? 16 } })
          }
        />
        <NumberField
          size="sm"
          label="Type scale ratio"
          value={config.typography.ratio}
          step={0.05}
          min={1}
          onValueChange={(n) =>
            setConfig({ ...config, typography: { ...config.typography, ratio: n ?? 1.25 } })
          }
        />
        <NumberField
          size="sm"
          label="Spacing base unit (px)"
          value={config.spacing.baseUnit}
          min={1}
          onValueChange={(n) => setConfig({ ...config, spacing: { baseUnit: n ?? 4 } })}
        />
        <NumberField
          size="sm"
          label="Radius base unit (px)"
          value={config.radius.baseUnit}
          min={1}
          onValueChange={(n) => setConfig({ ...config, radius: { baseUnit: n ?? 4 } })}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {exists ? (
          <Button intent="primary" size="sm" onClick={handleRegenerate}>
            Regenerate
          </Button>
        ) : (
          <Button intent="primary" size="sm" onClick={handleGenerate}>
            Generate foundation
          </Button>
        )}
        {exists && (
          <Button intent="tertiary" size="sm" onClick={handleGenerate}>
            Reset (discard overrides)
          </Button>
        )}
      </div>

      {report && <ReconcileReportView report={report} />}
    </div>
  );
}

function ReconcileReportView({ report }: { report: ReconcileReport }) {
  return (
    <>
      <Divider spacing="md" />
      <div className="tm-stack" style={{ gap: 6 }}>
        <span className="tm-card__title">Regeneration</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Tag variant="success" size="sm" emphasized={false}>
            {report.reapplied.length} reapplied
          </Tag>
          <Tag variant="info" size="sm" emphasized={false}>
            {report.redundant.length} absorbed
          </Tag>
          <Tag variant={report.stale.length ? "warning" : "info"} size="sm" emphasized={false}>
            {report.stale.length} stale
          </Tag>
        </div>

        {report.stale.length > 0 && (
          <div className="tm-stack" style={{ gap: 4, marginTop: 4 }}>
            <p className="tm-muted">These overrides need a decision (never auto-discarded):</p>
            {report.stale.map((entry) => (
              <div
                key={entry.path}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
              >
                <span className="tm-inspector__value" title={entry.reason}>
                  {entry.path}
                </span>
                <Button
                  intent="ghost"
                  size="sm"
                  icon="trash"
                  aria-label={`Discard override for ${entry.path}`}
                  onClick={() => clearOverride(entry.path)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
