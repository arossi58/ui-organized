import { useEffect, useMemo } from "react";
import { Tour as ArkTour, useTour, Portal } from "@ark-ui/react";
import { clsx } from "clsx";
import { Button } from "../Button/index.js";
import { Icon } from "../Icon/index.js";
import { tourStyles } from "@ui-organized/core";
import type { TourProps } from "./Tour.types.js";
import "@ui-organized/core/components/Tour/Tour.css";
import { useOverlayPortal } from "../../preview/useOverlayPortal.js";

const CLOSE_ICON_SIZE = 16;

const DEFAULT_ACTIONS = [
  { label: "Back", action: "prev" as const },
  { label: "Next", action: "next" as const },
];

export function Tour({
  steps,
  stepId,
  onStepChange,
  spotlightRadius,
  preventInteraction,
  closeOnInteractOutside,
  closeOnEscape,
  size,
  variant,
  showProgress = true,
  className,
}: TourProps) {
  const portal = useOverlayPortal();

  /* Steps carry render data our card reads back; the machine only needs the
     shape it defines. Defaults are filled in here so a caller who writes only
     `{ id, title, description }` still gets a working Back/Next row.

     `type` is defaulted for the same reason. TourStep documents it as "inferred
     from `target` when omitted", but the machine does no such inference — it
     rejects the step outright ("Step <id> has no target or type. At least one of
     those is required.") and the tour never opens. Chromium happened to swallow
     it; Firefox and WebKit surfaced it as a page error, which is how it was
     found. Doing the inference here is what makes the documented contract true,
     rather than pushing `type: "dialog"` onto every caller who wants the
     centred step the docs already promise them. */
  const machineSteps = useMemo(
    () =>
      steps.map((step) => ({
        ...step,
        type: step.type ?? (step.target ? "tooltip" : ("dialog" as const)),
        actions: step.actions ?? DEFAULT_ACTIONS,
      })),
    [steps],
  );

  /* Tour is the one Ark component whose Root takes no props: it takes the
     return value of `useTour`. Every other component (`ColorPicker.Root`,
     `TreeView.Root`, …) extends its `Use*Props` directly. */
  const tour = useTour({
    steps: machineSteps,
    stepId,
    onStepChange: (details) => onStepChange?.(details.stepId),
    spotlightRadius,
    preventInteraction,
    closeOnInteractOutside,
    closeOnEscape,
  });

  /* The machine's `stepId` is a bindable seeded from the prop *once*, not a
     live controlled value — changing the prop after mount does not move the
     machine. Opening and navigating therefore have to be driven imperatively,
     which is what this effect does, so the public API can stay a declarative
     prop like every other component here.

     Closing is the asymmetry: the api exposes `start` and `setStep` but no
     programmatic close, so `stepId: null` cannot force one. The tour closes
     through its own dismiss and close affordances and reports it as
     `onStepChange(null)` — keep that wired to your state and the two stay in
     sync. See §7 of FIGMA-PARITY.md. */
  useEffect(() => {
    if (stepId == null) return;
    if (!tour.isValidStep(stepId)) return;
    if (tour.open) {
      if (tour.step?.id !== stepId) tour.setStep(stepId);
    } else {
      tour.start(stepId);
    }
  }, [stepId, tour]);

  return (
    <ArkTour.Root tour={tour}>
      <Portal {...portal}>
        <ArkTour.Backdrop className="tour__backdrop" />
        <ArkTour.Spotlight className="tour__spotlight" />
        {/* The positioner className must stay a plain string literal — the
            overlay-stacking test scans for it. */}
        <ArkTour.Positioner className="tour__positioner">
          <ArkTour.Content className={clsx(tourStyles({ size, variant }), className)}>
            <ArkTour.Arrow className="tour__arrow">
              <ArkTour.ArrowTip className="tour__arrow-tip" />
            </ArkTour.Arrow>

            <div className="tour__header">
              <ArkTour.Title className="tour__title text-strong-body-large" />
              <ArkTour.CloseTrigger className="tour__close" aria-label="End tour">
                <Icon name="close" size={CLOSE_ICON_SIZE} />
              </ArkTour.CloseTrigger>
            </div>

            <ArkTour.Description className="tour__description text-default-body-medium" />

            <div className="tour__footer">
              {showProgress && <ArkTour.ProgressText className="tour__progress" />}
              {/* `Actions` is a render-prop over the *current step's* action
                  list, not an element — it takes no className, so the row it
                  fills is a plain div here. */}
              <div className="tour__actions">
                <ArkTour.Actions>
                  {(actions) =>
                    actions.map((action) => (
                      <ArkTour.ActionTrigger key={action.label} action={action} asChild>
                        <Button
                          intent={action.action === "next" ? "primary" : "secondary"}
                          size={size}
                          type="button"
                        >
                          {action.label}
                        </Button>
                      </ArkTour.ActionTrigger>
                    ))
                  }
                </ArkTour.Actions>
              </div>
            </div>
          </ArkTour.Content>
        </ArkTour.Positioner>
      </Portal>
    </ArkTour.Root>
  );
}
