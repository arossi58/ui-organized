import { Injectable, computed, signal } from "@angular/core";
import { nextMachineId } from "../part-ids.js";

/**
 * The identity a dialog's parts share, and the two references its content
 * cannot make up.
 *
 * Ark names the popup after whichever of Title and Description are rendered, and
 * *omits* the reference when the part is absent — a Select-in-a-Dialog has a
 * title and no description, and Ark emits `aria-labelledby` alone. A dangling
 * IDREF is not a cosmetic difference: it outranks any `aria-label` beside it, so
 * a popup naming a title that does not exist reaches a screen reader unnamed.
 *
 * The parts are content children of `<uio-dialog>`, so they are constructed with
 * the caller's view — before any binding in this component is evaluated — and
 * registering in a constructor is therefore early enough to be read in the same
 * pass. Same arrangement as `UioFieldContext`, and for the same reason.
 */
@Injectable()
export class UioDialogContext {
  private readonly machine = nextMachineId();

  private readonly titled = signal(false);
  private readonly described = signal(false);

  partId(part: string): string {
    return `dialog:${this.machine}:${part}`;
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
