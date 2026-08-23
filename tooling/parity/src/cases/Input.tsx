import type { ComponentType } from "react";
import { Input as RInput } from "@ui-organized/react";
import InputFixture from "../fixtures/InputFixture.svelte";
import VueInputFixture from "../fixtures/vue/InputFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Input",
  react: (p) => <RInput {...p} />,
  svelte: InputFixture as unknown as ComponentType<any>,
  vue: VueInputFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Email" } },
    { name: "required", props: { label: "Email", required: true } },
    { name: "helper text", props: { label: "Email", helperText: "We never share it" } },
    // The error path replaces the helper text and drives [data-invalid]
    // through every part of the field.
    { name: "error message", props: { label: "Email", error: "Required" } },
    { name: "invalid without message", props: { label: "Email", error: true } },
    { name: "helper hidden by error", props: { label: "E", helperText: "H", error: "Bad" } },
    ...(["sm", "md", "lg"] as const).map((size) => ({ name: `size/${size}`, props: { size } })),
    { name: "disabled", props: { label: "Email", disabled: true } },
    { name: "placeholder", props: { placeholder: "you@example.com" } },
    { name: "type=email", props: { type: "email" } },
  ],
};

export default spec;
