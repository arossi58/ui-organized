import { DestroyRef, inject, signal, type Signal } from "@angular/core";
import type { Store } from "@ui-organized/table-core";

/**
 * Binds one of core's framework-free stores to Angular signals.
 *
 * `@ui-organized/table-core`'s `state.ts` chose `{ getState, subscribe,
 * dispatch }` because it is exactly what React's `useSyncExternalStore` wants —
 * and the shape turns out to cost nothing anywhere else: Vue mirrors it with a
 * `shallowRef`, Svelte with `$state`, and this with a `signal`.
 *
 * The store's two invariants are what make it safe: `getState()` returns the
 * same reference until something actually changes, and a no-op action notifies
 * nobody. So the mirror only ever changes when the state did.
 *
 * `DestroyRef` rather than `ngOnDestroy`, because this is called from an
 * injection context rather than from a class that has lifecycle hooks.
 */
export function trackStore<S, A>(store: Store<S, A>): Signal<S> {
  const state = signal<S>(store.getState());
  const unsubscribe = store.subscribe(() => state.set(store.getState()));
  inject(DestroyRef).onDestroy(unsubscribe);
  return state.asReadonly();
}
