import type { Store } from "@ui-organized/table-core";

/**
 * Binds one of core's framework-free stores to Svelte 5 runes.
 *
 * `@ui-organized/table-core`'s `state.ts` predicted this binding in its own
 * header — "Svelte with a `readable`" — and Svelte 5 makes it simpler than that:
 * `$state` plus the store's own subscription, with no store contract in between.
 *
 * The store's two invariants are what make it safe: `getState()` returns the
 * same reference until something actually changes, and a no-op action notifies
 * nobody. So the mirror only ever changes when the state did.
 *
 * `$effect` rather than a bare `subscribe`, so the subscription is torn down
 * with the component that created it.
 *
 * Named `trackStore` rather than `useStore`, which is what the React and Vue
 * packages call it: `use*` is those two frameworks' convention, and here it only
 * succeeds in making `eslint-plugin-react-hooks` treat a Svelte function as a
 * React hook and complain that it is called in the wrong place.
 */
export function trackStore<S, A>(store: Store<S, A>): { readonly current: S } {
  let snapshot = $state(store.getState());

  $effect(() => store.subscribe(() => (snapshot = store.getState())));

  return {
    get current() {
      return snapshot;
    },
  };
}
