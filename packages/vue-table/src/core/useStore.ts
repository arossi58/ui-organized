import { onScopeDispose, shallowRef, type ShallowRef } from "vue";
import type { Store } from "@ui-organized/table-core";

/**
 * Binds one of core's framework-free stores to Vue reactivity.
 *
 * `@ui-organized/table-core`'s `state.ts` predicted this binding in its own
 * header — "Vue would bind the same three functions with `shallowRef` +
 * `onScopeDispose`" — and that is what this is. The store's two invariants are
 * what make it safe: `getState()` returns the same reference until something
 * actually changes, and a no-op action notifies nobody. So a `shallowRef` mirror
 * only ever changes when the state did.
 *
 * `shallowRef`, not `ref`: the state objects are plain data that is always
 * replaced wholesale, and deep reactivity would proxy every draft value a user
 * types into an inline editor for no benefit.
 */
export function useStore<S, A>(store: Store<S, A>): ShallowRef<S> {
  const state = shallowRef(store.getState()) as ShallowRef<S>;
  const unsubscribe = store.subscribe(() => {
    state.value = store.getState();
  });
  onScopeDispose(unsubscribe);
  return state;
}
