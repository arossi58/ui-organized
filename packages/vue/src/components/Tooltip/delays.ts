/**
 * Shared open/close delays for descendant tooltips.
 *
 * Ark UI has no app-level delay provider — delays are per-tooltip Root props —
 * so this facade supplies the contract itself, exactly as the React and Svelte
 * packages do. Provided as a ref so a provider driven by reactive props keeps
 * its descendants current.
 */
import { inject, provide, type InjectionKey, type Ref } from "vue";

export interface TooltipDelays {
  delay?: number;
  closeDelay?: number;
}

const KEY: InjectionKey<Ref<TooltipDelays>> = Symbol("ui-organized.tooltipDelays");

export function provideTooltipDelays(delays: Ref<TooltipDelays>): void {
  provide(KEY, delays);
}

export function useTooltipDelays(): Ref<TooltipDelays> | undefined {
  return inject(KEY, undefined);
}
