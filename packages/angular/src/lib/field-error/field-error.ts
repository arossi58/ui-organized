import { Component, effect, inject, input } from "@angular/core";
import { HostPresence } from "../host-presence.js";
import { UioIcon } from "../icons/icon.js";

/**
 * The inline error pill that sits under a form control.
 *
 * ── Why the message is an input, not projected content ──────────────────────
 *
 * React takes it as children and returns `null` when it is empty. Svelte and Vue
 * take a `message` prop instead, because a snippet or a slot is opaque — an
 * always-present one that happens to render nothing still reads as "I have
 * content", and that produced an empty pill. Angular has the same problem with
 * `<ng-content>`, so it takes the same answer.
 *
 * ```html
 * <span uioFieldError [message]="form.controls.email.errors?.['required']"></span>
 * ```
 */
@Component({
  selector: "span[uioFieldError]",
  providers: [HostPresence],
  standalone: true,
  imports: [UioIcon],
  template: `<span uioIcon class="field-error__icon" name="alert-circle" [size]="ICON_SIZE"></span
    >{{ message() }}`,
  host: { class: "field-error text-emphasis-caption" },
})
export class UioFieldError {
  readonly message = input<string | undefined | null>(undefined);

  protected readonly ICON_SIZE = 12;
  private readonly presence = inject(HostPresence);

  constructor() {
    // An empty message renders nothing at all — not an empty pill, which would
    // hold space and a background colour. See HostPresence.
    effect(() => this.presence.set(!!this.message()));
  }
}
