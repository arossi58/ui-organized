import type { ApplicationRef } from "@angular/core";

/**
 * Bring the DOM up to date *now*, the way React does when a discrete event
 * changes state.
 *
 * ── Why an overlay needs this and a checkbox does not ───────────────────────
 *
 * React 18 flushes a state update from a discrete event — a click, a keypress —
 * synchronously, before the event handler returns. Angular's zoneless scheduler
 * does not: a signal write notifies the scheduler, which runs change detection
 * on the next task. Around 5ms later, in practice.
 *
 * For a checkbox nobody can tell. For an overlay it is the difference between
 * two libraries agreeing and not, because an overlay's state is spread across
 * elements that are refreshed by *different* views: the trigger's
 * `aria-expanded` belongs to the caller's view, the popup's `data-state` to a
 * portalled embedded view, and the `aria-hidden` marks on the rest of the page
 * are written by hand. Anything that reads the DOM straight after the keypress —
 * the parity gate does exactly that, and so does any test a consumer writes —
 * sees them mid-flight.
 *
 * So a user interaction flushes. The declarative path (`[open]="editing()"`)
 * does not need to: it is already inside a change-detection pass, and the
 * `catch` below is what makes calling this from one harmless — Angular refuses a
 * recursive `tick()`, and a caller who is already in a pass has one coming
 * anyway.
 */
export function flushNow(appRef: ApplicationRef): void {
  try {
    appRef.tick();
  } catch {
    // Recursive tick: the change is already scheduled to land in the pass that
    // is running. Nothing is lost, only the immediacy.
  }
}
