import {
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  type Signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  CONTROL_ICON_SIZE,
  passwordInputFieldStyles,
  type InputVariants,
} from "@ui-organized/core";
import { UioPart } from "../part.js";
import { UioIcon } from "../icons/icon.js";
import { UioFieldContext } from "../field/field-context.js";
import { UioFieldLabel } from "../field/field.js";
import { UioFieldError } from "../field-error/field-error.js";

export type PasswordInputSize = NonNullable<InputVariants["size"]>;

/**
 * A password box with a show/hide toggle.
 *
 * ```html
 * <div uioPasswordInput label="Password" formControlName="password"></div>
 * ```
 *
 * ── Why this is a component and not `UioInput type="password"` ──────────────
 *
 * The toggle. It is a real button inside the control's box — `.input-affix`
 * positions it over the field's trailing padding — and the control has to know
 * about it twice over: `field__control--affix-end` is what reserves that
 * padding, so a field whose toggle is turned off must not carry the class. Both
 * facts live here rather than in a caller's template.
 *
 * ── No Ark machine, but still Ark parts ─────────────────────────────────────
 *
 * There is no `password-input` scope anywhere in Zag: React builds this out of
 * `Field.Root` and `Field.Input` plus a plain `<button>`, so the rendered
 * identity is a *field's* — `data-scope="field"`, `data-part="root"` and
 * `"input"` — and the toggle carries none at all. That is why this extends
 * `UioPart` where the six components of the previous wave did not: the identity
 * is real, it comes from Field, and the shared stylesheet reads it.
 *
 * `data-disabled` is absent from every part, exactly as in `UioInput`: React
 * passes only `invalid` to `Field.Root`, and `.field__control:disabled` sits in
 * the stylesheet beside `.field__control[data-disabled]`.
 */
@Component({
  selector: "div[uioPasswordInput]",
  standalone: true,
  exportAs: "uioPasswordInput",
  providers: [
    UioFieldContext,
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioPasswordInput), multi: true },
  ],
  imports: [UioIcon, UioFieldLabel, UioFieldError],
  template: `
    @if (label(); as text) {
      <label uioFieldLabel
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }
    <div class="input-affix">
      <input
        [class]="controlClass()"
        data-scope="field"
        data-part="input"
        [id]="field.controlId"
        [attr.type]="visible() ? 'text' : 'password'"
        [attr.name]="name()"
        [attr.placeholder]="placeholder()"
        [attr.autocomplete]="autocomplete()"
        [attr.required]="required() ? '' : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-describedby]="field.describedBy()"
        [attr.data-invalid]="flag(invalid())"
        [disabled]="isDisabled()"
        [value]="value()"
        (input)="write($event)"
        (blur)="onTouched()"
      />
      @if (showToggle()) {
        <!--
          Labelled by state rather than by function: "Show password" is what the
          button will *do*, which is what a screen reader should hear, and
          aria-pressed carries the state it is in. Both flip together.
        -->
        <button
          type="button"
          class="input-affix__adornment input-affix__adornment--end input-affix__action"
          [attr.aria-label]="visible() ? 'Hide password' : 'Show password'"
          [attr.aria-pressed]="visible()"
          [disabled]="isDisabled()"
          (click)="toggle()"
        >
          <span uioIcon [name]="visible() ? 'eye-off' : 'eye'" [size]="iconSize()"></span>
        </button>
      }
    </div>
    @if (helperVisible()) {
      <span
        class="field__description"
        data-scope="field"
        data-part="helper-text"
        [id]="field.partId('helper-text')"
      >{{ helperText() }}</span>
    }
    <span uioFieldError [message]="errorMessage()"></span>
  `,
  host: {
    role: "group",
    "[class]": "hostClass()",
    "[id]": "field.rootId",
  },
})
export class UioPasswordInput extends UioPart implements ControlValueAccessor {
  readonly scope = "field";
  readonly part = "root";

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows a message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly size = input<PasswordInputSize>("md");
  readonly required = input(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly autocomplete = input<string | undefined>(undefined);
  readonly showToggle = input(true, { transform: booleanAttribute });

  /** `disabled` comes from the caller *or* from a reactive form's disabled state. */
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabledInput() || this.formDisabled());

  override readonly invalid: Signal<boolean> = computed(() => !!this.error());
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  /** An error replaces the helper text rather than stacking under it. */
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.invalid());

  protected readonly field = inject(UioFieldContext);
  protected readonly hostClass = computed(() => passwordInputFieldStyles({ size: this.size() }));
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size()]);
  /** Without the toggle the control loses its trailing padding along with it. */
  protected readonly controlClass = computed(() =>
    this.showToggle() ? "field__control field__control--affix-end" : "field__control",
  );
  protected readonly value = signal("");
  /** Never bound from the outside: a caller cannot reveal a user's password for them. */
  protected readonly visible = signal(false);

  constructor() {
    super();
    this.field.bind({
      invalid: this.invalid,
      // Not the field's state: see the note above about `data-disabled`.
      disabled: signal(false),
      required: signal(false),
      readOnly: signal(false),
    });
    this.field.describe("helper-text", this.helperVisible);
  }

  protected toggle(): void {
    this.visible.update((shown) => !shown);
  }

  protected onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

  protected write(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    // Kept in step with the element so the binding never fights the caret.
    this.value.set(next);
    this.onChange(next);
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? "");
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
