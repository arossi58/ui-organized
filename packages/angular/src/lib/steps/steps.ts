import { Component, booleanAttribute, computed, input, model, output } from "@angular/core";
import { stepsStyles, type ControlSize, type StepsVariants } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioButton } from "../button/button.js";
import { UioIcon } from "../icons/icon.js";

export type StepsSize = ControlSize;
export type StepsOrientation = NonNullable<StepsVariants["orientation"]>;
export type StepsVariant = NonNullable<StepsVariants["variant"]>;

export interface StepItem {
  /** Step heading. */
  title: string;
  /** Optional supporting line under the title. */
  description?: string;
  /** Panel shown while this step is current. */
  content?: string;
}

/** The completed tick sits inside the indicator circle at every size — it marks
 *  the step rather than scaling with the surrounding text. */
const COMPLETE_ICON_SIZE = 16;

/**
 * A numbered or dotted progression with a panel per step.
 *
 * ```html
 * <div uioSteps [steps]="steps" [(step)]="current"></div>
 * ```
 *
 * ── There is one more panel than there are steps ────────────────────────────
 *
 * The current step index runs from `0` to `count` *inclusive*: `count` means
 * every step is done, which is why the completed panel is a content part with
 * index `count` rather than something rendered instead of the list. `Next` is
 * disabled at that point and `Back` at zero, and both fall out of the same
 * range rather than from a separate "finished" flag.
 *
 * ── Three states, not two ───────────────────────────────────────────────────
 *
 * Each step is exactly one of `data-complete`, `data-current` and
 * `data-incomplete`, and the trigger, the indicator and the separator all carry
 * it. Two would not be enough: the separator after a finished step is drawn
 * differently from the one after the step being worked on.
 *
 * ── `linear` is a guard, not a disabled attribute ───────────────────────────
 *
 * A linear flow ignores clicks on any step other than the current one and drops
 * the rest out of the tab order, but does **not** disable the buttons. A
 * disabled step would stop announcing its own state to a screen reader, and the
 * whole point of the list is that a user can see where they are in it.
 *
 * ── `type="button"`, deliberately ───────────────────────────────────────────
 *
 * zag 1.43 adds it to the step trigger and the machine Ark React bundles does
 * not. Ours keeps it: `Steps.css` selects on nothing derived from `type`, so
 * nothing renders differently, and stripping it would delete a real guard
 * against a step trigger submitting the form it sits in.
 */
@Component({
  selector: "div[uioSteps]",
  standalone: true,
  exportAs: "uioSteps",
  imports: [UioButton, UioIcon],
  template: `
    <div
      class="steps__list"
      data-scope="steps"
      data-part="list"
      role="tablist"
      [id]="partId('list')"
      [attr.aria-owns]="triggerIds()"
      [attr.aria-orientation]="orientation()"
      [attr.data-orientation]="orientation()"
    >
      @for (item of steps(); track $index) {
        <!--
          A "tablist" may own only tabs, and each item is a direct child div that
          is neither. "role="presentation"" is what stops the rule firing — but
          presentation is *ignored* on an element carrying a global ARIA
          attribute, so "aria-current" cannot be here as well. Nothing is lost:
          the trigger inside already reports "aria-selected", which is what a tab
          is supposed to say. Same decision as the other three libraries.
        -->
        <div
          class="steps__item"
          data-scope="steps"
          data-part="item"
          role="presentation"
          [attr.data-orientation]="orientation()"
        >
          <!--
            The panel a trigger names only exists while "showContent" is on.
            Left in place the reference dangles, which is an ARIA error
            (axe's "aria-valid-attr-value") and costs the trigger its accessible
            name — the broken IDREF wins over the text inside it.
          -->
          <button
            class="steps__trigger"
            data-scope="steps"
            data-part="trigger"
            type="button"
            role="tab"
            [id]="partId('trigger:' + $index)"
            [attr.tabindex]="!linear() || $index === step() ? 0 : -1"
            [attr.aria-selected]="$index === step()"
            [attr.aria-controls]="showContent() ? partId('content:' + $index) : null"
            [attr.data-state]="$index === step() ? 'open' : 'closed'"
            [attr.data-orientation]="orientation()"
            [attr.data-complete]="flag($index < step())"
            [attr.data-current]="flag($index === step())"
            [attr.data-incomplete]="flag($index > step())"
            (click)="goTo($index)"
          >
            <div
              class="steps__indicator"
              data-scope="steps"
              data-part="indicator"
              aria-hidden="true"
              [attr.data-complete]="flag($index < step())"
              [attr.data-current]="flag($index === step())"
              [attr.data-incomplete]="flag($index > step())"
            >
              <!--
                Both the number and the tick are always mounted; CSS hides
                whichever does not apply, so a step completing does not remount
                its indicator mid-transition.
              -->
              <span class="steps__indicator-number">{{
                variant() === "numbered" ? $index + 1 : ""
              }}</span>
              <span
                uioIcon
                name="check"
                class="steps__indicator-check"
                [size]="COMPLETE_ICON_SIZE"
              ></span>
            </div>
            <span class="steps__text">
              <span class="steps__title">{{ item.title }}</span>
              @if (item.description) {
                <span class="steps__description">{{ item.description }}</span>
              }
            </span>
          </button>
          <div
            class="steps__separator"
            data-scope="steps"
            data-part="separator"
            [attr.data-orientation]="orientation()"
            [attr.data-complete]="flag($index < step())"
            [attr.data-current]="flag($index === step())"
            [attr.data-incomplete]="flag($index > step())"
          ></div>
        </div>
      }
    </div>

    @if (showContent()) {
      @for (panel of panels(); track $index) {
        <div
          class="steps__content"
          data-scope="steps"
          data-part="content"
          role="tabpanel"
          tabindex="0"
          [id]="partId('content:' + $index)"
          [attr.hidden]="$index === step() ? null : ''"
          [attr.data-state]="$index === step() ? 'open' : 'closed'"
          [attr.data-orientation]="orientation()"
          [attr.aria-labelledby]="partId('trigger:' + $index)"
        >
          {{ panel }}
        </div>
      }
      <div class="steps__actions">
        <button
          uioButton
          intent="secondary"
          data-scope="steps"
          data-part="prev-trigger"
          [size]="size()"
          [disabled]="step() <= 0"
          (click)="previous()"
        >
          Back
        </button>
        <button
          uioButton
          intent="primary"
          data-scope="steps"
          data-part="next-trigger"
          [size]="size()"
          [disabled]="step() >= steps().length"
          (click)="next()"
        >
          Next
        </button>
      </div>
    }
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    /**
     * Written as the whole `style` attribute rather than through
     * `[style.--percent]`, so the custom property reaches the element the same
     * way in a JIT-compiled spec as it does in the built package — the same
     * arrangement `UioProgress` uses. `Steps.css` reads `--percent`.
     */
    "[attr.style]": "rootStyle()",
  },
})
export class UioSteps extends UioPart {
  readonly scope = "steps";
  readonly part = "root";

  readonly steps = input<StepItem[]>([]);
  /** `0` to `steps.length` inclusive — the last value means "all done". */
  readonly step = model(0);
  readonly stepChange = output<number>();
  /** Fires once the last step is completed. */
  readonly stepComplete = output<void>();

  override readonly orientation = input<StepsOrientation>("horizontal");
  readonly size = input<StepsSize>("md");
  readonly variant = input<StepsVariant>("numbered");
  /** Prevents jumping ahead past the current step. */
  readonly linear = input(false, { transform: booleanAttribute });
  /** Renders the step panels and the Back/Next pair. */
  readonly showContent = input(true, { transform: booleanAttribute });
  /** Panel shown once every step is complete. */
  readonly completedContent = input<string | undefined>(undefined);

  protected readonly hostClass = computed(() =>
    stepsStyles({
      orientation: this.orientation(),
      size: this.size(),
      variant: this.variant(),
    }),
  );

  /**
   * One panel per step, plus the completed one at the end.
   *
   * Rendering the completed panel as the `count`-th content part rather than as
   * a separate element is what keeps `hidden` and `data-state` deciding which
   * panel shows, with no branch anywhere for "finished".
   */
  protected readonly panels = computed(() => [
    ...this.steps().map((item) => item.content ?? ""),
    this.completedContent() ?? "",
  ]);

  private readonly percent = computed(() => {
    const count = this.steps().length;
    return count === 0 ? 0 : (this.step() / count) * 100;
  });
  protected readonly rootStyle = computed(() => `--percent: ${this.percent()}%;`);

  /**
   * The list `aria-owns` every trigger.
   *
   * The triggers are already descendants, so this looks redundant — it is what
   * Ark emits, and it is load-bearing for the one case where a step's content
   * is portalled away from its tab.
   */
  protected readonly triggerIds = computed(() =>
    this.steps()
      .map((_, index) => this.partId(`trigger:${index}`))
      .join(" "),
  );

  protected readonly COMPLETE_ICON_SIZE = COMPLETE_ICON_SIZE;
  protected readonly flag = stateFlag;

  private readonly machine = nextMachineId();
  protected get rootId(): string {
    return `${this.scope}:${this.machine}`;
  }
  protected partId(part: string): string {
    return `${this.scope}:${this.machine}:${part}`;
  }

  /**
   * A linear flow ignores the click rather than refusing it loudly, which is
   * what makes the list read as a progress indicator instead of a broken menu.
   */
  protected goTo(index: number): void {
    if (this.linear()) return;
    this.commit(index);
  }

  protected next(): void {
    this.commit(Math.min(this.step() + 1, this.steps().length));
  }

  protected previous(): void {
    this.commit(Math.max(this.step() - 1, 0));
  }

  private commit(next: number): void {
    if (next === this.step()) return;
    this.step.set(next);
    this.stepChange.emit(next);
    if (next === this.steps().length) this.stepComplete.emit();
  }
}
