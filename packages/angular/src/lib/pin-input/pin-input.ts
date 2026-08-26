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
  type Signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { pinInputStyles, type ControlSize, type PinInputVariants } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { VISUALLY_HIDDEN_INPUT, nextMachineId } from "../part-ids.js";
import { UioFieldError } from "../field-error/field-error.js";

export type PinInputSize = ControlSize;
export type PinInputVariant = NonNullable<PinInputVariants["variant"]>;
/** Which characters a cell accepts. Drives both the filter and `inputmode`. */
export type PinInputType = "numeric" | "alphanumeric" | "alphabetic";

const DEFAULT_LENGTH = 4;

/** Zag's default, and the character an empty cell shows. */
const DEFAULT_PLACEHOLDER = "○";

/** What each `type` will accept, one character at a time or pasted whole. */
const ALLOWED: Record<PinInputType, RegExp> = {
  numeric: /^[0-9]+$/,
  alphabetic: /^[A-Za-z]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
};

/**
 * Split the public string into one character per cell.
 *
 * The machine models the value as an array and the public API is the whole code
 * as a single string — the same boundary coercion `UioSelect` does for
 * `string ↔ string[]`, and for the same reason: the array is an implementation
 * detail of the cells, not something a caller should have to assemble. A short
 * string leaves the remaining cells empty rather than shrinking the control, and
 * a long one is truncated.
 */
export function toCells(code: string, length: number): string[] {
  return Array.from({ length }, (_, index) => code[index] ?? "");
}

/**
 * A one-character-per-cell code entry.
 *
 * ```html
 * <div uioPinInput label="Code" [length]="6" formControlName="otp"></div>
 * ```
 *
 * ── What the cells are, and what they are not ───────────────────────────────
 *
 * Six inputs, one value. Every cell carries `data-ownedby` naming the root, and
 * exactly one of them is in the tab order at a time — the first empty one, or
 * the last if the code is complete. That is the whole of the roving tab index:
 * a user Tabs into the control once and types, and Tab again leaves it, rather
 * than stepping through six separate stops.
 *
 * The value is **not** stored per cell. The cells are derived from one string,
 * so a caller never assembles or splits anything, and the hidden input a form
 * submits carries the same string.
 *
 * ── Backspace shifts, it does not blank ─────────────────────────────────────
 *
 * Clearing a cell splices it out and pushes an empty one onto the end, so
 * backspacing the middle of `1234` gives `134` and not `1_34`. That is Zag's
 * behaviour in the other three libraries and it is what makes correcting a
 * mistyped code feel like editing one field rather than six.
 *
 * ── The Angular-specific win ────────────────────────────────────────────────
 *
 * `ControlValueAccessor`, so `[(ngModel)]` and Reactive Forms both drive it,
 * including `control.disable()` reaching every cell's `data-disabled`. As with
 * `UioSwitch` there is no `defaultValue`: a `model()` is uncontrolled until
 * something binds it, so `[value]` is both the initial value and the bound one.
 */
@Component({
  selector: "div[uioPinInput]",
  standalone: true,
  exportAs: "uioPinInput",
  imports: [UioFieldError],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioPinInput), multi: true },
  ],
  template: `
    @if (label(); as text) {
      <!--
        The label names the *hidden* input rather than any one cell: a for
        attribute has to point at a single element and no cell is more the
        control than another, so Ark points it at the one a form submits.
        Clicking it focuses the first cell instead, which is what a pointer
        expects.
      -->
      <label
        class="field__label"
        data-scope="pin-input"
        data-part="label"
        [id]="partId('label')"
        [attr.for]="partId('hidden')"
        [attr.data-invalid]="flag(invalid())"
        [attr.data-disabled]="flag(isDisabled())"
        [attr.data-complete]="flag(complete())"
        [attr.data-required]="flag(required())"
        [attr.data-readonly]="flag(readOnly())"
        (click)="focusFirst($event)"
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }
    <div
      class="pin-input__control"
      data-scope="pin-input"
      data-part="control"
      [id]="partId('control')"
    >
      @for (index of indexes(); track index) {
        <input
          class="pin-input__cell"
          data-scope="pin-input"
          data-part="input"
          autocapitalize="none"
          [id]="partId(index)"
          [attr.data-index]="index"
          [attr.data-ownedby]="rootId"
          [attr.aria-label]="'pin code ' + (index + 1) + ' of ' + length()"
          [attr.inputmode]="inputMode()"
          [attr.enterkeyhint]="index === length() - 1 ? 'done' : 'next'"
          [attr.autocomplete]="otp() ? 'one-time-code' : 'off'"
          [attr.placeholder]="focusedIndex() === index ? '' : placeholder()"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          [attr.data-invalid]="flag(invalid())"
          [attr.data-disabled]="flag(isDisabled())"
          [attr.data-complete]="flag(complete())"
          [attr.data-filled]="flag(cells()[index] !== '')"
          [attr.readonly]="readOnly() ? '' : null"
          [type]="cellType()"
          [tabIndex]="index === tabbableIndex() ? 0 : -1"
          [disabled]="isDisabled()"
          [value]="cells()[index]"
          (input)="onInput($event, index)"
          (paste)="onPaste($event)"
          (keydown)="onKeydown($event)"
          (focus)="onFocus(index)"
          (blur)="onBlur($event)"
        />
      }
    </div>
    @if (helperVisible()) {
      <span class="field__description">{{ helperText() }}</span>
    }
    <span uioFieldError [message]="errorMessage()"></span>
    <!--
      The one element a form sees. Hidden from assistive tech, because the cells
      above are the accessible interface and a screen reader announcing the code
      twice is worse than not announcing it at all.
    -->
    <input
      aria-hidden="true"
      type="text"
      tabindex="-1"
      [id]="partId('hidden')"
      [attr.style]="HIDDEN"
      [attr.name]="name()"
      [attr.required]="required() ? '' : null"
      [attr.readonly]="readOnly() ? '' : null"
      [attr.maxlength]="length()"
      [disabled]="isDisabled()"
      [value]="value() ?? ''"
    />
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    /**
     * Not on `UioPart`. That base declares the vocabulary the *stylesheet*
     * reads and its spec fails an attribute no CSS selects on; `data-complete`
     * is one, and Ark emits it on the root, the label and every cell.
     */
    "[attr.data-complete]": "flag(complete())",
  },
})
export class UioPinInput extends UioPart implements ControlValueAccessor {
  readonly scope = "pin-input";
  readonly part = "root";

  /** The whole code as one string. Characters past `length` are dropped. */
  readonly value = model<string>("");
  readonly valueChange = output<string>();
  /** Fires once every cell is filled — the moment a code is worth submitting. */
  readonly valueComplete = output<string>();

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows a message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly length = input(DEFAULT_LENGTH);
  readonly size = input<PinInputSize>("md");
  readonly variant = input<PinInputVariant>("default");
  readonly type = input<PinInputType>("numeric");
  /** Renders entered characters as dots, like a password field. */
  readonly mask = input(false, { transform: booleanAttribute });
  /** Marks the cells as a one-time code so a browser offers to autofill it. */
  readonly otp = input(false, { transform: booleanAttribute });
  readonly placeholder = input(DEFAULT_PLACEHOLDER);
  /** Blurs the focused cell once the code is complete. */
  readonly blurOnComplete = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);
  override readonly readOnly = input(false, { transform: booleanAttribute });

  /** `disabled` comes from the caller *or* from a reactive form's disabled state. */
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabledInput() || this.formDisabled());
  override readonly disabled: Signal<boolean> = this.isDisabled;

  override readonly invalid: Signal<boolean> = computed(() => !!this.error());
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.invalid());

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly hostClass = computed(() =>
    pinInputStyles({ size: this.size(), variant: this.variant() }),
  );
  protected readonly indexes = computed(() =>
    Array.from({ length: this.length() }, (_, index) => index),
  );
  protected readonly cells = computed(() => toCells(this.value() ?? "", this.length()));
  protected readonly complete = computed(() => this.cells().every((cell) => cell !== ""));
  private readonly filledLength = computed(
    () => this.cells().filter((cell) => cell.trim() !== "").length,
  );

  /**
   * -1 when nothing in the control has focus, which is also what decides where
   * the single tab stop sits — see `tabbableIndex`.
   */
  protected readonly focusedIndex = signal(-1);

  /**
   * The one cell in the tab order: whichever has focus, or the first empty one,
   * or the last when the code is complete.
   *
   * Six tab stops would make a six-digit code cost seven Tab presses to skip.
   */
  protected readonly tabbableIndex = computed(() => {
    const focused = this.focusedIndex();
    if (focused !== -1) return focused;
    return Math.min(this.filledLength(), this.length() - 1);
  });

  protected readonly cellType = computed(() => {
    if (this.mask()) return "password";
    return this.type() === "numeric" ? "tel" : "text";
  });
  /** `otp` implies digits whatever `type` says, because an SMS code is digits. */
  protected readonly inputMode = computed(() =>
    this.otp() || this.type() === "numeric" ? "numeric" : "text",
  );

  private readonly machine = nextMachineId();
  protected get rootId(): string {
    return `${this.scope}:${this.machine}`;
  }
  protected partId(part: string | number): string {
    return `${this.scope}:${this.machine}:${part}`;
  }

  protected readonly HIDDEN = VISUALLY_HIDDEN_INPUT;
  protected readonly flag = stateFlag;

  // ── Typing ────────────────────────────────────────────────────────────────

  private inputAt(index: number): HTMLInputElement | null {
    return this.host.nativeElement
      .querySelectorAll<HTMLInputElement>('input[data-part="input"]')
      .item(index);
  }

  private focusAt(index: number): void {
    // A microtask, not synchronously: the cell being focused may only exist
    // after the `[value]` bindings above have been flushed.
    queueMicrotask(() => this.inputAt(index)?.focus({ preventScroll: true }));
  }

  protected focusFirst(event: Event): void {
    event.preventDefault();
    if (this.isDisabled()) return;
    this.focusAt(0);
  }

  private accepts(text: string): boolean {
    return ALLOWED[this.type()].test(text);
  }

  /**
   * A cell holds one character, so a keystroke into a full cell replaces it.
   *
   * Zag's `getNextValue`: the browser hands over the whole field text, which may
   * be the old character plus the new one in either order depending on where the
   * caret was. Taking the last character of whichever half is new is what makes
   * retyping over a filled cell feel like overwriting it.
   */
  protected onInput(event: Event, index: number): void {
    const element = event.target as HTMLInputElement;
    const typed = element.value;
    const current = this.cells()[index] ?? "";

    let next = typed;
    if (current[0] === typed[0]) next = typed[1] ?? "";
    else if (current[0] === typed[1]) next = typed[0] ?? "";
    next = next.slice(-1);

    // A rejected character must not survive on the element: the `[value]`
    // binding would not fire again for an unchanged model value.
    if (next !== "" && !this.accepts(next)) {
      element.value = current;
      return;
    }

    this.setCell(index, next);
    element.value = next;
    if (next !== "") this.moveTo(Math.min(index + 1, this.length() - 1));
  }

  /**
   * Pasting fills forward from the caret, not just the cell under it.
   *
   * The whole point of a pin input is that a code copied from an email lands in
   * one gesture, so this is the interaction most worth getting right and the one
   * a DOM comparison cannot see at all.
   */
  protected onPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData("text/plain");
    if (!pasted) return;
    event.preventDefault();
    if (!this.accepts(pasted)) return;

    const length = this.length();
    const focused = this.focusedIndex();
    const start = Math.min(focused === -1 ? 0 : focused, this.filledLength());
    const left = start > 0 ? (this.value() ?? "").substring(0, focused) : "";
    const right = pasted.substring(0, length - start);
    this.commit(toCells(`${left}${right}`, length));
    this.moveTo(Math.min(this.filledLength(), length - 1));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const index = this.focusedIndex();
    if (index === -1) return;

    switch (event.key) {
      case "Backspace": {
        event.preventDefault();
        if (this.readOnly()) return;
        // With a value: clear this cell and step back. Without one: step back
        // *first*, then clear — so backspacing an empty cell eats the one
        // before it rather than doing nothing.
        if (this.cells()[index] !== "") {
          this.clearAt(index);
          this.moveTo(Math.max(index - 1, 0));
        } else {
          const previous = Math.max(index - 1, 0);
          this.moveTo(previous);
          this.clearAt(previous);
        }
        return;
      }
      case "Delete":
        event.preventDefault();
        if (this.readOnly()) return;
        this.clearAt(index);
        return;
      case "ArrowLeft":
        event.preventDefault();
        this.moveTo(Math.max(index - 1, 0));
        return;
      case "ArrowRight":
        event.preventDefault();
        this.moveTo(Math.min(index + 1, Math.min(this.filledLength(), this.length() - 1)));
        return;
      case "Home":
        event.preventDefault();
        this.moveTo(0);
        return;
      case "End":
        event.preventDefault();
        this.moveTo(Math.max(this.filledLength() - 1, 0));
        return;
      default:
        return;
    }
  }

  protected onFocus(index: number): void {
    // Focusing the fifth cell of an empty code lands on the first: the machine
    // never lets the caret get ahead of the value.
    const max = Math.min(this.filledLength(), this.length() - 1);
    const next = Math.min(index, max);
    this.focusedIndex.set(next);
    if (next !== index) this.focusAt(next);
  }

  /**
   * Focus moving between two cells of the same control is not a blur.
   *
   * `data-ownedby` is what says so, which is the reason every cell carries it.
   */
  protected onBlur(event: FocusEvent): void {
    const next = event.relatedTarget as HTMLElement | null;
    if (next?.dataset?.["ownedby"] === this.rootId) return;
    this.focusedIndex.set(-1);
    this.onTouched();
  }

  private moveTo(index: number): void {
    this.focusedIndex.set(index);
    this.focusAt(index);
  }

  private setCell(index: number, character: string): void {
    const next = [...this.cells()];
    next[index] = character;
    this.commit(next);
  }

  /**
   * Clearing splices rather than blanks, so the code closes up behind the caret.
   *
   * Zag's `clearFocusedValue`. Blanking in place would leave a hole a user has
   * to navigate back into.
   */
  private clearAt(index: number): void {
    const next = [...this.cells()];
    next.splice(index, 1);
    next.push("");
    this.commit(next);
  }

  private commit(cells: string[]): void {
    const next = cells.join("");
    if (next === (this.value() ?? "")) return;
    this.value.set(next);
    this.valueChange.emit(next);
    this.onChange(next);
    if (cells.every((cell) => cell !== "")) {
      this.valueComplete.emit(next);
      if (this.blurOnComplete()) {
        queueMicrotask(() => this.inputAt(this.focusedIndex())?.blur());
      }
    }
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
