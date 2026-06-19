import { Collapsible as ArkCollapsible } from "@ark-ui/react";
import { clsx } from "clsx";
import type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
} from "./Collapsible.types.js";
import "./Collapsible.css";

/** Collapsible root — controls the open state of a single disclosure section. */
export function Collapsible({ className, onOpenChange, ...props }: CollapsibleProps) {
  return (
    <ArkCollapsible.Root
      className={clsx("collapsible", className)}
      onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
      {...props}
    />
  );
}

/** Button that toggles the panel. Use `render` to project a custom trigger. */
export function CollapsibleTrigger({ className, render, ...props }: CollapsibleTriggerProps) {
  if (render) {
    return (
      <ArkCollapsible.Trigger asChild className={clsx("collapsible__trigger", className)} {...props}>
        {render}
      </ArkCollapsible.Trigger>
    );
  }
  return <ArkCollapsible.Trigger className={clsx("collapsible__trigger", className)} {...props} />;
}

/** The region revealed when open. Height is animated by Ark via `--height`. */
export function CollapsibleContent({
  className,
  children,
  render,
  ...props
}: CollapsibleContentProps) {
  if (render) {
    return (
      <ArkCollapsible.Content asChild className={clsx("collapsible__panel", className)} {...props}>
        {render}
      </ArkCollapsible.Content>
    );
  }
  return (
    <ArkCollapsible.Content className={clsx("collapsible__panel", className)} {...props}>
      <div className="collapsible__content">{children}</div>
    </ArkCollapsible.Content>
  );
}
