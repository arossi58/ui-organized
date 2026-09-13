import type { ComponentType } from "react";
import { QRCode as RQRCode } from "@ui-organized/react";
import QRCodeFixture from "../fixtures/QRCodeFixture.svelte";
import VueQRCodeFixture from "../fixtures/vue/QRCodeFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const value = "https://ui-organized.dev";

/**
 * What this cannot see.
 *
 * The code itself is a `d` on one `<path>`, and `d` is not a contract
 * attribute — neither are the `viewBox` the frame carries nor the
 * `--qrcode-*` custom properties the root publishes. So every case below pins
 * the *scaffolding* around the code: the parts, their classes, the label, the
 * download control. That the three libraries encode the same string into the
 * same modules is asserted where it can actually be asserted, in each package's
 * own unit test (`QRCode.test.ts`), against the encoder `@zag-js/qr-code`
 * bundles rather than one written here.
 */
const spec: ParitySpec = {
  component: "QRCode",
  /**
   * `overlay` arrives as a boolean rather than as content.
   *
   * React takes a node, Svelte a snippet and Vue a slot, and none of the three
   * can be written into a props object all four sides share. The flag is the
   * portable half; each fixture turns it into its own framework's equivalent of
   * the same span.
   */
  react: ({ overlay, ...p }) => (
    <RQRCode
      {...(p as any)}
      overlay={overlay ? <span className="qr-overlay-probe">logo</span> : undefined}
    />
  ),
  svelte: QRCodeFixture as unknown as ComponentType<any>,
  vue: VueQRCodeFixture as unknown as ComponentType<any>,
  stylesheets: ["QRCode/QRCode.css"],
  allow: [
    {
      attribute: "id",
      reason:
        "zag 1.43.3 — the machine @ark-ui/svelte and @ark-ui/vue bundle — gives " +
        "the overlay part an id, so getDataUrl can find it and composite the " +
        "logo into the exported PNG; zag 1.41.2, the one @ark-ui/react bundles, " +
        "does not. Note which way round that is: the wrappers trail and the " +
        "machine leads, so React gains the id rather than the other two losing " +
        "it. QRCode.css selects on classes alone, so nothing renders " +
        "differently. What this also blinds is the id on the root and the " +
        "frame, and that costs less here than it would elsewhere: nothing in a " +
        "QR code points at anything else — aria-label is the whole of its ARIA " +
        "— so there is no reference for a wrong id to dangle from, and an " +
        "extra or missing element still shows up as an extra or missing entry " +
        "in the contract. Remove this once Ark React ships the newer machine — " +
        "the assertion below fails the moment QRCode.css starts selecting on id.",
    },
  ],
  cases: [
    { name: "default", props: { value } },
    { name: "with label", props: { value, label: "Scan to open" } },
    // A different module size rewrites the pattern and the viewBox, and leaves
    // every part and class alone. That second half is what is checked here.
    { name: "pixel size", props: { value, pixelSize: 4 } },
    ...(["L", "M", "Q", "H"] as const).map((ecc) => ({
      name: `error correction/${ecc}`,
      props: { value, errorCorrection: ecc },
    })),
    // An overlay is only safe at high error correction, so it is paired with it
    // here the way the prop's own documentation says to.
    { name: "overlay", props: { value, overlay: true, errorCorrection: "H" } },
    { name: "download", props: { value, showDownload: true } },
    { name: "download label", props: { value, showDownload: true, downloadLabel: "Save PNG" } },
    { name: "download file name", props: { value, showDownload: true, downloadFileName: "ticket" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { value, size } })),
    // The download button takes the code's size, so the two variants are worth
    // pinning together with it rather than on the bare code alone.
    ...SIZES.map((size) => ({
      name: `size/${size} with download`,
      props: { value, size, showDownload: true },
    })),
    ...(["default", "framed"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { value, variant },
    })),
    { name: "extra class", props: { value, className: "custom" } },
  ],
};

export default spec;
