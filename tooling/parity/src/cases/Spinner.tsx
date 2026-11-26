import type { ComponentType } from "react";
import { Spinner as RSpinner } from "@ui-organized/react";
import SpinnerFixture from "../fixtures/SpinnerFixture.svelte";
import VueSpinnerFixture from "../fixtures/vue/SpinnerFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Spinner",
  react: (p) => <RSpinner {...p} />,
  svelte: SpinnerFixture as unknown as ComponentType<any>,
  vue: VueSpinnerFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    ...(["sm", "md", "lg", "xl"] as const).map((size) => ({ name: `size/${size}`, props: { size } })),
    { name: "label", props: { label: "Loading results" } },
    // Inside a busy Button: the button carries the state, the ring is decoration.
    { name: "decorative", props: { decorative: true } },
    { name: "custom class", props: { className: "mine" } },
  ],
};

export default spec;
