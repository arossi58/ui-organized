import type { ComponentType } from "react";
import { SignaturePad as RSignaturePad } from "@ui-organized/react";
import SignaturePadFixture from "../fixtures/SignaturePadFixture.svelte";
import VueSignaturePadFixture from "../fixtures/vue/SignaturePadFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

/**
 * Two strokes, so the segment set is a set rather than a single element.
 *
 * `defaultPaths` is the only way to reach the drawn state without a pointer:
 * zag seeds `paths` from it in the machine's context, so it is populated on the
 * *first* render and a static one can see it. Everything about actually drawing
 * — the pressure envelope, the in-progress path, the canvas raster `getDataUrl`
 * produces — happens only under a real pointer and is not asserted here or
 * anywhere else yet.
 */
const PATHS = ["M 10 40 q 20 -30 40 0", "M 60 20 l 20 20"];

const spec: ParitySpec = {
  component: "SignaturePad",
  react: (p) => <RSignaturePad {...(p as any)} />,
  svelte: SignaturePadFixture as unknown as ComponentType<any>,
  vue: VueSignaturePadFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with label", props: { label: "Signature" } },
    { name: "required", props: { label: "Signature", required: true } },
    { name: "helper text", props: { label: "Signature", helperText: "Sign above the line" } },
    { name: "error message", props: { label: "Signature", error: "Required" } },
    { name: "invalid without message", props: { label: "Signature", error: true } },
    { name: "helper hidden by error", props: { label: "A", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Signature" } })),
    ...(["default", "bordered"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { variant },
    })),
    { name: "no guide", props: { showGuide: false } },
    { name: "no clear", props: { showClear: false } },
    { name: "clear label", props: { clearLabel: "Start over" } },
    // Ink width is canvas geometry handed to the machine, so it changes nothing
    // a static render can see. The case exists to pin that it changes nothing
    // *else* either — a library that forwarded it as an attribute would fail.
    { name: "stroke width", props: { strokeWidth: 6 } },
    { name: "disabled", props: { label: "Signature", disabled: true } },
    { name: "read only", props: { label: "Signature", readOnly: true } },
    { name: "named", props: { name: "signature", label: "Signature" } },
    // The drawn state. Both branches matter: the clear trigger is `hidden` while
    // there is nothing to clear and visible once there is, and each stroke gets
    // its own segment element.
    { name: "default paths", props: { defaultPaths: PATHS } },
    { name: "default paths with label", props: { defaultPaths: PATHS, label: "Signature" } },
    { name: "controlled paths", props: { paths: PATHS } },
    { name: "controlled empty", props: { paths: [] } },
    { name: "extra class", props: { className: "custom" } },
  ],
};

export default spec;
