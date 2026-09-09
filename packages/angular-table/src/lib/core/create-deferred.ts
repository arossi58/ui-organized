import {
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  type Signal,
} from "@angular/core";

/**
 * Angular's answer to React's `useDeferredValue`, which Angular does not have.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 *
 * The React table splits every expensive filter into two values: the condition
 * list and the search string update **urgently**, so a controlled input never
 * lags a keystroke, while the row-model pass they drive reads a *deferred* copy.
 * The React adapter records what happens without the split — typing "ada" landed
 * as "a".
 *
 * Angular has no priority scheduler either. This is a deliberate transcription
 * of the answer `@ui-organized/vue-table` and `@ui-organized/svelte-table`
 * already give, rather than a third design: the trade-offs are identical, and
 * three answers to one problem in one design system would be a defect in itself.
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

export function createDeferred<T>(source: () => T): Signal<T> {
  /**
   * `null` until something has actually been deferred, and the view below falls
   * through to the source while it is.
   *
   * The obvious spelling — `signal(untracked(source))` — reads the source at
   * *construction*, and this factory can be constructed before the host
   * component's inputs are set (see the `linkedSignal` note in
   * `./create-data-table.ts`). Falling through instead gives the same answer,
   * because the initial deferred value *is* the source value, and reads nothing
   * until someone asks.
   */
  const landed = signal<{ value: T } | null>(null);
  let cancel: Cancel | null = null;

  effect(() => {
    const value = source();
    cancel?.();
    cancel = scheduleIdle(() => {
      cancel = null;
      landed.set({ value });
    });
  });

  inject(DestroyRef).onDestroy(() => cancel?.());
  return computed(() => landed()?.value ?? untracked(source));
}
