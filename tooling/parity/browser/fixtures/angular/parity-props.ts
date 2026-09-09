import { InjectionToken, inject } from "@angular/core";

/**
 * The scenario's props, handed to a fixture by injection rather than by input.
 *
 * Inputs would be the obvious choice and do not work: these fixtures are
 * compiled by Angular's JIT compiler, which never registers initializer-based
 * inputs — `input()` is read for its default and nothing binds to it. The
 * *library* components the fixtures render are compiled ahead of time by
 * ng-packagr, so their inputs are real and the bindings inside these templates
 * work normally. It is only the fixture's own boundary that has to be crossed
 * some other way, and a provider is the least surprising one.
 */
export const PARITY_PROPS = new InjectionToken<Record<string, any>>("parity props");

export function parityProps(): Record<string, any> {
  return inject(PARITY_PROPS);
}

/** The selector every fixture uses, so the harness can bootstrap into `#mount`. */
export const ANGULAR_ROOT = "[data-angular-root]";
