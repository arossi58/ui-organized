import React, { useRef, useState, useEffect } from 'react';
import { Button, Input, Icon } from '@ui-organized/react';
import { PRESET_REGISTRY } from '../constants/presets';
import './color-palette.css';

// A collection is a container for an entire palette. This control is a single
// design-system Select-styled dropdown: the trigger shows the active collection,
// and the popup lists every collection (pick to switch; hover a row to rename or
// delete it) plus an input + button to create a new named collection.
const CollectionsBar = ({
  collections,
  activeCollectionId,
  switchCollection,
  createCollection,
  renameCollection,
  deleteCollection,
  loadPreset,
}) => {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loadingPresetId, setLoadingPresetId] = useState(null);
  const rootRef = useRef(null);

  const active = collections.find(c => c.id === activeCollectionId);
  const canDelete = collections.length > 1;

  // Close on outside click / Escape while the popup is open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setEditingId(null);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') { setOpen(false); setEditingId(null); }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleSelect = (id) => {
    switchCollection(id);
    setOpen(false);
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCollection(newName);
    setNewName('');
    setOpen(false);
  };

  return (
    <div style={{ width: '100%', flexShrink: 0 }}>
      <div className="select-field" ref={rootRef}>
        <span className="select-field__label">Collection</span>

        {/* Trigger — styled as the design-system Select trigger (large). */}
        <button
          type="button"
          className="select-field__trigger"
          data-popup-open={open ? '' : undefined}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          style={{ padding: 'var(--Button-Large-vertical) var(--Button-Large-horizontal)' }}
        >
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {active ? active.name : 'Select collection'}
          </span>
          <span className="select-field__icon"><Icon name="chevron-down" size={20} /></span>
        </button>

        {/* Popup — collection list + create form. */}
        {open && (
          <div
            className="select-popup"
            style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, width: '100%', zIndex: 50 }}
          >
            <div className="select-popup__list">
              {collections.map((c) => {
                const isActive = c.id === activeCollectionId;
                const isEditing = editingId === c.id;
                return (
                  <div
                    key={c.id}
                    className="select-popup__item cp-hover-group"
                    data-selected={isActive ? '' : undefined}
                    style={{ cursor: isEditing ? 'default' : 'pointer' }}
                    onClick={() => { if (!isEditing) handleSelect(c.id); }}
                  >
                    {/* Active check (space reserved so names stay aligned). */}
                    <span className="select-popup__item-indicator" style={{ opacity: isActive ? 1 : 0, flexShrink: 0 }}>
                      <Icon name="check" size={16} />
                    </span>

                    {isEditing ? (
                      <input
                        autoFocus
                        value={c.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => renameCollection(c.id, e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') setEditingId(null); }}
                        onBlur={() => setEditingId(null)}
                        aria-label="Rename collection"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          background: 'var(--color-interactive-ui-default)',
                          border: '1px solid var(--color-border-data-entry)',
                          borderRadius: 'var(--radius-interactive)',
                          color: 'var(--color-text-primary)',
                          font: 'inherit',
                          padding: '2px 6px',
                          outline: 'none',
                        }}
                      />
                    ) : (
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </span>
                    )}

                    {/* Hover actions — rename + delete, as design-system Buttons. */}
                    {!isEditing && (
                      <span
                        className="cp-hover-actions"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                      >
                        <Button
                          intent="ghost"
                          size="md"
                          icon="edit"
                          aria-label="Rename collection"
                          title="Rename collection"
                          onClick={(e) => { e.stopPropagation(); setEditingId(c.id); }}
                        />
                        <Button
                          intent="destructive-ghost"
                          size="md"
                          icon="trash"
                          disabled={!canDelete}
                          aria-label="Delete collection"
                          title={canDelete ? 'Delete collection' : 'Cannot delete the only collection'}
                          onClick={(e) => { e.stopPropagation(); if (canDelete) deleteCollection(c.id); }}
                        />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Load preset — each loads a design system's published scale into a
                new collection (non-destructive). Hex data is fetched on demand. */}
            <div
              style={{
                borderTop: '1px solid var(--color-border-primary)',
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span className="select-field__label">Load preset</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PRESET_REGISTRY.map((p) => (
                  <Button
                    key={p.id}
                    size="sm"
                    intent="secondary"
                    disabled={loadingPresetId !== null}
                    onClick={async () => {
                      setLoadingPresetId(p.id);
                      try {
                        await loadPreset(p.id);
                        setOpen(false);
                      } finally {
                        setLoadingPresetId(null);
                      }
                    }}
                  >
                    {loadingPresetId === p.id ? 'Loading…' : p.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Create-new form. */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Input
                  size="sm"
                  placeholder="New collection name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                  aria-label="New collection name"
                />
              </div>
              <Button size="sm" intent="primary" icon="plus" onClick={handleCreate} disabled={!newName.trim()}>
                Create
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Square icon button used in the Swatches header (24px icon, snug padding).
const HeaderIconButton = ({ icon, onClick, title, variant = 'secondary' }) => {
  const isPrimary = variant === 'primary';
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        borderRadius: 'var(--radius-interactive)',
        background: isPrimary
          ? 'var(--color-interactive-primary-default)'
          : 'var(--color-interactive-secondary-default)',
        color: isPrimary ? 'var(--color-interactive-contents)' : 'var(--color-text-primary)',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <Icon name={icon} size={24} />
    </button>
  );
};

// A single color swatch card. Selected → brand-orange border + semibold name.
const ColorCard = ({ colorObj, selected, canDelete, onSelect, onDelete, formatColorValue }) => (
  <div
    onClick={onSelect}
    className="cp-hover-group"
    style={{
      position: 'relative',
      width: '100%',
      cursor: 'pointer',
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
      padding: 8,
      borderRadius: 'var(--radius-interactive)',
      background: 'var(--color-surface-primary)',
      border: `1px solid ${selected ? 'var(--color-interactive-primary-default)' : 'var(--color-border-primary)'}`,
      transition: 'border-color 150ms ease',
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        flexShrink: 0,
        borderRadius: 'var(--border-radius-02)',
        background: colorObj.color,
        border: '1px solid var(--color-border-primary)',
      }}
    />
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignSelf: 'stretch',
        minWidth: 0,
        flex: 1,
      }}
    >
      <span
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontWeight: selected ? 600 : 500,
          fontSize: 16,
          lineHeight: 1.5,
          color: 'var(--color-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {colorObj.name}
      </span>
      <span
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 1.3,
          color: 'var(--color-text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {formatColorValue(colorObj.color)}
      </span>
    </div>

    {/* Delete on hover (kept available; hidden when only one color remains). */}
    {canDelete && (
      <div
        className="cp-hover-actions"
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          background: 'var(--color-surface-primary)',
          borderRadius: 'var(--radius-interactive)',
        }}
      >
        <Button
          intent="destructive-ghost"
          size="sm"
          icon="trash"
          aria-label="Delete color"
          title="Delete color"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        />
      </div>
    )}
  </div>
);

const Sidebar = ({
  baseColors,
  selectedColorId,
  setSelectedColorId,
  addBaseColor,
  removeBaseColor,
  sidebarOpen,
  setSidebarOpen,
  setShowExportModal,
  formatColorValue,
  importPalette,
  collections,
  activeCollectionId,
  switchCollection,
  createCollection,
  renameCollection,
  deleteCollection,
  loadPreset,
  // When the collections rail/overview owns collection nav, the in-sidebar
  // dropdown is redundant and hidden; onShowOverview surfaces a back button.
  showCollectionsBar = true,
  onShowOverview,
}) => {
  // Shared sidebar body (collection picker + swatches header + card list).
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 10, padding: '12px 16px' }}>
      {showCollectionsBar && (
        <CollectionsBar
          collections={collections}
          activeCollectionId={activeCollectionId}
          switchCollection={switchCollection}
          createCollection={createCollection}
          renameCollection={renameCollection}
          deleteCollection={deleteCollection}
          loadPreset={loadPreset}
        />
      )}

      {/* Swatches header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexShrink: 0 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500,
            fontSize: 20,
            lineHeight: 1.2,
            color: 'var(--color-text-primary)',
          }}
        >
          Swatches
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeaderIconButton icon="download" title="Export palette" onClick={() => setShowExportModal(true)} />
          <HeaderIconButton icon="plus" title="Add color" onClick={addBaseColor} variant="primary" />
        </div>
      </div>

      {/* Swatch cards */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', gap: 10 }}>
        {baseColors.map((colorObj) => (
          <ColorCard
            key={colorObj.id}
            colorObj={colorObj}
            selected={selectedColorId === colorObj.id}
            canDelete={baseColors.length > 1}
            onSelect={() => setSelectedColorId(colorObj.id)}
            onDelete={() => removeBaseColor(colorObj.id)}
            formatColorValue={formatColorValue}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="cp-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile overlay version */}
      <div
        className="cp-sidebar-drawer"
        data-open={sidebarOpen ? 'true' : 'false'}
        style={{ background: 'var(--color-surface-primary)', borderRight: '1px solid var(--color-border-primary)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, padding: 10, paddingBottom: 0 }}>
          {onShowOverview ? (
            <button
              type="button"
              onClick={() => { setSidebarOpen(false); onShowOverview(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-secondary)', font: 'inherit', fontSize: 14,
              }}
            >
              <Icon name="arrow-left" size={18} />
              Collections
            </button>
          ) : <span />}
          <HeaderIconButton icon="close" title="Close" onClick={() => setSidebarOpen(false)} />
        </div>
        {body}
      </div>

      {/* Tablet+ permanent sidebar */}
      <div
        className="cp-sidebar-permanent"
        style={{ background: 'var(--color-surface-primary)', borderRight: '1px solid var(--color-border-primary)' }}
      >
        {body}
      </div>
    </>
  );
};

export default Sidebar;
