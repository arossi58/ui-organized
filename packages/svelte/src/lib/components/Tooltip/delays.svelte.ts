/**
 * Shared open/close delays for descendant tooltips.
 *
 * Ark UI has no app-level delay provider — delays are per-tooltip Root props —
 * so this facade supplies the contract itself, exactly as the React package
 * does with a context. Held as an accessor so a provider driven by reactive
 * props keeps its descendants current.
 */
import { getContext, setContext } from "svelte";

export interface TooltipDelays {
  delay?: number;
  closeDelay?: number;
}

const KEY = Symbol("ui-organized.tooltipDelays");

export function setTooltipDelays(read: () => TooltipDelays): void {
  setContext(KEY, read);
}

export function getTooltipDelays(): TooltipDelays {
  return getContext<(() => TooltipDelays) | undefined>(KEY)?.() ?? {};
}
