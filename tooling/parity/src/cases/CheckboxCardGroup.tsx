import type { ComponentType } from "react";
import { CheckboxCardGroup as RCheckboxCardGroup } from "@ui-organized/react";
import CheckboxCardGroupFixture from "../fixtures/CheckboxCardGroupFixture.svelte";
import VueCheckboxCardGroupFixture from "../fixtures/vue/CheckboxCardGroupFixture.vue";
import type { ParitySpec } from "./spec.js";

const EXTRAS = [
  { value: "backups", label: "Backups", description: "Nightly, kept for thirty days." },
  { value: "support", label: "Support", description: "A reply within a working day.", icon: "check" },
  { value: "audit", label: "Audit log", disabled: true },
];

const spec: ParitySpec = {
  component: "CheckboxCardGroup",
  react: (p) => <RCheckboxCardGroup {...(p as any)} />,
  svelte: CheckboxCardGroupFixture as unknown as ComponentType<any>,
  vue: VueCheckboxCardGroupFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default", props: { options: EXTRAS, label: "Extras" } },
    { name: "no label, aria-label", props: { options: EXTRAS, "aria-label": "Extras" } },
    { name: "selected", props: { options: EXTRAS, label: "Extras", defaultValue: ["backups", "support"] } },
    { name: "two columns, small", props: { options: EXTRAS, label: "Extras", columns: 2, size: "sm" } },
    { name: "indicator start", props: { options: EXTRAS, label: "Extras", indicator: "start" } },
    { name: "group disabled", props: { options: EXTRAS, label: "Extras", disabled: true } },
    { name: "named", props: { options: EXTRAS, label: "Extras", name: "extras" } },
    // The message describes the group, and every card is marked invalid.
    { name: "error", props: { options: EXTRAS, label: "Extras", error: "Choose at least one" } },
    { name: "invalid without message", props: { options: EXTRAS, label: "Extras", error: true } },
  ],
};

export default spec;
