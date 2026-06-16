import { Collapsible as BaseCollapsible } from "@base-ui-components/react/collapsible";
import { clsx } from "clsx";
import type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
} from "./Collapsible.types.js";
import "./Collapsible.css";

/** Collapsible root — controls the open state of a single disclosure section. */
export function Collapsible({ className, ...props }: CollapsibleProps) {
  return <BaseCollapsible.Root className={clsx("collapsible", className)} {...props} />;
}

/** Button that toggles the panel. Use `render` to project a custom trigger. */
export function CollapsibleTrigger({ className, ...props }: CollapsibleTriggerProps) {
  return <BaseCollapsible.Trigger className={clsx("collapsible__trigger", className)} {...props} />;
}

/** The region revealed when open. Height is animated by Base UI. */
export function CollapsibleContent({ className, children, ...props }: CollapsibleContentProps) {
  return (
    <BaseCollapsible.Panel className={clsx("collapsible__panel", className)} {...props}>
      <div className="collapsible__content">{children}</div>
    </BaseCollapsible.Panel>
  );
}
