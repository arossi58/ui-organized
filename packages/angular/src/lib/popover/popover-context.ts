import { Injectable, computed, signal } from "@angular/core";
import { nextMachineId } from "../part-ids.js";

/**
 * A popover's identity, and the two references its content earns by existing.
 *
 * Ark gives the popup `role="dialog"`, which needs an accessible name, and
 * points `aria-labelledby` at the Title part when one is rendered. Without a
 * title *and* without an `aria-label`, a popover reaches a screen reader as an
 * unnamed dialog — so the reference is dropped rather than left dangling, for
 * the reason `OMIT_ARIA` in `@ui-organized/core` sets out: a dangling IDREF
 * outranks any `aria-label` beside it.
 *
 * Ark spells the description part's id `desc`, not `description`. The literal is
 * not the contract — every library generates its own — but keeping the shape
 * costs nothing and makes two DOM trees readable side by side.
 */
@Injectable()
export class UioPopoverContext {
  private readonly machine = nextMachineId();

  private readonly titled = signal(false);
  private readonly described = signal(false);

  get machineId(): string {
    return this.machine;
  }

  partId(part: string): string {
    return `popover:${this.machine}:${part}`;
  }

  registerTitle(): void {
    this.titled.set(true);
  }
  registerDescription(): void {
    this.described.set(true);
  }

  readonly labelledBy = computed(() => (this.titled() ? this.partId("title") : null));
  readonly describedBy = computed(() => (this.described() ? this.partId("desc") : null));
}
