import { clsx } from "clsx";
import { Button, Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-organized/react";
import type { CanonicalIconName } from "@ui-organized/utils";
import { useTableContext } from "../../core/TableContext.js";
import type { TableRowActionsProps } from "./TableRowActions.types.js";
import type { RowData } from "@ui-organized/table-core";

/**
 * Per-row actions, as a menu rather than a row of buttons.
 *
 * A menu is one tab stop per row instead of three, which matters a great deal
 * when there are two hundred rows — and it is the only affordance that survives
 * card mode unchanged.
 */
export function TableRowActions<T extends RowData>({
  row,
  actions,
  label = "Row actions",
  className,
}: TableRowActionsProps<T>) {
  const table = useTableContext<T>();
  const items = actions ?? table.options.rowActions ?? [];
  if (items.length === 0) return null;

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            intent="ghost"
            size={table.size}
            icon="menu"
            aria-label={label}
            className={clsx(className)}
          />
        }
      />
      <MenuContent align="end">
        {items.map((action) => (
          <MenuItem
            key={action.id}
            value={action.id}
            icon={action.icon as CanonicalIconName | undefined}
            destructive={action.destructive}
            disabled={action.disabled?.(row)}
            onSelect={() => void action.onRun(row)}
          >
            {action.label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
