import { Injectable, computed, signal } from "@angular/core";
import { nextMachineId } from "../part-ids.js";

/**
 * The identity a drawer's parts share, and the two references its content
 * cannot make up. The Dialog's arrangement (see `UioDialogContext`) under the
 * drawer's own scope: Ark's drawer is its own machine, so its parts report
 * `data-scope="drawer"` and ids of the form `drawer:<machine>:<part>`.
 */
@Injectable()
export class UioDrawerContext {
  private readonly machine = nextMachineId();

  private readonly titled = signal(false);
  private readonly described = signal(false);

  partId(part: string): string {
    return `drawer:${this.machine}:${part}`;
  }

  /** Ark's machine reference, which the trigger reports as `data-ownedby`. */
  get machineId(): string {
    return this.machine;
  }

  registerTitle(): void {
    this.titled.set(true);
  }
  registerDescription(): void {
    this.described.set(true);
  }

  readonly labelledBy = computed(() => (this.titled() ? this.partId("title") : null));
  readonly describedBy = computed(() => (this.described() ? this.partId("description") : null));
}
