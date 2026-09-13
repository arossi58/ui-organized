import { onScopeDispose, shallowRef, watch, type Ref } from "vue";

/**
 * Vue's answer to React's `useDeferredValue`, which Vue does not have.
 *
 * ── Why this file exists at all ─────────────────────────────────────────────
 *
 * The React table splits every expensive filter into two values: the condition
 * list and the search string update **urgently**, so a controlled input never
 * lags a keystroke, while the row-model pass they drive reads a *deferred* copy
 * and happens at the renderer's convenience. `useDataTable.ts` records what
 * happens without the split — dispatching inside a transition made a controlled
 * input lag behind the keystrokes, and typing "ada" landed as "a".
 *
 * Vue has no priority scheduler and nothing equivalent to `startTransition`, so
 * that split has to be built. This is it, and it is deliberately the *smallest*
 * thing that preserves the property that matters:
 *
 *   - The **source** stays urgent. Inputs bind to it directly, so typing is
 *     never delayed by anything and never drops a character.
 *   - The **mirror** lags by one idle beat, and only the filtering reads it.
 *
 * ── Why idle rather than a debounce ─────────────────────────────────────────
 *
 * A debounce with a fixed delay is the obvious spelling and is worse in both
 * directions: too short and it does nothing on a busy machine, too long and a
 * fast typist watches the table sit still after they have stopped. Yielding to
 * the browser's own idea of idle is the same trade React makes, and it adapts —
 * on an unloaded machine the mirror lands on the very next frame.
 *
 * The `timeout` matters as much as the callback: a table being scrolled while
 * someone types keeps the main thread busy indefinitely, and without a deadline
 * the filter would never run. 100ms is under the threshold at which a change
 * stops feeling like a response to the keystroke.
 *
 * ── Coalescing ──────────────────────────────────────────────────────────────
 *
 * Each new source value cancels the pending task, so a burst of keystrokes costs
 * one filter pass rather than one per character. That is the behaviour React's
 * scheduler produces too, and it is most of why the split is worth having.
 *
 * ── Where it must not defer ─────────────────────────────────────────────────
 *
 * The initial value is taken synchronously, not scheduled. A table seeded with
 * `defaultFilters` has to render filtered on its very first pass — on the server
 * as well, where there is no scheduler and the watcher never fires at all.
 */

type Cancel = () => void;

/** `requestIdleCallback`, with the two fallbacks that keep this honest. */
function scheduleIdle(run: () => void): Cancel {
  // SSR and jsdom: no scheduler, and no rendering to protect either. A
  // microtask keeps the mirror one tick behind, which is enough for the watcher
  // contract and costs nothing.
  if (typeof window === "undefined") {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) run();
    });
    return () => {
      cancelled = true;
    };
  }
  const request = window.requestIdleCallback;
  if (typeof request === "function") {
    const handle = request(() => run(), { timeout: IDLE_TIMEOUT });
    return () => window.cancelIdleCallback?.(handle);
  }
  // Safari has no requestIdleCallback. A macrotask still yields to paint and to
  // input, which is the property being bought here.
  const handle = window.setTimeout(run, 0);
  return () => window.clearTimeout(handle);
}

/** Long enough to coalesce a burst of typing, short enough to feel caused by it. */
const IDLE_TIMEOUT = 100;

export function useDeferred<T>(source: () => T): Readonly<Ref<T>> {
  const deferred = shallowRef(source()) as Ref<T>;
  let cancel: Cancel | null = null;

  const clear = () => {
    cancel?.();
    cancel = null;
  };

  watch(source, (value) => {
    clear();
    cancel = scheduleIdle(() => {
      cancel = null;
      deferred.value = value;
    });
  });

  onScopeDispose(clear);
  return deferred;
}
