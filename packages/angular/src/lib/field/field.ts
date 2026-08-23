import {
  Component,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  signal,
  type Signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { fieldStyles, type FieldVariants } from "@ui-organized/core";
import { UioPart } from "../part.js";
import { HostPresence } from "../host-presence.js";
import { UioFieldContext } from "./field-context.js";

export type FieldLayout = NonNullable<FieldVariants["layout"]>;

/**
 * A label, a control, its helper text and its error, wired together.
 *
 * ── What the wiring is ──────────────────────────────────────────────────────
 *
 * Four sibling elements that have to agree about five things: the label's `for`
 * and the control's `id`; the control's `aria-describedby` and whichever of the
 * helper and error text is actually on screen; and `[data-invalid]`,
 * `[data-disabled]` and `[data-readonly]`, which the shared stylesheet reads on
 * every one of them. Ark spreads that from a machine through React context.
 * Here the root provides a `UioFieldContext` and each part injects it, which is
 * the same arrangement in Angular's spelling.
 *
 * ```html
 * <div uioField [invalid]="email.invalid" required>
 *   <label uioFieldLabel>Email</label>
 *   <input uioFieldControl [formControl]="email" />
 *   <span uioFieldDescription>We never share it</span>
 *   <span uioFieldError [message]="emailError()"></span>
 * </div>
 * ```
 *
 * `UioInput` is this composition prepackaged. Reach for `UioField` when the
 * control is not a plain text box — a native `select`, a date picker, anything
 * the packaged component does not wrap.
 */
@Component({
  selector: "div[uioField]",
  standalone: true,
  providers: [UioFieldContext],
  template: `<ng-content />`,
  host: {
    role: "group",
    "[class]": "hostClass()",
    "[id]": "field.rootId",
  },
})
export class UioField extends UioPart {
  readonly scope = "field";
  readonly part = "root";

  readonly layout = input<FieldLayout>("stacked");
  override readonly invalid = input(false, { transform: booleanAttribute });
  override readonly disabled = input(false, { transform: booleanAttribute });
  override readonly readOnly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });

  protected readonly field = inject(UioFieldContext);
  protected readonly hostClass = computed(() => fieldStyles({ layout: this.layout() }));

  constructor() {
    super();
    // Before any part of the field exists, which is what makes plain property
    // assignment safe. See `UioFieldContext.bind`.
    this.field.bind({
      invalid: this.invalid,
      disabled: this.disabled,
      required: this.required,
      readOnly: this.readOnly,
    });
  }
}

/**
 * Names the field's control, and reports the field's state so the stylesheet
 * can grey the label along with it.
 *
 * `data-required` is bound here rather than on `UioPart`, for the reason Switch
 * gives: that base declares the vocabulary the *stylesheet* reads, and its spec
 * fails an attribute no CSS selects on. Ark emits `data-required` anyway, and
 * the rendered contract is what this package reproduces.
 */
@Component({
  selector: "label[uioFieldLabel]",
  standalone: true,
  template: `<ng-content />`,
  host: {
    class: "field__label",
    "[id]": "field.partId('label')",
    "[attr.for]": "field.controlId",
    "[attr.data-required]": "flag(field.required())",
  },
})
export class UioFieldLabel extends UioPart {
  readonly scope = "field";
  readonly part = "label";

  protected readonly field = inject(UioFieldContext);
  override readonly invalid: Signal<boolean> = this.field.invalid;
  override readonly disabled: Signal<boolean> = this.field.disabled;
  override readonly readOnly: Signal<boolean> = this.field.readOnly;
}

/**
 * The field's text box.
 *
 * ── Two things worth knowing ────────────────────────────────────────────────
 *
 * It reports `data-invalid`, `data-readonly` and `data-required` but **never**
 * `data-disabled` — Ark does not put one on the control either, because a real
 * `disabled` attribute is already there and `.field__control:disabled` sits in
 * the stylesheet beside `.field__control[data-disabled]`. Nothing is lost, and
 * the attribute the gate would otherwise flag as missing is missing on purpose.
 *
 * The `ControlValueAccessor` is the Angular-specific win rather than parity
 * debt. `setDisabledState` feeds the same expression the field's own `disabled`
 * does, so `control.disable()` greys the control instead of only keeping its
 * value out of the form.
 */
@Directive({
  selector: "input[uioFieldControl]",
  standalone: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioFieldControl), multi: true },
  ],
  host: {
    class: "field__control",
    "[id]": "field.controlId",
    "[attr.aria-describedby]": "field.describedBy()",
    "[attr.aria-invalid]": "field.invalid() ? 'true' : null",
    "[attr.data-required]": "flag(field.required())",
    "[disabled]": "isDisabled()",
    "[attr.required]": "field.required() || requiredInput() ? '' : null",
    "[attr.readonly]": "field.readOnly() || readOnlyInput() ? '' : null",
    "(input)": "write($event)",
    "(blur)": "onTouched()",
  },
})
export class UioFieldControl extends UioPart implements ControlValueAccessor {
  readonly scope = "field";
  readonly part = "input";

  protected readonly field = inject(UioFieldContext);
  override readonly invalid: Signal<boolean> = this.field.invalid;
  override readonly readOnly: Signal<boolean> = this.field.readOnly;

  /**
   * The control's own copies of the three form states, OR'd with the field's.
   *
   * A control can be disabled without its field being disabled, and — more to
   * the point — a plain `disabled` written on the element would otherwise be
   * wiped by the host binding above on the first change-detection pass.
   */
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  protected readonly requiredInput = input(false, {
    alias: "required",
    transform: booleanAttribute,
  });
  protected readonly readOnlyInput = input(false, {
    alias: "readOnly",
    transform: booleanAttribute,
  });

  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.field.disabled() || this.disabledInput() || this.formDisabled(),
  );

  private readonly host = inject<ElementRef<HTMLInputElement>>(ElementRef);

  protected onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

  protected write(event: Event): void {
    this.onChange((event.target as HTMLInputElement).value);
  }

  /**
   * Written straight onto the element, the way Angular's own
   * `DefaultValueAccessor` does. A `[value]` host binding would fight the one
   * the caller may have written on the same element, and the host binding wins
   * every pass — so a form-driven value and a template-driven one could not
   * coexist.
   */
  writeValue(value: string | null): void {
    this.host.nativeElement.value = value ?? "";
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}

/**
 * Advice under the control, named by the control's `aria-describedby`.
 *
 * Takes either projected content or a `message`. The input is not redundant:
 * `<ng-content>` cannot be tested for emptiness, so a component that always
 * projects "whatever the caller gave us" believes it has content and renders an
 * empty line of layout. Anything that can vanish therefore has to be told so in
 * a value — the same reason `FieldError` takes a message rather than children.
 */
@Component({
  selector: "span[uioFieldDescription]",
  standalone: true,
  providers: [HostPresence],
  template: `{{ message() }}<ng-content />`,
  host: {
    class: "field__description",
    "[id]": "field.partId('helper-text')",
  },
})
export class UioFieldDescription extends UioPart {
  readonly scope = "field";
  readonly part = "helper-text";

  readonly message = input<string | undefined>(undefined);

  protected readonly field = inject(UioFieldContext);
  override readonly disabled: Signal<boolean> = this.field.disabled;

  private readonly presence = inject(HostPresence);
  /** No message *given* means the caller projected content; an empty one means no helper. */
  private readonly present = computed(() => this.message() === undefined || !!this.message());

  constructor() {
    super();
    this.field.describe("helper-text", this.present);
    effect(() => this.presence.set(this.present()));
  }
}
