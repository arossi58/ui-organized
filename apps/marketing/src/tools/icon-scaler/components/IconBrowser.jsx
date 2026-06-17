import { useState, useRef, useCallback, useEffect } from "react";
import { Button, SearchInput, Tabs, Pagination } from "@ui-organized/react";
import { ICON_LIBRARIES } from "../constants.js";
import IconGridItem from "./IconGridItem.jsx";

// Library selector tabs (content is shared + rendered below, so each tab's panel
// is empty — the .tabs__panels area is hidden via CSS).
const LIB_TABS = Object.entries(ICON_LIBRARIES).map(([key, val]) => ({
  value: key,
  label: val.name,
  content: null,
}));

export default function IconBrowser({ onAddToWorkspace, onClose, existingIds }) {
  const [lib, setLib] = useState("lucide");
  const [icons, setIcons] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(new Set()); // Set<"lib:name">
  const PER_PAGE = 80;
  const cache = useRef({});

  const loadLibrary = useCallback(async (key) => {
    if (cache.current[key]) { setIcons(cache.current[key]); return; }
    setLoading(true); setError(null);
    try {
      const list = await ICON_LIBRARIES[key].fetchList();
      cache.current[key] = list;
      setIcons(list);
    } catch {
      setError("Failed to load icons.");
      setIcons([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadLibrary(lib); }, [lib, loadLibrary]);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    setFiltered(q ? icons.filter((n) => n.toLowerCase().includes(q)) : icons);
    setPage(0);
  }, [search, icons]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggleSelect = (name) => {
    const key = `${lib}:${name}`;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleAdd = () => {
    const list = Array.from(selected).map((key) => {
      const i = key.indexOf(":");
      return { lib: key.slice(0, i), name: key.slice(i + 1) };
    });
    onAddToWorkspace(list);
    onClose();
  };

  const pageIcons = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div
      className="is-browser-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="is-browser-modal" role="dialog" aria-modal="true" aria-label="Icon Library">

        {/* Header */}
        <div className="is-browser-header">
          <span className="is-browser-header-title">Icon Library</span>
          <div className="is-browser-spacer" />
          {selected.size > 0 && (
            <span className="is-browser-selected-count">{selected.size} selected</span>
          )}
          <Button intent="ghost" size="sm" icon="close" onClick={onClose} aria-label="Close" />
        </div>

        {/* Library tabs */}
        <Tabs
          className="is-browser-tabs"
          size="small"
          tabs={LIB_TABS}
          value={lib}
          onValueChange={(v) => { setLib(String(v)); setSearch(""); }}
        />

        {/* Search */}
        <div className="is-browser-search">
          <SearchInput
            autoFocus
            placeholder="Search icons…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
          <div className="is-browser-search-info">
            {loading ? "Loading…" : `${filtered.length} icons`}{search && !loading ? ` matching "${search}"` : ""}
          </div>
        </div>

        {error && <div className="is-browser-error">{error}</div>}

        {/* Icon grid */}
        <div className="is-browser-grid-wrap">
          {loading ? (
            <div className="is-browser-loading">Fetching icon list…</div>
          ) : filtered.length === 0 ? (
            <div className="is-browser-empty">No icons match "{search}"</div>
          ) : (
            <div className="is-browser-grid">
              {pageIcons.map((name) => {
                const key = `${lib}:${name}`;
                const inWorkspace = existingIds.has(key);
                return (
                  <IconGridItem
                    key={name}
                    name={name}
                    lib={lib}
                    onClick={() => !inWorkspace && toggleSelect(name)}
                    isSelected={selected.has(key)}
                    isInWorkspace={inWorkspace}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="is-browser-footer">
          {totalPages > 1 && (
            <Pagination
              className="is-browser-pagination"
              page={page + 1}
              count={totalPages}
              onPageChange={(p) => setPage(p - 1)}
            />
          )}
          <div className="is-browser-footer-bar">
            <div className="is-browser-spacer" />
            {selected.size > 0 && (
              <Button intent="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
            )}
            <Button intent="primary" size="md" icon="arrow-right" iconPosition="right" onClick={handleAdd} disabled={selected.size === 0}>
              {selected.size > 0 ? `Add ${selected.size} to workspace` : "Add to workspace"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
