import {
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
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { editableStyles, type ControlSize } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioButton } from "../button/button.js";
import { UioFieldError } from "../field-error/field-error.js";

export type EditableSize = ControlSize;
/** What turns the preview into an input. */
export type EditableActivationMode = "focus" | "dblclick" | "click" | "none";
/** What turns it back, keeping the edit. */
export type EditableSubmitMode = "blur" | "enter" | "both" | "none";

/**
 * Text that becomes an input when you go to change it.
 *
 * ```html
 * <div uioEditable label="Name" formControlName="displayName"></div>
 * ```
 *
 * ── Both halves are always mounted ──────────────────────────────────────────
 *
 * The preview and the input exist together and `hidden` picks between them, so
 * starting an edit never remounts anything and the caret survives the swap. The
 * same is true of the three control buttons: Edit is hidden while editing, Save
 * and Cancel are hidden while not, and the row changes without any local state.
 *
 * ── Commit and cancel are not the same exit ─────────────────────────────────
 *
 * Escape reverts to the value the edit started from; Enter and (in `blur` or
 * `both` mode) clicking away keep it. The revert target is captured when the
 * edit *begins*, not derived from the last committed value — an edit started,
 * abandoned, and started again must go back to where the second one began.
 *
 * ── The Angular-specific win ────────────────────────────────────────────────
 *
 * `ControlValueAccessor`, so `[(ngModel)]` and Reactive Forms both drive it. A
 * form's `disable()` reaches the preview's `aria-disabled` as well as the input.
 */
@Component({
  selector: "div[uioEditable]",
  standalone: true,
  exportAs: "uioEditable",
  imports: [UioButton, UioFieldError],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioEditable), multi: true },
  ],
  template: `
    @if (label(); as text) {
      <label
        class="field__label"
        data-scope="editable"
        data-part="label"
        [id]="partId('label')"
        [attr.for]="partId('input')"
        [attr.data-focus]="flag(editing())"
        [attr.data-invalid]="flag(isInvalid())"
        [attr.data-required]="flag(required())"
        (click)="focusPreview()"
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }
    <div
      class="editable__area"
      data-scope="editable"
      data-part="area"
      [id]="partId('area')"
      [attr.data-focus]="flag(editing())"
      [attr.data-disabled]="flag(isDisabled())"
      [attr.data-placeholder-shown]="flag(empty())"
      [style.display]="autoResize() ? 'inline-grid' : null"
    >
      <!--
        data-readonly on the preview reports *disabled*, not read-only. That is
        Zag's own wiring and every other library in the system renders it, so
        the stylesheet is written against it; correcting it here would make
        Angular the odd one out.
      -->
      <span
        class="editable__preview"
        data-scope="editable"
        data-part="preview"
        aria-label="edit"
        [id]="partId('preview')"
        [attr.data-placeholder-shown]="flag(empty())"
        [attr.aria-readonly]="readOnlyInput() ? 'true' : null"
        [attr.data-readonly]="flag(isDisabled())"
        [attr.data-disabled]="flag(isDisabled())"
        [attr.aria-disabled]="isDisabled() ? 'true' : null"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.data-invalid]="flag(isInvalid())"
        [attr.data-autoresize]="flag(autoResize())"
        [attr.hidden]="previewHidden()"
        [attr.tabindex]="interactive ? 0 : null"
        [style.white-space]="autoResize() ? 'pre' : null"
        [style.grid-area]="autoResize() ? '1 / 1' : null"
        [style.visibility]="autoResize() && editing() ? 'hidden' : null"
        [style.overflow]="autoResize() ? 'hidden' : null"
        [style.text-overflow]="autoResize() ? 'ellipsis' : null"
        (click)="onPreviewClick()"
        (dblclick)="onPreviewDoubleClick()"
        (focus)="onPreviewFocus()"
        >{{ previewText() }}</span
      >
      <input
        class="editable__input"
        data-scope="editable"
        data-part="input"
        aria-label="editable input"
        [id]="partId('input')"
        [attr.name]="name()"
        [attr.hidden]="inputHidden()"
        [attr.placeholder]="placeholder()"
        [attr.maxlength]="maxLength()"
        [attr.required]="required() ? '' : null"
        [attr.readonly]="readOnlyInput() ? '' : null"
        [attr.data-readonly]="flag(readOnlyInput())"
        [attr.data-disabled]="flag(isDisabled())"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.data-invalid]="flag(isInvalid())"
        [attr.data-autoresize]="flag(autoResize())"
        [attr.size]="autoResize() ? 1 : null"
        [style.grid-area]="autoResize() ? '1 / 1' : null"
        [style.visibility]="autoResize() && !editing() ? 'hidden' : null"
        [disabled]="isDisabled()"
        [value]="value()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (blur)="onInputBlur($event)"
      />
    </div>
    @if (showControls()) {
      <div
        class="editable__control"
        data-scope="editable"
        data-part="control"
        [id]="partId('control')"
      >
        <button
          uioButton
          intent="ghost"
          data-scope="editable"
          data-part="edit-trigger"
          aria-label="edit"
          [size]="size()"
          [id]="partId('edit')"
          [attr.hidden]="editing() ? '' : null"
          [disabled]="isDisabled()"
          (click)="edit()"
        >
          Edit
        </button>
        <button
          uioButton
          intent="secondary"
          data-scope="editable"
          data-part="submit-trigger"
          aria-label="submit"
          [size]="size()"
          [id]="partId('submit')"
          [attr.hidden]="editing() ? null : ''"
          [disabled]="isDisabled()"
          (click)="submit()"
        >
          Save
        </button>
        <button
          uioButton
          intent="ghost"
          data-scope="editable"
          data-part="cancel-trigger"
          aria-label="cancel"
          [size]="size()"
          [id]="partId('cancel')"
          [attr.hidden]="editing() ? null : ''"
          [disabled]="isDisabled()"
          (click)="cancel()"
        >
          Cancel
        </button>
      </div>
    }
    @if (helperVisible()) {
      <span class="field__description">{{ helperText() }}</span>
    }
    <span uioFieldError [message]="errorMessage()"></span>
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
  },
})
export class UioEditable extends UioPart implements ControlValueAccessor {
  readonly scope = "editable";
  readonly part = "root";

  readonly value = model<string>("");
  readonly valueChange = output<string>();
  /** Fires only on a *kept* edit — never on cancel. */
  readonly valueCommit = output<string>();

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows a message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly size = input<EditableSize>("md");
  readonly activationMode = input<EditableActivationMode>("focus");
  readonly submitMode = input<EditableSubmitMode>("both");
  readonly showControls = input(false, { transform: booleanAttribute });
  /** Grows the input to fit its content instead of filling the width. */
  readonly autoResize = input(false, { transform: booleanAttribute });
  readonly maxLength = input<number | undefined>(undefined);
  readonly required = input(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);

  /**
   * Neither of these overrides its `UioPart` field, deliberately.
   *
   * Ark's editable *root* reports no state at all — it is the area, the preview
   * and the input that carry `data-disabled` and the read-only pair — so
   * overriding the base signals would put attributes on the root that no other
   * library emits. Same split as `readOnlyInput` on `UioNumberField`.
   */
  protected readonly readOnlyInput = input(false, {
    alias: "readOnly",
    transform: booleanAttribute,
  });
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabledInput() || this.formDisabled());

  protected readonly isInvalid = computed(() => !!this.error());
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.isInvalid());

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly hostClass = computed(() => editableStyles({ size: this.size() }));
  protected readonly editing = signal(false);
  protected readonly empty = computed(() => this.value().trim() === "");
  /**
   * `hidden` is what swaps the two halves — except with `autoResize`, where they
   * are stacked in one grid cell and `visibility` does it instead, so the
   * preview keeps reserving the width the input has to grow into.
   */
  protected readonly previewHidden = computed(() =>
    !this.autoResize() && this.editing() ? "" : null,
  );
  protected readonly inputHidden = computed(() =>
    !this.autoResize() && !this.editing() ? "" : null,
  );
  /** The placeholder is the preview's own text when there is no value — not a
   *  `::placeholder`, because a span has none. */
  protected readonly previewText = computed(() =>
    this.empty() ? (this.placeholder() ?? "") : this.value(),
  );

  /** Where Escape goes back to: captured when the edit began. */
  private previousValue = "";

  protected readonly flag = stateFlag;

  private readonly machine = nextMachineId();
  protected get rootId(): string {
    return `${this.scope}:${this.machine}`;
  }
  protected partId(part: string): string {
    return `${this.scope}:${this.machine}:${part}`;
  }

  protected get interactive(): boolean {
    return !this.isDisabled() && !this.readOnlyInput();
  }

  private el<T extends HTMLElement>(part: string): T | null {
    return this.host.nativeElement.querySelector<T>(`[data-part="${part}"]`);
  }

  // ── Starting an edit ──────────────────────────────────────────────────────

  protected onPreviewClick(): void {
    if (this.activationMode() !== "click") return;
    this.edit();
  }

  protected onPreviewDoubleClick(): void {
    if (this.activationMode() !== "dblclick") return;
    this.edit();
  }

  protected onPreviewFocus(): void {
    if (this.activationMode() !== "focus") return;
    this.edit();
  }

  protected focusPreview(): void {
    if (this.editing()) return;
    this.el<HTMLElement>("preview")?.focus({ preventScroll: true });
  }

  /** Public so a caller can start an edit from their own affordance. */
  edit(): void {
    if (!this.interactive || this.editing()) return;
    this.previousValue = this.value();
    this.editing.set(true);
    // An animation frame, not a microtask: change detection has to have removed
    // the input's `hidden` before focus is asked for, and a hidden input cannot
    // take focus — the request is dropped silently and the caret is lost. Zag
    // reaches for a frame here for the same reason.
    requestAnimationFrame(() => this.el<HTMLInputElement>("input")?.select());
  }

  // ── Leaving one ───────────────────────────────────────────────────────────

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    const max = this.maxLength();
    this.write(max != null ? text.slice(0, max) : text);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      this.cancel();
      return;
    }
    if (event.key !== "Enter") return;
    const mode = this.submitMode();
    if (mode !== "enter" && mode !== "both") return;
    if (event.shiftKey || event.metaKey) return;
    event.preventDefault();
    this.submit();
  }

  /**
   * Clicking Save or Cancel blurs the input first, so a blur that lands on one
   * of them must do nothing and let the button's own click decide.
   */
  protected onInputBlur(event: FocusEvent): void {
    if (!this.editing()) return;
    const next = event.relatedTarget as HTMLElement | null;
    if (next?.closest('[data-part="control"]')) return;
    this.onTouched();
    const mode = this.submitMode();
    if (mode === "blur" || mode === "both") this.submit();
    else this.cancel();
  }

  /** Public so a caller can keep an edit from their own affordance. */
  submit(): void {
    if (!this.editing()) return;
    this.previousValue = this.value();
    this.editing.set(false);
    this.valueCommit.emit(this.value());
    this.restoreFocus();
  }

  /** Public so a caller can abandon an edit from their own affordance. */
  cancel(): void {
    if (!this.editing()) return;
    this.editing.set(false);
    // Zag reverts only to a non-empty previous value: cancelling an edit that
    // started from nothing leaves what was typed rather than blanking it.
    if (this.previousValue) this.write(this.previousValue);
    this.restoreFocus();
  }

  /**
   * The edit trigger, and nothing else.
   *
   * Falling back to the preview would be worse than leaving focus where it is:
   * in the default `focus` activation mode, focusing the preview starts the
   * edit again, and submitting would be unescapable.
   */
  private restoreFocus(): void {
    requestAnimationFrame(() =>
      this.el<HTMLElement>("edit-trigger")?.focus({ preventScroll: true }),
    );
  }

  private write(next: string): void {
    if (next === this.value()) return;
    this.value.set(next);
    this.valueChange.emit(next);
    this.onChange(next);
  }

  // ── Forms ─────────────────────────────────────────────────────────────────

  protected onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

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
