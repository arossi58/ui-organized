import type { ComponentType } from "react";
import { Progress as RProgress } from "@ui-organized/react";
import ProgressFixture from "../fixtures/ProgressFixture.svelte";
import VueProgressFixture from "../fixtures/vue/ProgressFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Progress",
  react: (p) => <RProgress {...(p as any)} />,
  svelte: ProgressFixture as unknown as ComponentType<any>,
  vue: VueProgressFixture as unknown as ComponentType<any>,
  cases: [
    { name: "indeterminate (default)" },
    { name: "at 40", props: { value: 40 } },
    { name: "custom max", props: { value: 3, max: 5 } },
    { name: "with label", props: { value: 40, label: "Uploading" } },
    { name: "show value", props: { value: 40, showValue: true } },
    { name: "label and value", props: { value: 40, label: "Uploading", showValue: true } },
    // A ring puts the value inside itself rather than in the header.
    { name: "circular", props: { value: 40, shape: "circular" } },
    { name: "circular with value", props: { value: 40, shape: "circular", showValue: true } },
    ...(["default", "success", "warning", "error"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { value: 40, variant },
    })),
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { value: 40, size } })),
  ],
};

export default spec;
