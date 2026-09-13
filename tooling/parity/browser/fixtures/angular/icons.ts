import { registerIconSet, type IconMarkup, type IconSet } from "@ui-organized/angular";
import { makeStubIconSet } from "../../../src/fixtures/stubIconSet.js";

/**
 * The Angular binding of the fake icon library, registered once for the whole
 * suite so `Icon` resolves without a provider as well as with one.
 *
 * An Angular icon is markup rather than a component, so the stub is a string and
 * the `{ size, strokeWidth }` mapping the other three do inside their stub
 * component moves into `svgProps` — which is where a real Angular adapter puts
 * it too. The rendered attributes are the same, and they are what the cases
 * assert.
 */
export const ANGULAR_STUB_SET: IconSet = makeStubIconSet<IconMarkup>(
  `<svg data-cut="outline"></svg>`,
  `<svg data-cut="solid"></svg>`,
  (size, stroke) => ({
    "data-size": size,
    ...(stroke !== undefined ? { "data-stroke": stroke } : {}),
  }),
);

registerIconSet(ANGULAR_STUB_SET);
