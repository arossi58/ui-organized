import { Overlay } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import {
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
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from "@angular/core";
import {
  COLOR_NOTATIONS,
  COLOR_NOTATION_FIELDS,
  CONTROL_ICON_SIZE,
  colorPickerStyles,
  type ColorField,
  type ColorNotation,
  type ColorPickerVariants,
  type ControlSize,
} from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { UioFieldError } from "../field-error/field-error.js";
import { UioIcon } from "../icons/icon.js";
import { UioInput } from "../input/input.js";
import { UioSelect } from "../select/select.js";
import { nextMachineId, VISUALLY_HIDDEN_INPUT } from "../part-ids.js";
import { AnchoredSurface } from "../overlay/anchored.js";
import { anchoredPositions } from "../overlay/anchor.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { focusInside, restoreFocus } from "../overlay/focus.js";
import { applySurfaceStacking, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";
import { readField, writeField } from "./channel-fields.js";
import {
  channelPercent,
  channelRange,
  channelValue,
  colorChannels,
  colorToString,
  isSameColor,
  parseColor,
  roundTo,
  toColorFormat,
  withChannelValue,
  type ColorFormat,
  type ColorValue,
} from "./color.js";

export type ColorPickerSize = ControlSize;
export type ColorPickerVariant = NonNullable<ColorPickerVariants["variant"]>;

const DEFAULT_COLOR = "#000000";

/**
 * Checkerboard cell size for the alpha grid. A perceptual constant for reading
 * transparency rather than a brand value, so it does not move with the spacing
 * scale — the same reasoning the React component gives for passing it.
 */
const TRANSPARENCY_CELL = "12px";

const GRID_STYLE =
  `--size: ${TRANSPARENCY_CELL}; width: 100%; height: 100%; position: absolute; ` +
  "background-color: #fff; " +
  "background-image: conic-gradient(#eeeeee 0 25%, transparent 0 50%, #eeeeee 0 75%, transparent 0); " +
  "background-size: var(--size) var(--size); inset: 0px; z-index: auto; pointer-events: none;";

/** zag's hue rail, which is the same six stops whatever colour is selected. */
const HUE_TRACK =
  "linear-gradient(to right, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, " +
  "rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%)";

/**
 * A colour swatch that opens a picker.
 *
 * ```html
 * <div uioColorPicker label="Brand" [(value)]="brand" [swatches]="palette"></div>
 * ```
 *
 * ── The colour maths is this package's own ──────────────────────────────────
 *
 * The other three libraries convert, parse and print colours with
 * `@zag-js/color-utils`. This package takes no dependency beyond the CDK, so
 * that arithmetic is written out in `color.ts` — and it is not cosmetic: the
 * machine puts the colour into the accessibility tree in three spaces at once,
 * so `aria-label`, `aria-valuenow` and `aria-valuetext` are all conversions
 * being compared to the hundredth. See the note there, and the reference values
 * captured from a running React picker in `color.spec.ts`.
 *
 * ── Two colours, not one ────────────────────────────────────────────────────
 *
 * The value is held in whatever space it was *written in* — `#2563eb` is an RGB
 * colour, `hsl(221, 83%, 53%)` an HSL one — while the area and the sliders read
 * an `areaValue` converted into HSB (or HSL, when the format is `hsla`). That is
 * why the hue thumb can read `221.21` while the trigger says `rgba(37, 99, 235,
 * 1)`: they are the same colour in two spaces, and the rounding happens on the
 * way between them.
 *
 * It is also why alpha is read off the *converted* colour: `#2563eb80` has an
 * alpha of `0.5019607843137255`, which the trigger prints in full and the alpha
 * slider reports as `0.5`, because the conversion rounds every channel to two
 * places. Reading alpha off the raw value instead is a one-character change that
 * puts Angular a thousandth away from the other three.
 */
@Component({
  selector: "div[uioColorPicker]",
  standalone: true,
  exportAs: "uioColorPicker",
  imports: [UioFieldError, UioIcon, UioInput, UioSelect],
  template: `
    @if (label(); as text) {
      <label
        class="field__label"
        data-scope="color-picker"
        data-part="label"
        [id]="partId('label')"
        [attr.for]="partId('hidden-input')"
        [attr.data-disabled]="flag(disabled())"
        [attr.data-readonly]="flag(readOnly())"
        [attr.data-invalid]="flag(invalid())"
        [attr.data-required]="flag(required())"
        [attr.data-focus]="flag(focused())"
        (click)="onLabelClick($event)"
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }

    <div
      class="color-picker__control"
      data-scope="color-picker"
      data-part="control"
      [id]="partId('control')"
      [attr.data-disabled]="flag(disabled())"
      [attr.data-readonly]="flag(readOnly())"
      [attr.data-invalid]="flag(invalid())"
      [attr.data-state]="openState()"
      [attr.data-focus]="flag(focused())"
    >
      <button
        #trigger
        class="color-picker__trigger"
        data-scope="color-picker"
        data-part="trigger"
        type="button"
        aria-haspopup="dialog"
        [id]="partId('trigger')"
        [disabled]="disabled()"
        [attr.aria-label]="triggerLabel()"
        [attr.aria-controls]="partId('content')"
        [attr.aria-labelledby]="partId('label')"
        [attr.aria-expanded]="open()"
        [attr.data-state]="openState()"
        [attr.data-disabled]="flag(disabled())"
        [attr.data-readonly]="flag(readOnly())"
        [attr.data-invalid]="flag(invalid())"
        [attr.data-placement]="anchored.placement()"
        [attr.data-side]="anchored.side()"
        [attr.data-focus]="flag(focused())"
        [attr.style]="triggerStyle"
        (click)="toggle()"
        (focus)="triggerFocused.set(true)"
        (blur)="triggerFocused.set(false)"
      >
        <span class="color-picker__swatch-well">
          <div
            class="color-picker__grid"
            data-scope="color-picker"
            data-part="transparency-grid"
            [attr.style]="GRID_STYLE"
          ></div>
          <div
            class="color-picker__value-swatch"
            data-scope="color-picker"
            data-part="swatch"
            [attr.data-state]="valueSwatchState()"
            [attr.data-value]="valueAsHex()"
            [attr.style]="swatchStyle(color())"
          ></div>
        </span>
        @if (variant() !== "swatch-only") {
          <span
            class="color-picker__value-text"
            data-scope="color-picker"
            data-part="value-text"
            [attr.data-disabled]="flag(disabled())"
            [attr.data-focus]="flag(focused())"
            >{{ valueAsString() }}</span
          >
        }
      </button>
    </div>

    @if (helperVisible()) {
      <span class="field__description">{{ helperText() }}</span>
    }
    <span uioFieldError [message]="errorMessage()"></span>

    <!--
      Not a hidden input in the "hidden" sense: it is visually hidden and out of
      the tab order, so a form submits the colour and a label points at it. Same
      element the other three render.
    -->
    <input
      type="text"
      tabindex="-1"
      [id]="partId('hidden-input')"
      [attr.name]="name()"
      [attr.disabled]="disabled() ? '' : null"
      [attr.readonly]="readOnly() ? '' : null"
      [attr.required]="required() ? '' : null"
      [value]="valueAsString()"
      [attr.style]="VISUALLY_HIDDEN_INPUT"
    />

    <ng-container #anchor />
    <ng-template #surface>
      <div
        class="color-picker__positioner"
        data-scope="color-picker"
        data-part="positioner"
        [id]="partId('positioner')"
      >
        <div
          class="color-picker__popup"
          data-scope="color-picker"
          data-part="content"
          role="dialog"
          tabindex="-1"
          [id]="partId('content')"
          [attr.aria-label]="contentLabel()"
          [attr.data-state]="openState()"
          [attr.hidden]="open() ? null : ''"
          [attr.data-placement]="anchored.placement()"
          [attr.data-side]="anchored.side()"
          (keydown)="onContentKeydown($event)"
        >
          <div
            class="color-picker__area"
            data-scope="color-picker"
            data-part="area"
            role="group"
            [id]="partId('area')"
            [attr.data-disabled]="flag(disabled())"
            [attr.data-readonly]="flag(readOnly())"
            [attr.data-invalid]="flag(invalid())"
            [attr.style]="areaStyle"
            (pointerdown)="onAreaPointerDown($event)"
          >
            <div
              class="color-picker__area-bg"
              data-scope="color-picker"
              data-part="area-background"
              [id]="partId('area-gradient')"
              [attr.data-disabled]="flag(disabled())"
              [attr.data-readonly]="flag(readOnly())"
              [attr.data-invalid]="flag(invalid())"
              [attr.style]="areaBackgroundStyle()"
            ></div>
            <div
              class="color-picker__thumb"
              data-scope="color-picker"
              data-part="area-thumb"
              role="slider"
              aria-roledescription="2d slider"
              aria-valuemin="0"
              aria-valuemax="100"
              [id]="partId('area-thumb')"
              [attr.tabindex]="disabled() ? null : 0"
              [attr.aria-label]="areaLabel()"
              [attr.aria-valuenow]="channel(areaChannels()[0])"
              [attr.aria-valuetext]="areaValueText()"
              [attr.data-disabled]="flag(disabled())"
              [attr.data-readonly]="flag(readOnly())"
              [attr.data-invalid]="flag(invalid())"
              [attr.style]="areaThumbStyle()"
              (keydown)="onAreaKeydown($event)"
            ></div>
          </div>

          <div class="color-picker__sliders">
            <div class="color-picker__slider-row">
              <div
                class="color-picker__channel-slider"
                data-scope="color-picker"
                data-part="channel-slider"
                data-channel="hue"
                data-orientation="horizontal"
                role="presentation"
                [attr.style]="sliderStyle"
                (pointerdown)="onSliderPointerDown($event, 'hue')"
              >
                <div
                  class="color-picker__channel-track"
                  data-scope="color-picker"
                  data-part="channel-slider-track"
                  role="group"
                  data-channel="hue"
                  data-orientation="horizontal"
                  [id]="partId('slider-track:hue')"
                  [attr.style]="trackStyle('hue')"
                ></div>
                <div
                  class="color-picker__thumb"
                  data-scope="color-picker"
                  data-part="channel-slider-thumb"
                  role="slider"
                  aria-label="hue"
                  data-channel="hue"
                  data-orientation="horizontal"
                  aria-orientation="horizontal"
                  aria-valuemin="0"
                  aria-valuemax="360"
                  [id]="partId('slider-thumb:hue')"
                  [attr.tabindex]="disabled() ? null : 0"
                  [attr.aria-disabled]="flag(disabled())"
                  [attr.aria-valuenow]="channel('hue')"
                  [attr.aria-valuetext]="'hue ' + channel('hue')"
                  [attr.data-disabled]="flag(disabled())"
                  [attr.style]="sliderThumbStyle('hue')"
                  (keydown)="onSliderKeydown($event, 'hue')"
                ></div>
              </div>
              @if (showEyeDropper()) {
                <button
                  class="color-picker__eyedropper"
                  data-scope="color-picker"
                  data-part="eye-dropper-trigger"
                  type="button"
                  aria-label="Pick a color from the screen"
                  [disabled]="disabled()"
                  [attr.data-disabled]="flag(disabled())"
                  [attr.data-readonly]="flag(readOnly())"
                  [attr.data-invalid]="flag(invalid())"
                  (click)="pickFromScreen()"
                >
                  <span uioIcon name="pipette" [size]="iconSize()"></span>
                </button>
              }
            </div>

            <div
              class="color-picker__channel-slider"
              data-scope="color-picker"
              data-part="channel-slider"
              data-channel="alpha"
              data-orientation="horizontal"
              role="presentation"
              [attr.style]="sliderStyle"
              (pointerdown)="onSliderPointerDown($event, 'alpha')"
            >
              <div
                class="color-picker__grid"
                data-scope="color-picker"
                data-part="transparency-grid"
                [attr.style]="GRID_STYLE"
              ></div>
              <div
                class="color-picker__channel-track"
                data-scope="color-picker"
                data-part="channel-slider-track"
                role="group"
                data-channel="alpha"
                data-orientation="horizontal"
                [id]="partId('slider-track:alpha')"
                [attr.style]="trackStyle('alpha')"
              ></div>
              <div
                class="color-picker__thumb"
                data-scope="color-picker"
                data-part="channel-slider-thumb"
                role="slider"
                aria-label="alpha"
                data-channel="alpha"
                data-orientation="horizontal"
                aria-orientation="horizontal"
                aria-valuemin="0"
                aria-valuemax="1"
                [id]="partId('slider-thumb:alpha')"
                [attr.tabindex]="disabled() ? null : 0"
                [attr.aria-disabled]="flag(disabled())"
                [attr.aria-valuenow]="channel('alpha')"
                [attr.aria-valuetext]="'alpha ' + channel('alpha')"
                [attr.data-disabled]="flag(disabled())"
                [attr.style]="sliderThumbStyle('alpha')"
                (keydown)="onSliderKeydown($event, 'alpha')"
              ></div>
            </div>
          </div>

          @if (showFormatInputs()) {
            <div class="color-picker__notation">
              <!--
                The label is rendered and hidden in CSS rather than left off:
                the trigger, the listbox and the hidden control are all named
                after it, so an absent label leaves dangling references behind.
              -->
              <div
                uioSelect
                class="color-picker__format"
                size="sm"
                label="Colour notation"
                [options]="notations"
                [value]="inputFormat()"
                [disabled]="disabled()"
                (valueChange)="onFormatChange($event)"
              ></div>

              <div class="color-picker__inputs" [attr.data-format]="inputFormat()">
                @for (field of notationFields(); track field.key) {
                  <div class="color-picker__field">
                    <!--
                      focusin / focusout rather than focus / blur: UioInput
                      renders the control, so what this element can hear is what
                      bubbles up to it, and the plain two do not bubble.
                    -->
                    <div
                      uioInput
                      size="sm"
                      [type]="field.kind === 'channel' ? 'number' : 'text'"
                      [inputMode]="field.kind === 'channel' ? 'decimal' : 'text'"
                      [aria-label]="field.label"
                      [spellcheck]="false"
                      autocomplete="off"
                      [disabled]="disabled()"
                      [readOnly]="readOnly()"
                      [min]="field.kind === 'channel' ? field.min : undefined"
                      [max]="field.kind === 'channel' ? field.max : undefined"
                      [step]="field.kind === 'channel' ? field.step : undefined"
                      [value]="shownField(field)"
                      (valueChange)="onFieldInput(field, $event)"
                      (focusin)="onFieldFocus($event)"
                      (focusout)="commitField(field)"
                      (keydown)="onFieldKeydown($event, field)"
                    ></div>
                    <!--
                      Only the numeric channels are abbreviated. A HEX caption
                      under a hex field would only repeat the select above it —
                      but the line stays reserved in CSS, so switching notation
                      cannot resize the popup out from under the pointer.
                    -->
                    @if (field.kind === "channel") {
                      <span class="color-picker__field-label" aria-hidden="true">{{
                        field.label
                      }}</span>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (swatches().length) {
            <div
              class="color-picker__swatches"
              data-scope="color-picker"
              data-part="swatch-group"
              role="group"
            >
              @for (swatch of swatches(); track swatch) {
                <button
                  class="color-picker__swatch-trigger"
                  data-scope="color-picker"
                  data-part="swatch-trigger"
                  type="button"
                  [disabled]="!interactive()"
                  [attr.aria-label]="'select ' + swatchHex(swatch) + ' as the color'"
                  [attr.data-state]="swatchState(swatch)"
                  [attr.data-value]="swatchHex(swatch)"
                  [attr.data-disabled]="flag(!interactive())"
                  [attr.style]="swatchTriggerStyle(swatch)"
                  (click)="choose(swatch)"
                >
                  <div
                    class="color-picker__swatch"
                    data-scope="color-picker"
                    data-part="swatch"
                    [attr.data-state]="swatchState(swatch)"
                    [attr.data-value]="swatchHex(swatch)"
                    [attr.style]="swatchStyle(parsed(swatch))"
                  ></div>
                </button>
              }
            </div>
          }
        </div>
      </div>
    </ng-template>
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    "[attr.data-disabled]": "flag(disabled())",
    "[attr.data-readonly]": "flag(readOnly())",
    "[attr.data-invalid]": "flag(invalid())",
    "[attr.style]": "rootStyle()",
  },
})
export class UioColorPicker extends UioPart implements OnInit, OnDestroy {
  readonly scope = "color-picker";
  readonly part = "root";

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows a message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  /** A CSS colour string. Uncontrolled until something binds it. */
  readonly value = model<string>(DEFAULT_COLOR);
  readonly valueChange = output<string>();
  /** Fired once the interaction ends. */
  readonly valueChangeEnd = output<string>();
  /** Which notation the value is printed in. Defaults to the value's own. */
  readonly format = input<ColorFormat | undefined>(undefined);
  readonly swatches = input<string[]>([]);
  readonly showEyeDropper = input(true, { transform: booleanAttribute });
  /**
   * Shows the notation select and its channel fields — HEX, RGB, HSL, OKLCH —
   * under the sliders. Defaults to true. Turn it off for a picker meant to be
   * driven by eye rather than by number.
   */
  readonly showFormatInputs = input(true, { transform: booleanAttribute });
  readonly open = model(false);
  readonly openChange = output<boolean>();
  readonly size = input<ColorPickerSize>("md");
  readonly variant = input<ColorPickerVariant>("default");
  readonly required = input(false, { transform: booleanAttribute });
  override readonly disabled = input(false, { transform: booleanAttribute });
  override readonly readOnly = input(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);

  protected readonly flag = stateFlag;
  protected readonly GRID_STYLE = GRID_STYLE;
  protected readonly VISUALLY_HIDDEN_INPUT = VISUALLY_HIDDEN_INPUT;
  protected readonly triggerStyle = "position: relative;";
  protected readonly areaStyle =
    "position: relative; touch-action: none; forced-color-adjust: none;";
  protected readonly sliderStyle = "position: relative; touch-action: none;";

  private readonly machine = nextMachineId();
  protected readonly rootId = `color-picker:${this.machine}`;
  protected partId(part: string): string {
    return `${this.rootId}:${part}`;
  }

  override readonly invalid = computed(() => !!this.error());
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.invalid());
  protected readonly interactive = computed(() => !this.disabled() && !this.readOnly());
  /**
   * The open state, which the control, the trigger and the popup carry — and
   * the **root** does not.
   *
   * Deliberately not an override of `UioPart.state`: the machine's
   * `getRootProps` emits no `data-state` at all, so binding it on the host would
   * give Angular an attribute the other three libraries do not render. The root
   * reports `data-disabled`, `data-readonly` and `data-invalid` and nothing else.
   */
  protected readonly openState = computed(() => (this.open() ? "open" : "closed"));

  /**
   * Whether the trigger holds focus, and the picker is not open.
   *
   * The machine reaches `data-focus` through a whole *state* rather than a flag —
   * `focused` is tagged `["closed", "focused"]`, so a picker that is open is
   * never focused however the browser feels about it. That is not a detail worth
   * smoothing over: the attribute comes back the moment Escape closes the popup
   * and returns focus to the trigger, which is the one place the gate catches a
   * port that treated it as "the trigger has focus" and nothing more.
   *
   * `focus` and `blur` rather than `focusin`/`focusout`, because the trigger is
   * the only element in question and neither event needs to bubble to reach it.
   */
  protected readonly triggerFocused = signal(false);
  protected readonly focused = computed(() => this.triggerFocused() && !this.open());

  protected readonly hostClass = computed(() =>
    colorPickerStyles({ size: this.size(), variant: this.variant() }),
  );
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size()]);

  /** The value, parsed. A bad string is the caller's, not something to hide. */
  protected readonly color = computed<ColorValue>(() => parseColor(this.value()));

  /* ─── The notation row ────────────────────────────────────────────────────
     Which notations exist and which fields each one shows come from
     `COLOR_NOTATIONS` / `COLOR_NOTATION_FIELDS` in `@ui-organized/core`, shared
     with the React, Svelte and Vue pickers so all four offer the same row. */

  protected readonly notations = COLOR_NOTATIONS;

  /**
   * Which notation the fields are showing.
   *
   * Local, and initialised from the *machine's* format once rather than derived
   * from it: it is a way of reading the colour rather than a property of it, so
   * switching it must not move the value string, the form value or which pair
   * of channels the area is — and a later change to `format` must not yank the
   * row out from under a reader who has switched it.
   */
  protected readonly inputFormat = signal<ColorNotation>("rgb");

  protected readonly notationFields = computed<ColorField[]>(
    () => COLOR_NOTATION_FIELDS[this.inputFormat()],
  );

  /**
   * The field being typed into, and what has been typed.
   *
   * `null` means every field shows the colour. While a field is mid-edit the
   * colour must not overwrite what is being typed — which it otherwise would on
   * every pointer move over the area behind the field.
   */
  private readonly draft = signal<{ key: string; text: string } | null>(null);

  protected shownField(field: ColorField): string {
    const draft = this.draft();
    return draft?.key === field.key ? draft.text : readField(field, this.color());
  }

  protected onFormatChange(next: string): void {
    this.draft.set(null);
    this.inputFormat.set(next as ColorNotation);
  }

  protected onFieldInput(field: ColorField, text: string): void {
    this.draft.set({ key: field.key, text });
  }

  protected onFieldFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement | null)?.select?.();
  }

  /**
   * Applies a typed edit, which is a finished interaction — so it reports an
   * end as well as a change, unlike a drag, which reports many changes and one
   * end when the pointer lifts. An unreadable edit is dropped and the field
   * falls back to the colour it was showing.
   */
  protected commitField(field: ColorField): void {
    const draft = this.draft();
    if (draft?.key !== field.key) return;
    this.draft.set(null);
    const next = writeField(field, draft.text, this.color());
    if (next) this.commit(toColorFormat(next, this.resolvedFormat()), true);
  }

  protected onFieldKeydown(event: KeyboardEvent, field: ColorField): void {
    if (event.key === "Enter") {
      event.preventDefault();
      this.commitField(field);
    } else if (event.key === "Escape") {
      // Abandon the edit without closing the picker under it.
      event.stopPropagation();
      this.draft.set(null);
    }
  }

  /** `format ?? the value's own space` — zag's `defaultFormat`. */
  private readonly resolvedFormat = computed<ColorFormat>(
    () => this.format() ?? this.color().format,
  );

  protected readonly valueAsString = computed(() =>
    colorToString(this.color(), this.resolvedFormat()),
  );
  protected readonly valueAsHex = computed(() => colorToString(this.color(), "hex"));
  protected readonly triggerLabel = computed(
    () => `select color. current color is ${this.valueAsString()}`,
  );

  /**
   * The popup is a `role="dialog"` with no title to take a name from — the same
   * trap `UioPopoverTitle` exists to close. Without this it reaches a screen
   * reader as an unnamed dialog (axe `aria-dialog-name`).
   */
  protected readonly contentLabel = computed(() => {
    const text = this.label();
    return text ? `${text} colour picker` : "Colour picker";
  });

  /**
   * The colour the area and the sliders work in.
   *
   * HSB unless the format is HSL, which is zag's rule and the reason the area's
   * second axis is labelled "brightness" for an RGB colour and "lightness" for
   * an HSL one.
   */
  protected readonly areaValue = computed(() =>
    toColorFormat(this.color(), this.resolvedFormat() === "hsla" ? "hsla" : "hsba"),
  );

  protected readonly areaChannels = computed(() => {
    const channels = colorChannels(this.areaValue().format);
    return [channels[1]!, channels[2]!];
  });
  protected readonly areaLabel = computed(
    () => `${this.areaChannels()[0]} and ${this.areaChannels()[1]}`,
  );
  protected readonly areaValueText = computed(() => {
    const [x, y] = this.areaChannels();
    return `${x} ${this.channel(x!)}, ${y} ${this.channel(y!)}`;
  });

  /** Every channel the DOM reports comes from the converted colour. */
  protected channel(name: string): number {
    return channelValue(this.areaValue(), name);
  }

  protected readonly rootStyle = computed(() => `--value: ${colorToString(this.color(), "css")};`);

  protected readonly areaBackgroundStyle = computed(() => {
    const hue = this.channel("hue");
    const layers =
      this.areaValue().format === "hsla"
        ? [
            "linear-gradient(to top, hsla(0,0%,0%,1) 0%, hsla(0,0%,0%,0) 50%, " +
              "hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,1) 100%)",
            "linear-gradient(to right,hsl(0,0%,50%),hsla(0,0%,50%,0))",
            `hsl(${hue}, 100%, 50%)`,
          ]
        : [
            "linear-gradient(to top,hsl(0,0%,0%),hsla(0,0%,0%,0))",
            "linear-gradient(to right,hsl(0,0%,100%),hsla(0,0%,100%,0))",
            `hsl(${hue}, 100%, 50%)`,
          ];
    return `${this.areaStyle} background: ${layers.join(",")};`;
  });

  protected readonly areaThumbStyle = computed(() => {
    const [x, y] = this.areaChannels();
    const left = channelPercent(this.areaValue(), x!) * 100;
    const top = (1 - channelPercent(this.areaValue(), y!)) * 100;
    const opaque = colorToString(withChannelValue(this.areaValue(), "alpha", 1), "css");
    return (
      `position: absolute; left: ${left}%; top: ${top}%; transform: translate(-50%, -50%); ` +
      `touch-action: none; forced-color-adjust: none; --color: ${opaque}; ` +
      `background: ${colorToString(this.areaValue(), "rgb")};`
    );
  });

  protected trackStyle(channel: "hue" | "alpha"): string {
    const base = "position: relative; forced-color-adjust: none; background-image: ";
    if (channel === "hue") return `${base}${HUE_TRACK};`;
    const clear = colorToString(withChannelValue(this.areaValue(), "alpha", 0), "css");
    const solid = colorToString(withChannelValue(this.areaValue(), "alpha", 1), "css");
    return `${base}linear-gradient(to right, ${clear}, ${solid});`;
  }

  protected sliderThumbStyle(channel: "hue" | "alpha"): string {
    const left = channelPercent(this.areaValue(), channel) * 100;
    return (
      "forced-color-adjust: none; position: absolute; " +
      `background: ${colorToString(this.areaValue(), "rgb")}; left: ${left}%; top: 50%;`
    );
  }

  protected swatchStyle(color: ColorValue): string {
    const css = colorToString(color, "css");
    return `--color: ${css}; position: relative; background: ${colorToString(color, "rgb")};`;
  }

  protected swatchTriggerStyle(swatch: string): string {
    return `--color: ${this.swatchHex(swatch)}; position: relative;`;
  }

  protected parsed(swatch: string): ColorValue {
    return parseColor(swatch);
  }

  /** A swatch names itself in hex, whatever notation the caller wrote it in. */
  protected swatchHex(swatch: string): string {
    return colorToString(parseColor(swatch), "hex");
  }

  protected swatchState(swatch: string): "checked" | "unchecked" {
    const swatchColor = toColorFormat(parseColor(swatch), this.resolvedFormat());
    return isSameColor(swatchColor, this.color()) ? "checked" : "unchecked";
  }

  /**
   * The value's own swatch, which is checked whenever the colour survives a
   * round trip through its printed form.
   *
   * That is a strange thing for a swatch to be unsure about and it is the
   * machine's own arrangement: Ark hands `getSwatchProps` the value as a
   * *string*, zag parses it back, and a colour whose printed form rounds — an
   * RGB value shown as `hsla(221.21, 83.19%, 53.33%, 1)` — no longer matches the
   * value it came from. The parity gate has an allowance for the resulting
   * disagreement between React, Svelte and Vue; this reproduces the mechanism
   * rather than short-circuiting it, so Angular lands on React's answer.
   */
  protected readonly valueSwatchState = computed<"checked" | "unchecked">(() => {
    const roundTripped = toColorFormat(parseColor(this.valueAsString()), this.resolvedFormat());
    return isSameColor(roundTripped, this.color()) ? "checked" : "unchecked";
  });

  readonly anchored = new AnchoredSurface(inject(Overlay));

  /** See `UioDialog` — decorator queries are the spelling both compilers register. */
  @ViewChild("surface", { static: true }) private surface!: TemplateRef<unknown>;
  @ViewChild("anchor", { read: ViewContainerRef, static: true }) private anchor!: ViewContainerRef;
  @ViewChild("trigger", { static: true }) private trigger!: ElementRef<HTMLElement>;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);

  private surfaceView?: EmbeddedViewRef<unknown>;
  private applied = false;

  private readonly layer: DismissibleLayer = {
    surface: () => this.contentElement(),
    trigger: () => this.trigger?.nativeElement ?? null,
    dismiss: () => this.hide(),
  };

  constructor() {
    super();
    effect(() => {
      this.open();
      untracked(() => this.sync());
    });
  }

  /** `ngOnInit`, not `ngAfterViewInit` — see the note in `UioDialog`. */
  ngOnInit(): void {
    /* Seeded here rather than where it is declared: a field initialiser runs
       before Angular has set the inputs, so `format()` would still be undefined
       and every picker would open on RGB. Set once, not derived — see the note
       on `inputFormat`. */
    this.inputFormat.set(this.format() === "hsla" ? "hsl" : "rgb");
    const ref = this.anchored.create(
      this.trigger.nativeElement,
      // zag's positioning for this component: below the trigger, left edges
      // aligned, with a four-pixel gutter.
      anchoredPositions("bottom", "start", 4, 0),
    );
    this.surfaceView = ref.attach(
      new TemplatePortal(this.surface, this.anchor),
    ) as EmbeddedViewRef<unknown>;
    applySurfaceStacking(ref);
    setSurfaceInteractive(ref, false);
  }

  ngOnDestroy(): void {
    removeLayer(this.layer);
    this.anchored.dispose();
  }

  show(): void {
    this.setOpen(true);
  }
  hide(): void {
    this.setOpen(false);
  }
  toggle(): void {
    if (!this.interactive()) return;
    this.setOpen(!this.open());
  }

  private setOpen(next: boolean): void {
    if (next === this.open()) return;
    this.open.set(next);
    this.openChange.emit(next);
    if (next) pushLayer(this.document, this.layer);
    else removeLayer(this.layer);
    flushNow(this.appRef);
  }

  private contentElement(): HTMLElement | null {
    return (
      this.anchored.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="content"]') ??
      null
    );
  }

  private sync(): void {
    const open = this.open();
    if (open === this.applied) return;
    this.applied = open;
    const ref = this.anchored.overlayRef;
    this.surfaceView?.detectChanges();
    if (!ref) return;
    setSurfaceInteractive(ref, open);
    if (open) {
      // Measured only now: while closed the popup is `hidden`, has no size, and
      // the CDK placed a zero-height box.
      this.anchored.reposition();
      raiseSurface(ref);
      const content = this.contentElement();
      if (content) focusInside(content);
      pushLayer(this.document, this.layer);
      return;
    }
    restoreFocus(this.trigger?.nativeElement ?? null);
  }

  protected onLabelClick(event: Event): void {
    event.preventDefault();
    if (!this.interactive()) return;
    this.trigger?.nativeElement.focus({ preventScroll: true });
  }

  protected onContentKeydown(event: KeyboardEvent): void {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    event.preventDefault();
    this.hide();
  }

  /** Set the colour and report it, in the caller's own notation. */
  private commit(color: ColorValue, end = false): void {
    const next = colorToString(color, this.resolvedFormat());
    if (next !== this.value()) {
      this.value.set(next);
      this.valueChange.emit(next);
    }
    if (end) this.valueChangeEnd.emit(next);
    flushNow(this.appRef);
  }

  protected choose(swatch: string): void {
    if (!this.interactive()) return;
    this.commit(toColorFormat(parseColor(swatch), this.resolvedFormat()), true);
  }

  /**
   * The eyedropper, where the browser has one.
   *
   * Behind a feature test rather than a build-time flag: `EyeDropper` is
   * Chromium-only, and a picker that threw on Firefox would be worse than one
   * whose button does nothing there — which is also what the machine does.
   */
  protected pickFromScreen(): void {
    if (!this.interactive()) return;
    const view = this.document.defaultView as (Window & { EyeDropper?: new () => unknown }) | null;
    const Ctor = view?.EyeDropper;
    if (!Ctor) return;
    const dropper = new Ctor() as { open(): Promise<{ sRGBHex: string }> };
    void dropper.open().then(({ sRGBHex }) => {
      this.commit(toColorFormat(parseColor(sRGBHex), this.resolvedFormat()), true);
    });
  }

  private setChannel(channel: string, value: number, end = false): void {
    const next = withChannelValue(this.areaValue(), channel, value);
    this.commit(toColorFormat(next, this.resolvedFormat()), end);
  }

  protected onAreaPointerDown(event: PointerEvent): void {
    if (!this.interactive() || event.button !== 0) return;
    event.preventDefault();
    const area = event.currentTarget as HTMLElement;
    const apply = (moved: PointerEvent) => this.setFromArea(area, moved.clientX, moved.clientY);
    apply(event);
    this.track(apply, () => this.valueChangeEnd.emit(this.value()));
  }

  private setFromArea(area: HTMLElement, clientX: number, clientY: number): void {
    const box = area.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const [x, y] = this.areaChannels();
    const xRange = channelRange(x!);
    const yRange = channelRange(y!);
    const xPercent = Math.min(Math.max((clientX - box.left) / box.width, 0), 1);
    // The vertical axis runs the other way: the top of the square is the
    // *largest* value, which is why the thumb's `top` is `1 - percent`.
    const yPercent = 1 - Math.min(Math.max((clientY - box.top) / box.height, 0), 1);
    let next = withChannelValue(
      this.areaValue(),
      x!,
      roundTo(xRange.minValue + xPercent * (xRange.maxValue - xRange.minValue), 2),
    );
    next = withChannelValue(
      next,
      y!,
      roundTo(yRange.minValue + yPercent * (yRange.maxValue - yRange.minValue), 2),
    );
    this.commit(toColorFormat(next, this.resolvedFormat()));
  }

  protected onSliderPointerDown(event: PointerEvent, channel: "hue" | "alpha"): void {
    if (!this.interactive() || event.button !== 0) return;
    event.preventDefault();
    const slider = event.currentTarget as HTMLElement;
    const apply = (moved: PointerEvent) => this.setFromSlider(slider, channel, moved.clientX);
    apply(event);
    this.track(apply, () => this.valueChangeEnd.emit(this.value()));
  }

  private setFromSlider(slider: HTMLElement, channel: "hue" | "alpha", clientX: number): void {
    const box = slider.getBoundingClientRect();
    if (!box.width) return;
    const { minValue, maxValue, step } = channelRange(channel);
    const percent = Math.min(Math.max((clientX - box.left) / box.width, 0), 1);
    const raw = minValue + percent * (maxValue - minValue);
    // Snapped to the channel's own step, so a hue lands on a whole degree and an
    // alpha on a hundredth rather than on whatever fraction of a pixel it was.
    this.setChannel(channel, roundTo(Math.round(raw / step) * step, 2));
  }

  protected onAreaKeydown(event: KeyboardEvent): void {
    if (!this.interactive()) return;
    const [x, y] = this.areaChannels();
    const step = event.shiftKey ? 10 : 1;
    const move: Record<string, [string, number]> = {
      ArrowLeft: [x!, -step],
      ArrowRight: [x!, step],
      ArrowUp: [y!, step],
      ArrowDown: [y!, -step],
    };
    const delta = move[event.key];
    if (!delta) return;
    event.preventDefault();
    const [channel, amount] = delta;
    this.setChannel(channel, roundTo(this.channel(channel) + amount, 2), true);
  }

  protected onSliderKeydown(event: KeyboardEvent, channel: "hue" | "alpha"): void {
    if (!this.interactive()) return;
    const { step } = channelRange(channel);
    const amount = (event.shiftKey ? 10 : 1) * step;
    const delta =
      event.key === "ArrowLeft" || event.key === "ArrowDown"
        ? -amount
        : event.key === "ArrowRight" || event.key === "ArrowUp"
          ? amount
          : null;
    if (delta === null) return;
    event.preventDefault();
    this.setChannel(channel, roundTo(this.channel(channel) + delta, 2), true);
  }

  /** Follow a pointer on the document until it is released. */
  private track(move: (event: PointerEvent) => void, end: () => void): void {
    const document = this.document;
    const onMove = (event: PointerEvent) => move(event);
    const stop = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", stop);
      document.removeEventListener("pointercancel", stop);
      end();
      flushNow(this.appRef);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", stop);
    document.addEventListener("pointercancel", stop);
  }
}
