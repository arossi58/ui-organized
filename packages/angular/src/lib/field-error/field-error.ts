import { Component, computed, effect, inject, input } from "@angular/core";
import { HostPresence } from "../host-presence.js";
import { UioIcon } from "../icons/icon.js";
import { UioFieldContext } from "../field/field-context.js";

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
 *
 * ── Inside a field it becomes a part of one ─────────────────────────────────
 *
 * React composes this by handing Ark's `Field.ErrorText` an `asChild` and
 * letting it merge its part identity onto this element. Angular has no
 * `asChild` and cannot put two components on one host element, so the merge
 * happens the other way round: this component asks for a `UioFieldContext`, and
 * when there is one it takes the field's `error-text` id, announces itself
 * politely, and shows only while the field is invalid — exactly what Ark's
 * ErrorText does. Outside a field none of that is bound and it is the plain
 * pill it was before.
 */
@Component({
  selector: "span[uioFieldError]",
  providers: [HostPresence],
  standalone: true,
  imports: [UioIcon],
  template: `<span uioIcon class="field-error__icon" name="alert-circle" [size]="ICON_SIZE"></span
    >{{ message() }}`,
  host: {
    class: "field-error text-emphasis-caption",
    "[attr.id]": "field ? field.partId('error-text') : null",
    "[attr.data-scope]": "field ? 'field' : null",
    "[attr.data-part]": "field ? 'error-text' : null",
    "[attr.aria-live]": "field ? 'polite' : null",
  },
})
export class UioFieldError {
  readonly message = input<string | undefined | null>(undefined);

  protected readonly ICON_SIZE = 12;
  protected readonly field = inject(UioFieldContext, { optional: true });
  private readonly presence = inject(HostPresence);

  /** A valid field has no error to show, whatever message it is holding. */
  private readonly present = computed(() => !!this.message() && (this.field?.invalid() ?? true));

  constructor() {
    this.field?.describe("error-text", this.present);
    // An empty message renders nothing at all — not an empty pill, which would
    // hold space and a background colour. See HostPresence.
    effect(() => this.presence.set(this.present()));
  }
}
