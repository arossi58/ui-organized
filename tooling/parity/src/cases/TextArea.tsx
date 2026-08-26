import type { ComponentType } from "react";
import { TextArea as RTextArea } from "@ui-organized/react";
import TextAreaFixture from "../fixtures/TextAreaFixture.svelte";
import VueTextAreaFixture from "../fixtures/vue/TextAreaFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "TextArea",
  react: (p) => <RTextArea {...p} />,
  svelte: TextAreaFixture as unknown as ComponentType<any>,
  vue: VueTextAreaFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Bio" } },
    { name: "required", props: { label: "Bio", required: true } },
    { name: "helper text", props: { label: "Bio", helperText: "Characters 0/500" } },
    { name: "error message", props: { label: "Bio", error: "Too long" } },
    ...(["none", "vertical", "horizontal", "both"] as const).map((resize) => ({
      name: `resize/${resize}`,
      props: { resize },
    })),
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size } })),
    { name: "rows", props: { rows: 6 } },
  ],
};

export default spec;
