import type { ComponentType } from "react";
import { Steps as RSteps } from "@ui-organized/react";
import StepsFixture from "../fixtures/StepsFixture.svelte";
import VueStepsFixture from "../fixtures/vue/StepsFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

/**
 * Step content is plain strings throughout — see the note in Splitter.tsx for
 * why the one value all three libraries accept unchanged is the one the cases
 * state.
 */
const spec: ParitySpec = {
  component: "Steps",
  react: (p) => <RSteps {...(p as any)} />,
  svelte: StepsFixture as unknown as ComponentType<any>,
  vue: VueStepsFixture as unknown as ComponentType<any>,
  cases: (() => {
    const steps = [
      { title: "One", content: "first" },
      { title: "Two", description: "second step", content: "second" },
      { title: "Three", content: "third" },
    ];
    return [
      { name: "default", props: { steps } },
      // Every step past the first is `data-complete`, the one before it
      // `data-current`, and both are attributes the stylesheet selects on.
      { name: "current step", props: { steps, defaultStep: 1 } },
      { name: "all complete", props: { steps, defaultStep: 3 } },
      { name: "controlled step", props: { steps, step: 2 } },
      { name: "linear", props: { steps, linear: true } },
      { name: "no descriptions", props: { steps: [{ title: "One" }, { title: "Two" }] } },
      { name: "single step", props: { steps: [{ title: "Only", content: "just this" }] } },
      // The panels, the completed panel and the two actions all disappear
      // together — the list is the whole component in this mode.
      { name: "no content", props: { steps, showContent: false } },
      { name: "completed content", props: { steps, completedContent: "All done" } },
      ...(["horizontal", "vertical"] as const).map((orientation) => ({
        name: `orientation/${orientation}`,
        props: { steps, orientation },
      })),
      ...(["numbered", "dotted"] as const).map((variant) => ({
        name: `variant/${variant}`,
        props: { steps, variant },
      })),
      // The size reaches two places at once: the root recipe and the intent of
      // the Back/Next buttons, which are the library Button projected through
      // Ark's asChild.
      ...SIZES.map((size) => ({ name: `size/${size}`, props: { steps, size } })),
      { name: "custom class", props: { steps, className: "mine" } },
    ];
  })(),
  stylesheets: ["Steps/Steps.css"],
  allow: [
    {
      attribute: "type",
      reason:
        "zag 1.43 — the machine @ark-ui/svelte and @ark-ui/vue bundle — adds " +
        "type=\"button\" to the step trigger; zag 1.41, the one @ark-ui/react " +
        "bundles, does not. Note which way round that is: the wrappers trail " +
        "and the machine leads, so React gains the attribute rather than the " +
        "other two losing it. Steps.css selects on neither [type] nor the " +
        "element it sits on, so nothing renders differently, and the Back and " +
        "Next buttons this also blinds are the library Button, whose own type " +
        "is gated by cases/Button.tsx. Remove this once Ark React ships the " +
        "newer machine — the assertion below fails the moment Steps.css " +
        "starts selecting on type.",
    },
  ],
};

export default spec;
