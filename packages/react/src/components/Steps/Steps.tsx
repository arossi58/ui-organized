import { Steps as ArkSteps } from "@ark-ui/react";
import { clsx } from "clsx";
import { Button } from "../Button/index.js";
import { Icon } from "../Icon/index.js";
import { stepsStyles } from "./Steps.styles.js";
import type { StepsProps } from "./Steps.types.js";
import "./Steps.css";

/** The completed tick sits inside the indicator circle at every size — it marks
 *  the step rather than scaling with the surrounding text. */
const COMPLETE_ICON_SIZE = 16;

export function Steps({
  steps,
  step,
  defaultStep,
  onStepChange,
  onStepComplete,
  orientation = "horizontal",
  size = "md",
  variant = "numbered",
  linear,
  showContent = true,
  completedContent,
  className,
}: StepsProps) {
  return (
    <ArkSteps.Root
      className={clsx(stepsStyles({ orientation, size, variant }), className)}
      // `count` is derived, never a prop: a count out of step with `steps` would
      // desync the progress bar and the trigger list against each other.
      count={steps.length}
      step={step}
      defaultStep={defaultStep}
      onStepChange={onStepChange && ((details) => onStepChange(details.step))}
      onStepComplete={onStepComplete}
      orientation={orientation}
      linear={linear}
    >
      <ArkSteps.List className="steps__list">
        {steps.map((item, index) => (
          <ArkSteps.Item key={item.title} index={index} className="steps__item">
            <ArkSteps.Trigger className="steps__trigger">
              <ArkSteps.Indicator className="steps__indicator">
                {/* The tick replaces the number only once the step is complete;
                    CSS hides whichever one does not apply. */}
                <span className="steps__indicator-number">
                  {variant === "numbered" ? index + 1 : null}
                </span>
                <Icon
                  name="check"
                  size={COMPLETE_ICON_SIZE}
                  className="steps__indicator-check"
                />
              </ArkSteps.Indicator>
              <span className="steps__text">
                <span className="steps__title">{item.title}</span>
                {item.description && (
                  <span className="steps__description">{item.description}</span>
                )}
              </span>
            </ArkSteps.Trigger>
            <ArkSteps.Separator className="steps__separator" />
          </ArkSteps.Item>
        ))}
      </ArkSteps.List>

      {showContent && (
        <>
          {steps.map((item, index) => (
            <ArkSteps.Content key={item.title} index={index} className="steps__content">
              {item.content}
            </ArkSteps.Content>
          ))}
          <ArkSteps.CompletedContent className="steps__content">
            {completedContent}
          </ArkSteps.CompletedContent>
          <div className="steps__actions">
            <ArkSteps.PrevTrigger asChild>
              <Button intent="secondary" size={size} type="button">
                Back
              </Button>
            </ArkSteps.PrevTrigger>
            <ArkSteps.NextTrigger asChild>
              <Button intent="primary" size={size} type="button">
                Next
              </Button>
            </ArkSteps.NextTrigger>
          </div>
        </>
      )}
    </ArkSteps.Root>
  );
}
