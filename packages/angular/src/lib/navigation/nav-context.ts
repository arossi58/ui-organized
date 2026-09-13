import { Injectable, computed, signal, type Signal } from "@angular/core";

/**
 * Sidebar-level state shared with every `UioNavItem` below it, so one toggle
 * drives the whole rail without a `collapsed` on each item.
 *
 * ── Why it holds a *source* signal rather than a value ──────────────────────
 *
 * The obvious shape — a `WritableSignal<boolean>` the sidebar pushes into from
 * an effect — is wrong by one frame. Effects run *after* change detection, so
 * the items would render with the previous rail state and correct themselves on
 * the following pass: a collapse toggle that visibly lags a frame behind the
 * container it collapses.
 *
 * Connecting the sidebar's own signal instead makes the items read the same
 * signal the sidebar does, so there is no propagation step to be late. The
 * default source is what an item rendered outside any sidebar gets — the
 * uncollapsed shape rather than a crash.
 */
@Injectable()
export class UioNavContext {
  private readonly source = signal<Signal<boolean>>(signal(false));

  /** Read by every `UioNavItem`. */
  readonly collapsed = computed(() => this.source()());

  /** Called by the container that owns the rail, from its constructor. */
  connect(source: Signal<boolean>): void {
    this.source.set(source);
  }
}
