import {
  ApplicationRef,
  Component,
  ElementRef,
  booleanAttribute,
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
import { CONTROL_ICON_SIZE, searchInputFieldStyles, type InputVariants } from "@ui-organized/core";
import { UioPart } from "../part.js";
import { UioIcon } from "../icons/icon.js";
import { UioFieldContext } from "../field/field-context.js";
import { UioFieldLabel } from "../field/field.js";
import { UioFieldError } from "../field-error/field-error.js";
import { flushNow } from "../overlay/flush.js";

export type SearchInputSize = NonNullable<InputVariants["size"]>;

/**
 * A search box with a leading icon and a clear button.
 *
 * ```html
 * <div uioSearchInput label="Search" [(value)]="query"></div>
 * ```
 *
 * ── The clear button is the whole component ─────────────────────────────────
 *
 * Everything else is `UioInput` with `type="search"`. What is not is the button
 * that appears only while the field holds something, and the class that comes
 * and goes with it: `field__control--affix-end` is what reserves the trailing
 * padding, so an empty field must not carry it or its text sits in a gap. Three
 * pieces of state — the value, the button's presence, the control's class — that
 * have to move together.
 *
 * ── No Ark machine, but still Ark parts ─────────────────────────────────────
 *
 * There is no `search-input` scope in Zag. React builds this from `Field.Root`
 * and `Field.Input`, so the identity is a *field's* and this extends `UioPart`
 * for the same reason `UioPasswordInput` does. The adornments carry none: they
 * are the design system's own elements, not Ark parts.
 *
 * The clear button is `tabindex="-1"` and the leading icon is `aria-hidden` —
 * both deliberate. Clearing a search box is what Escape and the keyboard are
 * for; a tab stop between the field and whatever follows it would be in the way
 * of every keyboard user for the sake of one they help.
 */
@Component({
  selector: "div[uioSearchInput]",
  standalone: true,
  exportAs: "uioSearchInput",
  providers: [
    UioFieldContext,
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioSearchInput), multi: true },
  ],
  imports: [UioIcon, UioFieldLabel, UioFieldError],
  template: `
    @if (label(); as text) {
      <label uioFieldLabel
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }
    <div class="input-affix">
      <span class="input-affix__adornment input-affix__adornment--start" aria-hidden="true">
        <span uioIcon name="search" [size]="iconSize()"></span>
      </span>
      <input
        [class]="controlClass()"
        data-scope="field"
        data-part="input"
        type="search"
        [id]="field.controlId"
        [attr.name]="name()"
        [attr.placeholder]="placeholder()"
        [attr.required]="required() ? '' : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-describedby]="field.describedBy()"
        [attr.data-invalid]="flag(invalid())"
        [disabled]="isDisabled()"
        [value]="value()"
        (input)="write($event)"
        (blur)="onTouched()"
      />
      @if (showClear()) {
        <button
          type="button"
          class="input-affix__adornment input-affix__adornment--end input-affix__action"
          aria-label="Clear search"
          tabindex="-1"
          (click)="clear()"
        >
          <span uioIcon name="close" [size]="iconSize()"></span>
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
export class UioSearchInput extends UioPart implements ControlValueAccessor {
  readonly scope = "field";
  readonly part = "root";

  /** Uncontrolled until something binds it — see `UioSwitch`. */
  readonly value = model("");
  readonly valueChange = output<string>();
  /** Fired after the clear button empties the field, in addition to `valueChange`. */
  readonly cleared = output<void>();

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows a message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly size = input<SearchInputSize>("md");
  readonly required = input(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly clearable = input(true, { transform: booleanAttribute });

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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);

  protected readonly hostClass = computed(() => searchInputFieldStyles({ size: this.size() }));
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size()]);

  /**
   * A disabled field shows no clear button, even holding a value.
   *
   * Not because it would be pressable — it would not — but because the trailing
   * padding it reserves is layout, and a control nobody can reach should not
   * carry a gap where a button used to be.
   */
  protected readonly showClear = computed(
    () => this.clearable() && this.value().length > 0 && !this.isDisabled(),
  );
  protected readonly controlClass = computed(() =>
    this.showClear()
      ? "field__control field__control--affix-start field__control--affix-end"
      : "field__control field__control--affix-start",
  );

  constructor() {
    super();
    this.field.bind({
      invalid: this.invalid,
      // Not the field's state: React passes only `invalid` to Field.Root, so a
      // disabled search box reports itself through the control's native
      // attribute alone. Same as `UioInput`.
      disabled: signal(false),
      required: signal(false),
      readOnly: signal(false),
    });
    this.field.describe("helper-text", this.helperVisible);
  }

  protected onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

  protected write(event: Event): void {
    this.commit((event.target as HTMLInputElement).value);
  }

  /**
   * Clearing focuses the field, which is the point: a user who clears a search
   * is about to type another one, and leaving focus on a button that has just
   * removed itself would drop it on `document.body`.
   */
  protected clear(): void {
    this.commit("");
    this.host.nativeElement.querySelector("input")?.focus();
    this.cleared.emit();
    flushNow(this.appRef);
  }

  /**
   * The model *is* what the element shows, so the `[value]` binding above never
   * has to be reconciled against a second copy: by the time this returns, the
   * signal and the DOM already agree and Angular writes the same string back.
   * `UioInput` keeps the same invariant with its own internal signal.
   */
  private commit(next: string): void {
    if (next === this.value()) return;
    this.value.set(next);
    this.valueChange.emit(next);
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
