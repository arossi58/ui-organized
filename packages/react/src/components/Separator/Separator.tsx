import { Separator as BaseSeparator } from "@base-ui-components/react/separator";
import { clsx } from "clsx";
import { separatorStyles } from "./Separator.styles.js";
import type { SeparatorProps } from "./Separator.types.js";
import "./Separator.css";

export function Separator({
  orientation = "horizontal",
  spacing,
  className,
  ...props
}: SeparatorProps) {
  return (
    <BaseSeparator
      orientation={orientation}
      className={clsx(separatorStyles({ orientation, spacing }), className)}
      {...props}
    />
  );
}
