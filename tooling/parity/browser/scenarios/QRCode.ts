import type { ParityAllowance } from "../../src/cases/spec.js";
import { type BrowserScenario } from "./scenario.js";

/**
 * The scaffolding around a QR code, which is all four libraries have in common
 * to compare.
 *
 * The code itself is a `d` on one `<path>`, and `d` is not a contract
 * attribute — neither is the frame's `viewBox` nor the `--qrcode-*` custom
 * properties the root publishes. So what is pinned below is the parts, their
 * classes, the accessible name and the download control. That the four
 * libraries encode the same string into the same modules is asserted where it
 * can be: each package's own unit test, and for Angular that is
 * `qr-encoder.spec.ts`, which holds a hand-written encoder to `uqr`'s output
 * module for module across 43 fixtures. Angular takes no dependency beyond the
 * CDK and so cannot bundle `uqr` the way the other three do through
 * `@zag-js/qr-code`; four libraries rendering four different *valid* codes for
 * one string would be a worse failure than an unstyled one, and a silent one.
 *
 * Nothing here is interactive. The one control a QR code has is the download
 * trigger, and pressing it rasterises the frame into a canvas and hands the
 * result to the browser — a side effect with no rendered state, which in a
 * headless page is a download the harness would have to catch rather than a DOM
 * change it could compare.
 */
const SIZES = ["sm", "md", "lg"] as const;
const value = "https://ui-organized.dev";

/**
 * zag 1.43.3 — the machine `@ark-ui/svelte` and `@ark-ui/vue` bundle — gives the
 * overlay part an id so `getDataUrl` can composite the logo into the exported
 * PNG; zag 1.41.2, the one `@ark-ui/react` bundles, does not. Note which way
 * round that is: the wrappers trail and the machine leads, so React *gains* the
 * id rather than the other two losing it. Angular reproduces React, because
 * React is what this gate compares against.
 *
 * One extra id renumbers every placeholder after it, so this is not a
 * per-attribute difference that could be narrowed to the overlay — it blinds
 * `id` for the whole scenario. That costs less here than almost anywhere else:
 * nothing in a QR code points at anything else (`aria-label` is the whole of
 * its ARIA), so there is no reference for a wrong id to dangle from, and an
 * extra or missing element still shows up as an extra or missing entry. Remove
 * this once Ark React ships the newer machine — the check below fails the
 * moment QRCode.css starts selecting on id.
 *
 * The same allowance `cases/QRCode.tsx` carries, for the same reason and with
 * the same expiry, and applied to the one scenario that renders an overlay
 * rather than to all of them.
 */
const OVERLAY_ID_SKEW: ParityAllowance = {
  attribute: "id",
  reason:
    "zag 1.43.3 gives the QR overlay an id and zag 1.41.2, which @ark-ui/react " +
    "bundles, does not. QRCode.css selects on classes alone, so nothing renders " +
    "differently, and one extra id renumbers every later placeholder — which is " +
    "why this is the whole attribute rather than one element's.",
};

const qr = (name: string, props: Record<string, unknown>, allow?: ParityAllowance[]): BrowserScenario => ({
  component: "QRCode",
  name,
  props: { value, ...props },
  steps: [],
  regions: ["#mount"],
  stylesheets: ["QRCode/QRCode.css"],
  ...(allow ? { allow } : {}),
});

const scenarios: BrowserScenario[] = [
  qr("default", {}),
  // The accessible name falls back to the encoded string, so a code with no
  // caption is still announced as something rather than as nothing.
  qr("with label", { label: "Scan to open" }),
  // A different module size rewrites the pattern and the viewBox and leaves
  // every part and class alone. That second half is what is checked here.
  qr("pixel size", { pixelSize: 4 }),
  ...(["L", "M", "Q", "H"] as const).map((ecc) => qr(`error correction/${ecc}`, { errorCorrection: ecc })),
  // An overlay is only safe at high error correction, so it is paired with it
  // here the way the prop's own documentation says to.
  qr("overlay", { overlay: true, errorCorrection: "H" }, [OVERLAY_ID_SKEW]),
  qr("download", { showDownload: true }),
  qr("download label", { showDownload: true, downloadLabel: "Save PNG" }),
  qr("download file name", { showDownload: true, downloadFileName: "ticket" }),
  ...SIZES.map((size) => qr(`size/${size}`, { size })),
  // The download button takes the code's size, so the two are worth pinning
  // together rather than on the bare code alone.
  ...SIZES.map((size) => qr(`size/${size} with download`, { size, showDownload: true })),
  ...(["default", "framed"] as const).map((variant) => qr(`variant/${variant}`, { variant })),
  qr("extra class", { className: "custom" }),
];

export default scenarios;
