import {
  Component,
  Directive,
  booleanAttribute,
  contentChild,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  type Signal,
  afterNextRender,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, inputFieldStyles, type InputVariants } from "@ui-organized/core";
import { UioIcon, type IconName } from "../icons/icon.js";
import type { IconGlyph } from "../icons/glyph.js";
import { UioPart } from "../part.js";
import { UioFieldContext } from "../field/field-context.js";
import { UioFieldLabel } from "../field/field.js";
import { UioFieldError } from "../field-error/field-error.js";
import { trackFocusModality } from "@ui-organized/core/focus-modality";

export type InputSize = NonNullable<InputVariants["size"]>;


/**
 * A control in the add-on slot before the input: a ghost Select, a Button. The
 * element it sits on *is* the slot, so the DOM matches the other three
 * libraries' `div.field__addon--slot` with nothing extra around it.
 *
 * ```html
 * <div uioInput label="Website" endAddon=".com">
 *   <div uioInputStartAddon><div uioSelect variant="ghost" label="Protocol" [options]="protocols"></div></div>
 * </div>
 * ```
 */
@Directive({
  selector: "[uioInputStartAddon]",
  standalone: true,
  host: { class: "field__addon field__addon--start field__addon--slot" },
})
export class UioInputStartAddon {}

/** A control in the add-on slot after the input. */
@Directive({
  selector: "[uioInputEndAddon]",
  standalone: true,
  host: { class: "field__addon field__addon--end field__addon--slot" },
})
export class UioInputEndAddon {}

/**
 * A single-line text field, with its label, helper text and error already wired
 * to it.
 *
 * ── Why the parts are written out here ──────────────────────────────────────
 *
 * This is `UioField` prepackaged, and it could have been assembled from
 * `UioFieldControl` and `UioFieldDescription`. It is not, for the reason Switch
 * writes its track and thumb into a template: the control's whole attribute
 * surface is then visible in one place, next to the states that drive it, and
 * the browser parity gate compares every one of them. Assembling it from
 * directives would also mean this component's `[disabled]` and the directive's
 * own host binding both writing `disabled` on the same element every pass, with
 * the host binding winning.
 *
 * The two parts that *are* reused are the ones with nothing to fight over: the
 * label, which only projects content, and the error pill, which takes its
 * identity from the field context this component provides.
 *
 * ── What is deliberately absent ─────────────────────────────────────────────
 *
 * `data-disabled`, on every part. React does not emit one either: `disabled`
 * here is a native attribute on the control rather than a state of the field,
 * and `.field__control:disabled` is in the stylesheet beside
 * `.field__control[data-disabled]`. Disable the whole field instead — label and
 * helper text included — with `<div uioField disabled>`.
 *
 * Angular has no prop spread, so the native attributes worth having are
 * declared. Anything beyond them is a `UioField` away.
 */
@Component({
  selector: "div[uioInput]",
  standalone: true,
  providers: [
    UioFieldContext,
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioInput), multi: true },
  ],
  imports: [UioFieldLabel, UioFieldError, UioIcon, NgTemplateOutlet],
  template: `
    @if (label(); as text) {
      <label uioFieldLabel
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }
    <ng-template #control>
      <input
        [class]="controlClass()"
        data-scope="field"
        data-part="input"
        [id]="field.controlId"
        [attr.type]="type()"
        [attr.name]="name()"
        [attr.placeholder]="placeholder()"
        [attr.autocomplete]="autocomplete()"
        [attr.aria-label]="ariaLabel()"
        [attr.inputmode]="inputMode()"
        [attr.spellcheck]="spellcheck()"
        [attr.min]="min()"
        [attr.max]="max()"
        [attr.step]="step()"
        [attr.required]="required() ? '' : null"
        [attr.readonly]="readOnlyInput() ? '' : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        [attr.data-invalid]="flag(invalid())"
        [disabled]="isDisabled()"
        [value]="value()"
        (input)="write($event)"
        (blur)="onTouched()"
      />
    </ng-template>
    <ng-template #affixed>
      @if (hasIcons()) {
        <div class="input-affix">
          @if (startIcon(); as name) {
            <span class="input-affix__adornment input-affix__adornment--start" aria-hidden="true">
              <span uioIcon [name]="name" [size]="iconSize()"></span>
            </span>
          }
          <ng-container *ngTemplateOutlet="control" />
          @if (endIcon(); as name) {
            <span class="input-affix__adornment input-affix__adornment--end" aria-hidden="true">
              <span uioIcon [name]="name" [size]="iconSize()"></span>
            </span>
          }
        </div>
      } @else {
        <ng-container *ngTemplateOutlet="control" />
      }
    </ng-template>
    @if (hasGroup()) {
      <div class="field__group">
        @if (startAddon(); as text) {
          <div class="field__addon field__addon--start" [id]="field.partId('start-addon')">{{ text }}</div>
        }
        <ng-content select="[uioInputStartAddon]" />
        <ng-container *ngTemplateOutlet="affixed" />
        @if (endAddon(); as text) {
          <div class="field__addon field__addon--end" [id]="field.partId('end-addon')">{{ text }}</div>
        }
        <ng-content select="[uioInputEndAddon]" />
      </div>
    } @else {
      <ng-container *ngTemplateOutlet="affixed" />
    }
    @if (helperVisible()) {
      <span
        class="field__description"
        data-scope="field"
        data-part="helper-text"
        [id]="field.partId('helper-text')"
      >{{ helperText() }}</span>
    }
    <!--
      Shows only while the field is invalid and holding a message, which is
      what Ark's ErrorText does — see UioFieldError. That is also why the
      helper text above is hidden by an error rather than merely covered:
      two lines of guidance under one control is one too many.
    -->
    <span uioFieldError [message]="errorMessage()"></span>
  `,
  host: {
    role: "group",
    "[class]": "hostClass()",
    "[id]": "field.rootId",
  },
})
export class UioInput extends UioPart implements ControlValueAccessor {
  /** Pointer vs keyboard, read by the field CSS for a quiet focus state on click. */
  protected readonly focusModalityTracker = afterNextRender(() => trackFocusModality());

  readonly scope = "field";
  readonly part = "root";

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /**
   * A string shows an error message; `true` marks the field invalid without
   * one. Same fork the other three take, and the reason `invalid` below is
   * derived rather than an input of its own.
   */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly size = input<InputSize>("md");
  readonly required = input(false, { transform: booleanAttribute });
  /**
   * Read-only, on the control rather than on the field — so the root reports no
   * `data-readonly`, for the reason the note above gives for `data-disabled`:
   * Ark's `Field.Root` is never told about a read-only *input* either, and the
   * `readonly` attribute is already on the element the stylesheet selects.
   * Mark the whole field read-only with `<div uioField readOnly>`.
   */
  protected readonly readOnlyInput = input(false, {
    alias: "readOnly",
    transform: booleanAttribute,
  });
  readonly type = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly autocomplete = input<string | undefined>(undefined);
  /**
   * The control's text.
   *
   * A `model()`, so it is uncontrolled until something binds it — the
   * arrangement `UioSwitch` describes — and a reactive form can keep driving it
   * through the value accessor either way. React, Svelte and Vue reach the same
   * place by spreading `value` onto their `Field.Input`; Angular has no spread,
   * so it is declared.
   */
  readonly value = model<string>("");
  /**
   * A name for a control the design does not print a label above — a channel
   * field inside the color picker, say. Prefer `label`: a visible one names
   * the control for everyone rather than only for a screen reader.
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });
  readonly inputMode = input<string | undefined>(undefined);
  readonly spellcheck = input<boolean | undefined>(undefined);
  /* The numeric attributes. Declared rather than spread, for the reason above. */
  readonly min = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined);
  readonly step = input<number | undefined>(undefined);
  /** An icon inside the control, before the text. */
  readonly startIcon = input<IconName | IconGlyph | undefined>(undefined);
  /** An icon inside the control, after the text. */
  readonly endIcon = input<IconName | IconGlyph | undefined>(undefined);
  /** A text add-on before the control: `https://`. For a control, project `[uioInputStartAddon]`. */
  readonly startAddon = input<string | undefined>(undefined);
  /** A text add-on after the control: `.com`. For a control, project `[uioInputEndAddon]`. */
  readonly endAddon = input<string | undefined>(undefined);

  private readonly startSlot = contentChild(UioInputStartAddon);
  private readonly endSlot = contentChild(UioInputEndAddon);
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size()]);
  protected readonly hasIcons = computed(() => this.startIcon() != null || this.endIcon() != null);
  protected readonly hasGroup = computed(
    () => !!this.startAddon() || !!this.endAddon() || !!this.startSlot() || !!this.endSlot(),
  );
  /**
   * A text add-on is part of the value (`https://`, `.com`), so it describes
   * the control, ahead of the field's own helper and error text — the order the
   * other three libraries join them in.
   */
  protected readonly describedBy = computed(() => {
    const ids = [
      this.startAddon() && this.field.partId("start-addon"),
      this.endAddon() && this.field.partId("end-addon"),
      this.field.describedBy(),
    ].filter(Boolean);
    return ids.length ? ids.join(" ") : null;
  });
  protected readonly controlClass = computed(() =>
    clsx(
      "field__control",
      this.startIcon() != null && "field__control--affix-start",
      this.endIcon() != null && "field__control--affix-end",
    ),
  );

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
  protected readonly hostClass = computed(() => inputFieldStyles({ size: this.size() }));

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

  protected onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

  protected write(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    // Kept in step with the element so the binding above never has to fight the
    // user for the caret: the signal only ever differs from the DOM when
    // something *else* wrote the value.
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
