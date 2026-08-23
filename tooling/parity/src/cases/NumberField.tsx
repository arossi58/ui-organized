import type { ComponentType } from "react";
import { NumberField as RNumberField } from "@ui-organized/react";
import NumberFieldFixture from "../fixtures/NumberFieldFixture.svelte";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "NumberField",
  react: (p) => <RNumberField {...p} />,
  svelte: NumberFieldFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Quantity" } },
    { name: "required", props: { label: "Quantity", required: true } },
    { name: "helper text", props: { label: "Quantity", helperText: "How many" } },
    { name: "error message", props: { label: "Quantity", error: "Too low" } },
    { name: "invalid without message", props: { label: "Quantity", error: true } },
    { name: "helper hidden by error", props: { label: "Q", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Q" } })),
    { name: "disabled", props: { label: "Quantity", disabled: true } },
    { name: "read only", props: { label: "Quantity", readOnly: true } },
    { name: "placeholder", props: { placeholder: "0" } },
    // The steppers are what min/max drive: at a bound one of them goes
    // [data-disabled] while the other stays live.
    { name: "default value", props: { defaultValue: 3 } },
    { name: "at min", props: { defaultValue: 0, min: 0, max: 10 } },
    { name: "at max", props: { defaultValue: 10, min: 0, max: 10 } },
    { name: "step", props: { defaultValue: 2, step: 0.5 } },
    // A controlled empty value: `null` on the facade, "" at the zag boundary.
    { name: "controlled null", props: { value: null } },
    { name: "controlled value", props: { value: 7 } },
    { name: "formatted", props: { defaultValue: 12, format: { style: "currency", currency: "USD" } } },
    { name: "named", props: { name: "qty", label: "Quantity" } },
    { name: "explicit id", props: { id: "qty-field", label: "Quantity" } },
  ],
};

export default spec;
