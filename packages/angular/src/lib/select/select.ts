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
import {
  CONTROL_ICON_SIZE,
  selectFieldStyles,
  type ControlSize,
  type SelectVariants,
} from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { VISUALLY_HIDDEN_INPUT, nextMachineId } from "../part-ids.js";
import { UioFieldContext } from "../field/field-context.js";
import { UioFieldError } from "../field-error/field-error.js";
import { UioIcon } from "../icons/icon.js";
import { AnchoredSurface } from "../overlay/anchored.js";
import { anchoredPositions } from "../overlay/anchor.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { restoreFocus } from "../overlay/focus.js";
import { moveHighlight } from "../overlay/roving.js";
import { applySurfaceStacking, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";

export type SelectSize = NonNullable<SelectVariants["size"]>;
export type SelectVariant = NonNullable<SelectVariants["variant"]>;

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * A single-choice dropdown, with its label, helper text and error already wired
 * to it.
 *
 * ```html
 * <div uioSelect label="Fruit" [options]="fruit" formControlName="fruit"></div>
 * ```
 *
 * ── Three things that look like details and are not ─────────────────────────
 *
 * **The label is a Select part, not a Field part.** Ark's Select renders its own
 * Label — `data-scope="select"` — but gives it the *field's* id, because three
 * separate references point at it: the trigger's `aria-labelledby`, the
 * listbox's, and the hidden native select's. That is also why the ghost variant
 * hides the label instead of dropping it: with no Label element all three
 * references dangle, and a dangling IDREF outranks any `aria-label` beside it,
 * so the field ends up with no accessible name at all.
 *
 * **The hidden `<select>` is the form control.** It is what carries `name`,
 * `required`, `disabled` and `aria-describedby`, and what a plain HTML form
 * submits. The visible trigger is a `role="combobox"` button.
 *
 * **The listbox keeps focus; the option is only named.** Ark drives the popup
 * with `aria-activedescendant`, so `[data-highlighted]` — which is the whole
 * hover treatment in the shared stylesheet — sits on an option that does not
 * have DOM focus. See `overlay/roving.ts` for why the CDK's
 * `ActiveDescendantKeyManager` could not supply it.
 *
 * ── The Angular-specific win ────────────────────────────────────────────────
 *
 * `ControlValueAccessor`, so `[(ngModel)]` and Reactive Forms both drive it,
 * including `control.disable()` reaching every part's `data-disabled`. React has
 * no equivalent; this is capability rather than parity debt.
 */
@Component({
  selector: "div[uioSelect]",
  standalone: true,
  exportAs: "uioSelect",
  imports: [UioIcon, UioFieldError],
  providers: [
    UioFieldContext,
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioSelect), multi: true },
  ],
  template: `
    <div
      class="select-field__control"
      data-scope="select"
      data-part="root"
      [id]="selectId"
      [attr.data-invalid]="flag(invalid())"
    >
      @if (label(); as text) {
        <label
          [class]="labelClass()"
          data-scope="select"
          data-part="label"
          [id]="field.partId('label')"
          [attr.for]="field.controlId"
          [attr.data-invalid]="flag(invalid())"
          [attr.data-disabled]="flag(isDisabled())"
          [attr.data-required]="flag(required())"
          >{{ text }}@if (required() && !isGhost()) {<span
            class="field__required"
            aria-hidden="true"
          ></span>}</label
        >
      }
      <button
        class="select-field__trigger text-default-body-large"
        data-scope="select"
        data-part="trigger"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        [id]="partId('trigger')"
        [attr.data-state]="openState()"
        [attr.aria-expanded]="open() ? 'true' : 'false'"
        [attr.aria-invalid]="invalid() ? 'true' : 'false'"
        [attr.aria-required]="required() ? 'true' : 'false'"
        [attr.aria-labelledby]="label() ? field.partId('label') : null"
        [attr.aria-controls]="open() ? partId('content') : null"
        [attr.data-placement]="anchored.placement()"
        [attr.data-side]="anchored.side()"
        [attr.data-placeholder-shown]="flag(!chosen())"
        [attr.data-invalid]="flag(invalid())"
        [attr.data-disabled]="flag(isDisabled())"
        [disabled]="isDisabled()"
        (click)="toggle()"
        (keydown)="onTriggerKeydown($event)"
        (focus)="focused.set(true)"
        (blur)="focused.set(false); onTouched()"
      >
        <span
          class="select-field__value"
          data-scope="select"
          data-part="value-text"
          [attr.data-focus]="flag(focused())"
          [attr.data-invalid]="flag(invalid())"
          [attr.data-disabled]="flag(isDisabled())"
          >{{ valueText() }}</span
        >
        <div
          class="select-field__icon"
          data-scope="select"
          data-part="indicator"
          aria-hidden="true"
          [attr.data-state]="openState()"
          [attr.data-invalid]="flag(invalid())"
          [attr.data-disabled]="flag(isDisabled())"
        >
          <span uioIcon name="chevron-down" [size]="iconSize()"></span>
        </div>
      </button>
      <!--
        The control a form actually submits. Ark calls it HiddenSelect; it takes
        the name, the validation attributes and the field's description, and the
        visible trigger takes none of them.
      -->
      <select
        aria-hidden="true"
        tabindex="-1"
        [id]="field.controlId"
        [attr.style]="HIDDEN"
        [attr.name]="name()"
        [attr.required]="required() ? '' : null"
        [disabled]="isDisabled()"
        [attr.aria-labelledby]="label() ? field.partId('label') : null"
        [attr.aria-describedby]="field.describedBy()"
        [value]="value() ?? ''"
      >
        <!--
          The placeholder option, and only while nothing is chosen. Ark drops it
          the moment there is a value — leaving it would offer "no answer" as a
          choice in a native form long after one had been made.
        -->
        @if (!chosen()) {
          <option value=""></option>
        }
        @for (option of options(); track option.value) {
          <option [value]="option.value" [disabled]="!!option.disabled">{{ option.label }}</option>
        }
      </select>
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
        class="select-positioner"
        data-scope="select"
        data-part="positioner"
        [id]="partId('positioner')"
      >
        <div
          [class]="popupClass()"
          data-scope="select"
          data-part="content"
          role="listbox"
          tabindex="0"
          [id]="partId('content')"
          [attr.data-state]="openState()"
          [attr.hidden]="open() ? null : ''"
          [attr.data-placement]="anchored.placement()"
          [attr.data-side]="anchored.side()"
          [attr.aria-labelledby]="label() ? field.partId('label') : null"
          [attr.aria-activedescendant]="activeDescendant()"
          [attr.data-activedescendant]="activeDescendant()"
          (keydown)="onListKeydown($event)"
        >
          @for (option of options(); track option.value) {
            <div
              class="select-popup__item text-default-body-large"
              data-scope="select"
              data-part="item"
              role="option"
              [id]="optionId(option.value)"
              [attr.data-value]="option.value"
              [attr.aria-selected]="value() === option.value ? 'true' : 'false'"
              [attr.data-state]="value() === option.value ? 'checked' : 'unchecked'"
              [attr.data-disabled]="flag(!!option.disabled)"
              [attr.aria-disabled]="option.disabled ? 'true' : null"
              [attr.data-highlighted]="flag(highlightedValue() === option.value)"
              (click)="choose(option)"
              (pointermove)="highlight(option)"
            >
              <span
                data-scope="select"
                data-part="item-text"
                [attr.data-state]="value() === option.value ? 'checked' : 'unchecked'"
                [attr.data-disabled]="flag(!!option.disabled)"
                [attr.data-highlighted]="flag(highlightedValue() === option.value)"
                >{{ option.label }}</span
              >
              <div
                class="select-popup__item-indicator"
                aria-hidden="true"
                data-scope="select"
                data-part="item-indicator"
                [attr.data-state]="value() === option.value ? 'checked' : 'unchecked'"
                [attr.hidden]="value() === option.value ? null : ''"
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
export class UioSelect extends UioPart implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {
  readonly scope = "field";
  readonly part = "root";

  readonly options = input<readonly SelectOption[]>([]);
  readonly value = model<string | undefined>(undefined);
  readonly open = model(false);
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows a message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly size = input<SelectSize>("md");
  readonly variant = input<SelectVariant>("default");
  readonly name = input<string | undefined>(undefined);
  readonly required = input(false, { transform: booleanAttribute });
  readonly valueChange = output<string>();

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
   * — the open/closed state belongs to the trigger, the indicator and the
   * listbox, which are three elements further in. Overriding the base's `state`
   * would stamp `data-state="open"` on a `role="group"` that has no such state.
   */
  protected readonly openState = computed(() => (this.open() ? "open" : "closed"));

  readonly machine = nextMachineId();
  readonly anchored = new AnchoredSurface(inject(Overlay));
  protected readonly field = inject(UioFieldContext);
  /** Named `highlightedValue` because `UioPart.highlighted` is this element's own state. */
  protected readonly highlightedValue = signal<string | null>(null);
  /**
   * Whether the *trigger* has DOM focus.
   *
   * Ark marks it on the value-text part alone — not on the trigger, and not
   * while the popup is open, when focus has moved to the listbox. It is the
   * state a user is left in after choosing an option, so it shows up the moment
   * anything drives this control by keyboard.
   */
  protected readonly focused = signal(false);

  protected readonly isGhost = computed(() => this.variant() === "ghost");
  protected readonly hostClass = computed(() =>
    selectFieldStyles({ size: this.size(), variant: this.variant() }),
  );
  protected readonly labelClass = computed(() =>
    this.isGhost() ? "select-field__label--hidden" : "field__label",
  );
  protected readonly popupClass = computed(() =>
    clsx("select-popup", this.isGhost() && "select-popup--ghost"),
  );
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size() as ControlSize]);
  /** Named `chosen` because `UioPart.selected` is this element's own state. */
  protected readonly chosen = computed(() =>
    this.options().find((option) => option.value === this.value()),
  );
  protected readonly valueText = computed(() => this.chosen()?.label ?? this.placeholder() ?? "");
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  /** An error replaces the helper text rather than stacking under it. */
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.invalid());
  protected readonly activeDescendant = computed(() => {
    const value = this.highlightedValue();
    return value === null ? null : this.optionId(value);
  });

  protected readonly HIDDEN = VISUALLY_HIDDEN_INPUT;
  protected readonly flag = stateFlag;

  @ViewChild("surface", { static: true }) private surface!: TemplateRef<unknown>;
  @ViewChild("anchor", { read: ViewContainerRef, static: true }) private anchor!: ViewContainerRef;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);

  private surfaceView?: EmbeddedViewRef<unknown>;
  private applied = false;

  private readonly layer: DismissibleLayer = {
    surface: () => this.contentElement(),
    trigger: () => this.triggerElement(),
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
    effect(() => {
      this.open();
      untracked(() => this.sync());
    });
  }

  get selectId(): string {
    return `select:${this.machine}`;
  }
  partId(part: string): string {
    return `select:${this.machine}:${part}`;
  }
  /** Ark's option ids carry the value, so two selects on a page cannot collide. */
  optionId(value: string): string {
    return this.partId(`option:${value}`);
  }

  /**
   * `ngOnInit`, not `ngAfterViewInit`, and the queries are static because of it.
   *
   * `ngAfterViewInit` runs bottom-up: a select declared inside a dialog attaches
   * its overlay *before* the dialog attaches its own, so the CDK's single
   * container ends up holding the inner surface first. The other three libraries
   * portal each surface straight into `document.body`, where a dialog's backdrop
   * and popup land before anything declared inside them — and anything reading
   * the document in order sees a different tree for the same page.
   *
   * It is also the right order on its own terms: an inner surface should not
   * exist before the surface that contains it, because `hideOthersFrom` and the
   * browser's top layer both work from what is already there.
   */
  ngOnInit(): void {
    const trigger = this.triggerElement();
    const ref = this.anchored.create(
      trigger ?? this.host.nativeElement,
      // Ark's Select positions itself bottom-start with a 4px gutter; the popup
      // is as wide as the trigger, so there is no centring to do.
      anchoredPositions("bottom", "start", 4),
    );
    this.surfaceView = ref.attach(
      new TemplatePortal(this.surface, this.anchor),
    ) as EmbeddedViewRef<unknown>;
    applySurfaceStacking(ref);
    setSurfaceInteractive(ref, false);
  }

  /**
   * The trigger exists by now for certain, where `ngOnInit` only creates the
   * overlay early enough to keep the container in document order.
   */
  ngAfterViewInit(): void {
    const trigger = this.triggerElement();
    if (trigger) this.anchored.setAnchor(trigger);
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

  protected highlight(option: SelectOption): void {
    this.highlightedValue.set(option.disabled ? null : option.value);
  }

  protected choose(option: SelectOption): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.valueChange.emit(option.value);
    this.onChange(option.value);
    this.close();
  }

  /** Space, Enter and the arrows open a closed select — the APG combobox keys. */
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.open()) return;
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    this.show();
  }

  protected onListKeydown(event: KeyboardEvent): void {
    const options = this.options();
    const navigable = options.map((option) => ({ disabled: !!option.disabled }));
    const current = options.findIndex((option) => option.value === this.highlightedValue());

    const move = (step: number) => {
      const next = options[moveHighlight(navigable, current, step)];
      if (next) this.highlightedValue.set(next.value);
      event.preventDefault();
    };

    switch (event.key) {
      case "ArrowDown":
        return move(1);
      case "ArrowUp":
        return move(-1);
      case "Home":
        this.highlightedValue.set(null);
        return move(1);
      case "End":
        this.highlightedValue.set(null);
        return move(-1);
      case "Enter":
      case " ": {
        event.preventDefault();
        const option = options[current];
        if (option) this.choose(option);
        return;
      }
      case "Tab":
        this.close();
        return;
      default:
        return;
    }
  }

  private triggerElement(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('[data-part="trigger"]');
  }
  private contentElement(): HTMLElement | null {
    return (
      this.anchored.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="content"]') ??
      null
    );
  }

  private setOpen(next: boolean): void {
    if (next && this.isDisabled()) return;
    this.open.set(next);
    if (next) pushLayer(this.document, this.layer);
    else removeLayer(this.layer);
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
    this.surfaceView?.detectChanges();
    this.sizeToTrigger();
    this.anchored.reposition();
    raiseSurface(ref);
    setSurfaceInteractive(ref, true);
    // Ark opens on the current selection when there is one, and on nothing when
    // there is not — which is why a fresh select reports no `aria-activedescendant`.
    this.highlightedValue.set(this.chosen()?.value ?? null);
    this.contentElement()?.focus({ preventScroll: true });
    pushLayer(this.document, this.layer);
  }

  private applyClose(): void {
    this.applied = false;
    removeLayer(this.layer);
    this.highlightedValue.set(null);
    this.surfaceView?.detectChanges();
    const ref = this.anchored.overlayRef;
    if (ref) setSurfaceInteractive(ref, false);
    restoreFocus(this.triggerElement());
  }

  /**
   * `.select-popup` is `width: var(--reference-width)` — zag measures the trigger
   * and publishes it on the positioner. Nothing in the CDK does, so the popup
   * would be `width: auto` and narrower than the control it belongs to.
   */
  private sizeToTrigger(): void {
    const trigger = this.triggerElement();
    const positioner = this.anchored.overlayRef?.overlayElement.querySelector<HTMLElement>(
      '[data-part="positioner"]',
    );
    if (trigger && positioner) {
      positioner.style.setProperty("--reference-width", `${trigger.offsetWidth}px`);
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
