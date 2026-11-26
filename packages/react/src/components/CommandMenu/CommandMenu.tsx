import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Listbox as ArkListbox, createListCollection } from "@ark-ui/react";
import {
  createContains,
  detectPlatform,
  filterCommandItems,
  firstCommand,
  groupCommandItems,
  matchesHotkey,
  orderCommandItems,
} from "@ui-organized/core";
import { Dialog, DialogContent } from "../Dialog/index.js";
import { Icon } from "../Icon/index.js";
import { Kbd } from "../Kbd/index.js";
import type { CommandMenuItem, CommandMenuProps } from "./CommandMenu.types.js";
import "@ui-organized/core/components/CommandMenu/CommandMenu.css";
import { glyph } from "../../icons/glyph.js";

/** Layout effects warn during server rendering, where there is nothing to listen to. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Built once: the collator is the expensive part of a comparison. */
const contains = createContains();

const ITEM_ICON_SIZE = 16;
const SEARCH_ICON_SIZE = 20;

/**
 * A search box over a list of commands, in a dialog near the top of the
 * screen. Typing narrows the list and highlights its first command; the arrows
 * move through it, wrapping at the ends; Enter or a click runs one.
 *
 * Built from Dialog and Ark's Listbox. Focus stays in the search box, which is
 * a combobox whose active descendant is the highlighted row, and the list
 * holds no selection: every pick is a fresh command, reported by `onSelect`.
 */
export function CommandMenu({
  items,
  open,
  defaultOpen,
  onOpenChange,
  onSelect,
  closeOnSelect = true,
  placeholder = "Type a command or search…",
  emptyMessage = "No results found.",
  label = "Command menu",
  hotkey,
  platform,
  portalContainer,
}: CommandMenuProps) {
  const [ownOpen, setOwnOpen] = useState(defaultOpen ?? false);
  const isOpen = open ?? ownOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) setOwnOpen(next);
    onOpenChange?.(next);
  };

  const [query, setQuery] = useState("");
  const matches = useMemo(
    () => orderCommandItems(filterCommandItems(items, query, contains)),
    [items, query],
  );
  const groups = useMemo(() => groupCommandItems(matches), [matches]);
  /**
   * The highlight is derived while rendering, so it is valid for the list
   * being drawn. An effect would run a render late, after zag had already
   * seen a value missing from its new collection and cleared it. A row the
   * pointer or the arrows moved to is kept until the query changes; then the
   * first match is highlighted again, so Enter always runs what is visible.
   */
  const [moved, setMoved] = useState<{ query: string; value: string } | null>(null);
  const highlighted =
    moved && moved.query === query && matches.some((item) => item.value === moved.value)
      ? moved.value
      : firstCommand(matches);
  // A menu reopened starts from the whole list, not the last search.
  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  // Read through a ref so the listener is attached once per hotkey. Attached at
  // commit, not after paint, so a shortcut pressed the moment the page is up
  // is heard.
  const latest = useRef({ isOpen, setOpen });
  latest.current = { isOpen, setOpen };
  useIsomorphicLayoutEffect(() => {
    if (!hotkey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      if (!matchesHotkey(event, hotkey, detectPlatform())) return;
      event.preventDefault();
      latest.current.setOpen(!latest.current.isOpen);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hotkey]);

  const collection = useMemo(
    () =>
      createListCollection<CommandMenuItem>({
        items: matches,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
        isItemDisabled: (item) => !!item.disabled,
      }),
    [matches],
  );
  const container = useMemo(
    () => (portalContainer ? { current: portalContainer } : undefined),
    [portalContainer],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent
        showClose={false}
        container={container}
        className="command-menu"
        aria-label={label}
      >
        <ArkListbox.Root
          className="command-menu__listbox"
          collection={collection}
          // Held empty: a command runs, it is not chosen, so no row is ever
          // "selected" and every pick reaches onSelect as a new one.
          value={[]}
          highlightedValue={highlighted}
          // zag clears the highlight when the pointer leaves a row; the menu
          // keeps it, so there is always a command for Enter to run.
          onHighlightChange={(details) => {
            if (details.highlightedValue != null)
              setMoved({ query, value: details.highlightedValue });
          }}
          onSelect={(details) => {
            onSelect?.(details.value);
            if (closeOnSelect) setOpen(false);
          }}
          loopFocus
          typeahead={false}
        >
          <ArkListbox.Label className="command-menu__label">{label}</ArkListbox.Label>
          <div className="command-menu__search">
            <Icon name={glyph("search")} size={SEARCH_ICON_SIZE} />
            {/* A combobox, which is what owns an active descendant in a list
                it controls; zag's input carries the rest of that pattern. */}
            <ArkListbox.Input
              ref={inputRef}
              className="command-menu__input"
              role="combobox"
              aria-expanded="true"
              aria-label={label}
              placeholder={placeholder}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </div>
          {/* zag focuses the list on a row's mousedown. Focus goes straight back
              to the search box, so typing still filters with closeOnSelect off. */}
          <ArkListbox.Content
            className="command-menu__list"
            tabIndex={-1}
            onFocus={() => inputRef.current?.focus({ preventScroll: true })}
          >
            {groups.map(([group, bucket]) => {
              const rows = bucket.map((item) => (
                <ArkListbox.Item
                  key={item.value}
                  item={item}
                  highlightOnHover
                  className="command-menu__item"
                  // zag draws the highlight only after its search box has had a
                  // focus event, which the dialog can deliver before the machine
                  // listens. The menu always knows its highlight, so it says so.
                  data-highlighted={item.value === highlighted ? "" : undefined}
                >
                  {item.icon != null && (
                    <span className="command-menu__item-icon" aria-hidden="true">
                      <Icon name={item.icon} size={ITEM_ICON_SIZE} />
                    </span>
                  )}
                  <ArkListbox.ItemText
                    className="command-menu__item-text"
                    data-highlighted={item.value === highlighted ? "" : undefined}
                  >
                    {item.label}
                  </ArkListbox.ItemText>
                  {item.shortcut && <Kbd keys={item.shortcut} size="sm" platform={platform} />}
                </ArkListbox.Item>
              ));
              // An ungrouped run is not wrapped: a group with no name would be
              // announced as one.
              if (group == null) return rows;
              return (
                <ArkListbox.ItemGroup key={group} className="command-menu__group">
                  <ArkListbox.ItemGroupLabel className="command-menu__group-label">
                    {group}
                  </ArkListbox.ItemGroupLabel>
                  {rows}
                </ArkListbox.ItemGroup>
              );
            })}
            {/* A disabled option rather than Ark's Empty part, which is
                role="presentation" and would leave the listbox childless. See
                Listbox. */}
            {matches.length === 0 && (
              <div
                role="option"
                aria-disabled="true"
                aria-selected="false"
                className="command-menu__empty"
              >
                {emptyMessage}
              </div>
            )}
          </ArkListbox.Content>
        </ArkListbox.Root>
      </DialogContent>
    </Dialog>
  );
}
