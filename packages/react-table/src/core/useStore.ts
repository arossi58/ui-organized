import { useSyncExternalStore } from "react";
import type { Store } from "@ui-organized/table-core";

/**
 * Binds one of core's framework-free stores to React.
 *
 * `useSyncExternalStore` wants exactly `{ subscribe, getState }`, which is why
 * core's stores have that shape — and why binding one is three lines rather
 * than a mirror of the state in `useState` that has to be kept in sync.
 *
 * The third argument is the server snapshot: the same getter, because these
 * stores hold interaction state which is identical (and empty) on the server.
 */
export function useStore<S, A>(store: Store<S, A>): S {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}
