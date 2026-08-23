import {
  InjectionToken,
  computed,
  inject,
  isSignal,
  signal,
  type Provider,
  type Signal,
} from "@angular/core";
import { DEFAULT_ICON_CONFIG, type IconConfig } from "@ui-organized/core";
import type { IconMarkup } from "./registry.js";

export type UioIconConfig = IconConfig<IconMarkup>;

/**
 * The icon configuration for a part of the application.
 *
 * The other three libraries express this as a context provider component. In
 * Angular the same idea is a DI provider, so it is a function rather than a
 * component — `provideIconConfig()` at the application, or on a route or a
 * component's own `providers` to override a subtree. That is the framework's own
 * idiom for exactly this, and wrapping the app in a component to carry
 * configuration would be a React shape written in Angular.
 *
 * Note the prop is `style`, spelled the same as React and Svelte. Vue is the odd
 * one out and cannot be — see the note in its `IconProvider.vue`.
 */
export const UIO_ICON_CONFIG = new InjectionToken<Signal<UioIconConfig>>("uio icon config", {
  providedIn: "root",
  factory: () => signal({ ...DEFAULT_ICON_CONFIG } as UioIconConfig),
});

/**
 * `config` may be a signal, and usually should be for anything a user can
 * change.
 *
 * The other three libraries carry this on a provider *component*, so a theme
 * switcher flipping `style` to "solid" re-renders every icon below it for free.
 * A plain object frozen into a `useValue` cannot do that — the icons on the page
 * would keep the weight they were born with. Accepting a signal keeps the same
 * behaviour available in the idiom Angular actually uses.
 */
export function provideIconConfig(
  config: Partial<UioIconConfig> | Signal<Partial<UioIconConfig>>,
): Provider {
  const resolved = isSignal(config)
    ? computed(() => ({ ...DEFAULT_ICON_CONFIG, ...config() }) as UioIconConfig)
    : signal({ ...DEFAULT_ICON_CONFIG, ...config } as UioIconConfig);
  return { provide: UIO_ICON_CONFIG, useValue: resolved };
}

export function injectIconConfig(): Signal<UioIconConfig> {
  return inject(UIO_ICON_CONFIG);
}
