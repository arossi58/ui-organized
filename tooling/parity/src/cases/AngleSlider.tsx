import type { ComponentType } from "react";
import { AngleSlider as RAngleSlider } from "@ui-organized/react";
import AngleSliderFixture from "../fixtures/AngleSliderFixture.svelte";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "AngleSlider",
  react: (p) => <RAngleSlider {...p} />,
  svelte: AngleSliderFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Angle" } },
    { name: "helper text", props: { label: "Angle", helperText: "Degrees" } },
    { name: "error message", props: { label: "Angle", error: "Out of range" } },
    { name: "invalid without message", props: { label: "Angle", error: true } },
    { name: "helper hidden by error", props: { label: "A", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Angle" } })),
    // The header exists only when there is something to put in it, and the
    // readout is typeset as a degree rather than as Ark's CSS angle.
    { name: "show value", props: { showValue: true } },
    { name: "show value with label", props: { showValue: true, label: "Angle" } },
    { name: "show value at angle", props: { showValue: true, defaultValue: 135 } },
    { name: "default value", props: { defaultValue: 90 } },
    { name: "controlled value", props: { value: 45 } },
    { name: "step", props: { step: 15 } },
    // Markers are positioned from an inline custom property, so what is pinned
    // here is the element and its part attributes rather than the geometry.
    { name: "markers", props: { markers: [0, 90, 180, 270] } },
    { name: "single marker", props: { markers: [180] } },
    { name: "empty markers", props: { markers: [] } },
    { name: "disabled", props: { label: "Angle", disabled: true } },
    { name: "read only", props: { label: "Angle", readOnly: true } },
    { name: "named", props: { name: "angle", label: "Angle" } },
  ],
};

export default spec;
