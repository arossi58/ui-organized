import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_PALETTE } from './constants/defaultPalette';
import { loadPresetDefinition, PRESET_REGISTRY } from './constants/presets';
import { usePaletteGeneration } from './hooks/usePaletteGeneration';
import { rgbToOklch, hexToRgb, oklchToRgbGamutMapped, rgbToHex, rgbToHsl } from './utils/colorConversions';
import { getColorNameFromHSL, getStopNames, formatColorValue as _formatColorValue } from './utils/naming';
import Sidebar from './components/Sidebar';
import ControlsPanel from './components/ControlsPanel';
import PaletteDisplay from './components/PaletteDisplay';
import ExportModal from './components/ExportModal';
import CollectionsOverview from './components/CollectionsOverview';
import CollectionsRail from './components/CollectionsRail';

// The default palette IS the UI Organized design-system color set, so the
// first collection is named accordingly.
const UI_ORGANIZED_NAME = 'UI Organized';

const STORAGE_KEY = 'ui-organized:color-palette';

// A brand-new collection starts as a clean container with a single base color.
const makeNewPalette = () => ({
  baseColors: [{ id: 1, color: '#3b82f6', name: 'Blue' }],
  selectedColorId: 1,
  numStops: 16,
  mainStopIndex: 8,
  colorMode: 'oklch',
  easingType: 'linear',
  namingSystem: 'custom',
  customIncrement: 100,
  lightest: 0.97,
  darkest: 0.07,
  preservePerceptualBrightness: false,
  nextId: 2,
});

const ColorPaletteGenerator = ({ collectionsView = false }) => {
  // 'overview' = the full-screen collections landing; 'editor' = the workspace.
  // Only meaningful when collectionsView is on (the spacious marketing layout).
  const [view, setView] = useState(collectionsView ? 'overview' : 'editor');
  const [baseColors, setBaseColors] = useState(DEFAULT_PALETTE);
  const [selectedColorId, setSelectedColorId] = useState(1);
  // The UI Organized palette mirrors the design system's 24-step ramps
  // (100 -> 2400), with 1200 (index 11) as the primary weight.
  const [numStops, setNumStops] = useState(24);
  const [mainStopIndex, setMainStopIndex] = useState(11);
  const [colorMode, setColorMode] = useState('oklch');
  const [easingType, setEasingType] = useState('linear');
  const [namingSystem, setNamingSystem] = useState('custom');
  const [customIncrement, setCustomIncrement] = useState(100);
  const [lightest, setLightest] = useState(0.97);
  const [darkest, setDarkest] = useState(0.07);
  const [displayFormat, setDisplayFormat] = useState('hex');
  const [contrastMethod, setContrastMethod] = useState('wcag');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [nextId, setNextId] = useState(DEFAULT_PALETTE.length + 1);
  const [hueOffset] = useState(30);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('css');
  const [preservePerceptualBrightness, setPreservePerceptualBrightness] = useState(false);

  // Collections: each is a container for a full palette (its base colors plus
  // all generation settings). The working state above holds the *active*
  // collection's live palette; inactive collections keep a stored snapshot.
  const [collections, setCollections] = useState(() => [{ id: 1, name: UI_ORGANIZED_NAME, palette: null }]);
  const [activeCollectionId, setActiveCollectionId] = useState(1);
  const [collectionNextId, setCollectionNextId] = useState(2);

  const palettes = usePaletteGeneration(
    baseColors,
    numStops,
    mainStopIndex,
    colorMode,
    easingType,
    lightest,
    darkest,
    preservePerceptualBrightness
  );

  const activeCollection = collections.find(c => c.id === activeCollectionId);
  const activeCollectionName = activeCollection ? activeCollection.name : 'Collection';

  // Capture the active collection's live palette from the working state.
  const snapshotPalette = () => ({
    baseColors,
    selectedColorId,
    numStops,
    mainStopIndex,
    colorMode,
    easingType,
    namingSystem,
    customIncrement,
    lightest,
    darkest,
    preservePerceptualBrightness,
    nextId,
  });

  // Load a stored palette into the working state.
  const applyPalette = (p) => {
    if (!p || typeof p !== 'object') return;
    setBaseColors(Array.isArray(p.baseColors) && p.baseColors.length > 0 ? p.baseColors : DEFAULT_PALETTE);
    setSelectedColorId(
      typeof p.selectedColorId === 'number'
        ? p.selectedColorId
        : (Array.isArray(p.baseColors) && p.baseColors[0] ? p.baseColors[0].id : 1)
    );
    setNumStops(typeof p.numStops === 'number' ? p.numStops : 16);
    setMainStopIndex(typeof p.mainStopIndex === 'number' ? p.mainStopIndex : 8);
    setColorMode(typeof p.colorMode === 'string' ? p.colorMode : 'oklch');
    setEasingType(typeof p.easingType === 'string' ? p.easingType : 'linear');
    setNamingSystem(typeof p.namingSystem === 'string' ? p.namingSystem : 'custom');
    setCustomIncrement(typeof p.customIncrement === 'number' ? p.customIncrement : 100);
    setLightest(typeof p.lightest === 'number' ? p.lightest : 0.97);
    setDarkest(typeof p.darkest === 'number' ? p.darkest : 0.07);
    setPreservePerceptualBrightness(typeof p.preservePerceptualBrightness === 'boolean' ? p.preservePerceptualBrightness : false);
    setNextId(typeof p.nextId === 'number' ? p.nextId : 42);
  };

  const switchCollection = (id) => {
    if (id === activeCollectionId) return;
    const target = collections.find(c => c.id === id);
    if (!target) return;
    const snap = snapshotPalette();
    // Stash the current palette into the collection we're leaving.
    setCollections(prev => prev.map(c => (c.id === activeCollectionId ? { ...c, palette: snap } : c)));
    applyPalette(target.palette);
    setActiveCollectionId(id);
  };

  const createCollection = (name, palette, presetId) => {
    const snap = snapshotPalette();
    const id = collectionNextId;
    const newPalette = palette || makeNewPalette();
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const newCollection = { id, name: trimmedName || `Collection ${id}`, palette: newPalette, presetId };
    setCollections(prev =>
      prev.map(c => (c.id === activeCollectionId ? { ...c, palette: snap } : c)).concat(newCollection)
    );
    applyPalette(newPalette);
    setActiveCollectionId(id);
    setCollectionNextId(id + 1);
  };

  const renameCollection = (id, name) => {
    setCollections(prev => prev.map(c => (c.id === id ? { ...c, name } : c)));
  };

  const deleteCollection = (id) => {
    if (collections.length <= 1) return;
    const remaining = collections.filter(c => c.id !== id);
    setCollections(remaining);
    if (id === activeCollectionId) {
      const next = remaining[0];
      applyPalette(next.palette);
      setActiveCollectionId(next.id);
    }
  };

  // Build a palette snapshot (same shape as snapshotPalette()) from a resolved
  // design-system preset definition. The published scales are stored verbatim as
  // customStops; numStops/namingSystem are matched to the system so the generator
  // renders them as-is rather than regenerating via OKLCH. Pure (no state).
  const buildPaletteFromPreset = (preset) => {
    const baseColors = preset.colors.map((c, i) => {
      if (c.stops.length !== preset.numStops) {
        // Fails silently downstream (the generator would regenerate the ramp), so
        // surface it loudly during development.
        console.warn(
          `[color-palette] preset "${preset.id}" color "${c.name}" has ${c.stops.length} stops; expected ${preset.numStops}.`
        );
      }
      return {
        id: i + 1, // ids are scoped per collection — local 1..n is collision-free
        name: c.name,
        color: c.stops[preset.mainStopIndex] ?? c.stops[Math.floor(c.stops.length / 2)],
        customStops: c.stops,
      };
    });
    return {
      baseColors,
      selectedColorId: 1,
      numStops: preset.numStops,
      mainStopIndex: preset.mainStopIndex,
      colorMode: 'oklch',
      easingType: 'linear',
      namingSystem: preset.namingSystem,
      customIncrement: preset.customIncrement ?? 100,
      lightest: 0.97,
      darkest: 0.07,
      preservePerceptualBrightness: false,
      nextId: baseColors.length + 1,
    };
  };

  // Load a design-system preset into its own new collection (non-destructive).
  // The hex data module is fetched on demand (code-split) the first time. If the
  // preset already has a collection, switch to it instead of duplicating.
  const loadPreset = async (presetId) => {
    const existing = collections.find(c => c.presetId === presetId);
    if (existing) {
      switchCollection(existing.id);
      return;
    }
    const def = await loadPresetDefinition(presetId);
    if (!def || !Array.isArray(def.colors) || def.colors.length === 0) return;
    createCollection(def.label, buildPaletteFromPreset(def), presetId);
  };

  // Persistence: load saved state on mount, then save on every change.
  // State is stored in localStorage.
  const hydratedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && typeof s === 'object') {
          // Global view preferences (shared across collections).
          if (typeof s.displayFormat === 'string') setDisplayFormat(s.displayFormat);
          if (typeof s.contrastMethod === 'string') setContrastMethod(s.contrastMethod);
          if (typeof s.exportFormat === 'string') setExportFormat(s.exportFormat);

          if (Array.isArray(s.collections) && s.collections.length > 0) {
            // New format: a list of collections, each with a stored palette.
            const cols = s.collections
              .filter(c => c && typeof c === 'object' && c.palette)
              .map(c => ({
                id: c.id,
                name: typeof c.name === 'string' ? c.name : 'Collection',
                palette: c.palette,
                presetId: typeof c.presetId === 'string' ? c.presetId : undefined,
              }));
            if (cols.length > 0) {
              const activeId = cols.find(c => c.id === s.activeCollectionId) ? s.activeCollectionId : cols[0].id;
              const active = cols.find(c => c.id === activeId) || cols[0];
              setCollections(cols);
              setActiveCollectionId(activeId);
              applyPalette(active.palette);
              const maxId = cols.reduce((m, c) => (typeof c.id === 'number' && c.id > m ? c.id : m), 0);
              setCollectionNextId(maxId + 1);
            }
          } else if (Array.isArray(s.baseColors) && s.baseColors.length > 0) {
            // Legacy format: wrap the old flat palette into a single collection.
            const palette = {
              baseColors: s.baseColors,
              selectedColorId: typeof s.selectedColorId === 'number' ? s.selectedColorId : s.baseColors[0].id,
              numStops: typeof s.numStops === 'number' ? s.numStops : 16,
              mainStopIndex: typeof s.mainStopIndex === 'number' ? s.mainStopIndex : 8,
              colorMode: typeof s.colorMode === 'string' ? s.colorMode : 'oklch',
              easingType: typeof s.easingType === 'string' ? s.easingType : 'linear',
              namingSystem: typeof s.namingSystem === 'string' ? s.namingSystem : 'custom',
              customIncrement: typeof s.customIncrement === 'number' ? s.customIncrement : 100,
              lightest: typeof s.lightest === 'number' ? s.lightest : 0.97,
              darkest: typeof s.darkest === 'number' ? s.darkest : 0.07,
              preservePerceptualBrightness: typeof s.preservePerceptualBrightness === 'boolean' ? s.preservePerceptualBrightness : false,
              nextId: typeof s.nextId === 'number' ? s.nextId : 42,
            };
            setCollections([{ id: 1, name: UI_ORGANIZED_NAME, palette }]);
            setActiveCollectionId(1);
            setCollectionNextId(2);
            applyPalette(palette);
          }
        }
      }
    } catch {
      // Ignore malformed stored state; start fresh.
    }
    // Enable saving once hydration has run (even if there was no stored state).
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    // Serialize all collections, with the active one's palette taken from the
    // live working state.
    const palette = snapshotPalette();
    const collectionsToSave = collections.map(c => (c.id === activeCollectionId ? { ...c, palette } : c));
    const state = {
      version: 2,
      collections: collectionsToSave,
      activeCollectionId,
      displayFormat,
      contrastMethod,
      exportFormat,
    };
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Storage may be unavailable (private mode / quota); ignore.
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [
    baseColors, selectedColorId, numStops, mainStopIndex, colorMode, easingType,
    namingSystem, customIncrement, lightest, darkest, displayFormat, contrastMethod,
    exportFormat, preservePerceptualBrightness, nextId,
    collections, activeCollectionId,
  ]);

  const addBaseColor = () => {
    const lastColor = baseColors[0];
    const lastRgb = hexToRgb(lastColor.color);
    const lastOklch = rgbToOklch(lastRgb.r, lastRgb.g, lastRgb.b);

    const newHue = (lastOklch.h + hueOffset) % 360;

    const newRgb = oklchToRgbGamutMapped(lastOklch.l, lastOklch.c, newHue);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);

    const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
    const colorName = getColorNameFromHSL(newHsl.h, newHsl.s, newHsl.l);

    const newColor = {
      id: nextId,
      color: newHex,
      name: colorName
    };
    setBaseColors([newColor, ...baseColors]);
    setSelectedColorId(nextId);
    setNextId(nextId + 1);
  };

  const removeBaseColor = (id) => {
    if (baseColors.length === 1) return;
    const newColors = baseColors.filter(c => c.id !== id);
    setBaseColors(newColors);
    if (selectedColorId === id) {
      setSelectedColorId(newColors[0].id);
    }
  };

  const updateBaseColor = (id, color) => {
    const rgb = hexToRgb(color);
    if (rgb) {
      setBaseColors(baseColors.map(c =>
        c.id === id ? { ...c, color, customStops: undefined } : c
      ));
    }
  };

  const importPalette = (jsonData) => {
    let parsed;
    try {
      parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    } catch {
      alert('Invalid JSON file.');
      return;
    }

    const newColors = [];
    let detectedStops = null;
    let startId = nextId;

    // Detect format: Figma tokens vs plain JSON
    const isFigmaFormat = parsed.colors && typeof parsed.colors === 'object' &&
      Object.values(parsed.colors).some(v => v && v.type === 'color');

    if (isFigmaFormat) {
      // { colors: { "Name/100": { value: "#hex", type: "color" } } }
      const grouped = {};
      Object.entries(parsed.colors).forEach(([key, val]) => {
        if (!val || val.type !== 'color') return;
        const slashIdx = key.lastIndexOf('/');
        if (slashIdx === -1) return;
        const name = key.slice(0, slashIdx);
        const stop = key.slice(slashIdx + 1);
        if (!grouped[name]) grouped[name] = {};
        grouped[name][stop] = val.value;
      });

      Object.entries(grouped).forEach(([name, stops]) => {
        const stopKeys = Object.keys(stops).sort((a, b) => Number(a) - Number(b));
        if (detectedStops === null) detectedStops = stopKeys.length;
        const customStops = stopKeys.map(k => stops[k]);
        const midHex = customStops[Math.floor(customStops.length / 2)];
        newColors.push({ id: startId++, name, color: midHex, customStops });
      });
    } else {
      // { colorname: { "100": "#hex", ... } }
      Object.entries(parsed).forEach(([name, stops]) => {
        if (typeof stops !== 'object' || Array.isArray(stops)) return;
        const stopKeys = Object.keys(stops).sort((a, b) => Number(a) - Number(b));
        if (detectedStops === null) detectedStops = stopKeys.length;
        const customStops = stopKeys.map(k => stops[k]);
        const midHex = customStops[Math.floor(customStops.length / 2)];
        newColors.push({ id: startId++, name, color: midHex, customStops });
      });
    }

    if (newColors.length === 0) {
      alert('No color data found in this file.');
      return;
    }

    if (detectedStops !== null) setNumStops(detectedStops);
    setMainStopIndex(Math.floor((detectedStops ?? numStops) / 2));
    setNamingSystem('custom');
    setCustomIncrement(100);
    setBaseColors(newColors);
    setSelectedColorId(newColors[0].id);
    setNextId(startId);
  };

  const resetColorStops = (id) => {
    const original = DEFAULT_PALETTE.find(c => c.id === id);
    if (original) {
      setBaseColors(baseColors.map(c =>
        c.id === id ? { ...c, color: original.color, name: original.name, customStops: original.customStops } : c
      ));
    }
  };

  const updateBaseColorName = (id, name) => {
    setBaseColors(baseColors.map(c =>
      c.id === id ? { ...c, name } : c
    ));
  };

  const selectedColor = baseColors.find(c => c.id === selectedColorId);

  // ── Collections-view navigation (marketing layout only) ──────────────────
  // Presets that don't yet have a collection — shown as openable rows in the
  // overview alongside the existing collections.
  const loadedPresetIds = new Set(collections.map(c => c.presetId).filter(Boolean));
  const availablePresets = PRESET_REGISTRY.filter(p => !loadedPresetIds.has(p.id));

  const openCollection = (id) => { switchCollection(id); setView('editor'); };
  const openPreset = async (id) => { await loadPreset(id); setView('editor'); };
  const newCollection = () => { createCollection(); setView('editor'); };
  const showOverview = () => setView('overview');

  // Helper wrappers that bind current state
  const formatColorValue = (hex) => _formatColorValue(hex, displayFormat);
  const getStopNamesForCurrentSettings = (n) => getStopNames(n, namingSystem, customIncrement);

  // Full-screen collections landing (marketing layout, before entering the editor).
  if (collectionsView && view === 'overview') {
    return (
      <div style={{ display: 'flex', height: '100%', width: '100%', minHeight: 0, overflow: 'hidden', background: 'var(--color-surface-base)' }}>
        <CollectionsOverview
          collections={collections}
          activeCollectionId={activeCollectionId}
          liveBaseColors={baseColors}
          availablePresets={availablePresets}
          onOpenCollection={openCollection}
          onOpenPreset={openPreset}
          onNewCollection={newCollection}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', minHeight: 0, overflow: 'hidden', background: 'var(--color-surface-base)' }}>
      {collectionsView && (
        <CollectionsRail
          collections={collections}
          activeCollectionId={activeCollectionId}
          liveBaseColors={baseColors}
          onSwitch={switchCollection}
          onShowOverview={showOverview}
          onNewCollection={newCollection}
          onRename={renameCollection}
          onDelete={deleteCollection}
        />
      )}
      <Sidebar
        showCollectionsBar={!collectionsView}
        onShowOverview={collectionsView ? showOverview : undefined}
        baseColors={baseColors}
        selectedColorId={selectedColorId}
        setSelectedColorId={setSelectedColorId}
        addBaseColor={addBaseColor}
        removeBaseColor={removeBaseColor}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setShowExportModal={setShowExportModal}
        formatColorValue={formatColorValue}
        importPalette={importPalette}
        collections={collections}
        activeCollectionId={activeCollectionId}
        switchCollection={switchCollection}
        createCollection={createCollection}
        renameCollection={renameCollection}
        deleteCollection={deleteCollection}
        loadPreset={loadPreset}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        <ControlsPanel
          selectedColor={selectedColor}
          selectedColorId={selectedColorId}
          updateBaseColor={updateBaseColor}
          updateBaseColorName={updateBaseColorName}
          resetColorStops={resetColorStops}
          displayFormat={displayFormat}
          setDisplayFormat={setDisplayFormat}
          numStops={numStops}
          setNumStops={setNumStops}
          mainStopIndex={mainStopIndex}
          setMainStopIndex={setMainStopIndex}
          contrastMethod={contrastMethod}
          setContrastMethod={setContrastMethod}
          preservePerceptualBrightness={preservePerceptualBrightness}
          setPreservePerceptualBrightness={setPreservePerceptualBrightness}
          namingSystem={namingSystem}
          setNamingSystem={setNamingSystem}
          customIncrement={customIncrement}
          setCustomIncrement={setCustomIncrement}
          colorMode={colorMode}
          setColorMode={setColorMode}
          easingType={easingType}
          setEasingType={setEasingType}
          lightest={lightest}
          setLightest={setLightest}
          darkest={darkest}
          setDarkest={setDarkest}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          getStopNames={getStopNamesForCurrentSettings}
          formatColorValue={formatColorValue}
        />
        <PaletteDisplay
          selectedColor={selectedColor}
          selectedColorId={selectedColorId}
          palette={palettes[selectedColorId]}
          numStops={numStops}
          namingSystem={namingSystem}
          customIncrement={customIncrement}
          displayFormat={displayFormat}
          contrastMethod={contrastMethod}
          copiedIndex={copiedIndex}
          setCopiedIndex={setCopiedIndex}
        />
      </div>
      <ExportModal
        showExportModal={showExportModal}
        setShowExportModal={setShowExportModal}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        baseColors={baseColors}
        palettes={palettes}
        numStops={numStops}
        namingSystem={namingSystem}
        customIncrement={customIncrement}
      />
    </div>
  );
};

export default ColorPaletteGenerator;
