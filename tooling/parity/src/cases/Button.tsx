import type { ComponentType } from "react";
import { Button as RButton } from "@ui-organized/react";
import ButtonFixture from "../fixtures/ButtonFixture.svelte";
import VueButtonFixture from "../fixtures/vue/ButtonFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Button",
  // `iconOnly` branches outside the component — see ButtonFixture.svelte.
  react: ({ iconOnly, ...p }) =>
    iconOnly ? <RButton {...p} /> : <RButton {...p}>Label</RButton>,
  svelte: ButtonFixture as unknown as ComponentType<any>,
  vue: VueButtonFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    ...(["primary", "secondary", "tertiary", "ghost", "destructive", "destructive-ghost"] as const).flatMap(
      (intent) => SIZES.map((size) => ({ name: `${intent}/${size}`, props: { intent, size } })),
    ),
    { name: "disabled", props: { disabled: true } },
    { name: "submit", props: { type: "submit" } },
    { name: "custom class", props: { className: "mine" } },
    { name: "aria-label", props: { "aria-label": "Save" } },
  ],
};

export default spec;
