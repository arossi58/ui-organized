<!--
  A guided walkthrough: a spotlight over the page and a card beside whatever it
  is pointing at. Everything it renders is teleported, so the tour has no DOM in
  place until it opens.
-->
<script setup lang="ts">
import { computed, onMounted, useAttrs, watch } from "vue";
import { Tour as ArkTour, useTour } from "@ark-ui/vue";
import { clsx } from "clsx";
import { tourStyles } from "@ui-organized/core";
import Button from "../Button/Button.vue";
import Icon from "../Icon/Icon.vue";
import type { TourProps, TourStepAction } from "./Tour.types.js";
import "@ui-organized/core/components/Tour/Tour.css";

const CLOSE_ICON_SIZE = 16;

const DEFAULT_ACTIONS: TourStepAction[] = [
  { label: "Back", action: "prev" },
  { label: "Next", action: "next" },
];

// `showProgress` defaults to true, which Vue's Boolean cast would get wrong — an
// absent prop becomes `false`, not `undefined`. See ../../props.ts.
const props = withDefaults(defineProps<TourProps>(), {
  showProgress: true,
  preventInteraction: undefined,
  closeOnInteractOutside: undefined,
  closeOnEscape: undefined,
});
const emit = defineEmits<{ stepChange: [stepId: string | null] }>();

/**
 * The caller's `class` has to be routed by hand, and Tour is the case where
 * forgetting is invisible.
 *
 * `Tour.Root` renders no element, so there is nothing for a fallthrough
 * attribute to land on — Vue drops it silently rather than warning. React and
 * Svelte both do `clsx(tourStyles(…), className)` on the card, and this used to
 * pass `tourStyles(…)` alone, so a consumer's class reached nothing in Vue and
 * nowhere said so.
 *
 * The parity gate cannot catch it either: the card is teleported, so the case
 * that would test it compares two absences and passes. It is pinned by
 * `Tour.test.ts` instead. `ColorPicker.vue` carries the same pair for the same
 * reason.
 */
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();

const contentClass = computed(() =>
  clsx(tourStyles({ size: props.size, variant: props.variant }), attrs.class as string),
);

/* Steps carry render data our card reads back; the machine only needs the shape
   it defines. Defaults are filled in here so a caller who writes only
   `{ id, title, description }` still gets a working Back/Next row. */
const machineSteps = computed(() =>
  props.steps.map((step) => ({ ...step, actions: step.actions ?? DEFAULT_ACTIONS })),
);

/* Tour is the one Ark component whose Root takes no props: it takes the return
   value of `useTour`. Every other component (`ColorPicker.Root`,
   `TreeView.Root`, …) declares its machine props on the Root itself. */
const tour = useTour(
  computed(() => ({
    steps: machineSteps.value,
    stepId: props.stepId,
    onStepChange: (details: { stepId: string | null }) => emit("stepChange", details.stepId),
    spotlightRadius: props.spotlightRadius,
    preventInteraction: props.preventInteraction,
    closeOnInteractOutside: props.closeOnInteractOutside,
    closeOnEscape: props.closeOnEscape,
  })),
);

/* The machine's `stepId` is a bindable seeded from the prop *once*, not a live
   controlled value — changing the prop after mount does not move the machine.
   Opening and navigating therefore have to be driven imperatively so the public
   API can stay a declarative prop like every other component here.

   Closing is the asymmetry: the api exposes `start` and `setStep` but no
   programmatic close, so `stepId: null` cannot force one. The tour closes
   through its own dismiss and close affordances and reports it as `stepChange`
   with `null` — keep that wired to your state and the two stay in sync.

   `onMounted` plus a plain `watch` rather than `watchEffect`: both are skipped
   during SSR, which is what keeps this from measuring a target element that does
   not exist on the server. */
function syncStep() {
  const stepId = props.stepId;
  if (stepId == null) return;
  const api = tour.value;
  if (!api.isValidStep(stepId)) return;
  if (api.open) {
    if (api.step?.id !== stepId) api.setStep(stepId);
  } else {
    api.start(stepId);
  }
}
onMounted(syncStep);
watch(() => props.stepId, syncStep);
</script>

<template>
  <ArkTour.Root :tour="tour">
    <!--
      Vue has no Ark Portal component — Teleport is built into the framework,
      and Ark Vue relies on it rather than shipping its own.
    -->
    <Teleport to="body">
      <ArkTour.Backdrop class="tour__backdrop" />
      <ArkTour.Spotlight class="tour__spotlight" />
      <!--
        The positioner class must stay a plain string literal — the
        overlay-stacking test scans for it.
      -->
      <ArkTour.Positioner class="tour__positioner">
        <ArkTour.Content :class="contentClass">
          <ArkTour.Arrow class="tour__arrow">
            <ArkTour.ArrowTip class="tour__arrow-tip" />
          </ArkTour.Arrow>

          <div class="tour__header">
            <ArkTour.Title class="tour__title text-strong-body-large" />
            <ArkTour.CloseTrigger class="tour__close" aria-label="End tour">
              <Icon name="close" :size="CLOSE_ICON_SIZE" />
            </ArkTour.CloseTrigger>
          </div>

          <ArkTour.Description class="tour__description text-default-body-medium" />

          <div class="tour__footer">
            <ArkTour.ProgressText v-if="showProgress" class="tour__progress" />
            <!--
              `Actions` is a slot over the *current step's* action list, not an
              element — it takes no class, so the row it fills is a plain div here.
            -->
            <div class="tour__actions">
              <ArkTour.Actions v-slot="actions">
                <ArkTour.ActionTrigger
                  v-for="action in actions"
                  :key="action.label"
                  :action="action"
                  as-child
                >
                  <!--
                    The button *is* the library Button, projected through Ark's
                    `as-child` so it inherits every interactive token instead of
                    restating them.
                  -->
                  <Button
                    :intent="action.action === 'next' ? 'primary' : 'secondary'"
                    :size="size"
                    type="button"
                  >
                    {{ action.label }}
                  </Button>
                </ArkTour.ActionTrigger>
              </ArkTour.Actions>
            </div>
          </div>
        </ArkTour.Content>
      </ArkTour.Positioner>
    </Teleport>
  </ArkTour.Root>
</template>
