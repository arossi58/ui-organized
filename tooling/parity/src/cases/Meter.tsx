import type { ComponentType } from "react";
import { Meter as RMeter } from "@ui-organized/react";
import VueMeterFixture from "../fixtures/vue/MeterFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

/**
 * Both libraries are handed the *same* props object, so a default belongs here
 * rather than in the `react` builder below. One applied on React's side only is
 * invisible to the other side, and the symptom is not "a default is missing" —
 * it is Vue rendering `aria-valuetext="NaN"` against React's 60.
 */
const withValue = (props: Record<string, unknown> = {}) => ({ value: 60, ...props });

const spec: ParitySpec = {
  component: "Meter",
  react: ({ value, ...p }) => <RMeter value={value} {...p} />,
  vue: VueMeterFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default", props: withValue() },
    { name: "with label", props: withValue({ label: "Disk usage" }) },
    { name: "with value", props: withValue({ showValue: true }) },
    { name: "with label and value", props: withValue({ label: "Disk usage", showValue: true }) },
    // The accessible name when there is no visible caption. Vue camelises a
    // declared prop name, so `"aria-label"` could not be declared under that
    // spelling — this is the case that proves the hyphenated one still lands.
    { name: "aria-label", props: withValue({ "aria-label": "Disk usage" }) },
    // A caption wins over the caller's name rather than both being emitted.
    {
      name: "label wins over aria-label",
      props: withValue({ label: "Disk", "aria-label": "Disk usage" }),
    },
    { name: "formatted", props: { showValue: true, format: { style: "percent" }, value: 0.42 } },
    { name: "custom range", props: { value: 7, min: 2, max: 12, showValue: true } },
    // Out of range in both directions: the fill clamps, the ARIA value does not.
    { name: "above max", props: { value: 140 } },
    { name: "below min", props: { value: -20 } },
    // A zero-width range would divide by zero.
    { name: "empty range", props: { value: 5, min: 5, max: 5 } },
    ...(["default", "success", "warning", "error"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: withValue({ variant }),
    })),
    ...SIZES.map((size) => ({ name: `size/${size}`, props: withValue({ size }) })),
  ],
};

export default spec;
