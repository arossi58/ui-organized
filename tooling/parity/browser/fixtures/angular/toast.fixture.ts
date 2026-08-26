import { Component, inject } from "@angular/core";
import { UioToaster, type ToastOptions } from "@ui-organized/angular";
import { ANGULAR_ROOT, parityProps } from "./parity-props.js";

/**
 * A button, because there is no such thing as a statically rendered toast.
 *
 * The React fixture wraps the same button in `<ToastProvider>`, which is what
 * renders its region. Angular's region is created by the service on the first
 * `add`, into a CDK overlay — so there is nothing to wrap and no provider to
 * place, which is the whole point of `UioToaster` being a root service. See its
 * class note.
 */
@Component({
  selector: ANGULAR_ROOT,
  standalone: true,
  template: `<button id="fire" (click)="fire()">Fire</button>`,
})
export class ToastFixture {
  private readonly p = parityProps();
  private readonly toaster = inject(UioToaster);

  protected fire(): void {
    for (const options of (this.p["toasts"] ?? []) as ToastOptions[]) {
      this.toaster.add(options);
    }
  }
}
