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
import { tagsInputStyles, type ControlSize } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";
import { UioFieldError } from "../field-error/field-error.js";

export type TagsInputSize = ControlSize;

/** Delete affordance inside a tag — always the small edge, at every control
 *  size, because it sits inside the chip rather than beside it. */
const DELETE_ICON_SIZE = 12;

/**
 * A text box that turns what you type into removable chips.
 *
 * ```html
 * <div uioTagsInput label="Tags" formControlName="tags"></div>
 * ```
 *
 * ── The chips are state, not children ───────────────────────────────────────
 *
 * Every tag is rendered from the component's own value, and each one mounts
 * *two* elements: the chip a user sees and a hidden input that replaces it
 * during an in-place edit. `hidden` is what picks between them, so editing a tag
 * never remounts the row and never loses the caret. A port that mapped over the
 * `value` input and rendered chips alone would look right and have no way to
 * edit one.
 *
 * ── Backspace is two presses, not one ───────────────────────────────────────
 *
 * With the caret at the start of an empty entry field, Backspace *highlights*
 * the last tag; a second Backspace removes it. One-press deletion is how tag
 * inputs lose data — the user is one key away from destroying a chip they cannot
 * see the caret near — and the highlight is what makes it recoverable.
 *
 * ── The Angular-specific win ────────────────────────────────────────────────
 *
 * `ControlValueAccessor`, so `[(ngModel)]` and Reactive Forms both drive the
 * list, including `control.disable()` reaching every chip's `data-disabled`.
 */
@Component({
  selector: "div[uioTagsInput]",
  standalone: true,
  exportAs: "uioTagsInput",
  imports: [UioIcon, UioFieldError],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioTagsInput), multi: true },
  ],
  template: `
    @if (label(); as text) {
      <label
        class="field__label"
        data-scope="tags-input"
        data-part="label"
        [id]="partId('label')"
        [attr.for]="partId('input')"
        [attr.data-disabled]="flag(isDisabled())"
        [attr.data-invalid]="flag(invalid())"
        [attr.data-readonly]="flag(readOnly())"
        [attr.data-required]="flag(required())"
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }
    <!--
      tabindex on a read-only control, and only then: the entry field is
      disabled in that state, so without a tab stop here the chips would be
      unreachable by keyboard entirely.
    -->
    <div
      class="tags-input__control"
      data-scope="tags-input"
      data-part="control"
      [id]="partId('control')"
      [attr.tabindex]="readOnly() ? 0 : null"
      [attr.data-disabled]="flag(isDisabled())"
      [attr.data-readonly]="flag(readOnly())"
      [attr.data-invalid]="flag(invalid())"
      [attr.data-focus]="flag(focused())"
      (pointerdown)="onControlPointerDown($event)"
    >
      @for (tag of tags(); track $index) {
        <div
          data-scope="tags-input"
          data-part="item"
          [attr.data-value]="tag"
          [attr.data-disabled]="flag(isDisabled())"
        >
          <div
            class="tags-input__tag"
            data-scope="tags-input"
            data-part="item-preview"
            [id]="itemId(tag, $index)"
            [attr.hidden]="editingIndex() === $index ? '' : null"
            [attr.data-value]="tag"
            [attr.data-disabled]="flag(isDisabled())"
            [attr.data-highlighted]="flag(highlightedIndex() === $index)"
            (dblclick)="startEdit($index)"
          >
            <span
              class="tags-input__tag-label"
              data-scope="tags-input"
              data-part="item-text"
              [attr.data-disabled]="flag(isDisabled())"
              [attr.data-highlighted]="flag(highlightedIndex() === $index)"
              >{{ tag }}</span
            >
            <button
              class="tags-input__tag-delete"
              data-scope="tags-input"
              data-part="item-delete-trigger"
              type="button"
              tabindex="-1"
              [id]="itemId(tag, $index) + ':delete-btn'"
              [attr.data-disabled]="flag(isDisabled())"
              [attr.aria-disabled]="isDisabled() ? 'true' : 'false'"
              [attr.data-highlighted]="flag(highlightedIndex() === $index)"
              [attr.aria-label]="'Delete tag ' + tag"
              [disabled]="isDisabled()"
              (click)="removeAt($index)"
            >
              <span uioIcon name="close" [size]="DELETE_ICON_SIZE"></span>
            </button>
          </div>
          <!--
            Mounted next to the chip rather than instead of it, so an edit
            swaps two hidden attributes and remounts nothing.
          -->
          <input
            class="tags-input__tag-input"
            data-scope="tags-input"
            data-part="item-input"
            tabindex="-1"
            [id]="itemId(tag, $index) + ':input'"
            [attr.aria-label]="
              'Editing tag ' + tag + '. Press enter to save or escape to cancel.'
            "
            [attr.hidden]="editingIndex() === $index ? null : ''"
            [disabled]="isDisabled()"
            [value]="editingIndex() === $index ? editingValue() : ''"
            (input)="editingValue.set($any($event.target).value)"
            (keydown)="onEditKeydown($event)"
            (blur)="cancelEdit()"
          />
        </div>
      }
      <input
        class="tags-input__entry"
        data-scope="tags-input"
        data-part="input"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="none"
        enterkeyhint="done"
        [id]="partId('input')"
        [attr.data-invalid]="flag(invalid())"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.data-readonly]="flag(readOnly())"
        [attr.data-empty]="flag(empty())"
        [attr.placeholder]="empty() ? placeholder() : null"
        [disabled]="isDisabled() || readOnly()"
        [value]="inputValue()"
        (input)="onInput($event)"
        (paste)="onPaste($event)"
        (keydown)="onKeydown($event)"
        (focus)="onEntryFocus()"
        (blur)="onEntryBlur($event)"
      />
    </div>
    @if (helperVisible()) {
      <span class="field__description">{{ helperText() }}</span>
    }
    <span uioFieldError [message]="errorMessage()"></span>
    <!--
      One field, comma-joined, because that is the shape a form submits and the
      shape Ark's hidden input carries in the other three libraries.
    -->
    <input
      type="text"
      hidden
      [id]="partId('hidden-input')"
      [attr.name]="name()"
      [attr.required]="required() ? '' : null"
      [attr.readonly]="readOnly() ? '' : null"
      [disabled]="isDisabled()"
      [value]="valueAsString()"
    />
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    /**
     * Not on `UioPart`, which declares only the vocabulary the stylesheet reads.
     * Ark emits `data-empty` on the root and the entry field, and the rendered
     * contract is what this package reproduces.
     */
    "[attr.data-empty]": "flag(empty())",
  },
})
export class UioTagsInput extends UioPart implements ControlValueAccessor {
  readonly scope = "tags-input";
  readonly part = "root";

  readonly value = model<string[]>([]);
  readonly valueChange = output<string[]>();

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows a message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly size = input<TagsInputSize>("md");
  /** Further entries are rejected once reached. Unbounded by default. */
  readonly max = input(Number.POSITIVE_INFINITY);
  /** Allows a double-click to edit an existing tag in place. */
  readonly editable = input(true, { transform: booleanAttribute });
  /** Splits typed or pasted text into several tags. */
  readonly delimiter = input(",");
  /** Creates tags from pasted text. */
  readonly addOnPaste = input(false, { transform: booleanAttribute });
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

  /**
   * Overflowing counts as invalid even without an `error`.
   *
   * Zag folds the two together, so a list pushed past `max` from outside reports
   * the same state as one the caller marked bad — which is what the stylesheet
   * reads.
   */
  override readonly invalid: Signal<boolean> = computed(
    () => !!this.error() || this.tags().length > this.max(),
  );
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.invalid());

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly hostClass = computed(() => tagsInputStyles({ size: this.size() }));
  protected readonly tags = computed(() => this.value() ?? []);
  protected readonly empty = computed(() => this.tags().length === 0);
  protected readonly valueAsString = computed(() => this.tags().join(", "));

  protected readonly inputValue = signal("");
  protected readonly focused = signal(false);
  /** Which chip Backspace/Delete would act on. `null` when the caret owns the field. */
  protected readonly highlightedIndex = signal<number | null>(null);
  protected readonly editingIndex = signal<number | null>(null);
  protected readonly editingValue = signal("");

  override readonly focus: Signal<boolean> = this.focused;
  protected readonly DELETE_ICON_SIZE = DELETE_ICON_SIZE;

  private readonly machine = nextMachineId();
  protected get rootId(): string {
    return `${this.scope}:${this.machine}`;
  }
  protected partId(part: string): string {
    return `${this.scope}:${this.machine}:${part}`;
  }
  /** Ark's shape: the root id, then the tag's own value and index. */
  protected itemId(value: string, index: number): string {
    return `${this.rootId}:tag:${value}:${index}`;
  }

  protected readonly flag = stateFlag;

  private get interactive(): boolean {
    return !this.isDisabled() && !this.readOnly();
  }

  // ── The entry field ───────────────────────────────────────────────────────

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    const delimiter = this.delimiter();
    // A typed delimiter ends a tag rather than becoming part of one.
    if (delimiter && text.endsWith(delimiter)) {
      this.inputValue.set(text.slice(0, -delimiter.length));
      this.addFromInput();
      return;
    }
    this.inputValue.set(text);
    this.highlightedIndex.set(null);
  }

  protected onPaste(event: ClipboardEvent): void {
    if (!this.addOnPaste() || !this.interactive) return;
    const pasted = event.clipboardData?.getData("text/plain");
    if (!pasted) return;
    event.preventDefault();
    const delimiter = this.delimiter();
    const parts = (delimiter ? pasted.split(delimiter) : [pasted])
      .map((part) => part.trim())
      .filter(Boolean);
    this.addMany(parts);
    this.inputValue.set("");
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.interactive) return;
    const element = event.target as HTMLInputElement;
    const atStart = element.selectionStart === 0 && element.selectionEnd === 0;

    if (event.key === "Enter") {
      event.preventDefault();
      // Enter means two different things depending on where the caret is: with
      // a chip highlighted it opens that chip for editing, which is the only
      // keyboard route into an in-place edit.
      const highlighted = this.highlightedIndex();
      if (highlighted != null && this.editable()) this.startEdit(highlighted);
      else this.addFromInput();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      this.highlightedIndex.set(null);
      return;
    }
    if (event.key === "Backspace") {
      if (!atStart || this.empty()) return;
      event.preventDefault();
      // First press highlights, second removes — see the class note.
      const highlighted = this.highlightedIndex();
      if (highlighted == null) this.highlightedIndex.set(this.tags().length - 1);
      else this.removeAt(highlighted);
      return;
    }
    if (event.key === "Delete") {
      const highlighted = this.highlightedIndex();
      if (highlighted == null) return;
      event.preventDefault();
      this.removeAt(highlighted);
      return;
    }
    if (event.key === "ArrowLeft" && atStart && !this.empty()) {
      event.preventDefault();
      const highlighted = this.highlightedIndex();
      this.highlightedIndex.set(
        highlighted == null ? this.tags().length - 1 : Math.max(highlighted - 1, 0),
      );
      return;
    }
    if (event.key === "ArrowRight") {
      const highlighted = this.highlightedIndex();
      if (highlighted == null) return;
      event.preventDefault();
      const next = highlighted + 1;
      this.highlightedIndex.set(next > this.tags().length - 1 ? null : next);
      return;
    }
    if (event.key.length === 1) this.highlightedIndex.set(null);
  }

  protected onEntryFocus(): void {
    this.focused.set(true);
  }

  /**
   * Focus moving from the entry field into a chip's own input is not a blur.
   *
   * Opening an edit does exactly that, and clearing the highlight there would
   * unstyle the chip being edited — the one the user is looking at. Same rule,
   * for the same reason, as the `data-ownedby` check in `UioPinInput`.
   */
  protected onEntryBlur(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) return;
    this.focused.set(false);
    this.highlightedIndex.set(null);
    this.onTouched();
  }

  /** Clicking the well anywhere but on a chip puts the caret in the entry field. */
  protected onControlPointerDown(event: PointerEvent): void {
    if (!this.interactive) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-part="item"]')) return;
    if (target.matches('[data-part="input"]')) return;
    event.preventDefault();
    this.entryEl()?.focus();
  }

  private entryEl(): HTMLInputElement | null {
    return this.host.nativeElement.querySelector<HTMLInputElement>('[data-part="input"]');
  }

  // ── Adding and removing ───────────────────────────────────────────────────

  private addFromInput(): void {
    const entry = this.inputValue().trim();
    if (!entry) return;
    this.addMany([entry]);
    this.inputValue.set("");
  }

  private addMany(entries: string[]): void {
    if (!this.interactive) return;
    const next = [...this.tags()];
    for (const entry of entries) {
      // `max` is a hard stop, and duplicates are dropped rather than appended —
      // both are Zag's defaults, and both are silent by design: a rejected tag
      // that cleared the field would look like the control had eaten it.
      if (next.length >= this.max()) break;
      if (next.includes(entry)) continue;
      next.push(entry);
    }
    this.commit(next);
  }

  protected removeAt(index: number): void {
    if (!this.interactive) return;
    const next = [...this.tags()];
    next.splice(index, 1);
    this.highlightedIndex.set(null);
    this.commit(next);
    this.entryEl()?.focus();
  }

  // ── Editing in place ──────────────────────────────────────────────────────

  protected startEdit(index: number): void {
    if (!this.interactive || !this.editable()) return;
    this.editingValue.set(this.tags()[index] ?? "");
    this.editingIndex.set(index);
    // An animation frame, not a microtask: the chip's input is still `hidden`
    // until change detection has run, and a hidden input cannot take focus.
    requestAnimationFrame(() => {
      const input = this.host.nativeElement.querySelectorAll<HTMLInputElement>(
        '[data-part="item-input"]',
      )[index];
      input?.select();
    });
  }

  protected onEditKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      this.commitEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      this.cancelEdit();
    }
  }

  private commitEdit(): void {
    const index = this.editingIndex();
    if (index == null) return;
    const edited = this.editingValue().trim();
    const next = [...this.tags()];
    // An emptied tag is a deletion, which is the only way to remove one without
    // reaching for the mouse once an edit has started.
    if (!edited) next.splice(index, 1);
    else if (!next.some((tag, at) => at !== index && tag === edited)) next[index] = edited;
    this.editingIndex.set(null);
    this.editingValue.set("");
    this.commit(next);
    this.entryEl()?.focus();
  }

  protected cancelEdit(): void {
    if (this.editingIndex() == null) return;
    this.editingIndex.set(null);
    this.editingValue.set("");
  }

  private commit(next: string[]): void {
    const current = this.tags();
    if (next.length === current.length && next.every((tag, i) => tag === current[i])) return;
    this.value.set(next);
    this.valueChange.emit(next);
    this.onChange(next);
  }

  // ── Forms ─────────────────────────────────────────────────────────────────

  protected onTouched: () => void = () => {};
  private onChange: (value: string[]) => void = () => {};

  writeValue(value: string[] | null): void {
    this.value.set(value ?? []);
  }
  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
