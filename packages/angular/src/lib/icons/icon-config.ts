import { InjectionToken, inject, signal, type Provider, type Signal } from "@angular/core";
import { DEFAULT_ICON_CONFIG, type IconConfig } from "@ui-organized/core";
import type { IconComponent } from "./registry.js";

export type UioIconConfig = IconConfig<IconComponent>;

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

export function provideIconConfig(config: Partial<UioIconConfig>): Provider {
  return {
    provide: UIO_ICON_CONFIG,
    useValue: signal({ ...DEFAULT_ICON_CONFIG, ...config } as UioIconConfig),
  };
}

export function injectIconConfig(): Signal<UioIconConfig> {
  return inject(UIO_ICON_CONFIG);
}
