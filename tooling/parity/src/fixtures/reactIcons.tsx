/**
 * The React binding of the fake icon library, registered once for the whole
 * suite so `Icon` resolves without a provider as well as with one.
 *
 * The counterpart of `svelteIcons.ts` and `vue/vueIcons.ts`. See
 * `stubIconSet.ts` for what the set is standing in for and why a real icon
 * library cannot be used.
 */

import type { ComponentType } from "react";
import { registerIconSet } from "@ui-organized/react";
import { makeStubIconSet } from "./stubIconSet.js";

export function ReactStubIcon({ size, strokeWidth }: { size?: number; strokeWidth?: number }) {
  return <svg data-cut="outline" data-size={size} data-stroke={strokeWidth} />;
}

export function ReactStubSolidIcon({ size, strokeWidth }: { size?: number; strokeWidth?: number }) {
  return <svg data-cut="solid" data-size={size} data-stroke={strokeWidth} />;
}

export const REACT_STUB_SET = makeStubIconSet<ComponentType<any>>(
  ReactStubIcon,
  ReactStubSolidIcon,
);

// Registered globally, as a consumer does by importing `@ui-organized/react/icons/lucide`,
// so the cases that pass no provider exercise the registry lookup rather than the
// explicit `icons` prop. The Svelte and Vue sets register themselves when their
// fixtures are imported.
registerIconSet(REACT_STUB_SET);
