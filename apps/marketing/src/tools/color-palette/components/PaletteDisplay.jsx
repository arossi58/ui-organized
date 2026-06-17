import React, { useState } from 'react';
import { getStopNames, formatColorValue } from '../utils/naming';
import { getContrast, getBestTextColor } from '../utils/contrast';
import { Copy, Check } from './Icons';

const copyToClipboard = (text, index, setCopiedIndex) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }).catch(err => {
        console.error('Clipboard write failed:', err);
        fallbackCopy(text, index, setCopiedIndex);
      });
    } else {
      fallbackCopy(text, index, setCopiedIndex);
    }
  } catch (err) {
    console.error('Copy error:', err);
    fallbackCopy(text, index, setCopiedIndex);
  }
};

const fallbackCopy = (text, index, setCopiedIndex) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  document.body.removeChild(textarea);
};

// Pass/fail badge colors (formerly Tailwind bg-green-600 / bg-yellow-600 / bg-red-600).
const BADGE_PASS = '#16a34a';
const BADGE_WARN = '#ca8a04';
const BADGE_FAIL = '#dc2626';

const contrastBadgeStyle = (bg) => ({
  padding: '2px 6px',
  background: bg,
  color: 'var(--color-text-text-primary)',
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 700,
});

const PaletteDisplay = ({
  selectedColor,
  selectedColorId,
  palette,
  numStops,
  namingSystem,
  customIncrement,
  displayFormat,
  contrastMethod,
  copiedIndex,
  setCopiedIndex,
}) => {
  const [hoveredSwatch, setHoveredSwatch] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [hoverMenuPosition, setHoverMenuPosition] = useState(null);

  // Renders the AA / pass-fail badge for a contrast result.
  const renderContrastBadge = (contrast) => {
    if (contrastMethod === 'wcag') {
      if (contrast.passes.aa) return <span style={contrastBadgeStyle(BADGE_PASS)}>AA</span>;
      if (contrast.passes.aaLarge) return <span style={contrastBadgeStyle(BADGE_WARN)}>AA+</span>;
      return <span style={contrastBadgeStyle(BADGE_FAIL)}>✗</span>;
    }
    if (contrast.passes.body) return <span style={contrastBadgeStyle(BADGE_PASS)}>✓</span>;
    if (contrast.passes.large) return <span style={contrastBadgeStyle(BADGE_WARN)}>L</span>;
    return <span style={contrastBadgeStyle(BADGE_FAIL)}>✗</span>;
  };

  return (
    <div style={{ width: 200, flexShrink: 0, background: 'var(--color-surface-secondary)', display: 'flex', flexDirection: 'column' }}>
      {selectedColor && palette && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-surface-primary)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)' }}>
          {palette.map((color, index) => {
            const stopNames = getStopNames(numStops, namingSystem, customIncrement);
            const colorValue = formatColorValue(color.hex, displayFormat);
            const swatchKey = `${selectedColorId}-${index}`;
            const isHovered = hoveredSwatch === swatchKey;

            // Calculate contrast for black and white text
            const blackContrast = getContrast('#000000', color.hex, contrastMethod);
            const whiteContrast = getContrast('#ffffff', color.hex, contrastMethod);
            const textColor = getBestTextColor(color.hex);

            return (
              <div
                key={index}
                style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', backgroundColor: color.hex }}
                onMouseEnter={(e) => {
                  if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                  }
                  // Capture the rect before setTimeout (React events are recycled)
                  const rect = e.currentTarget.getBoundingClientRect();
                  const timeout = setTimeout(() => {
                    // Calculate position for hover menu
                    const menuHeight = 160; // max menu height
                    const menuWidth = 200; // menu width
                    const padding = 12; // right padding

                    // Calculate vertical position (centered on swatch)
                    let top = rect.top + (rect.height / 2) - (menuHeight / 2);

                    // Constrain to viewport
                    const maxTop = window.innerHeight - menuHeight - 10;
                    const minTop = 10;
                    top = Math.max(minTop, Math.min(top, maxTop));

                    // Calculate horizontal position (to the left of swatches)
                    const right = window.innerWidth - rect.left + padding;

                    setHoverMenuPosition({ top, right });
                    setHoveredSwatch(swatchKey);
                  }, 300);
                  setHoverTimeout(timeout);
                }}
                onMouseLeave={() => {
                  if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    setHoverTimeout(null);
                  }
                  setHoveredSwatch(null);
                  setHoverMenuPosition(null);
                }}
              >
                {/* Compact Swatch Content - Stop Number and Copy */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{ fontSize: 14, fontWeight: 700, color: textColor }}
                    >
                      {stopNames[index]}
                    </span>
                    {color.isBase && (
                      <span
                        style={{
                          fontSize: 12,
                          background: 'var(--color-interactive-primary-default)',
                          color: 'var(--color-interactive-contents)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontWeight: 500,
                        }}
                      >
                        BASE
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => copyToClipboard(colorValue, `color-${selectedColorId}-${index}`, setCopiedIndex)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      transition: 'all 150ms ease',
                      fontSize: 12,
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: textColor === '#000000' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
                      color: textColor,
                    }}
                  >
                    {copiedIndex === `color-${selectedColorId}-${index}` ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check style={{ width: 12, height: 12 }} />
                        Copied
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Copy style={{ width: 12, height: 12 }} />
                        Copy
                      </span>
                    )}
                  </button>
                </div>

                {/* Hover Menu - Appears to the Left */}
                {isHovered && hoverMenuPosition && (
                  <div
                    style={{
                      position: 'fixed',
                      pointerEvents: 'none',
                      zIndex: 50,
                      top: `${hoverMenuPosition.top}px`,
                      right: `${hoverMenuPosition.right}px`,
                    }}
                  >
                    <div style={{ paddingRight: 12 }}>
                      <div style={{
                        background: 'var(--color-surface-primary)',
                        borderRadius: 8,
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)',
                        padding: 12,
                        border: '1px solid var(--color-border-primary)',
                        width: 200,
                        maxHeight: 160,
                        overflowY: 'auto',
                      }}>
                        {/* Color Name */}
                        <div style={{ fontWeight: 700, color: 'var(--color-text-text-primary)', marginBottom: 8 }}>
                          {selectedColor.name}-{stopNames[index]}
                        </div>

                        {/* Color Value */}
                        <code style={{
                          fontSize: 12,
                          fontFamily: 'monospace',
                          color: 'var(--color-text-text-primary)',
                          display: 'block',
                          marginBottom: 12,
                          background: 'var(--color-surface-secondary)',
                          padding: '4px 8px',
                          borderRadius: 4,
                        }}>
                          {colorValue}
                        </code>

                        {/* Contrast Information */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-text-primary)' }}>vs Black:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 500, color: 'var(--color-text-text-primary)' }}>{blackContrast.label}</span>
                              {renderContrastBadge(blackContrast)}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-text-primary)' }}>vs White:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 500, color: 'var(--color-text-text-primary)' }}>{whiteContrast.label}</span>
                              {renderContrastBadge(whiteContrast)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaletteDisplay;
