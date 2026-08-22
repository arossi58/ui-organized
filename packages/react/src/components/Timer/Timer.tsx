import { Fragment } from "react";
import { Timer as ArkTimer } from "@ark-ui/react";
import { clsx } from "clsx";
import { Button } from "../Button/index.js";
import { timerStyles } from "./Timer.styles.js";
import type { TimerProps, TimerPart } from "./Timer.types.js";
import "@ui-organized/core/components/Timer/Timer.css";

const DEFAULT_PARTS: TimerPart[] = ["hours", "minutes", "seconds"];

export function Timer({
  parts = DEFAULT_PARTS,
  countdown,
  startMs,
  targetMs,
  autoStart,
  interval,
  onComplete,
  showControls = false,
  size = "md",
  variant,
  showLabels = false,
  className,
}: TimerProps) {
  return (
    <ArkTimer.Root
      className={clsx(timerStyles({ size, variant }), className)}
      countdown={countdown}
      startMs={startMs}
      targetMs={targetMs}
      autoStart={autoStart}
      interval={interval}
      onComplete={onComplete}
    >
      <ArkTimer.Area className="timer__area">
        {parts.map((part, index) => (
          <Fragment key={part}>
            {index > 0 && (
              <ArkTimer.Separator className="timer__separator" aria-hidden="true">
                :
              </ArkTimer.Separator>
            )}
            <div className="timer__segment">
              <ArkTimer.Item type={part} className="timer__value" />
              {showLabels && <span className="timer__label">{part}</span>}
            </div>
          </Fragment>
        ))}
      </ArkTimer.Area>

      {showControls && (
        <ArkTimer.Control className="timer__control">
          {/* zag hides whichever trigger does not apply to the current state, so
              start and resume can both be present without a conditional here. */}
          <ArkTimer.ActionTrigger action="start" asChild>
            <Button intent="primary" size={size} icon="play" type="button">
              Start
            </Button>
          </ArkTimer.ActionTrigger>
          <ArkTimer.ActionTrigger action="pause" asChild>
            <Button intent="secondary" size={size} icon="pause" type="button">
              Pause
            </Button>
          </ArkTimer.ActionTrigger>
          <ArkTimer.ActionTrigger action="resume" asChild>
            <Button intent="secondary" size={size} icon="play" type="button">
              Resume
            </Button>
          </ArkTimer.ActionTrigger>
          <ArkTimer.ActionTrigger action="reset" asChild>
            <Button intent="ghost" size={size} icon="refresh" type="button">
              Reset
            </Button>
          </ArkTimer.ActionTrigger>
        </ArkTimer.Control>
      )}
    </ArkTimer.Root>
  );
}
