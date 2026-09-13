/**
 * The framework-free store the behaviour state machines are built on.
 *
 * `{ getState, subscribe, dispatch }` is deliberately the exact shape React's
 * `useSyncExternalStore` wants, because React is the adapter that exists today —
 * but nothing here knows that. Vue would bind the same three functions with
 * `shallowRef` + `onScopeDispose`, Svelte with a `readable`.
 *
 * Two invariants make external-store subscriptions safe:
 *
 * 1. `getState()` returns the *same reference* until something actually
 *    changes. React re-renders on reference inequality, so a reducer that
 *    rebuilds an identical object on every keystroke produces an infinite
 *    render loop rather than a no-op.
 * 2. A reducer that decides an action is a no-op returns its input state
 *    unchanged, and `dispatch` then skips notifying listeners entirely.
 */

export interface Store<S, A> {
  /** The current state. Stable by reference between changes. */
  getState: () => S;
  /** Subscribe to changes; returns the unsubscribe function. */
  subscribe: (listener: () => void) => () => void;
  /** Apply an action. Listeners fire only if the state reference changed. */
  dispatch: (action: A) => void;
}

export type Reducer<S, A> = (state: S, action: A) => S;

export function createStore<S, A>(initial: S, reduce: Reducer<S, A>): Store<S, A> {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispatch(action) {
      const next = reduce(state, action);
      if (Object.is(next, state)) return;
      state = next;
      // Copied before iterating: a listener that unsubscribes itself during the
      // notification pass would otherwise mutate the set mid-iteration.
      for (const listener of [...listeners]) listener();
    },
  };
}
