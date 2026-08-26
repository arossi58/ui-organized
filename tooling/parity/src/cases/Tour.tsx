import type { ComponentType } from "react";
import { Tour as RTour } from "@ui-organized/react";
import TourFixture from "../fixtures/TourFixture.svelte";
import VueTourFixture from "../fixtures/vue/TourFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

/**
 * Tour has no unportalled half at all, and what is left to compare is worth
 * stating precisely rather than dressing up.
 *
 * `Tour.Root` renders no element — it only carries the machine — and everything
 * else (backdrop, spotlight, positioner, card, arrow, title, description,
 * progress text, action buttons) sits inside the portal. Ark React renders a
 * portal inline under SSR, Ark Svelte renders nothing, and Vue's Teleport moves
 * its content into a bucket the gate never sees, so the card itself cannot be
 * compared statically at all. `size`, `variant`, `showProgress`, the step title
 * and description, the Back/Next row — none of it is pinned by anything below.
 * All of it belongs to the Playwright harness, which starts a tour in a real
 * browser.
 *
 * Two things these cases *do* pin, and they are the reason the spec exists
 * rather than being left out:
 *
 * 1. **Nothing escapes the portal.** Excluding the tour parts leaves React's
 *    contract empty, so any element a port rendered outside its portal — a
 *    wrapper div added to satisfy Vue's single-root rule, say — shows up as a
 *    contract the other two do not have.
 * 2. **The machine is built and the step effect stays off the server.** Tour is
 *    the one component whose Root takes the result of `useTour`, and each
 *    library assembles that differently — `useMemo` + `useEffect`, `$derived` +
 *    `$effect`, `computed` + `onMounted`/`watch`. The step-opening effect
 *    measures a target element, so an SSR-unsafe spelling of it (a Vue
 *    `watchEffect` rather than `onMounted`, which is exactly the trap Tour.vue's
 *    comment names) would throw or paint here. That is what the cases carrying a
 *    real `stepId` are for.
 *
 * Deliberately absent: a `custom class` case. `class` lands on the portalled
 * content, so it would pass on both sides by comparing two absences — and it
 * would be passing over a real divergence, because Vue's Tour takes no class at
 * all. It has no `inheritAttrs: false` / `useAttrs` pair like ColorPicker.vue,
 * and `Tour.Root` renders no element for an attribute to fall through to, so a
 * class handed to the Vue Tour is dropped while React and Svelte put it on the
 * card. A green case here would say the opposite; the browser harness is where
 * that one has to be caught.
 */
const steps = [
  { id: "one", title: "One", description: "First step" },
  { id: "two", title: "Two", description: "Second step" },
  { id: "three", title: "Three", description: "Third step" },
];

const spec: ParitySpec = {
  component: "Tour",
  react: (p) => <RTour {...(p as any)} />,
  svelte: TourFixture as unknown as ComponentType<any>,
  vue: VueTourFixture as unknown as ComponentType<any>,
  exclude: '[data-scope="tour"]',
  cases: [
    { name: "closed", props: { steps, stepId: null } },
    // A real stepId is what drives each library's imperative open effect. None
    // of the three may run it on the server; all three must still render.
    { name: "open at first step", props: { steps, stepId: "one" } },
    { name: "open at middle step", props: { steps, stepId: "two" } },
    { name: "open at last step", props: { steps, stepId: "three" } },
    // Guarded by `isValidStep` in all three, and the guard is hand-written in
    // each — an unguarded `start()` here is a throw rather than a no-op.
    { name: "unknown step id", props: { steps, stepId: "nope" } },
    { name: "single step", props: { steps: steps.slice(0, 1), stepId: "one" } },
    // An anchored step: the machine asks for the target element, and there is
    // no document to answer with. Returning null is what a server render of a
    // real tour does, so it is the case worth having rather than avoiding.
    {
      name: "anchored step",
      props: {
        steps: [{ ...steps[0], target: () => null, placement: "bottom" }, steps[1]],
        stepId: null,
      },
    },
    {
      name: "dialog step",
      props: { steps: [{ ...steps[0], type: "dialog" }, steps[1]], stepId: "one" },
    },
    // Step actions are filled in by each library when a step omits them, so
    // both the supplied and the defaulted shape are worth rendering.
    {
      name: "explicit actions",
      props: {
        steps: [
          { ...steps[0], actions: [{ label: "Skip", action: "skip" }] },
          { ...steps[1], actions: [{ label: "Done", action: "dismiss" }] },
        ],
        stepId: "one",
      },
    },
    { name: "no backdrop", props: { steps: [{ ...steps[0], backdrop: false }], stepId: "one" } },
    { name: "no progress", props: { steps, stepId: "one", showProgress: false } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { steps, stepId: "one", size } })),
    ...(["default", "compact"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { steps, stepId: "one", variant },
    })),
    { name: "spotlight radius", props: { steps, stepId: "one", spotlightRadius: 16 } },
    { name: "prevent interaction", props: { steps, stepId: "one", preventInteraction: true } },
    {
      name: "no dismissal",
      props: { steps, stepId: "one", closeOnEscape: false, closeOnInteractOutside: false },
    },
  ],
  stylesheets: ["Tour/Tour.css"],
};

export default spec;
