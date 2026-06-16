import type * as React from "react";
import { Menubar as BaseMenubar } from "@base-ui-components/react/menubar";

/** Restrict Base UI's `className` (string | fn) to a plain string for styled parts. */
type StringClassName = { className?: string };

export type MenubarProps = Omit<
  React.ComponentProps<typeof BaseMenubar>,
  "className"
> &
  StringClassName;
