import { NgTemplateOutlet } from "@angular/common";
import {
  ApplicationRef,
  Component,
  ElementRef,
  TemplateRef,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from "@angular/core";
import { splitterStyles, type SplitterVariants } from "@ui-organized/core";
import { UioPart } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { flushNow } from "../overlay/flush.js";

export type SplitterOrientation = NonNullable<SplitterVariants["orientation"]>;
export type SplitterVariant = NonNullable<SplitterVariants["variant"]>;

export interface SplitterPanelDef {
  /** Unique across the splitter. Handle ids are derived from adjacent pairs. */
  id: string;
  /**
   * A string, or a template for anything richer.
   *
   * The other three libraries take a node here, which Angular has no equivalent
   * of inside a data array. A `TemplateRef` is the Angular way to hand a
   * component markup it will render itself, and it costs the string case
   * nothing. Same shape as `TabItem.content`.
   */
  content?: string | TemplateRef<unknown>;
  /** Smallest size, as a percentage of the group. */
  minSize?: number;
  /** Largest size, as a percentage of the group. */
  maxSize?: number;
  /** Allows the panel to collapse to `collapsedSize`. */
  collapsible?: boolean;
  /** Size the panel collapses to, as a percentage. Defaults to 0. */
  collapsedSize?: number;
}

/** What a handle reports to assistive technology about the panel before it. */
export interface SplitterAriaValues {
  valueNow: number;
  valueMin: number;
  valueMax: number;
}

/**
 * How many decimal places two sizes have to agree on to count as equal, and the
 * number every constrained size is rounded to.
 *
 * Zag's, and it has to be shared rather than "close enough": a splitter divides
 * 100 by three and then adds the parts back up, so a comparison against a bare
 * `===` decides that 33.333333333333336 is not 33.333333333333336 and the
 * layout is redistributed on every render.
 */
const PRECISION = 10;

const nearlyEqual = (a: number, b: number) => a.toFixed(PRECISION) === b.toFixed(PRECISION);

/**
 * Clamp one panel to its own constraints.
 *
 * Collapsing is a snap rather than a clamp: a collapsible panel pushed below
 * its minimum goes the rest of the way to `collapsedSize` once it is past the
 * halfway mark between the two, and stops at the minimum before that. A clamp
 * would leave a panel that can be collapsed permanently stuck one pixel above
 * being collapsed.
 */
function clampPanel(panel: SplitterPanelDef, size: number): number {
  const min = panel.minSize ?? 0;
  const max = panel.maxSize ?? 100;
  const collapsed = panel.collapsedSize ?? 0;
  let next = size;
  if (next < min) {
    next = panel.collapsible && next < (collapsed + min) / 2 ? collapsed : min;
  }
  return Number.parseFloat(Math.min(max, next).toFixed(PRECISION));
}

/**
 * Fill in the sizes the caller did not give, then make the layout legal.
 *
 * Two passes, and the second is the one that is easy to leave out. Panels with a
 * stated size keep it and the rest split what is left evenly — but an even split
 * ignores every `minSize` and `maxSize`, so a panel pinned to 30% would render
 * at 50 and report `aria-valuenow="50"` on a handle that cannot move. So each
 * panel is clamped, what it could not take is collected, and the surplus is
 * offered to the others in turn until it is gone. That is zag's `validateSizes`,
 * and reproducing it is what makes a pinned panel actually pinned.
 *
 * Exported because it is the whole of "what size is each panel", and the one
 * part of this component worth asserting without a DOM.
 */
export function resolveSplitterSizes(
  panels: readonly SplitterPanelDef[],
  sizes: readonly number[] | undefined,
): number[] {
  const next: number[] = Array(panels.length);
  let unassigned = 100;
  let assigned = 0;
  panels.forEach((_, index) => {
    const size = sizes?.[index];
    if (size == null || !Number.isFinite(size)) return;
    assigned++;
    next[index] = size;
    unassigned -= size;
  });
  panels.forEach((_, index) => {
    if (next[index] != null) return;
    const left = panels.length - assigned;
    assigned++;
    next[index] = left > 0 ? unassigned / left : 0;
    unassigned -= next[index]!;
  });

  // A caller's sizes need not add up; scale them so they do before anything is
  // clamped, or the surplus below would be measuring the caller's arithmetic.
  const total = next.reduce((sum, size) => sum + size, 0);
  if (next.length && !nearlyEqual(total, 100)) {
    for (let index = 0; index < next.length; index++) next[index] = (100 / total) * next[index]!;
  }

  let surplus = 0;
  panels.forEach((panel, index) => {
    const safe = clampPanel(panel, next[index]!);
    if (safe === next[index]) return;
    surplus += next[index]! - safe;
    next[index] = safe;
  });
  if (nearlyEqual(surplus, 0)) return next;

  for (let index = 0; index < panels.length; index++) {
    const safe = clampPanel(panels[index]!, next[index]! + surplus);
    if (safe === next[index]) continue;
    surplus -= safe - next[index]!;
    next[index] = safe;
    if (nearlyEqual(surplus, 0)) break;
  }
  return next;
}

/**
 * What a handle reports, which is *not* simply the panel's own min and max.
 *
 * A handle can only move as far as the rest of the group allows: a panel with
 * no maximum of its own still cannot grow past what every other panel's minimum
 * leaves free. Zag computes both bounds that way and rounds them, and a screen
 * reader announcing a range the handle cannot reach is a promise the component
 * does not keep.
 */
export function splitterAriaValues(
  panels: readonly SplitterPanelDef[],
  sizes: readonly number[],
  index: number,
): SplitterAriaValues {
  let currentMin = 0;
  let currentMax = 100;
  let othersMin = 0;
  let othersMax = 0;
  panels.forEach((panel, panelIndex) => {
    const min = panel.minSize ?? 0;
    const max = panel.maxSize ?? 100;
    if (panelIndex === index) {
      currentMin = min;
      currentMax = max;
    } else {
      othersMin += min;
      othersMax += max;
    }
  });
  return {
    valueNow: Math.round(sizes[index] ?? 0),
    valueMin: Math.round(Math.max(currentMin, 100 - othersMax)),
    valueMax: Math.round(Math.min(currentMax, 100 - othersMin)),
  };
}

/**
 * Move a handle by `delta` percentage points, and hand back the new layout.
 *
 * Only the two panels either side of the handle move — everything else in the
 * group keeps its size, which is what makes a drag feel local. A panel that
 * cannot give up the whole delta gives what it can, and the pair stays summing
 * to what it summed to before: taking from one without giving to the other is
 * how a splitter silently loses a percent per drag until the last panel has
 * eaten the group.
 *
 * Both panels are held to their own constraints by the same `clampPanel` the
 * initial layout uses, so a drag cannot reach a size the layout would refuse.
 */
export function applySplitterDelta(
  panels: readonly SplitterPanelDef[],
  sizes: readonly number[],
  index: number,
  delta: number,
): number[] {
  const next = [...sizes];
  const before = panels[index];
  const after = panels[index + 1];
  if (!before || !after) return next;

  const total = (next[index] ?? 0) + (next[index + 1] ?? 0);
  const wanted = clampPanel(before, (next[index] ?? 0) + delta);
  const paired = clampPanel(after, total - wanted);
  // Re-derived from what the *second* panel could actually accept, so the pair
  // always sums to `total`.
  next[index] = total - paired;
  next[index + 1] = paired;
  return next;
}

/**
 * Keep every pointer event of a drag arriving at the handle, even once the
 * pointer has left the four pixels it started on.
 *
 * Guarded rather than called outright, and the guard is load-bearing in two
 * places: `setPointerCapture` throws `NotFoundError` for a pointer id that is
 * not currently down, which is every id a synthesised event in a spec carries,
 * and the whole API is missing in older engines. Capture is an improvement to
 * the drag rather than a requirement of it — without it a move that leaves the
 * handle simply stops arriving — so a failure here must not take the drag with
 * it.
 */
function capturePointer(element: HTMLElement, pointerId: number): void {
  try {
    element.setPointerCapture?.(pointerId);
  } catch {
    // No live pointer to capture.
  }
}

function releasePointer(element: HTMLElement, pointerId: number): void {
  try {
    if (element.hasPointerCapture?.(pointerId)) element.releasePointerCapture(pointerId);
  } catch {
    // Nothing was captured.
  }
}

/**
 * Resizable panes with a draggable handle between each adjacent pair.
 *
 * ```html
 * <div uioSplitter [panels]="panes" [(size)]="sizes" orientation="vertical"></div>
 * ```
 *
 * ── Panels are data, and the handles are not the caller's to place ──────────
 *
 * A handle belongs *between* two panels, and there is no way to interleave
 * elements the component owns with content the caller projected — `<ng-content>`
 * is one slot and everything lands in it in order. So `panels` is data and the
 * component renders the whole strip, which is also how React, Svelte and Vue
 * spell it: all three take a `panels` array and derive each handle's id from the
 * pair it sits between (`"a:b"`).
 *
 * There is deliberately no `disabled` input: the machine has none in any
 * library. Resizing is constrained per panel instead — give a panel equal
 * `minSize` and `maxSize` and the handles beside it can no longer move, which is
 * what `aria-valuemin === aria-valuemax` reports.
 *
 * ── Sizes are percentages, and they live here ───────────────────────────────
 *
 * Every size in this component is a percentage of the group, never a pixel
 * count, because that is the only unit that survives the container changing
 * size. The flex basis is written inline for the same reason zag writes it:
 * `flex-grow: <size>` on a `flex-basis: 0` child *is* the layout, and no
 * stylesheet can know the numbers.
 */
@Component({
  selector: "div[uioSplitter]",
  standalone: true,
  exportAs: "uioSplitter",
  imports: [NgTemplateOutlet],
  template: `
    @for (panel of panels(); track panel.id; let index = $index) {
      <div
        class="splitter__panel"
        data-scope="splitter"
        data-part="panel"
        [id]="panelId(panel.id)"
        [attr.data-id]="panel.id"
        [attr.data-index]="index"
        [attr.data-ownedby]="rootId"
        [attr.data-orientation]="orientation()"
        [attr.data-dragging]="dragging() !== null ? '' : null"
        [style.flex-grow]="sizes()[index]"
        [style.flex-shrink]="1"
        [style.flex-basis]="'0'"
        [style.overflow]="'hidden'"
        [style.min-width]="panel.minSize != null && horizontal() ? panel.minSize + '%' : null"
        [style.max-width]="panel.maxSize != null && horizontal() ? panel.maxSize + '%' : null"
        [style.min-height]="panel.minSize != null && !horizontal() ? panel.minSize + '%' : null"
        [style.max-height]="panel.maxSize != null && !horizontal() ? panel.maxSize + '%' : null"
        [style.pointer-events]="dragging() !== null ? 'none' : null"
      >
        @if (asTemplate(panel.content); as template) {
          <ng-container [ngTemplateOutlet]="template" />
        } @else {
          {{ panel.content }}
        }
      </div>
      <!--
        A handle sits between adjacent panels, so the last panel has none. It is
        a button element with role="separator" and no type attribute, which is
        what Ark renders — the missing type is reproduced rather than corrected,
        because the four libraries have to render the same element and a
        splitter is not inside a form.
      -->
      @if (index < panels().length - 1) {
        <button
          class="splitter__trigger"
          data-scope="splitter"
          data-part="resize-trigger"
          role="separator"
          tabindex="0"
          [id]="triggerId(index)"
          [attr.data-id]="handleId(index)"
          [attr.data-ownedby]="rootId"
          [attr.data-orientation]="orientation()"
          [attr.aria-orientation]="orientation()"
          [attr.aria-valuenow]="aria(index).valueNow"
          [attr.aria-valuemin]="aria(index).valueMin"
          [attr.aria-valuemax]="aria(index).valueMax"
          [attr.aria-controls]="controls(index)"
          [attr.data-focus]="focused() === index ? '' : null"
          [attr.data-dragging]="dragging() === index ? '' : null"
          [style.touch-action]="'none'"
          [style.user-select]="'none'"
          [style.flex]="'0 0 auto'"
          [style.cursor]="horizontal() ? 'col-resize' : 'row-resize'"
          [style.min-height]="horizontal() ? '0' : null"
          [style.min-width]="horizontal() ? null : '0'"
          (pointerdown)="onPointerDown($event, index)"
          (pointermove)="onPointerMove($event)"
          (pointerup)="onPointerUp($event)"
          (pointercancel)="onPointerUp($event)"
          (keydown)="onKeydown($event, index)"
          (focus)="focused.set(index)"
          (blur)="focused.set(null)"
        >
          <span class="splitter__grip" aria-hidden="true"></span>
        </button>
      }
    }
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    // Not a `UioPart` attribute: `data-dragging` is read by `.splitter__trigger`
    // alone, and adding it to the base would put a binding on every element in
    // the library for one component's benefit. See `part.spec.ts`.
    "[attr.data-dragging]": "dragging() !== null ? '' : null",
    "[style.display]": "'flex'",
    "[style.flex-direction]": "horizontal() ? 'row' : 'column'",
    "[style.height]": "'100%'",
    "[style.width]": "'100%'",
    "[style.overflow]": "'hidden'",
  },
})
export class UioSplitter extends UioPart {
  readonly scope = "splitter";
  readonly part = "root";

  /** The panels, in order. A handle is placed between each adjacent pair. */
  readonly panels = input<readonly SplitterPanelDef[]>([]);
  /**
   * The sizes, as percentages. Uncontrolled until something binds it, which is
   * why there is no separate `defaultSize` — see `UioSwitch` for the note.
   */
  readonly size = model<readonly number[] | undefined>(undefined);
  override readonly orientation = input<SplitterOrientation>("horizontal");
  /** `subtle` shows the rule only on hover or focus. */
  readonly variant = input<SplitterVariant>("default");

  /** Fired continuously while a handle moves. */
  readonly resize = output<number[]>();
  /** Fired once, when the drag or the keypress ends. */
  readonly resizeEnd = output<number[]>();

  /**
   * Ark spells the root id `splitter:<machine>` with no part suffix, and every
   * panel's `data-ownedby` points at it.
   */
  protected readonly rootId = `splitter:${nextMachineId()}`;

  private readonly appRef = inject(ApplicationRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The index of the handle being dragged, or `null`. Also drives `data-dragging`. */
  protected readonly dragging = signal<number | null>(null);
  protected readonly focused = signal<number | null>(null);

  /** Where the pointer was, and what the layout was, when the drag started. */
  private origin = 0;
  private startSizes: number[] = [];

  protected readonly horizontal = computed(() => this.orientation() === "horizontal");
  protected readonly hostClass = computed(() =>
    splitterStyles({ orientation: this.orientation(), variant: this.variant() }),
  );
  protected readonly sizes = computed(() => resolveSplitterSizes(this.panels(), this.size()));

  protected panelId(id: string): string {
    return `${this.rootId}:panel:${id}`;
  }
  /** Zag identifies a handle by the literal `before:after` pair of panel ids. */
  protected handleId(index: number): string {
    return `${this.panels()[index]?.id}:${this.panels()[index + 1]?.id}`;
  }
  protected triggerId(index: number): string {
    return `${this.rootId}:splitter:${this.handleId(index)}`;
  }
  protected controls(index: number): string | null {
    const before = this.panels()[index];
    const after = this.panels()[index + 1];
    return before && after ? `${this.panelId(before.id)} ${this.panelId(after.id)}` : null;
  }
  protected aria(index: number): SplitterAriaValues {
    return splitterAriaValues(this.panels(), this.sizes(), index);
  }

  protected asTemplate(content: SplitterPanelDef["content"]): TemplateRef<unknown> | null {
    return content instanceof TemplateRef ? content : null;
  }

  protected onPointerDown(event: PointerEvent, index: number): void {
    if (event.button !== 0) return;
    const handle = event.currentTarget as HTMLElement;
    // `currentTarget`, never `target`: the pointer usually lands on the grip
    // inside the handle, and focusing that focuses nothing — which leaves the
    // arrow keys doing nothing after a click, silently.
    handle.focus({ preventScroll: true });
    capturePointer(handle, event.pointerId);
    this.origin = this.horizontal() ? event.clientX : event.clientY;
    this.startSizes = this.sizes();
    this.dragging.set(index);
    event.preventDefault();
    event.stopPropagation();
  }

  protected onPointerMove(event: PointerEvent): void {
    const index = this.dragging();
    if (index === null) return;
    const box = this.host.nativeElement.getBoundingClientRect();
    const extent = this.horizontal() ? box.width : box.height;
    if (!extent) return;
    // Pixels to percent of the *group*, which is the unit every size is in.
    const moved = (this.horizontal() ? event.clientX : event.clientY) - this.origin;
    this.commit(applySplitterDelta(this.panels(), this.startSizes, index, (moved / extent) * 100));
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.dragging() === null) return;
    releasePointer(event.currentTarget as HTMLElement, event.pointerId);
    this.dragging.set(null);
    this.resizeEnd.emit(this.sizes());
    flushNow(this.appRef);
  }

  /**
   * The keyboard equivalent of a drag, and the only way a handle is usable
   * without a pointer at all.
   *
   * The arrow keys that move a handle are the ones that run *along* its axis —
   * left/right for a vertical rule, up/down for a horizontal one — so the two
   * that would move it sideways are left alone rather than silently swallowed.
   * Shift multiplies the step by ten, which is zag's, and Home/End run the
   * handle to its limits by asking for a delta no constraint can grant.
   */
  protected onKeydown(event: KeyboardEvent, index: number): void {
    const step = event.shiftKey ? 10 : 1;
    const horizontal = this.horizontal();
    let delta: number | null = null;
    switch (event.key) {
      case "ArrowLeft":
        delta = horizontal ? -step : null;
        break;
      case "ArrowRight":
        delta = horizontal ? step : null;
        break;
      case "ArrowUp":
        delta = horizontal ? null : -step;
        break;
      case "ArrowDown":
        delta = horizontal ? null : step;
        break;
      case "Home":
        delta = -100;
        break;
      case "End":
        delta = 100;
        break;
      default:
        return;
    }
    if (delta === null) return;
    event.preventDefault();
    this.commit(applySplitterDelta(this.panels(), this.sizes(), index, delta));
    // A keypress is a complete gesture, so the end fires with it — unlike a
    // drag, where it waits for the pointer to come up.
    this.resizeEnd.emit(this.sizes());
    flushNow(this.appRef);
  }

  private commit(next: number[]): void {
    this.size.set(next);
    this.resize.emit(next);
    flushNow(this.appRef);
  }
}
