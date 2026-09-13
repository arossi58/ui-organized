<!--
  A guided walkthrough: a spotlight over the page and a card beside whatever it
  is pointing at. Everything it renders is portalled, so the tour has no DOM in
  place until it opens.
-->
<script lang="ts">
  import { Tour as ArkTour, useTour, Portal } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { tourStyles } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import Icon from "../Icon/Icon.svelte";
  import type { TourProps } from "./Tour.types.js";
  import "@ui-organized/core/components/Tour/Tour.css";

  const CLOSE_ICON_SIZE = 16;

  const DEFAULT_ACTIONS = [
    { label: "Back", action: "prev" as const },
    { label: "Next", action: "next" as const },
  ];

  let {
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
    class: className,
  }: TourProps = $props();

  /* Steps carry render data our card reads back; the machine only needs the
     shape it defines. Defaults are filled in here so a caller who writes only
     `{ id, title, description }` still gets a working Back/Next row. */
  const machineSteps = $derived(
    steps.map((step) => ({ ...step, actions: step.actions ?? DEFAULT_ACTIONS })),
  );

  /* Tour is the one Ark component whose Root takes no props: it takes the
     return value of `useTour`. Every other component (`ColorPicker.Root`,
     `TreeView.Root`, …) extends its `Use*Props` directly. */
  const tour = useTour(() => ({
    steps: machineSteps,
    stepId,
    onStepChange: (details) => onStepChange?.(details.stepId),
    spotlightRadius,
    preventInteraction,
    closeOnInteractOutside,
    closeOnEscape,
  }));

  /* The machine's `stepId` is a bindable seeded from the prop *once*, not a
     live controlled value — changing the prop after mount does not move the
     machine. Opening and navigating therefore have to be driven imperatively,
     which is what this effect does, so the public API can stay a declarative
     prop like every other component here.

     Closing is the asymmetry: the api exposes `start` and `setStep` but no
     programmatic close, so `stepId: null` cannot force one. The tour closes
     through its own dismiss and close affordances and reports it as
     `onStepChange(null)` — keep that wired to your state and the two stay in
     sync.

     The guards are what stop this from looping: it writes machine state that it
     also reads, so an unconditional `setStep` would re-trigger itself. */
  $effect(() => {
    if (stepId == null) return;
    const api = tour();
    if (!api.isValidStep(stepId)) return;
    if (api.open) {
      if (api.step?.id !== stepId) api.setStep(stepId);
    } else {
      api.start(stepId);
    }
  });
</script>

<ArkTour.Root {tour}>
  <Portal>
    <ArkTour.Backdrop class="tour__backdrop" />
    <ArkTour.Spotlight class="tour__spotlight" />
    <!--
      The positioner class must stay a plain string literal — the
      overlay-stacking test scans for it.
    -->
    <ArkTour.Positioner class="tour__positioner">
      <ArkTour.Content class={clsx(tourStyles({ size, variant }), className)}>
        <ArkTour.Arrow class="tour__arrow">
          <ArkTour.ArrowTip class="tour__arrow-tip" />
        </ArkTour.Arrow>

        <div class="tour__header">
          <ArkTour.Title class="tour__title text-strong-body-large" />
          <ArkTour.CloseTrigger class="tour__close" aria-label="End tour">
            <Icon name="close" size={CLOSE_ICON_SIZE} />
          </ArkTour.CloseTrigger>
        </div>

        <ArkTour.Description class="tour__description text-default-body-medium" />

        <div class="tour__footer">
          {#if showProgress}
            <ArkTour.ProgressText class="tour__progress" />
          {/if}
          <!--
            `Actions` is a snippet over the *current step's* action list, not an
            element — it takes no class, so the row it fills is a plain div here.
          -->
          <div class="tour__actions">
            <ArkTour.Actions>
              {#snippet children(actions)}
                {#each actions() as action (action.label)}
                  <ArkTour.ActionTrigger {action}>
                    <!--
                      The button *is* the library Button, projected through Ark's
                      asChild so it inherits every interactive token instead of
                      restating them. `class` is pulled out and handed over
                      separately because Ark types the projected props in
                      Svelte's own shapes, where it is a `ClassValue` that may be
                      null while the Button takes a string.
                    -->
                    {#snippet asChild(props)}
                      {@const { class: arkClass, ...triggerProps } = props()}
                      <Button
                        intent={action.action === "next" ? "primary" : "secondary"}
                        {size}
                        type="button"
                        class={clsx(arkClass)}
                        {...triggerProps}
                      >
                        {action.label}
                      </Button>
                    {/snippet}
                  </ArkTour.ActionTrigger>
                {/each}
              {/snippet}
            </ArkTour.Actions>
          </div>
        </div>
      </ArkTour.Content>
    </ArkTour.Positioner>
  </Portal>
</ArkTour.Root>
