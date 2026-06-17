import React, { useState } from 'react';
import { Button } from '@ui-organized/react';
import SwatchStrip from './SwatchStrip';

// A single collection entry in the rail: name (with hover rename/delete) over a
// thin swatch band. Double duty as the in-editor collection switcher.
const RailItem = ({ name, colors, active, canDelete, onClick, onRename, onDelete }) => {
  const [editing, setEditing] = useState(false);

  return (
    <div
      className="cp-rail-item cp-hover-group"
      data-active={active ? '' : undefined}
      role="button"
      tabIndex={0}
      onClick={() => { if (!editing) onClick(); }}
      onKeyDown={(e) => { if (!editing && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
    >
      <div className="cp-rail-item__row">
        {editing ? (
          <input
            autoFocus
            className="cp-rail-item__input"
            value={name}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onRename(e.target.value)}
            onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') setEditing(false); }}
            onBlur={() => setEditing(false)}
            aria-label="Rename collection"
          />
        ) : (
          <span className="cp-rail-item__name">{name}</span>
        )}

        {!editing && (
          <span className="cp-hover-actions cp-rail-item__actions">
            <Button
              intent="ghost"
              size="sm"
              icon="edit"
              aria-label="Rename collection"
              title="Rename collection"
              onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            />
            <Button
              intent="destructive-ghost"
              size="sm"
              icon="trash"
              disabled={!canDelete}
              aria-label="Delete collection"
              title={canDelete ? 'Delete collection' : 'Cannot delete the only collection'}
              onClick={(e) => { e.stopPropagation(); if (canDelete) onDelete(); }}
            />
          </span>
        )}
      </div>
      <SwatchStrip colors={colors} height={20} radius="var(--border-radius-radius-01)" />
    </div>
  );
};

/**
 * Persistent left column (wide / marketing view) listing every collection. Lets
 * the user jump between collections without leaving the editor, rename/delete
 * them, and return to the full-screen overview. Mirrors the overview's data.
 */
const CollectionsRail = ({
  collections,
  activeCollectionId,
  liveBaseColors,
  onSwitch,
  onShowOverview,
  onNewCollection,
  onRename,
  onDelete,
}) => {
  const swatchesFor = (c) => {
    const baseColors = c.id === activeCollectionId ? liveBaseColors : (c.palette?.baseColors || []);
    return baseColors.map((x) => x.color);
  };
  const canDelete = collections.length > 1;

  return (
    <div
      className="cp-collections-rail"
      style={{ background: 'var(--color-surface-primary)', borderRight: '1px solid var(--color-border-primary)' }}
    >
      <div className="cp-rail-header">
        <Button
          intent="ghost"
          size="md"
          icon="arrow-left"
          aria-label="Back to collections"
          title="Back to collections"
          onClick={onShowOverview}
        />
        <h2 className="cp-rail-title">Collections</h2>
      </div>

      <div className="cp-rail-list">
        {collections.map((c) => (
          <RailItem
            key={c.id}
            name={c.name}
            colors={swatchesFor(c)}
            active={c.id === activeCollectionId}
            canDelete={canDelete}
            onClick={() => onSwitch(c.id)}
            onRename={(name) => onRename(c.id, name)}
            onDelete={() => onDelete(c.id)}
          />
        ))}
      </div>

      <div style={{ padding: 8, borderTop: '1px solid var(--color-border-primary)', flexShrink: 0 }}>
        <Button size="sm" intent="secondary" icon="plus" onClick={onNewCollection} style={{ width: '100%' }}>
          New collection
        </Button>
      </div>
    </div>
  );
};

export default CollectionsRail;
