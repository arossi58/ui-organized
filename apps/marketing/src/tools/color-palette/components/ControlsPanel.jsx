import React, { useState } from 'react';
import { Button, Input, Range, Select, Switch, Icon } from '@ui-organized/react';
import { DEFAULT_PALETTE } from '../constants/defaultPalette';
import { hexToRgb, rgbToHsl, rgbToOklch, hslToRgb, oklchToRgb } from '../utils/colorConversions';
import { getColorNameFromHSL } from '../utils/naming';
import './color-palette.css';

// --- helpers -------------------------------------------------------------
const clamp255 = (x) => Math.max(0, Math.min(255, Math.round(x)));
const toHex2 = (x) => {
  const h = clamp255(x).toString(16);
  return h.length === 1 ? '0' + h : h;
};
const rgbToHexStr = (r, g, b) => `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;

// Format the active hex color into the display string for a given format.
const formatColor = (color, fmt) => {
  const rgb = hexToRgb(color);
  if (fmt === 'rgb') {
    return `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)})`;
  }
  if (fmt === 'hsl') {
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;
  }
  if (fmt === 'oklch') {
    const o = rgbToOklch(rgb.r, rgb.g, rgb.b);
    return `oklch(${Math.round(o.l * 100)}% ${o.c.toFixed(3)} ${Math.round(o.h)})`;
  }
  return color;
};

// Parse a display string back to a hex color, or null if invalid/incomplete.
const parseColor = (text, fmt) => {
  const v = text.trim();
  if (fmt === 'rgb') {
    const m = v.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) {
      const [, r, g, b] = m.map(Number);
      if (r <= 255 && g <= 255 && b <= 255) return rgbToHexStr(r, g, b);
    }
    return null;
  }
  if (fmt === 'hsl') {
    const m = v.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
    if (m) {
      const [, h, s, l] = m.map(Number);
      if (h <= 360 && s <= 100 && l <= 100) {
        const nr = hslToRgb(h, s / 100, l / 100);
        return rgbToHexStr(nr.r * 255, nr.g * 255, nr.b * 255);
      }
    }
    return null;
  }
  if (fmt === 'oklch') {
    const m = v.match(/oklch\((\d+)%?\s+([\d.]+)\s+(\d+)\)/);
    if (m) {
      const lVal = Number(m[1]) / 100;
      const cVal = Number(m[2]);
      const hVal = Number(m[3]);
      if (lVal >= 0 && lVal <= 1 && cVal >= 0 && hVal >= 0 && hVal <= 360) {
        const nr = oklchToRgb(lVal, cVal, hVal);
        return rgbToHexStr(nr.r * 255, nr.g * 255, nr.b * 255);
      }
    }
    return null;
  }
  // hex
  let s = v;
  if (s && !s.startsWith('#')) s = '#' + s;
  if (/^#([0-9A-Fa-f]{3})$/.test(s)) s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
  return /^#[0-9A-Fa-f]{6}$/.test(s) ? s : null;
};

const VALUE_PLACEHOLDERS = {
  hex: '#3b82f6',
  rgb: 'rgb(59, 130, 246)',
  hsl: 'hsl(217, 91%, 60%)',
  oklch: 'oklch(65% 0.15 250)',
};

// Color Value field. While unfocused it mirrors the live color, so it updates
// as the channel sliders move; while focused it holds a local buffer so the
// user can type freely, and any valid entry drives the color (and the sliders).
const ColorValueInput = ({ color, fmt, onCommit }) => {
  const formatted = formatColor(color, fmt);
  const [text, setText] = useState(formatted);
  const [focused, setFocused] = useState(false);
  return (
    <Input
      size="lg"
      label="Color Value"
      value={focused ? text : formatted}
      placeholder={VALUE_PLACEHOLDERS[fmt]}
      onFocus={() => { setText(formatted); setFocused(true); }}
      onChange={(e) => {
        setText(e.target.value);
        const hex = parseColor(e.target.value, fmt);
        if (hex) onCommit(hex);
      }}
      onBlur={() => setFocused(false)}
    />
  );
};

// Options for the design-system Selects.
const NAMING_OPTIONS = [
  { value: 'tailwind', label: 'Tailwind' },
  { value: 'material', label: 'Material' },
  { value: 'radix', label: 'Radix' },
  { value: 'custom', label: 'Custom' },
];
const COUNT_BY_OPTIONS = [
  { value: '1', label: '1s' },
  { value: '10', label: '10s' },
  { value: '100', label: '100s' },
];
const DISPLAY_FORMAT_OPTIONS = [
  { value: 'hex', label: 'HEX' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsl', label: 'HSL' },
  { value: 'oklch', label: 'OKLCH' },
];
const COLOR_MODE_OPTIONS = [
  { value: 'oklch', label: 'OKLCH' },
  { value: 'hsl', label: 'HSL' },
];
const CONTRAST_OPTIONS = [
  { value: 'wcag', label: 'WCAG 2.x' },
  { value: 'apca', label: 'APCA' },
];
const EASING_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In-Out' },
  { value: 'ease-in-cubic', label: 'Ease In (Cubic)' },
  { value: 'ease-out-cubic', label: 'Ease Out (Cubic)' },
  { value: 'ease-in-out-cubic', label: 'Ease In-Out (Cubic)' },
];

const SECTION_HEADING = {
  margin: 0,
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 20,
  lineHeight: 1.2,
  color: 'var(--color-text-primary)',
};

// Square icon button used in the pane header (hamburger + settings gear).
const IconButton = ({ icon, onClick, title, className }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className={className}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
      borderRadius: 'var(--radius-interactive)',
      background: 'var(--color-interactive-secondary-default)',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--color-text-primary)',
      flexShrink: 0,
    }}
  >
    <Icon name={icon} size={24} />
  </button>
);

const ControlsPanel = ({
  selectedColor,
  selectedColorId,
  updateBaseColor,
  updateBaseColorName,
  resetColorStops,
  displayFormat,
  setDisplayFormat,
  numStops,
  setNumStops,
  mainStopIndex,
  setMainStopIndex,
  contrastMethod,
  setContrastMethod,
  preservePerceptualBrightness,
  setPreservePerceptualBrightness,
  namingSystem,
  setNamingSystem,
  customIncrement,
  setCustomIncrement,
  colorMode,
  setColorMode,
  easingType,
  setEasingType,
  lightest,
  setLightest,
  darkest,
  setDarkest,
  sidebarOpen,
  setSidebarOpen,
  getStopNames,
  formatColorValue,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  // Element the Select popups portal into, so they inherit this pane's light theme.
  const [paneEl, setPaneEl] = useState(null);

  const canResetStops =
    selectedColor && !selectedColor.customStops && !!DEFAULT_PALETTE.find((c) => c.id === selectedColor.id);

  // --- Color channel sliders (format-driven) -----------------------------
  const renderColorSliders = () => {
    if (!selectedColor) return null;
    const rgb = hexToRgb(selectedColor.color);

    if (displayFormat === 'hex' || displayFormat === 'rgb') {
      const r = Math.round(rgb.r * 255);
      const g = Math.round(rgb.g * 255);
      const b = Math.round(rgb.b * 255);
      // Order follows the Figma design: Red, Blue, Green.
      return (
        <>
          <Range
            label="Red"
            min={0}
            max={255}
            step={1}
            value={r}
            onValueChange={(v) => updateBaseColor(selectedColorId, rgbToHexStr(v, g, b))}
            formatValue={(v) => String(Math.round(v))}
          />
          <Range
            label="Blue"
            min={0}
            max={255}
            step={1}
            value={b}
            onValueChange={(v) => updateBaseColor(selectedColorId, rgbToHexStr(r, g, v))}
            formatValue={(v) => String(Math.round(v))}
          />
          <Range
            label="Green"
            min={0}
            max={255}
            step={1}
            value={g}
            onValueChange={(v) => updateBaseColor(selectedColorId, rgbToHexStr(r, v, b))}
            formatValue={(v) => String(Math.round(v))}
          />
        </>
      );
    }

    if (displayFormat === 'hsl') {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const h = Math.round(hsl.h);
      const s = Math.round(hsl.s * 100);
      const l = Math.round(hsl.l * 100);
      return (
        <>
          <Range
            label="Hue"
            min={0}
            max={360}
            step={1}
            value={h}
            onValueChange={(v) => {
              const nr = hslToRgb(v, hsl.s, hsl.l);
              updateBaseColor(selectedColorId, rgbToHexStr(nr.r * 255, nr.g * 255, nr.b * 255));
            }}
            formatValue={(v) => `${Math.round(v)}°`}
          />
          <Range
            label="Saturation"
            min={0}
            max={100}
            step={1}
            value={s}
            onValueChange={(v) => {
              const nr = hslToRgb(hsl.h, v / 100, hsl.l);
              updateBaseColor(selectedColorId, rgbToHexStr(nr.r * 255, nr.g * 255, nr.b * 255));
            }}
            formatValue={(v) => `${Math.round(v)}%`}
          />
          <Range
            label="Lightness"
            min={0}
            max={100}
            step={1}
            value={l}
            onValueChange={(v) => {
              const nr = hslToRgb(hsl.h, hsl.s, v / 100);
              updateBaseColor(selectedColorId, rgbToHexStr(nr.r * 255, nr.g * 255, nr.b * 255));
            }}
            formatValue={(v) => `${Math.round(v)}%`}
          />
        </>
      );
    }

    // oklch
    const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
    const l = Math.round(oklch.l * 100);
    return (
      <>
        <Range
          label="Lightness"
          min={0}
          max={100}
          step={1}
          value={l}
          onValueChange={(v) => {
            const nr = oklchToRgb(v / 100, oklch.c, oklch.h);
            updateBaseColor(selectedColorId, rgbToHexStr(nr.r * 255, nr.g * 255, nr.b * 255));
          }}
          formatValue={(v) => `${Math.round(v)}%`}
        />
        <Range
          label="Chroma"
          min={0}
          max={0.4}
          step={0.001}
          value={oklch.c}
          onValueChange={(v) => {
            const nr = oklchToRgb(oklch.l, v, oklch.h);
            updateBaseColor(selectedColorId, rgbToHexStr(nr.r * 255, nr.g * 255, nr.b * 255));
          }}
          formatValue={(v) => v.toFixed(3)}
        />
        <Range
          label="Hue"
          min={0}
          max={360}
          step={1}
          value={Math.round(oklch.h)}
          onValueChange={(v) => {
            const nr = oklchToRgb(oklch.l, oklch.c, v);
            updateBaseColor(selectedColorId, rgbToHexStr(nr.r * 255, nr.g * 255, nr.b * 255));
          }}
          formatValue={(v) => `${Math.round(v)}°`}
        />
      </>
    );
  };

  return (
    <div
      ref={setPaneEl}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        width: 300,
        background: 'var(--color-surface-primary)',
        boxShadow: '1px 0 0 0 var(--color-border-primary)',
      }}
    >
      {/* Scrollable content (header is part of the flow, matching the design). */}
      <div
        style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', overflowX: 'hidden', gap: 16, padding: '12px 16px' }}
      >
        {/* Color section — heading with the settings gear inline on the right
            (the hamburger sits to its left on narrow viewports only). */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <IconButton className="cp-menu-button" icon="menu" onClick={() => setSidebarOpen(true)} title="Show colors" />
            <h2 style={SECTION_HEADING}>Color</h2>
          </div>
          <IconButton icon="settings" onClick={() => setShowSettings(true)} title="Settings" />
        </div>

        {selectedColor && (
          <>
            {/* Color preview */}
            <div
              style={{
                width: '100%',
                height: 114,
                flexShrink: 0,
                borderRadius: 'var(--radius-interactive)',
                border: '1px solid var(--color-border-primary)',
                background: selectedColor.color,
              }}
            />

            {/* Color Name (DS Input + reset-to-generated-name button) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, width: '100%' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Input
                  size="lg"
                  label="Color Name"
                  value={selectedColor.name}
                  placeholder="Data"
                  onChange={(e) => updateBaseColorName(selectedColorId, e.target.value)}
                />
              </div>
              <Button
                intent="secondary"
                size="lg"
                icon="refresh"
                title="Reset to generated name"
                aria-label="Reset to generated name"
                onClick={() => {
                  const rgb = hexToRgb(selectedColor.color);
                  if (rgb) {
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    updateBaseColorName(selectedColorId, getColorNameFromHSL(hsl.h, hsl.s, hsl.l));
                  }
                }}
              />
            </div>

            {/* Color Value */}
            <ColorValueInput
              key={selectedColor.id}
              color={selectedColor.color}
              fmt={displayFormat}
              onCommit={(hex) => updateBaseColor(selectedColorId, hex)}
            />

            {/* Color channel sliders */}
            {renderColorSliders()}
          </>
        )}

        {/* Palette section */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 8 }}>
          <h2 style={SECTION_HEADING}>Palette</h2>
          <p
            style={{
              margin: 0,
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: 1.3,
              color: 'var(--color-text-secondary)',
            }}
          >
            These settings apply to every swatch in the collection
          </p>
        </div>

        <Range
          label="Base Position"
          min={0}
          max={Math.max(0, numStops - 1)}
          step={1}
          value={Math.min(mainStopIndex, numStops - 1)}
          onValueChange={(v) => setMainStopIndex(v)}
          formatValue={(v) => {
            const names = getStopNames(numStops);
            return names[v] != null ? String(names[v]) : String(v);
          }}
        />

        <Range
          label="Stops"
          min={3}
          max={24}
          step={1}
          value={numStops}
          onValueChange={(v) => {
            setNumStops(v);
            if (mainStopIndex >= v) setMainStopIndex(Math.floor(v / 2));
          }}
          formatValue={(v) => String(v)}
        />

        <Select
          label="Naming System"
          size="lg"
          options={NAMING_OPTIONS}
          value={namingSystem}
          onValueChange={setNamingSystem}
          portalContainer={paneEl}
        />

        <Select
          label="Count By"
          size="lg"
          options={COUNT_BY_OPTIONS}
          value={String(customIncrement)}
          onValueChange={(v) => setCustomIncrement(Number(v))}
          portalContainer={paneEl}
        />

        <Range
          label="Lightest"
          min={0.5}
          max={0.99}
          step={0.01}
          value={lightest}
          onValueChange={(v) => setLightest(v)}
          formatValue={(v) => `${Math.round(v * 100)}%`}
        />

        <Range
          label="Darkest"
          min={0}
          max={0.4}
          step={0.01}
          value={darkest}
          onValueChange={(v) => setDarkest(v)}
          formatValue={(v) => `${Math.round(v * 100)}%`}
        />
      </div>

      {/* Settings overlay (opened from the gear in the header) */}
      {showSettings && (
        <div
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', background: 'var(--color-surface-primary)', gap: 16, padding: 8, zIndex: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <h2 style={SECTION_HEADING}>Settings</h2>
            <IconButton icon="close" onClick={() => setShowSettings(false)} title="Close settings" />
          </div>

          <Select
            label="Display Format"
            size="lg"
            options={DISPLAY_FORMAT_OPTIONS}
            value={displayFormat}
            onValueChange={setDisplayFormat}
            portalContainer={paneEl}
          />

          <Select
            label="Color Mode"
            size="lg"
            options={COLOR_MODE_OPTIONS}
            value={colorMode}
            onValueChange={setColorMode}
            portalContainer={paneEl}
          />

          <Select
            label="Easing"
            size="lg"
            options={EASING_OPTIONS}
            value={easingType}
            onValueChange={setEasingType}
            portalContainer={paneEl}
          />

          <Select
            label="Contrast Method"
            size="lg"
            options={CONTRAST_OPTIONS}
            value={contrastMethod}
            onValueChange={setContrastMethod}
            portalContainer={paneEl}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Switch
              label="Preserve Perceived Brightness"
              checked={preservePerceptualBrightness}
              onCheckedChange={setPreservePerceptualBrightness}
            />
            <p
              style={{
                margin: 0,
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 400,
                fontSize: 12,
                lineHeight: 1.3,
                color: 'var(--color-text-tertiary)',
              }}
            >
              Keep brightness uniform across hues (reduces saturation to stay in gamut)
            </p>
          </div>

          {canResetStops && (
            <Button intent="secondary" icon="refresh" onClick={() => resetColorStops(selectedColorId)}>
              Reset color stops
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ControlsPanel;
