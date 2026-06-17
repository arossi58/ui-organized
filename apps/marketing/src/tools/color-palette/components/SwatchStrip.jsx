import React from 'react';

/**
 * A horizontal strip of color swatches that fills the width of its container.
 * Each color is an equal-flex segment, so a collection's identity reads as one
 * continuous band. Used by the collections overview and the left rail.
 */
const SwatchStrip = ({ colors, height = 44, radius = 'var(--border-radius-02)' }) => {
  if (!colors || colors.length === 0) {
    return (
      <div
        style={{
          height,
          borderRadius: radius,
          border: '1px solid var(--color-border-primary)',
          background: 'var(--color-surface-secondary)',
        }}
      />
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        height,
        borderRadius: radius,
        overflow: 'hidden',
        border: '1px solid var(--color-border-primary)',
      }}
    >
      {colors.map((color, i) => (
        <div key={i} style={{ flex: 1, minWidth: 0, background: color }} />
      ))}
    </div>
  );
};

export default SwatchStrip;
