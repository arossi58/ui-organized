import { Overlay, type OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import {
  ApplicationRef,
  Component,
  DOCUMENT,
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
import { tourStyles, type ControlSize, type TourVariants } from "@ui-organized/core";
import { stateFlag } from "../part.js";
import { HostPresence } from "../host-presence.js";
import { UioButton } from "../button/button.js";
import { UioIcon } from "../icons/icon.js";
import { nextMachineId } from "../part-ids.js";
import { flushNow } from "../overlay/flush.js";
import { createSurface, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";

export type TourSize = ControlSize;
export type TourVariant = NonNullable<TourVariants["variant"]>;
export type TourStepType = "tooltip" | "dialog" | "wait" | "floating";
export type TourActionKind = "next" | "prev" | "dismiss" | "skip";

export interface TourStepAction {
  /** Button text. */
  label: string;
  /** What the button does. Defaults to `next`. */
  action?: TourActionKind;
}

export interface TourStep {
  /** Unique across the tour. This is what `stepId` names. */
  id: string;
  title: string;
  description: string;
  /** Returns the element to highlight. Omit for a centred, modal step. */
  target?: () => HTMLElement | null;
  /** Inferred from `target` when omitted — see `normalizeTourStep`. */
  type?: TourStepType;
  placement?: string;
  actions?: TourStepAction[];
  /** Dims the rest of the page. Defaulted by the normaliser, not here. */
  backdrop?: boolean;
  /** Points an arrow at the target. Defaulted by the normaliser. */
  arrow?: boolean;
}

const CLOSE_ICON_SIZE = 16;

const DEFAULT_ACTIONS: TourStepAction[] = [
  { label: "Back", action: "prev" },
  { label: "Next", action: "next" },
];

/**
 * Fill in a step's implied fields, exactly as zag's `normalizeStep` does.
 *
 * The order of the branches is the whole of it, and it is not intuitive: a step
 * with `type: "wait"` and **no target** falls into the *dialog* branch, because
 * `target == null` is tested before the type is — so it keeps its own `type` (the
 * spread comes last) while picking up `backdrop: true` from a branch it does not
 * belong to. That is why a waiting step with no target renders an *un*-hidden
 * backdrop, which is the sort of thing no amount of reading the prop types
 * predicts and which the browser cases pin.
 *
 * Exported so `tour.spec.ts` can hold every branch against the values a running
 * `@ark-ui/react` Tour rendered.
 */
export function normalizeTourStep(step: TourStep): TourStep {
  if (step.type === "floating") {
    return { backdrop: false, arrow: false, placement: "bottom-end", ...step };
  }
  if (step.target == null || step.type === "dialog") {
    return { type: "dialog", placement: "center", backdrop: true, ...step };
  }
  if (!step.type || step.type === "tooltip") {
    return { type: "tooltip", arrow: true, backdrop: true, ...step };
  }
  return step;
}

/** A `wait` step is a pause for the app, not a card, so it is not counted. */
export const effectiveTourSteps = (steps: readonly TourStep[]): TourStep[] =>
  steps.filter((step) => step.type !== "wait");

/**
 * The "N of M" a tour reads out.
 *
 * Both halves come from the *effective* steps, so a waiting step reads "0 of 1"
 * rather than "1 of 2" — it is not one of the cards being counted, and its own
 * index among them is -1.
 */
export function tourProgressText(steps: readonly TourStep[], stepId: string | null): string {
  const effective = effectiveTourSteps(steps);
  const index = stepId == null ? -1 : effective.findIndex((step) => step.id === stepId);
  return `${index + 1} of ${effective.length}`;
}

/**
 * A guided walkthrough: a card per step, over a dimmed page.
 *
 * ```html
 * <uio-tour [steps]="steps" [(stepId)]="stepId" />
 * ```
 *
 * ── Opening is a *change* to `stepId`, never its initial value ──────────────
 *
 * This is the component's one genuine surprise, it is shared by all four
 * libraries, and it is worth stating rather than smoothing over. zag seeds its
 * `stepId` from the prop and moves the tour into its running state from a
 * **watch** on that value — so a tour rendered with `stepId` already set has
 * nothing to watch, and `start()` sets the id it already holds. It stays closed.
 * The card, the backdrop and the spotlight are all rendered; the card is
 * `hidden` and `data-state="closed"`.
 *
 * Reproduced rather than fixed, because "fixed" here means Angular alone opening
 * a tour on page load where React, Svelte and Vue do not. Open it from an
 * interaction — a click that sets `stepId`, or `start(id)` — which is what the
 * React component's own documentation says.
 *
 * ── Where the numbers come from ────────────────────────────────────────────
 *
 * `hasNextStep` and `hasPrevStep` — which decide the Back and Next buttons'
 * `disabled` — count **all** the steps, while the progress text counts only the
 * effective ones. The two disagree for a tour containing a `wait` step, and the
 * disagreement is zag's rather than a slip: a waiting step is a real place in the
 * sequence and not a card to be numbered.
 */
@Component({
  selector: "uio-tour",
  standalone: true,
  exportAs: "uioTour",
  providers: [HostPresence],
  imports: [UioButton, UioIcon],
  template: `
    <!-- See the note in "UioPopover" for why the container is not on the host. -->
    <ng-container #anchor />
    <ng-template #surface>
      <div
        class="tour__backdrop"
        data-scope="tour"
        data-part="backdrop"
        [id]="partId('backdrop')"
        [attr.hidden]="backdropHidden() ? '' : null"
        [attr.data-state]="state()"
        [attr.data-type]="step()?.type ?? null"
        [attr.style]="backdropStyle()"
      ></div>

      <!--
        The cut-out over the highlighted element. Hidden until a step both is
        showing and has a target to point at, which is why a dialog step never
        shows one.
      -->
      <div
        class="tour__spotlight"
        data-scope="tour"
        data-part="spotlight"
        [attr.hidden]="spotlightHidden() ? '' : null"
        [attr.data-state]="state()"
        [attr.style]="spotlightStyle()"
      ></div>

      <div
        class="tour__positioner"
        data-scope="tour"
        data-part="positioner"
        [id]="partId('positioner')"
        [attr.data-type]="step()?.type ?? null"
        [attr.style]="positionerStyle"
      >
        <div
          [class]="contentClass()"
          data-scope="tour"
          data-part="content"
          role="alertdialog"
          aria-modal="true"
          aria-live="polite"
          aria-atomic="true"
          tabindex="-1"
          [id]="partId('content')"
          [attr.hidden]="open() ? null : ''"
          [attr.data-state]="state()"
          [attr.data-type]="step()?.type ?? null"
          [attr.data-step]="step()?.id ?? null"
          [attr.aria-labelledby]="partId('title')"
          [attr.aria-describedby]="partId('desc')"
          (keydown)="onKeydown($event)"
        >
          @if (step()?.arrow) {
            <div class="tour__arrow" data-scope="tour" data-part="arrow" [id]="partId('arrow')">
              <div class="tour__arrow-tip" data-scope="tour" data-part="arrow-tip"></div>
            </div>
          }

          <div class="tour__header">
            <h2
              class="tour__title text-strong-body-large"
              data-scope="tour"
              data-part="title"
              [id]="partId('title')"
              [attr.data-placement]="placement()"
              >{{ step()?.title ?? "" }}</h2
            >
            <!--
              No "type" attribute, deliberately: zag normalises this part with
              "normalize.element" rather than "normalize.button", so none of the
              four libraries renders one. Adding it would be the safer HTML and
              would put Angular out of step on an element the gate compares.
            -->
            <button
              class="tour__close"
              data-scope="tour"
              data-part="close-trigger"
              aria-label="End tour"
              [attr.data-type]="step()?.type ?? null"
              (click)="dismiss()"
            >
              <span uioIcon name="close" [size]="CLOSE_ICON_SIZE"></span>
            </button>
          </div>

          <div
            class="tour__description text-default-body-medium"
            data-scope="tour"
            data-part="description"
            [id]="partId('desc')"
            [attr.data-placement]="placement()"
            >{{ step()?.description ?? "" }}</div
          >

          <div class="tour__footer">
            @if (showProgress()) {
              <div class="tour__progress" data-scope="tour" data-part="progress-text">{{
                progressText()
              }}</div>
            }
            <div class="tour__actions">
              @for (action of actions(); track $index) {
                <button
                  uioButton
                  type="button"
                  data-scope="tour"
                  data-part="action-trigger"
                  [intent]="action.action === 'next' ? 'primary' : 'secondary'"
                  [size]="size()"
                  [attr.data-type]="actionType(action)"
                  [attr.aria-label]="actionLabel(action)"
                  [disabled]="actionDisabled(action)"
                  [attr.data-disabled]="flag(actionDisabled(action))"
                  (click)="run(action)"
                >{{ action.label }}</button>
              }
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
})
export class UioTour implements OnInit, OnDestroy {
  readonly steps = input<TourStep[]>([]);
  /**
   * The step to show, by id.
   *
   * Setting it to another id *after mount* opens the tour there — see the class
   * note for why its initial value does not.
   */
  readonly stepId = model<string | null>(null);
  readonly stepIdChange = output<string | null>();
  readonly size = input<TourSize>("md");
  readonly variant = input<TourVariant>("default");
  readonly showProgress = input(true, { transform: booleanAttribute });
  /** Corner radius of the spotlight cutout, in pixels. */
  readonly spotlightRadius = input(4);
  /** Blocks interaction with the page behind the tour. */
  readonly preventInteraction = input(false, { transform: booleanAttribute });
  /** Closes when clicking outside the card. */
  readonly closeOnInteractOutside = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });

  protected readonly CLOSE_ICON_SIZE = CLOSE_ICON_SIZE;
  protected readonly flag = stateFlag;

  private readonly machine = nextMachineId();
  /**
   * `tour-<part>-<machine>`, which is neither of the two shapes the rest of the
   * library uses. zag builds this component's ids that way and the parity gate
   * compares references rather than literals, so the spelling is reproduced to
   * keep a DOM diff between the four libraries readable.
   */
  protected partId(part: string): string {
    return `tour-${part}-${this.machine}`;
  }

  private readonly running = signal(false);
  protected readonly open = this.running.asReadonly();
  protected readonly state = computed(() => (this.running() ? "open" : "closed"));

  protected readonly step = computed(() => {
    const id = this.stepId();
    if (id == null) return null;
    const found = this.steps().find((step) => step.id === id);
    return found ? normalizeTourStep(found) : null;
  });

  /** The index among *all* steps, which is what the two buttons are decided by. */
  private readonly stepIndex = computed(() => {
    const id = this.stepId();
    return id == null ? -1 : this.steps().findIndex((step) => step.id === id);
  });
  private readonly hasNextStep = computed(() => this.stepIndex() < this.steps().length - 1);
  private readonly hasPrevStep = computed(() => this.stepIndex() > 0);

  protected readonly progressText = computed(() =>
    tourProgressText(this.steps(), this.stepId()),
  );

  /** Steps fill in a Back/Next row when they do not name their own. */
  protected readonly actions = computed(() => this.step()?.actions ?? (this.step() ? DEFAULT_ACTIONS : []));

  protected readonly contentClass = computed(() =>
    tourStyles({ size: this.size(), variant: this.variant() }),
  );

  /**
   * A step with no target has no side to be on, so it is centred — and it is
   * centred even before a step exists, which is what the other three render.
   */
  protected readonly placement = computed(() => (this.step()?.target?.() ? null : "center"));

  /** Hidden by the *step*, not by the tour: a step may ask for no dimming. */
  protected readonly backdropHidden = computed(() => !this.step()?.backdrop);
  protected readonly spotlightHidden = computed(
    () => !this.running() || !this.step()?.target?.(),
  );

  protected readonly backdropStyle = computed(
    () =>
      "--tour-layer: 0; " +
      `position: ${this.step()?.type === "dialog" ? "fixed" : "absolute"}; inset: 0px;`,
  );

  protected readonly spotlightStyle = computed(
    () =>
      "--tour-layer: 1; position: absolute; width: 0px; height: 0px; left: 0px; top: 0px; " +
      `border-radius: ${this.spotlightRadius()}px; pointer-events: none;`,
  );

  protected readonly positionerStyle = "--tour-layer: 2;";

  protected actionType(action: TourStepAction): string {
    const kind = action.action ?? "next";
    if (kind === "next" || kind === "prev") return kind;
    if (kind === "dismiss") return "close";
    return "custom";
  }

  protected actionLabel(action: TourStepAction): string | null {
    const kind = action.action ?? "next";
    if (kind === "next") return "next step";
    if (kind === "prev") return "previous step";
    if (kind === "dismiss") return "close tour";
    return null;
  }

  protected actionDisabled(action: TourStepAction): boolean {
    const kind = action.action ?? "next";
    if (kind === "next") return !this.hasNextStep();
    if (kind === "prev") return !this.hasPrevStep();
    return false;
  }

  /** See `UioDialog` — decorator queries are the spelling both compilers register. */
  @ViewChild("surface", { static: true }) private surface!: TemplateRef<unknown>;
  @ViewChild("anchor", { read: ViewContainerRef, static: true }) private anchor!: ViewContainerRef;

  private readonly overlay = inject(Overlay);
  private readonly document = inject(DOCUMENT);
  private readonly presence = inject(HostPresence);
  private readonly appRef = inject(ApplicationRef);

  private overlayRef?: OverlayRef;
  private surfaceView?: EmbeddedViewRef<unknown>;
  private applied = false;
  /**
   * `undefined` until the first pass, which is what makes the initial `stepId` a
   * seed rather than an instruction. See the class note.
   */
  private seenStepId: string | null | undefined = undefined;

  constructor() {
    effect(() => {
      const id = this.stepId();
      untracked(() => this.onStepId(id));
    });
    effect(() => {
      this.running();
      this.step();
      untracked(() => this.sync());
    });
  }

  ngOnInit(): void {
    this.overlayRef = createSurface(this.overlay, {
      // The card is centred by `Tour.css` for a dialog step and by the step's
      // own placement otherwise; the CDK is only asked for a container.
      positionStrategy: this.overlay.position().global(),
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
    this.surfaceView = this.overlayRef.attach(
      new TemplatePortal(this.surface, this.anchor),
    ) as EmbeddedViewRef<unknown>;
    setSurfaceInteractive(this.overlayRef, false);
    this.presence.hide();
    this.document.addEventListener("pointerdown", this.onDocumentPointerDown, true);
  }

  ngOnDestroy(): void {
    this.document.removeEventListener("pointerdown", this.onDocumentPointerDown, true);
    this.overlayRef?.dispose();
  }

  /** Open the tour at a step. The imperative half of `stepId`. */
  start(id: string): void {
    if (!this.isValidStep(id)) return;
    this.seenStepId = id;
    this.stepId.set(id);
    this.stepIdChange.emit(id);
    this.running.set(true);
    flushNow(this.appRef);
  }

  isValidStep(id: string): boolean {
    return this.steps().some((step) => step.id === id);
  }

  next(): void {
    this.goto(this.stepIndex() + 1);
  }

  previous(): void {
    this.goto(this.stepIndex() - 1);
  }

  /** Ends the tour and reports it as `stepId: null`, the way React's does. */
  dismiss(): void {
    this.running.set(false);
    this.seenStepId = null;
    this.stepId.set(null);
    this.stepIdChange.emit(null);
    flushNow(this.appRef);
  }

  private goto(index: number): void {
    const step = this.steps()[index];
    if (!step) return;
    this.seenStepId = step.id;
    this.stepId.set(step.id);
    this.stepIdChange.emit(step.id);
    flushNow(this.appRef);
  }

  private onStepId(id: string | null): void {
    if (this.seenStepId === undefined) {
      // The seed. zag's `stepId` bindable takes the prop as its default value,
      // so the machine already holds it and its watch never fires.
      this.seenStepId = id;
      return;
    }
    if (id === this.seenStepId) return;
    this.seenStepId = id;
    if (id != null && this.isValidStep(id)) this.running.set(true);
  }

  private contentElement(): HTMLElement | null {
    return (
      this.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="content"]') ?? null
    );
  }

  private sync(): void {
    const open = this.running();
    this.surfaceView?.detectChanges();
    const ref = this.overlayRef;
    if (!ref) return;
    /**
     * The pane takes clicks exactly when the backdrop is painted.
     *
     * The other three libraries portal the backdrop straight into `document.body`
     * where it blocks the page on its own; Angular's sits inside a CDK pane, and
     * `.cdk-overlay-pane` is what actually receives the pointer. So the two have
     * to be kept in step by hand — and the condition is the *backdrop's*, not the
     * tour's, because a closed tour whose current step asks for dimming still
     * renders an un-hidden backdrop in every library. That is a finding about the
     * machine rather than about this port; what matters here is that Angular
     * blocks the page in exactly the cases React does.
     */
    setSurfaceInteractive(ref, open || !this.backdropHidden());
    if (open === this.applied) return;
    this.applied = open;
    if (!open) return;
    raiseSurface(ref);
    this.contentElement()?.focus({ preventScroll: true });
  }

  protected run(action: TourStepAction): void {
    switch (action.action ?? "next") {
      case "next":
        this.next();
        break;
      case "prev":
        this.previous();
        break;
      default:
        // `dismiss` and `skip` both end the tour; the difference is which
        // callback zag invokes, and this component reports both as `null`.
        this.dismiss();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || !this.running()) return;
    if (event.key === "Escape") {
      if (this.closeOnEscape()) this.dismiss();
      return;
    }
    if (event.key === "ArrowRight" && this.hasNextStep()) this.next();
    else if (event.key === "ArrowLeft" && this.hasPrevStep()) this.previous();
  }

  private readonly onDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.running() || !this.closeOnInteractOutside()) return;
    const content = this.contentElement();
    const target = event.target;
    if (!content || (target instanceof Node && content.contains(target))) return;
    this.dismiss();
  };
}
