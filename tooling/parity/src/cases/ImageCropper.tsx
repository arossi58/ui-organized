import type { ComponentType } from "react";
import { ImageCropper as RImageCropper } from "@ui-organized/react";
import ImageCropperFixture from "../fixtures/ImageCropperFixture.svelte";
import VueImageCropperFixture from "../fixtures/vue/ImageCropperFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const src = "/photo.png";

/**
 * What this cannot see.
 *
 * The crop box's position and size are measured from the loaded image and
 * written as inline custom properties (`--crop-x`, `--image-zoom`), and `style`
 * is not part of the contract. Nothing here has a viewport with a width, so on
 * a static render the rect is zero and `data-measured` is absent in every
 * library — which is a real agreement, just a shallow one.
 *
 * What *is* worth pinning, and what these cases exist for, is the half of the
 * machine that is prop-driven rather than measured: `data-shape` on the root and
 * the selection, `data-fixed`, the `data-disabled` that `fixedCropArea` puts on
 * three separate parts, and the selection's `aria-label` and `aria-valuetext`,
 * which are built from the crop shape. That half caught a real bug — see the
 * note in the Vue component about Ark Vue 5.39 dropping every root prop.
 *
 * Moving or resizing the box is pointer work and belongs to the browser
 * harness, which is out of scope for this wave.
 */
const spec: ParitySpec = {
  component: "ImageCropper",
  react: (p) => <RImageCropper {...(p as any)} />,
  svelte: ImageCropperFixture as unknown as ComponentType<any>,
  vue: VueImageCropperFixture as unknown as ComponentType<any>,
  stylesheets: ["ImageCropper/ImageCropper.css"],
  allow: [
    {
      attribute: "aria-disabled",
      reason:
        "zag 1.43.3 — the machine @ark-ui/svelte and @ark-ui/vue bundle — drops " +
        "aria-disabled from the selection under fixedCropArea and gives it a " +
        "tabIndex unconditionally; zag 1.41.2, the one @ark-ui/react bundles, " +
        "marks it disabled and takes it out of the tab order. Note which way " +
        "round that is: the wrappers trail and the machine leads, so React " +
        "loses the attribute rather than the other two failing to emit it — and " +
        "the change is deliberate, because a fixed crop area is still pannable " +
        "by keyboard and so is not disabled. ImageCropper.css selects on " +
        "classes and on [data-axis], never on [aria-disabled], and " +
        "[data-disabled] — which every library still emits on the selection, " +
        "the viewport and all eight handles — is what carries the state here. " +
        "Remove this once Ark React ships the newer machine, and expect the " +
        "assertion below to fail the moment ImageCropper.css starts selecting " +
        "on aria-disabled.",
    },
  ],
  cases: [
    { name: "default", props: { src } },
    { name: "with alt", props: { src, alt: "A photograph" } },
    { name: "with label", props: { src, label: "Crop your photo" } },
    { name: "helper text", props: { src, helperText: "Drag to reposition" } },
    { name: "label and helper", props: { src, label: "Avatar", helperText: "Square crop" } },
    ...(["rectangle", "circle"] as const).map((cropShape) => ({
      name: `crop shape/${cropShape}`,
      props: { src, cropShape },
    })),
    { name: "aspect ratio", props: { src, aspectRatio: 16 / 9 } },
    { name: "square aspect ratio", props: { src, aspectRatio: 1 } },
    { name: "initial crop", props: { src, initialCrop: { x: 10, y: 10, width: 80, height: 80 } } },
    { name: "no grid", props: { src, showGrid: false } },
    // `fixedCropArea` disables the selection and every handle rather than
    // removing them, so the box keeps its shape. Three parts change at once.
    { name: "fixed crop area", props: { src, fixedCropArea: true } },
    { name: "fixed circle", props: { src, fixedCropArea: true, cropShape: "circle" } },
    { name: "zoom", props: { src, zoom: 2 } },
    { name: "default zoom", props: { src, defaultZoom: 1.5 } },
    { name: "zoom bounds", props: { src, minZoom: 0.5, maxZoom: 6 } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { src, size } })),
    { name: "extra class", props: { src, className: "custom" } },
  ],
};

export default spec;
