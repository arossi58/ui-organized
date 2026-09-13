import { Directive, booleanAttribute, computed, inject, input, type Signal } from "@angular/core";
import { UioPart } from "../part.js";
import { nextMachineId } from "../part-ids.js";

/**
 * Groups related fields under a shared legend.
 *
 * ```html
 * <fieldset uioFieldset [disabled]="!editing()">
 *   <legend uioFieldsetLegend>Contact</legend>
 *   <div uioField>…</div>
 *   <div uioField>…</div>
 * </fieldset>
 * ```
 *
 * ── Why it is a directive on a real `fieldset` ──────────────────────────────
 *
 * `<fieldset disabled>` is one of the few genuinely useful native behaviours
 * left in HTML: it disables every form control below it, and it does so in the
 * browser rather than in any framework. A `<uio-fieldset>` wrapper would throw
 * that away and have to re-implement it — so the caller writes the element and
 * this decorates it, which is also what makes `[disabled]` here a real
 * attribute rather than only a styling hook.
 *
 * ── The legend's id is always referenced, present or not ────────────────────
 *
 * Ark names the legend from the root unconditionally — `aria-labelledby` is
 * built from the id it *would* have — so a fieldset written without a legend
 * carries a reference to nothing. That is upstream behaviour and this
 * reproduces it, because the parity gate compares Angular against React and a
 * fieldset is not much use without its legend anyway. Write the legend.
 */
@Directive({
  selector: "fieldset[uioFieldset]",
  standalone: true,
  exportAs: "uioFieldset",
  host: {
    class: "fieldset",
    // The property, not `attr.disabled`: `disabled` reflects, and binding the
    // property is what gives the descendant controls the native behaviour.
    "[disabled]": "disabled()",
    "[attr.aria-labelledby]": "legendId",
  },
})
export class UioFieldset extends UioPart {
  readonly scope = "fieldset";
  readonly part = "root";

  override readonly disabled = input(false, { transform: booleanAttribute });
  override readonly invalid = input(false, { transform: booleanAttribute });

  /**
   * `<scope>:<machine>:<part>`, this package's shape for every hand-written id.
   *
   * Ark spells this one `fieldset::<id>::legend` rather than the single-colon
   * form its Field uses, which is a wrinkle in Ark and not a contract: the
   * parity gate numbers ids positionally, so what is compared is that the
   * root's `aria-labelledby` names *this legend* and nothing else.
   */
  readonly legendId = `fieldset:${nextMachineId()}:legend`;
}

/**
 * Names the fieldset, and greys along with it.
 *
 * Both state attributes are repeated here rather than left to the root, because
 * that is what Ark emits and the shared stylesheet is free to select on either.
 */
@Directive({
  selector: "legend[uioFieldsetLegend]",
  standalone: true,
  host: {
    class: "fieldset__legend",
    "[id]": "fieldset.legendId",
  },
})
export class UioFieldsetLegend extends UioPart {
  readonly scope = "fieldset";
  readonly part = "legend";

  protected readonly fieldset = inject(UioFieldset);
  override readonly disabled: Signal<boolean> = this.fieldset.disabled;
  override readonly invalid: Signal<boolean> = this.fieldset.invalid;
}

/**
 * A component's own `disabled`, OR'd with any enclosing fieldset's.
 *
 * The behaviour Ark gives React and Svelte for free — `disabled ??
 * Boolean(fieldset?.disabled)` in their `useField` — and which Angular has to
 * write, because it has no Zag. It matters more here than it looks: the native
 * `<fieldset disabled>` already makes every descendant control dead, so a
 * component that does not inherit the flag renders an *ungreyed* control that
 * cannot be used, which is worse than either state on its own.
 *
 * Call it from an injection context — a field initialiser or a constructor.
 * Returns the signal it was given, unchanged, when there is no fieldset above,
 * so nothing outside one pays for it.
 */
export function withFieldsetDisabled(own: Signal<boolean>): Signal<boolean> {
  const fieldset = inject(UioFieldset, { optional: true });
  return fieldset ? computed(() => own() || fieldset.disabled()) : own;
}
