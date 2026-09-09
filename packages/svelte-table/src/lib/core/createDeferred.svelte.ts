/**
 * Svelte's answer to React's `useDeferredValue`, which Svelte does not have.
 *
 * Named `createDeferred` rather than `useDeferred`, which is what the Vue
 * package calls it: `use*` is a React and Vue convention, and here it only makes
 * `eslint-plugin-react-hooks` treat a Svelte function as a React hook.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 *
 * The React table splits every expensive filter into two values: the condition
 * list and the search string update **urgently**, so a controlled input never
 * lags a keystroke, while the row-model pass they drive reads a *deferred* copy.
 * `useDataTable.ts` in the React package records what happens without the split
 * — typing "ada" landed as "a".
 *
 * Svelte has no priority scheduler. Neither does Vue, and this is a deliberate
 * transcription of `@ui-organized/vue-table`'s `useDeferred` rather than a
 * second design: the trade-offs are identical and two different answers to the
 * same problem in one design system would be a defect in itself.
 *
 *   - The **source** stays urgent. Inputs bind to it directly, so typing is
 *     never delayed and never drops a character.
 *   - The **mirror** lags by one idle beat, and only the filtering reads it.
 *   - A burst of keystrokes **coalesces** into one filter pass.
 *   - The initial value is taken **synchronously**, because a table seeded with
 *     `defaultFilters` has to render filtered on its first pass — on the server
 *     too, where nothing is ever scheduled.
 *
 * Idle rather than a debounce because a fixed delay is wrong in both directions:
 * too short and it does nothing on a busy machine, too long and a fast typist
 * watches the table sit still. The deadline matters as much as the callback — a
 * table being scrolled while someone types keeps the main thread busy, and
 * without one the filter would never run.
 */

type Cancel = () => void;

/** Long enough to coalesce a burst of typing, short enough to feel caused by it. */
const IDLE_TIMEOUT = 100;

function scheduleIdle(run: () => void): Cancel {
  // SSR: no scheduler, and no rendering to protect either.
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

export function createDeferred<T>(source: () => T): { readonly current: T } {
  let deferred = $state(source());
  let cancel: Cancel | null = null;

  $effect(() => {
    // Read the source so this effect depends on it, then schedule outside the
    // tracking scope — `untrack` is unnecessary because the callback runs later.
    const value = source();
    cancel?.();
    cancel = scheduleIdle(() => {
      cancel = null;
      deferred = value;
    });
    return () => {
      cancel?.();
      cancel = null;
    };
  });

  return {
    get current() {
      return deferred;
    },
  };
}
