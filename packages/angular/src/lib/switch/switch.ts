import {
  Component,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  type Signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { UioInteractionState } from "../interaction-state.js";
import { UioPart, stateFlag } from "../part.js";
import { VISUALLY_HIDDEN_INPUT, nextMachineId } from "../part-ids.js";

/**
 * A two-state toggle.
 *
 * ── What this is a proof of ─────────────────────────────────────────────────
 *
 * The first control in this package with a state machine behind it in the other
 * three libraries, and therefore the first to reproduce Ark's rendered contract
 * by hand: the root `<label>` that *is* the control, the `aria-hidden` track and
 * thumb, the visually-hidden input that actually takes focus, and a
 * `data-state` of `checked`/`unchecked` on every part of it. The root extends
 * `UioPart` so its identity and state are declared rather than typed out; the
 * inner parts are written in the template, where they are visible together and
 * the browser parity gate compares every attribute of each.
 *
 * ── The Angular-specific win ────────────────────────────────────────────────
 *
 * `ControlValueAccessor`, so `[(ngModel)]` and Reactive Forms both drive it:
 *
 * ```html
 * <label uioSwitch label="Wifi" formControlName="wifi"></label>
 * <label uioSwitch label="Wifi" [(checked)]="enabled"></label>
 * ```
 *
 * That is a capability the React library does not have, not parity debt. Note
 * there is no `defaultChecked`: `model()` is uncontrolled until something binds
 * it, so `[checked]="true"` is an initial value *and* a bound one, and the
 * controlled/uncontrolled fork React implements by hand does not arise.
 */
@Component({
  selector: "label[uioSwitch]",
  standalone: true,
  // Reports hover and focus so the shared stylesheet can draw a focus ring —
  // see UioInteractionState.
  hostDirectives: [UioInteractionState],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioSwitch), multi: true },
  ],
  template: `
    <span
      class="switch__track"
      data-scope="switch"
      data-part="control"
      aria-hidden="true"
      [id]="partId('control')"
      [attr.data-state]="state()"
      [attr.data-disabled]="flag(disabled())"
      [attr.data-required]="flag(required())"
      [attr.data-hover]="flag(hover())"
      [attr.data-focus]="flag(focus())"
      [attr.data-focus-visible]="flag(focusVisible())"
    >
      <span
        class="switch__thumb"
        data-scope="switch"
        data-part="thumb"
        aria-hidden="true"
        [id]="partId('thumb')"
        [attr.data-state]="state()"
        [attr.data-disabled]="flag(disabled())"
        [attr.data-required]="flag(required())"
        [attr.data-hover]="flag(hover())"
        [attr.data-focus]="flag(focus())"
        [attr.data-focus-visible]="flag(focusVisible())"
      ></span>
    </span>
    @if (label(); as text) {
      <span
        class="switch__label text-default-body-large"
        data-scope="switch"
        data-part="label"
        [id]="partId('label')"
        [attr.data-state]="state()"
        [attr.data-disabled]="flag(disabled())"
        [attr.data-required]="flag(required())"
        [attr.data-hover]="flag(hover())"
        [attr.data-focus]="flag(focus())"
        [attr.data-focus-visible]="flag(focusVisible())"
        >{{ text }}</span
      >
    }
    <!--
      The input is what actually takes focus and what a form submits; the track
      is decorative. Without a label part there is nothing for aria-labelledby
      to name, so it is dropped rather than left dangling — a dangling IDREF
      outranks aria-label, which is the whole reason OMIT_ARIA exists in the
      other three.
    -->
    <input
      type="checkbox"
      value="on"
      [id]="partId('input')"
      [attr.style]="HIDDEN"
      [checked]="checked()"
      [disabled]="disabled()"
      [attr.required]="required() ? '' : null"
      [attr.name]="name()"
      [attr.aria-labelledby]="label() ? partId('label') : null"
      [attr.aria-label]="label() ? null : ariaLabel()"
      (change)="toggle($event)"
      (blur)="onTouched()"
    />
  `,
  host: {
    class: "switch",
    // The root carries an id too — Ark's is `<scope>:<machine>`, with no part
    // suffix — and the label's `for` names the input, which is what actually
    // takes focus.
    "[id]": "rootId",
    "[attr.for]": "partId('input')",
    /**
     * Not on `UioPart`, deliberately. That base declares the vocabulary the
     * *stylesheet* reads, and its spec fails an attribute no CSS selects on —
     * `data-required` is one. Ark emits it anyway, on every part, and the
     * rendered contract is what this package reproduces.
     */
    "[attr.data-required]": "flag(required())",
  },
})
export class UioSwitch extends UioPart implements ControlValueAccessor {
  private readonly interaction = inject(UioInteractionState);
  override readonly hover: Signal<boolean> = this.interaction.hover;
  override readonly focus: Signal<boolean> = this.interaction.focus;
  override readonly focusVisible: Signal<boolean> = this.interaction.focusVisible;

  readonly scope = "switch";
  readonly part = "root";

  readonly checked = model(false);
  readonly label = input<string | undefined>(undefined);
  readonly required = input(false);
  readonly name = input<string | undefined>(undefined);
  /**
   * Declared as `ariaLabel`, written `aria-label` in a template. Only used when
   * there is no visible label — with one, the label element names the control.
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });
  readonly checkedChange = output<boolean>();

  /** `disabled` comes from the caller *or* from a reactive form's disabled state. */
  protected readonly disabledInput = input(false, { alias: "disabled" });
  private readonly formDisabled = signal(false);
  override readonly disabled: Signal<boolean> = computed(
    () => this.disabledInput() || this.formDisabled(),
  );
  override readonly state = computed(() => (this.checked() ? "checked" : "unchecked"));

  /**
   * Ark builds every id as `<scope>:<machine>:<part>`, with the root as
   * `<scope>:<machine>`. The literal values differ per framework and are not the
   * contract — what is, is that the label's `for` names the input and
   * `aria-labelledby` names the label. Same shape, so the same relationships.
   */
  private readonly machine = nextMachineId();
  protected get rootId(): string {
    return `${this.scope}:${this.machine}`;
  }
  protected partId(part: string): string {
    return `${this.scope}:${this.machine}:${part}`;
  }

  protected readonly HIDDEN = VISUALLY_HIDDEN_INPUT;
  protected readonly flag = stateFlag;

  protected onTouched: () => void = () => {};
  private onChange: (value: boolean) => void = () => {};

  protected toggle(event: Event): void {
    const next = (event.target as HTMLInputElement).checked;
    this.checked.set(next);
    this.checkedChange.emit(next);
    this.onChange(next);
  }

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
