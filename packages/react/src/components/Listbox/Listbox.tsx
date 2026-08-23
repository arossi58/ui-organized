import { useMemo } from "react";
import { Listbox as ArkListbox, createListCollection } from "@ark-ui/react";
import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import { CONTROL_ICON_SIZE, type ControlSize } from "../controlSize.js";
import { listboxStyles } from "./Listbox.styles.js";
import type { ListboxProps, ListboxOption } from "./Listbox.types.js";
import "./Listbox.css";

/** Options in declaration order, bucketed by `group`. Ungrouped options keep a
 *  `null` bucket so a partially grouped list still renders every option once,
 *  in the order it was given. */
function groupOptions(options: ListboxOption[]): [string | null, ListboxOption[]][] {
  const buckets = new Map<string | null, ListboxOption[]>();
  for (const option of options) {
    const key = option.group ?? null;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(option);
    else buckets.set(key, [option]);
  }
  return [...buckets];
}

export function Listbox({
  options,
  label,
  value,
  defaultValue,
  onValueChange,
  selectionMode,
  size = "md",
  variant,
  emptyMessage = "No options",
  disabled,
  className,
}: ListboxProps) {
  const iconSize = CONTROL_ICON_SIZE[size as ControlSize];

  // Ark drives the list off a collection rather than children, the same way
  // Select does — `options` is the single source for both.
  const collection = useMemo(
    () =>
      createListCollection({
        items: options,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
        isItemDisabled: (item) => !!item.disabled,
      }),
    [options],
  );

  const groups = useMemo(() => groupOptions(options), [options]);

  return (
    <ArkListbox.Root
      className={clsx(listboxStyles({ size, variant }), className)}
      collection={collection}
      value={value}
      defaultValue={defaultValue}
      // Passed unconditionally, not as `onValueChange && (…)`. Ark's Root is
      // generic in the collection item, and a `fn | undefined` union at this
      // position defeats inference of that type parameter — the collection then
      // resolves to `ListCollection<unknown>` and stops matching.
      onValueChange={(details) => onValueChange?.(details.value)}
      selectionMode={selectionMode}
      disabled={disabled}
    >
      {label && <ArkListbox.Label className="listbox__label">{label}</ArkListbox.Label>}
      <ArkListbox.Content className="listbox__content">
        {groups.map(([group, groupItems]) => {
          const items = groupItems.map((item) => (
            <ArkListbox.Item key={item.value} item={item} className="listbox__item">
              <ArkListbox.ItemText className="listbox__item-text">{item.label}</ArkListbox.ItemText>
              <ArkListbox.ItemIndicator className="listbox__item-indicator">
                <Icon name="check" size={iconSize} />
              </ArkListbox.ItemIndicator>
            </ArkListbox.Item>
          ));

          // An ungrouped bucket must not be wrapped in an ItemGroup — that would
          // announce a group with no name to a screen reader.
          if (group == null) return items;

          return (
            <ArkListbox.ItemGroup key={group} className="listbox__group">
              <ArkListbox.ItemGroupLabel className="listbox__group-label">
                {group}
              </ArkListbox.ItemGroupLabel>
              {items}
            </ArkListbox.ItemGroup>
          );
        })}
        {/* A `listbox` must own `option` or `group` children, and with no items
            it had neither — axe rates that critical, because a screen reader
            entering the list is told it is a listbox and then finds nothing in
            it. A disabled option is the conventional answer: the list is never
            childless, and what the user hears ("No results, dimmed") is true.

            Rendered directly rather than through `ArkListbox.Empty`, which
            hard-codes `role="presentation"` and ignores a `role` prop — the
            element it produces is exactly the child the rule rejects. */}
        {options.length === 0 && (
          <div role="option" aria-disabled="true" aria-selected="false" className="listbox__empty">
            {emptyMessage}
          </div>
        )}
      </ArkListbox.Content>
    </ArkListbox.Root>
  );
}
