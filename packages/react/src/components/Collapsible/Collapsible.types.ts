import type * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui-components/react/collapsible";

/** Restrict Base UI's `className` (string | fn) to a plain string for styled parts. */
type StringClassName = { className?: string };

export type CollapsibleProps = Omit<
  React.ComponentProps<typeof BaseCollapsible.Root>,
  "className"
> &
  StringClassName;

export type CollapsibleTriggerProps = Omit<
  React.ComponentProps<typeof BaseCollapsible.Trigger>,
  "className"
> &
  StringClassName;

export type CollapsibleContentProps = Omit<
  React.ComponentProps<typeof BaseCollapsible.Panel>,
  "className"
> &
  StringClassName;
