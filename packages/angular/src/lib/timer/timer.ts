import {
  ApplicationRef,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { timerStyles, type TimerVariants } from "@ui-organized/core";
import { UioPart } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioButton } from "../button/button.js";
import { flushNow } from "../overlay/flush.js";

export type TimerPart = "days" | "hours" | "minutes" | "seconds" | "milliseconds";
export type TimerSize = NonNullable<TimerVariants["size"]>;
export type TimerVariant = NonNullable<TimerVariants["variant"]>;
export type TimerAction = "start" | "pause" | "resume" | "reset";

const DEFAULT_PARTS: TimerPart[] = ["hours", "minutes", "seconds"];
const DEFAULT_INTERVAL = 1000;

/** The five units, broken out of a millisecond count. Zag's `msToTime`. */
export interface TimerTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export function msToTime(ms: number): TimerTime {
  const time = Math.max(0, ms);
  return {
    days: Math.floor(time / (1000 * 60 * 60 * 24)),
    hours: Math.floor(time / (1000 * 60 * 60)) % 24,
    minutes: Math.floor(time / (1000 * 60)) % 60,
    seconds: Math.floor(time / 1000) % 60,
    milliseconds: time % 1000,
  };
}

const pad = (value: number, width = 2) => value.toString().padStart(width, "0");

/** What each unit is *printed* as — two digits, or three for milliseconds. */
export function formatTimerTime(time: TimerTime): Record<TimerPart, string> {
  return {
    days: pad(time.days),
    hours: pad(time.hours),
    minutes: pad(time.minutes),
    seconds: pad(time.seconds),
    milliseconds: pad(time.milliseconds, 3),
  };
}

/**
 * Where a tick lands, given how long actually elapsed.
 *
 * `deltaMs` is floored to a whole number of intervals rather than added raw,
 * which is zag's `roundToInterval` and the reason a timer with a 1000ms interval
 * shows whole seconds even though the callback fires at 1003ms. Adding the raw
 * delta would drift the displayed value away from the interval within a minute.
 *
 * The target is a floor when counting down and a ceiling when counting up, so a
 * timer cannot overshoot the value that completes it.
 */
export function nextTimerValue(options: {
  currentMs: number;
  deltaMs: number;
  interval: number;
  countdown: boolean;
  targetMs: number | undefined;
}): number {
  const { currentMs, deltaMs, interval, countdown } = options;
  const step = Math.floor(deltaMs / interval) * interval;
  const next = currentMs + (countdown ? -step : step);
  let targetMs = options.targetMs;
  if (targetMs == null && countdown) targetMs = 0;
  if (targetMs == null) return next;
  return countdown ? Math.max(next, targetMs) : Math.min(next, targetMs);
}

/** Whether the timer has arrived at the value that ends it. */
export function hasReachedTarget(options: {
  currentMs: number;
  countdown: boolean;
  targetMs: number | undefined;
}): boolean {
  let targetMs = options.targetMs;
  if (targetMs == null && options.countdown) targetMs = 0;
  if (targetMs == null) return false;
  return options.countdown ? options.currentMs <= targetMs : options.currentMs >= targetMs;
}

/**
 * A countdown or a stopwatch, with optional controls.
 *
 * ```html
 * <div uioTimer countdown [startMs]="60000" showControls></div>
 * ```
 *
 * ── The four triggers are always rendered ───────────────────────────────────
 *
 * Start, Pause, Resume and Reset all exist in the DOM at once, and whichever
 * does not apply to the current state carries `hidden`. That is zag's, not a
 * simplification: a button that is removed and re-added loses focus, so a user
 * who pauses with the keyboard would be dropped back to the top of the page
 * rather than left on the Resume button that replaced Pause. Rendering all four
 * and hiding three keeps the tab order stable across every transition.
 *
 * ── Why the tick is `setInterval` and not `requestAnimationFrame` ───────────
 *
 * Zag ticks on a rAF loop, which is smoother for a millisecond readout and
 * unusable in a spec: jsdom's rAF is tied to a timer this package cannot drive.
 * The arithmetic is what matters and it is identical — `deltaMs` is measured
 * against the clock rather than assumed, then floored to whole intervals — so a
 * background tab that throttles the callback resumes at the right value instead
 * of losing the time it was away.
 */
@Component({
  selector: "div[uioTimer]",
  standalone: true,
  exportAs: "uioTimer",
  imports: [UioButton],
  template: `
    <div
      class="timer__area"
      role="timer"
      aria-atomic="true"
      data-scope="timer"
      data-part="area"
      [id]="partId('area')"
      [attr.aria-label]="areaLabel()"
    >
      @for (unit of parts(); track unit; let index = $index) {
        @if (index > 0) {
          <div
            class="timer__separator"
            aria-hidden="true"
            data-scope="timer"
            data-part="separator"
          >
            :
          </div>
        }
        <div class="timer__segment">
          <div
            class="timer__value"
            data-scope="timer"
            data-part="item"
            [attr.data-type]="unit"
            [style.--value]="time()[unit]"
          >
            {{ formatted()[unit] }}
          </div>
          @if (showLabels()) {
            <span class="timer__label">{{ unit }}</span>
          }
        </div>
      }
    </div>

    @if (showControls()) {
      <div class="timer__control" data-scope="timer" data-part="control">
        <button
          uioButton
          intent="primary"
          icon="play"
          data-scope="timer"
          data-part="action-trigger"
          [size]="size()"
          [attr.hidden]="isHidden('start')"
          (click)="act('start')"
        >
          Start
        </button>
        <button
          uioButton
          intent="secondary"
          icon="pause"
          data-scope="timer"
          data-part="action-trigger"
          [size]="size()"
          [attr.hidden]="isHidden('pause')"
          (click)="act('pause')"
        >
          Pause
        </button>
        <button
          uioButton
          intent="secondary"
          icon="play"
          data-scope="timer"
          data-part="action-trigger"
          [size]="size()"
          [attr.hidden]="isHidden('resume')"
          (click)="act('resume')"
        >
          Resume
        </button>
        <button
          uioButton
          intent="ghost"
          icon="refresh"
          data-scope="timer"
          data-part="action-trigger"
          [size]="size()"
          [attr.hidden]="isHidden('reset')"
          (click)="act('reset')"
        >
          Reset
        </button>
      </div>
    }
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
  },
})
export class UioTimer extends UioPart {
  readonly scope = "timer";
  readonly part = "root";

  /** Which units to show, in order. */
  readonly parts = input<readonly TimerPart[]>(DEFAULT_PARTS);
  /** Counts down to `targetMs` rather than up from `startMs`. */
  readonly countdown = input(false);
  readonly startMs = input(0);
  readonly targetMs = input<number | undefined>(undefined);
  /** Starts as soon as it mounts. */
  readonly autoStart = input(false);
  readonly interval = input(DEFAULT_INTERVAL);
  readonly showControls = input(false);
  readonly showLabels = input(false);
  readonly size = input<TimerSize>("md");
  readonly variant = input<TimerVariant>("default");

  /** Fired once the target is reached. */
  readonly complete = output<void>();
  /** Fired on every tick, with the new value in milliseconds. */
  readonly tick = output<number>();

  private readonly machine = nextMachineId();
  /** Ark's timer root carries a `:root` suffix, unlike most machines. */
  protected readonly rootId = `timer:${this.machine}:root`;
  protected partId(part: string): string {
    return `timer:${this.machine}:${part}`;
  }

  private readonly appRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly status = signal<"idle" | "running" | "paused">("idle");
  private readonly currentMs = signal(0);

  protected readonly time = computed(() => msToTime(this.currentMs()));
  protected readonly formatted = computed(() => formatTimerTime(this.time()));
  /**
   * Zag's default `areaLabel`, which always spells out days and always shows
   * three fields — it does not follow `parts`. A timer showing only seconds
   * still announces "0 days 00:00:09".
   */
  protected readonly areaLabel = computed(() => {
    const formatted = this.formatted();
    return `${this.time().days} days ${formatted.hours}:${formatted.minutes}:${formatted.seconds}`;
  });

  protected readonly hostClass = computed(() =>
    timerStyles({ size: this.size(), variant: this.variant() }),
  );

  private handle: ReturnType<typeof setInterval> | null = null;
  private lastTick = 0;

  /** False until the first effect run, which is the earliest inputs are bound. */
  private seeded = false;

  constructor() {
    super();
    /**
     * The first run seeds; every later one restarts.
     *
     * An effect rather than the constructor because a constructor runs before
     * Angular has set a single input — `startMs()` there is the declared
     * default, not what the caller passed. The first run is therefore the
     * mount, where `autoStart` decides the state, and any run after it is the
     * caller handing the timer a new duration, which zag treats as a RESTART:
     * a new duration starts counting rather than sitting idle at the new value.
     */
    effect(() => {
      const start = this.startMs();
      if (!this.seeded) {
        this.seeded = true;
        this.currentMs.set(start);
        this.status.set(untracked(this.autoStart) ? "running" : "idle");
        return;
      }
      untracked(() => this.restart());
    });
    effect(() => {
      if (this.status() === "running") untracked(() => this.startTicking(this.interval()));
      else untracked(() => this.stopTicking());
    });
    this.destroyRef.onDestroy(() => this.stopTicking());
  }

  // ── Public API ────────────────────────────────────────────────────────────

  start(): void {
    if (this.status() === "idle") this.status.set("running");
  }
  pause(): void {
    if (this.status() === "running") this.status.set("paused");
  }
  resume(): void {
    if (this.status() === "paused") this.status.set("running");
  }
  reset(): void {
    this.currentMs.set(this.startMs());
    if (this.status() === "paused") this.status.set("idle");
  }
  restart(): void {
    this.currentMs.set(this.startMs());
    this.status.set("running");
  }

  // ── Triggers ──────────────────────────────────────────────────────────────

  /**
   * Zag's table, reproduced exactly. Note `reset` is hidden while *idle* as well
   * as while stopped — there is nothing to reset until the timer has run.
   */
  protected isHidden(action: TimerAction): "" | null {
    const running = this.status() === "running";
    const paused = this.status() === "paused";
    const hidden = {
      start: running || paused,
      pause: !running,
      resume: !paused,
      reset: !running && !paused,
    }[action];
    return hidden ? "" : null;
  }

  protected act(action: TimerAction): void {
    this[action]();
    flushNow(this.appRef);
  }

  // ── Ticking ───────────────────────────────────────────────────────────────

  private startTicking(interval: number): void {
    this.stopTicking();
    this.lastTick = Date.now();
    this.handle = setInterval(() => this.onTick(interval), interval);
  }

  private stopTicking(): void {
    if (this.handle === null) return;
    clearInterval(this.handle);
    this.handle = null;
  }

  private onTick(interval: number): void {
    const now = Date.now();
    const deltaMs = now - this.lastTick;
    // Only the whole intervals are consumed; the remainder stays on the clock so
    // a callback that fires 3ms late does not lose those 3ms forever.
    const consumed = Math.floor(deltaMs / interval) * interval;
    if (consumed <= 0) return;
    this.lastTick += consumed;

    const countdown = this.countdown();
    const targetMs = this.targetMs();
    // Checked *before* the value moves, which is zag's order: a timer that has
    // reached its target spends one more interval running and completes on the
    // tick after it. Completing the moment the value lands would hide Pause a
    // whole interval earlier than the other three libraries do.
    if (hasReachedTarget({ currentMs: this.currentMs(), countdown, targetMs })) {
      this.finish();
      return;
    }
    const next = nextTimerValue({
      currentMs: this.currentMs(),
      deltaMs,
      interval,
      countdown,
      targetMs,
    });
    this.currentMs.set(next);
    this.tick.emit(next);
    flushNow(this.appRef);
  }

  private finish(): void {
    // Back to `idle` rather than `paused`: the run is over, so Start is the
    // trigger that applies, not Resume.
    this.status.set("idle");
    this.complete.emit();
    flushNow(this.appRef);
  }
}
