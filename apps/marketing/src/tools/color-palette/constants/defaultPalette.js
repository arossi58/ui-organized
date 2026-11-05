// The default "UI Organized" collection IS the design system's global color
// tokens, read straight from @ui-organized/utils so it can never drift from what
// themes actually resolve. Every family is the canonical 24-step ramp (100
// lightest -> 2400 darkest); the base `color` is the 1200 weight, the design
// system's primary stop (mainStopIndex 11).
//
// Neutrals come from `getCoreFamily`, which returns them re-derived to grey's
// lightness (the authored tinted families diverge by up to 23 L* mid-ramp and
// fail text contrast). Brands are the authored ramps.
import {
  BRAND_FAMILY_NAMES,
  CORE_STEPS,
  NEUTRAL_FAMILY_NAMES,
  getCoreFamily,
} from '@ui-organized/utils';

const MAIN_STOP_INDEX = 11;

const titleCase = (name) => name.charAt(0).toUpperCase() + name.slice(1);

export const DEFAULT_PALETTE = [...NEUTRAL_FAMILY_NAMES, ...BRAND_FAMILY_NAMES].map((name, i) => {
  const ramp = getCoreFamily(name);
  const customStops = CORE_STEPS.map((step) => ramp[step].hex);
  return { id: i + 1, name: titleCase(name), color: customStops[MAIN_STOP_INDEX], customStops };
});
