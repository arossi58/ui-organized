import type { ComponentType } from "react";
import { PinInput as RPinInput } from "@ui-organized/react";
import PinInputFixture from "../fixtures/PinInputFixture.svelte";
import VuePinInputFixture from "../fixtures/vue/PinInputFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "PinInput",
  react: (p) => <RPinInput {...p} />,
  svelte: PinInputFixture as unknown as ComponentType<any>,
  vue: VuePinInputFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Code" } },
    { name: "required", props: { label: "Code", required: true } },
    { name: "helper text", props: { label: "Code", helperText: "Six digits" } },
    { name: "error message", props: { label: "Code", error: "Wrong code" } },
    { name: "invalid without message", props: { label: "Code", error: true } },
    { name: "helper hidden by error", props: { label: "C", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Code" } })),
    { name: "variant/underline", props: { variant: "underline" } },
    // The cell count is what `length` drives: one Input part per cell, each
    // carrying its own index into the machine.
    { name: "length 6", props: { length: 6 } },
    { name: "length 1", props: { length: 1 } },
    { name: "mask", props: { mask: true } },
    { name: "otp", props: { otp: true } },
    { name: "placeholder", props: { placeholder: "-" } },
    { name: "blur on complete", props: { blurOnComplete: true } },
    { name: "type/alphanumeric", props: { type: "alphanumeric" } },
    { name: "type/alphabetic", props: { type: "alphabetic" } },
    { name: "disabled", props: { label: "Code", disabled: true } },
    { name: "read only", props: { label: "Code", readOnly: true } },
    // The string facade is split one character per cell at the boundary; a
    // short string leaves the remaining cells empty rather than shrinking.
    { name: "default value", props: { defaultValue: "1234" } },
    { name: "controlled value", props: { value: "12" } },
    { name: "value longer than length", props: { length: 3, value: "12345" } },
    { name: "named", props: { name: "otp", label: "Code" } },
  ],
};

export default spec;
