import React, { useEffect, useState } from 'react';
import { Button, Icon } from '@ui-organized/react';
import { loadPresetDefinition } from '../constants/presets';
import SwatchStrip from './SwatchStrip';

// Shared row chrome — a full-width clickable card whose body is a swatch band.
const Row = ({ title, subtitle, colors, loading, onClick }) => (
  <button type="button" className="cp-overview-row" onClick={onClick} disabled={loading && colors.length === 0}>
    <div className="cp-overview-row__head">
      <span className="cp-overview-row__title">{title}</span>
      <span className="cp-overview-row__meta">
        {subtitle}
        <Icon name="arrow-right" size={18} />
      </span>
    </div>
    <SwatchStrip colors={colors} height={48} />
  </button>
);

// A preset whose hex data lives in a code-split module — fetched on mount so the
// overview can show its real swatches without bloating the tool's initial chunk.
const PresetRow = ({ preset, onOpen }) => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadPresetDefinition(preset.id)
      .then((def) => {
        if (!alive || !def || !Array.isArray(def.colors)) return;
        const mid = (c) => c.stops[def.mainStopIndex] ?? c.stops[Math.floor(c.stops.length / 2)];
        setColors(def.colors.map(mid));
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [preset.id]);

  return (
    <Row
      title={preset.label}
      subtitle={loading ? 'Loading…' : `${colors.length} colors · Preset`}
      colors={colors}
      loading={loading}
      onClick={() => onOpen(preset.id)}
    />
  );
};

/**
 * Landing view for the Color Palette tool's collections. Shows the user's
 * collections (starting with UI Organized) plus the built-in design-system
 * presets as full-width swatch bands. Clicking a row opens it in the editor.
 */
const CollectionsOverview = ({
  collections,
  activeCollectionId,
  liveBaseColors,
  availablePresets,
  onOpenCollection,
  onOpenPreset,
  onNewCollection,
}) => {
  const swatchesFor = (c) => {
    const baseColors = c.id === activeCollectionId ? liveBaseColors : (c.palette?.baseColors || []);
    return baseColors.map((x) => x.color);
  };

  return (
    <div className="cp-overview">
      <div className="cp-overview__inner">
        <header className="cp-overview__header">
          <div className="cp-overview__header-text">
            <h1 className="cp-overview__title">Collections</h1>
            <p className="cp-overview__subtitle">
              Pick a collection to open it in the editor — start from UI Organized, a
              design-system preset, or one of your own.
            </p>
          </div>
          <Button
            intent="primary"
            size="lg"
            icon="plus"
            onClick={onNewCollection}
            style={{ flexShrink: 0 }}
          >
            New Collection
          </Button>
        </header>

        <div className="cp-overview__rows">
          {collections.map((c) => {
            const colors = swatchesFor(c);
            return (
              <Row
                key={`col-${c.id}`}
                title={c.name}
                subtitle={`${colors.length} colors`}
                colors={colors}
                onClick={() => onOpenCollection(c.id)}
              />
            );
          })}

          {availablePresets.map((p) => (
            <PresetRow key={`preset-${p.id}`} preset={p} onOpen={onOpenPreset} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsOverview;
