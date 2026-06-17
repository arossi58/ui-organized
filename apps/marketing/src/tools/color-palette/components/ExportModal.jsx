import React, { useState, useEffect } from 'react';
import { generateExport } from '../utils/exportFormatters';
import { Button } from '@ui-organized/react';
import { X } from './Icons';

const CODE_FORMATS = [
  { value: 'css', title: 'CSS Variables', desc: 'Use directly in web projects with :root variables' },
  { value: 'tailwind', title: 'Tailwind Config', desc: 'Add to tailwind.config.js theme.extend.colors' },
  { value: 'figma', title: 'Figma Tokens (JSON)', desc: 'Import with Tokens Studio plugin for Figma' },
  { value: 'js', title: 'JavaScript/TypeScript', desc: 'Export as JS object for React, Vue, etc.' },
  { value: 'scss', title: 'SCSS Variables', desc: 'Use in Sass/SCSS stylesheets' },
  { value: 'json', title: 'JSON', desc: 'Generic JSON format for any use case' },
];

const EXTENSIONS = {
  css: 'css',
  tailwind: 'js',
  figma: 'json',
  js: 'js',
  scss: 'scss',
  json: 'json',
};

const downloadText = (text, filename) => {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const ExportModal = ({
  showExportModal,
  setShowExportModal,
  exportFormat,
  setExportFormat,
  baseColors,
  palettes,
  numStops,
  namingSystem,
  customIncrement,
}) => {
  const [selectedColorIds, setSelectedColorIds] = useState(() => baseColors.map(c => c.id));

  useEffect(() => {
    setSelectedColorIds(baseColors.map(c => c.id));
  }, [baseColors]);

  const toggleColor = (id) => {
    setSelectedColorIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const allSelected = selectedColorIds.length === baseColors.length;
  const filteredColors = baseColors.filter(c => selectedColorIds.includes(c.id));

  // --- Code & Tokens ---
  const handleExport = () => {
    const exportData = generateExport(exportFormat, filteredColors, palettes, numStops, namingSystem, customIncrement);
    navigator.clipboard.writeText(exportData);
    setShowExportModal(false);
  };

  const handleDownload = () => {
    const exportData = generateExport(exportFormat, filteredColors, palettes, numStops, namingSystem, customIncrement);
    downloadText(exportData, `palette.${EXTENSIONS[exportFormat]}`);
    setShowExportModal(false);
  };

  if (!showExportModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflow: 'auto',
        zIndex: 'var(--z-index-dialog)',
        background: 'var(--color-surface-curtain)',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface-primary)',
          borderRadius: 12,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)',
          maxWidth: '42rem',
          width: '100%',
          marginTop: 'auto',
          marginBottom: 'auto',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 2rem)',
        }}
      >
        <div style={{ padding: 24, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--color-text-text-primary)' }}>Export Palette</h2>
            <button
              onClick={() => setShowExportModal(false)}
              style={{
                padding: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-text-primary)',
                borderRadius: 8,
              }}
            >
              <X style={{ width: 20, height: 20 }} />
            </button>
          </div>
          <p style={{ margin: 0, marginTop: 8, fontSize: 14, color: 'var(--color-text-text-tertiary)' }}>
            Export your generated palette as code or design tokens
          </p>
        </div>

        <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
          {/* Color selection */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Include Colors</span>
              <button
                onClick={() => setSelectedColorIds(allSelected ? [] : baseColors.map(c => c.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-interactive-primary-default)', padding: 0 }}
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {baseColors.map(c => {
                const isSelected = selectedColorIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleColor(c.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      border: `1px solid ${isSelected ? 'var(--color-interactive-primary-default)' : 'var(--color-border-primary)'}`,
                      background: isSelected ? 'var(--color-interactive-ui-selected)' : 'transparent',
                      color: isSelected ? 'var(--color-text-text-primary)' : 'var(--color-text-text-placeholder)',
                    }}
                  >
                    <div
                      style={{ width: 12, height: 12, borderRadius: 2, flexShrink: 0, backgroundColor: c.color, opacity: isSelected ? 1 : 0.4 }}
                    />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {CODE_FORMATS.map(fmt => (
              <label
                key={fmt.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  border: '2px solid var(--color-border-primary)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value={fmt.value}
                  checked={exportFormat === fmt.value}
                  onChange={(e) => setExportFormat(e.target.value)}
                  style={{ width: 16, height: 16, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-text-primary)' }}>{fmt.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-text-tertiary)' }}>{fmt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div style={{ background: 'var(--color-surface-secondary)', borderRadius: 8, padding: 16 }}>
            <pre style={{ margin: 0, fontSize: 12, color: 'var(--color-text-text-primary)', fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{generateExport(exportFormat, filteredColors, palettes, numStops, namingSystem, customIncrement)}</pre>
          </div>
        </div>

        <div style={{ padding: 24, display: 'flex', gap: 12, flexShrink: 0 }}>
          <Button intent="primary" icon="copy" onClick={handleExport} disabled={filteredColors.length === 0} style={{ flex: 1 }}>Copy to Clipboard</Button>
          <Button intent="secondary" icon="download" onClick={handleDownload} disabled={filteredColors.length === 0} style={{ flex: 1 }}>Download File</Button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
