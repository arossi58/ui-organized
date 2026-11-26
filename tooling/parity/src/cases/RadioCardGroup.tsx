import type { ComponentType } from "react";
import { RadioCardGroup as RRadioCardGroup } from "@ui-organized/react";
import RadioCardGroupFixture from "../fixtures/RadioCardGroupFixture.svelte";
import VueRadioCardGroupFixture from "../fixtures/vue/RadioCardGroupFixture.vue";
import type { ParitySpec } from "./spec.js";

const PLANS = [
  { value: "starter", label: "Starter", description: "For one person getting started." },
  { value: "team", label: "Team", description: "Shared workspaces and roles.", icon: "check" },
  { value: "custom", label: "Custom", disabled: true },
];

const spec: ParitySpec = {
  component: "RadioCardGroup",
  react: (p) => <RRadioCardGroup {...(p as any)} />,
  svelte: RadioCardGroupFixture as unknown as ComponentType<any>,
  vue: VueRadioCardGroupFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default", props: { options: PLANS, label: "Plan" } },
    { name: "no label, aria-label", props: { options: PLANS, "aria-label": "Plan" } },
    { name: "selected", props: { options: PLANS, label: "Plan", defaultValue: "team" } },
    { name: "two columns, small", props: { options: PLANS, label: "Plan", columns: 2, size: "sm" } },
    { name: "indicator start", props: { options: PLANS, label: "Plan", indicator: "start" } },
    { name: "group disabled", props: { options: PLANS, label: "Plan", disabled: true } },
    { name: "named", props: { options: PLANS, label: "Plan", name: "plan" } },
    // The message describes the radiogroup; the cards take the error border.
    { name: "error", props: { options: PLANS, label: "Plan", error: "Choose a plan" } },
    { name: "invalid without message", props: { options: PLANS, label: "Plan", error: true } },
  ],
};

export default spec;
