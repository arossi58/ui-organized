import { clsx } from "clsx";
import { itemGroupStyles } from "@ui-organized/core";
import { ItemGroupContext } from "./ItemGroupContext.js";
import type { ItemGroupProps } from "./Item.types.js";
import "@ui-organized/core/components/Item/Item.css";

/** Rows that belong together, as a list: each Item inside is one of its list items. */
export function ItemGroup({
  variant = "plain",
  divided = true,
  className,
  children,
  ...props
}: ItemGroupProps) {
  return (
    <ItemGroupContext.Provider value={true}>
      <div
        role="list"
        className={clsx(itemGroupStyles({ variant, divided }), className)}
        {...props}
      >
        {children}
      </div>
    </ItemGroupContext.Provider>
  );
}
