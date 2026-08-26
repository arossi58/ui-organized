import { Overlay } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import {
  AfterViewInit,
  ApplicationRef,
  Component,
  DOCUMENT,
  ElementRef,
  EmbeddedViewRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  type Signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, comboboxFieldStyles, type ControlSize } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioFieldContext } from "../field/field-context.js";
import { UioFieldError } from "../field-error/field-error.js";
import { UioIcon } from "../icons/icon.js";
import { AnchoredSurface } from "../overlay/anchored.js";
import { anchoredPositions } from "../overlay/anchor.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { applySurfaceStacking, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";

export type ComboboxSize = ControlSize;

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * A text box that filters a list, and the list it filters.
 *
 * ```html
 * <div uioCombobox label="Fruit" [options]="fruit" formControlName="fruit"></div>
 * ```
 *
 * ── Three things this is not ────────────────────────────────────────────────
 *
 * **Not a Select with a text box.** The input is the control: it takes focus, it
 * takes the field's id, and it is what `aria-activedescendant` is written on.
 * The popup never takes focus at all — which is why its `pointerdown` is
 * cancelled, so that clicking an option cannot blur the input and close the
 * thing being clicked.
 *
 * **Not filtered by Ark.** Zag's combobox machine holds a collection and does
 * not narrow it; every library here mirrors the input text and rebuilds the
 * list itself. The comparison is a locale-aware substring match — a
 * `search`-usage `Intl.Collator` at base sensitivity — so "cafe" finds "Café"
 * and "APPLE" finds "Apple" in every locale, which `toLowerCase().includes()`
 * does in none of them.
 *
 * **Not the same navigation as `UioListbox`.** `loopFocus` is on here, so
 * ArrowDown past the last option wraps to the first. The listbox's does not.
 * They look like the same list and Ark configures them differently.
 *
 * ── The one that will surprise you ──────────────────────────────────────────
 *
 * Choosing an option writes its label into the input, and the input's text *is*
 * the filter — so a combobox reopened after a choice shows only the chosen
 * option. That is Ark's behaviour in all three other libraries, verified in the
 * browser, and it is not a bug in this port. Anything that "fixed" it here would
 * make Angular the odd one out.
 *
 * ── The Angular-specific win ────────────────────────────────────────────────
 *
 * `ControlValueAccessor`, so `[(ngModel)]` and Reactive Forms both drive it,
 * including `control.disable()` reaching every part's `data-disabled`.
 */
@Component({
  selector: "div[uioCombobox]",
  standalone: true,
  exportAs: "uioCombobox",
  imports: [UioIcon, UioFieldError],
  providers: [
    UioFieldContext,
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioCombobox), multi: true },
  ],
  template: `
    <!--
      Ark's Combobox.Root renders a wrapping <div>; display: contents on
      .combobox-field__root keeps the label, control and helper as direct flex
      children of the field.
    -->
    <div
      class="combobox-field__root"
      data-scope="combobox"
      data-part="root"
      [id]="comboboxId"
      [attr.data-invalid]="flag(invalid())"
    >
      @if (label(); as text) {
        <!--
          The label is a Combobox part carrying the *field's* id, because that is
          what the input's for and the listbox's aria-labelledby both name.
        -->
        <label
          class="field__label"
          data-scope="combobox"
          data-part="label"
          [id]="field.partId('label')"
          [attr.for]="field.controlId"
          [attr.data-focus]="flag(focused())"
          [attr.data-invalid]="flag(invalid())"
          [attr.data-disabled]="flag(isDisabled())"
          [attr.data-required]="flag(required())"
          >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
        >
      }
      <div
        class="combobox-field__control"
        data-scope="combobox"
        data-part="control"
        [id]="partId('control')"
        [attr.data-state]="openState()"
        [attr.data-focus]="flag(focused())"
        [attr.data-invalid]="flag(invalid())"
        [attr.data-disabled]="flag(isDisabled())"
      >
        <input
          class="field__control combobox-field__input"
          data-scope="combobox"
          data-part="input"
          type="text"
          role="combobox"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="none"
          spellcheck="false"
          aria-autocomplete="list"
          [id]="field.controlId"
          [value]="inputValue()"
          [attr.placeholder]="placeholder()"
          [attr.name]="name()"
          [attr.required]="required() ? '' : null"
          [disabled]="isDisabled()"
          [attr.aria-controls]="partId('content')"
          [attr.aria-expanded]="open() ? 'true' : 'false'"
          [attr.aria-activedescendant]="activeDescendant()"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          [attr.aria-describedby]="field.describedBy()"
          [attr.data-state]="openState()"
          [attr.data-invalid]="flag(invalid())"
          (input)="onInput($event)"
          (keydown)="onInputKeydown($event)"
          (focus)="focused.set(true)"
          (blur)="onInputBlur()"
        />
        <!--
          tabindex="-1": the input is the tab stop, and a second one beside it
          would make every combobox in a form take two Tabs to leave.
        -->
        <button
          class="combobox-field__trigger"
          data-scope="combobox"
          data-part="trigger"
          type="button"
          tabindex="-1"
          aria-haspopup="listbox"
          aria-label="Toggle options"
          [id]="partId('toggle-btn')"
          [attr.aria-expanded]="open() ? 'true' : 'false'"
          [attr.aria-controls]="open() ? partId('content') : null"
          [attr.data-state]="openState()"
          [attr.data-invalid]="flag(invalid())"
          [attr.data-disabled]="flag(isDisabled())"
          [disabled]="isDisabled()"
          (pointerdown)="onTriggerPointerDown($event)"
          (click)="toggle()"
        >
          <span uioIcon name="chevron-down" [size]="iconSize()"></span>
        </button>
      </div>
    </div>
    @if (helperVisible()) {
      <span
        class="field__description"
        data-scope="field"
        data-part="helper-text"
        [id]="field.partId('helper-text')"
        >{{ helperText() }}</span
      >
    }
    <span uioFieldError [message]="errorMessage()"></span>

    <!-- See UioPopover: a container anchored on the host is re-homed by projection. -->
    <ng-container #anchor />
    <ng-template #surface>
      <div
        class="combobox-positioner"
        data-scope="combobox"
        data-part="positioner"
        [id]="partId('popper')"
      >
        <div
          class="combobox-popup"
          data-scope="combobox"
          data-part="content"
          role="listbox"
          tabindex="-1"
          [id]="partId('content')"
          [attr.data-state]="openState()"
          [attr.hidden]="open() ? null : ''"
          [attr.data-placement]="anchored.placement()"
          [attr.data-side]="anchored.side()"
          [attr.aria-labelledby]="field.partId('label')"
          [attr.data-empty]="flag(!matches().length)"
          (pointerdown)="$event.preventDefault()"
        >
          <!--
            Ark renders the Empty part only when nothing matched, and renders it
            before the items — so the two can never be on screen together.
          -->
          @if (!matches().length) {
            <div
              class="combobox-popup__empty text-default-body-medium"
              data-scope="combobox"
              data-part="empty"
              role="presentation"
            >
              {{ emptyMessage() }}
            </div>
          }
          @for (option of matches(); track option.value) {
            <div
              class="combobox-popup__item text-default-body-large"
              data-scope="combobox"
              data-part="item"
              role="option"
              tabindex="-1"
              [id]="optionId(option.value)"
              [attr.data-value]="option.value"
              [attr.data-state]="isChosen(option.value) ? 'checked' : 'unchecked'"
              [attr.aria-selected]="isChosen(option.value) ? 'true' : null"
              [attr.data-highlighted]="flag(highlightedValue() === option.value)"
              [attr.data-disabled]="flag(!!option.disabled)"
              [attr.aria-disabled]="option.disabled ? 'true' : null"
              (click)="choose(option)"
              (pointermove)="highlight(option)"
            >
              <span class="combobox-popup__item-label">{{ option.label }}</span>
              <div
                class="combobox-popup__item-indicator"
                data-scope="combobox"
                data-part="item-indicator"
                aria-hidden="true"
                [attr.data-state]="isChosen(option.value) ? 'checked' : 'unchecked'"
                [attr.hidden]="isChosen(option.value) ? null : ''"
              >
                <span uioIcon name="check" [size]="iconSize()"></span>
              </div>
            </div>
          }
        </div>
      </div>
    </ng-template>
  `,
  host: {
    role: "group",
    "[class]": "hostClass()",
    "[id]": "field.rootId",
  },
})
export class UioCombobox
  extends UioPart
  implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor
{
  readonly scope = "field";
  readonly part = "root";

  readonly options = input<readonly ComboboxOption[]>([]);
  readonly value = model<string | undefined>(undefined);
  readonly open = model(false);
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows a message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly size = input<ComboboxSize>("md");
  readonly name = input<string | undefined>(undefined);
  readonly required = input(false, { transform: booleanAttribute });
  readonly emptyMessage = input("No results found.");
  readonly valueChange = output<string>();
  readonly openChange = output<boolean>();

  /** `disabled` comes from the caller *or* from a reactive form's disabled state. */
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabledInput() || this.formDisabled());
  override readonly disabled: Signal<boolean> = this.isDisabled;
  override readonly invalid: Signal<boolean> = computed(() => !!this.error());

  /**
   * Deliberately *not* `UioPart.state`.
   *
   * This component's host is the field root, and Ark puts no `data-state` on it
   * — open and closed belong to the control, the input, the trigger and the
   * popup, which are four elements further in.
   */
  protected readonly openState = computed(() => (this.open() ? "open" : "closed"));

  readonly machine = nextMachineId();
  readonly anchored = new AnchoredSurface(inject(Overlay));
  protected readonly field = inject(UioFieldContext);

  /** The text in the box, which is also the filter. See the class comment. */
  protected readonly inputValue = signal("");
  /** Named `highlightedValue` because `UioPart.highlighted` is this element's own state. */
  protected readonly highlightedValue = signal<string | null>(null);
  protected readonly focused = signal(false);

  protected readonly flag = stateFlag;
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size()]);
  protected readonly hostClass = computed(() => clsx(comboboxFieldStyles({ size: this.size() })));
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  /** An error replaces the helper text rather than stacking under it. */
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.invalid());

  /**
   * A `search`-usage collator, built once.
   *
   * `usage: "search"` is what makes `compare` answer "are these the same word"
   * rather than "which sorts first", and base sensitivity is what makes it
   * ignore case and accents. Rebuilding it per keystroke is the expensive part
   * of this comparison, which is why it is a field.
   */
  private readonly collator = new Intl.Collator(undefined, {
    usage: "search",
    sensitivity: "base",
  });

  /** The options on screen. An empty query shows everything, unfiltered. */
  protected readonly matches = computed(() => {
    const query = this.inputValue().trim();
    if (!query.length) return [...this.options()];
    return this.options().filter((option) => this.contains(option.label, query));
  });

  protected readonly activeDescendant = computed(() => {
    const value = this.highlightedValue();
    return value === null ? null : this.optionId(value);
  });

  @ViewChild("surface", { static: true }) private surface!: TemplateRef<unknown>;
  @ViewChild("anchor", { read: ViewContainerRef, static: true }) private anchor!: ViewContainerRef;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);

  private surfaceView?: EmbeddedViewRef<unknown>;
  private applied = false;

  private readonly layer: DismissibleLayer = {
    surface: () => this.contentElement(),
    trigger: () => this.controlElement(),
    dismiss: () => this.close(),
  };

  constructor() {
    super();
    this.field.bind({
      invalid: this.invalid,
      disabled: this.isDisabled,
      required: this.required,
      readOnly: signal(false),
    });
    this.field.describe("helper-text", this.helperVisible);
    /**
     * The box shows the chosen option's label — including when a form writes the
     * value, which is the path `writeValue` takes.
     *
     * Tracks `value` alone. Reading `options` here as well would re-run on every
     * list change and wipe whatever the user was halfway through typing, which
     * is exactly what happens to a combobox whose options are loaded as you
     * type.
     */
    effect(() => {
      const value = this.value();
      untracked(() => {
        const chosen = this.options().find((option) => option.value === value);
        this.inputValue.set(chosen?.label ?? "");
      });
    });
    effect(() => {
      this.open();
      untracked(() => this.sync());
    });
  }

  get comboboxId(): string {
    return `combobox:${this.machine}`;
  }
  partId(part: string): string {
    return `combobox:${this.machine}:${part}`;
  }
  /** Ark's option ids carry the value, so two comboboxes on a page cannot collide. */
  optionId(value: string): string {
    return this.partId(`option:${value}`);
  }

  /** See `UioSelect.ngOnInit` for why the overlay is created this early. */
  ngOnInit(): void {
    const ref = this.anchored.create(
      this.controlElement() ?? this.host.nativeElement,
      // Ark positions the popup bottom-start with a 4px gutter, against the
      // *control* rather than the trigger — the popup is as wide as the whole
      // field, not as wide as the chevron.
      anchoredPositions("bottom", "start", 4),
    );
    this.surfaceView = ref.attach(
      new TemplatePortal(this.surface, this.anchor),
    ) as EmbeddedViewRef<unknown>;
    applySurfaceStacking(ref);
    setSurfaceInteractive(ref, false);
  }

  ngAfterViewInit(): void {
    const control = this.controlElement();
    if (control) this.anchored.setAnchor(control);
  }

  ngOnDestroy(): void {
    removeLayer(this.layer);
    this.anchored.dispose();
  }

  toggle(): void {
    this.setOpen(!this.open());
  }
  show(): void {
    this.setOpen(true);
  }
  close(): void {
    this.setOpen(false);
  }

  protected isChosen(value: string): boolean {
    return this.value() === value;
  }

  protected highlight(option: ComboboxOption): void {
    if (option.disabled) return;
    this.highlightedValue.set(option.value);
  }

  protected choose(option: ComboboxOption): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.inputValue.set(option.label);
    this.valueChange.emit(option.value);
    this.onChange(option.value);
    this.close();
  }

  /**
   * Focus the input *instead of* the trigger.
   *
   * The trigger is not a tab stop, so a click on it would otherwise leave focus
   * wherever it was — and every keystroke after opening the popup would go
   * somewhere else. Cancelling the pointerdown is what stops the browser giving
   * the button focus in the first place.
   */
  protected onTriggerPointerDown(event: PointerEvent): void {
    if (this.isDisabled()) return;
    event.preventDefault();
    this.inputElement()?.focus({ preventScroll: true });
  }

  protected onInput(event: Event): void {
    this.inputValue.set((event.target as HTMLInputElement).value);
    // Typing opens: `openOnChange` is on, and a filtered list nobody can see is
    // the one state this control must never be in.
    if (!this.open()) this.show();
    else this.refresh();
    // A highlight on an option that has just been filtered out would name an
    // element that is no longer there.
    if (!this.matches().some((option) => option.value === this.highlightedValue())) {
      this.highlightedValue.set(null);
    }
  }

  protected onInputBlur(): void {
    this.focused.set(false);
    this.close();
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    const options = this.matches();
    const current = options.findIndex((option) => option.value === this.highlightedValue());

    const move = (step: number) => {
      event.preventDefault();
      if (!this.open()) {
        // `openOnKeyPress` — an arrow on a closed combobox opens it rather than
        // moving a highlight nobody can see.
        this.show();
        return;
      }
      const next = this.step(options, current, step);
      if (next) this.highlightedValue.set(next.value);
      this.refresh();
    };

    switch (event.key) {
      case "ArrowDown":
        return move(1);
      case "ArrowUp":
        return move(-1);
      case "Home":
      case "End": {
        if (!this.open()) return;
        event.preventDefault();
        // From "nothing highlighted", one step forward is the first option and
        // one step back is the last — so both ends come out of the same walk.
        const edge = this.step(options, -1, event.key === "Home" ? 1 : -1);
        if (edge) this.highlightedValue.set(edge.value);
        return this.refresh();
      }
      case "Enter": {
        const option = options[current];
        if (!this.open() || !option) return;
        event.preventDefault();
        return this.choose(option);
      }
      case "Escape": {
        if (!this.open()) return;
        event.preventDefault();
        return this.close();
      }
      default:
        return;
    }
  }

  /**
   * The next selectable option, wrapping at both ends.
   *
   * `loopFocus` is on for a combobox and off for a listbox — see the class
   * comment. `current` of -1 means nothing is highlighted, which is the state
   * the popup opens in, so the first ArrowDown lands on the first option and the
   * first ArrowUp on the last.
   */
  private step(
    options: readonly ComboboxOption[],
    current: number,
    step: number,
  ): ComboboxOption | undefined {
    if (!options.length) return undefined;
    // Nothing highlighted starts the walk *outside* the list, on the side the
    // step is coming from, so +1 lands on the first option and -1 on the last.
    let index = current === -1 ? (step > 0 ? -1 : 0) : current;
    for (let attempt = 0; attempt < options.length; attempt++) {
      index = (index + step + options.length) % options.length;
      const option = options[index];
      if (option && !option.disabled) return option;
    }
    return undefined;
  }

  /**
   * Zag's `contains`, which is a collator scan rather than a substring test.
   *
   * `String.includes` after `toLowerCase` gets the common cases right and the
   * ones that matter wrong: it does not fold accents, and its idea of "lower
   * case" is the invariant one, so a Turkish user typing "i" fails to find
   * "İstanbul".
   */
  private contains(text: string, query: string): boolean {
    const haystack = text.normalize("NFC");
    const needle = query.normalize("NFC");
    for (let start = 0; start + needle.length <= haystack.length; start++) {
      if (this.collator.compare(needle, haystack.slice(start, start + needle.length)) === 0) {
        return true;
      }
    }
    return false;
  }

  private inputElement(): HTMLInputElement | null {
    return this.host.nativeElement.querySelector<HTMLInputElement>('[data-part="input"]');
  }
  private controlElement(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('[data-part="control"]');
  }
  private contentElement(): HTMLElement | null {
    return (
      this.anchored.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="content"]') ??
      null
    );
  }

  private setOpen(next: boolean): void {
    if (next && this.isDisabled()) return;
    if (next === this.open()) return;
    this.open.set(next);
    this.openChange.emit(next);
    flushNow(this.appRef);
  }

  private sync(): void {
    const open = this.open();
    if (open === this.applied) return;
    if (open) this.applyOpen();
    else this.applyClose();
  }

  private applyOpen(): void {
    this.applied = true;
    const ref = this.anchored.overlayRef;
    if (!ref) return;
    // Ark opens on the current selection when there is one, and on nothing when
    // there is not — which is why a fresh combobox reports no active descendant.
    this.highlightedValue.set(this.value() ?? null);
    this.surfaceView?.detectChanges();
    this.sizeToControl();
    this.anchored.reposition();
    raiseSurface(ref);
    setSurfaceInteractive(ref, true);
    pushLayer(this.document, this.layer);
  }

  private applyClose(): void {
    this.applied = false;
    removeLayer(this.layer);
    this.highlightedValue.set(null);
    this.surfaceView?.detectChanges();
    const ref = this.anchored.overlayRef;
    if (ref) setSurfaceInteractive(ref, false);
  }

  /** Re-render the portalled view and re-place it, which filtering both needs. */
  private refresh(): void {
    this.surfaceView?.detectChanges();
    this.anchored.reposition();
  }

  /**
   * `.combobox-popup` is `width: var(--reference-width)` — zag measures the
   * control and publishes it on the positioner. Nothing in the CDK does, so the
   * popup would be `width: auto` and narrower than the field it belongs to.
   */
  private sizeToControl(): void {
    const control = this.controlElement();
    const positioner = this.anchored.overlayRef?.overlayElement.querySelector<HTMLElement>(
      '[data-part="positioner"]',
    );
    if (control && positioner) {
      positioner.style.setProperty("--reference-width", `${control.offsetWidth}px`);
    }
  }

  protected onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? undefined);
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
