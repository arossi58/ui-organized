/**
 * Colour-vision simulations for the preview — carried over from Storybook's
 * accessibility addon.
 *
 * These are the standard published `feColorMatrix` transforms, applied to the
 * preview stage with `filter: url(#…)`. No dependency is needed: the addon does
 * exactly this with exactly these matrices, so reimplementing the nine
 * simulations is cheaper and lighter than pulling the addon into a React app
 * that has no Storybook manager to host it.
 *
 * The filter goes on the stage element only, never the frame or toolbar —
 * tinting the chrome along with the component would make the simulation
 * misleading about what a user actually sees.
 */
import { Select } from "@ui-organized/react";

export interface VisionSimulation {
  id: string;
  label: string;
}

/** Matrix rows are R, G, B, A — the standard 4×5 `feColorMatrix` form. */
const MATRICES: Array<VisionSimulation & { matrix: string }> = [
  {
    id: "protanopia",
    label: "Protanopia",
    matrix: "0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0",
  },
  {
    id: "protanomaly",
    label: "Protanomaly",
    matrix: "0.817 0.183 0 0 0  0.333 0.667 0 0 0  0 0.125 0.875 0 0  0 0 0 1 0",
  },
  {
    id: "deuteranopia",
    label: "Deuteranopia",
    matrix: "0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0",
  },
  {
    id: "deuteranomaly",
    label: "Deuteranomaly",
    matrix: "0.8 0.2 0 0 0  0.258 0.742 0 0 0  0 0.142 0.858 0 0  0 0 0 1 0",
  },
  {
    id: "tritanopia",
    label: "Tritanopia",
    matrix: "0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0",
  },
  {
    id: "tritanomaly",
    label: "Tritanomaly",
    matrix: "0.967 0.033 0 0 0  0 0.733 0.267 0 0  0 0.183 0.817 0 0  0 0 0 1 0",
  },
  {
    id: "achromatopsia",
    label: "Achromatopsia",
    matrix: "0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0",
  },
  {
    id: "achromatomaly",
    label: "Achromatomaly",
    matrix: "0.618 0.32 0.062 0 0  0.163 0.775 0.062 0 0  0.163 0.32 0.516 0 0  0 0 0 1 0",
  },
];

const BLUR: VisionSimulation = { id: "blurred-vision", label: "Blurred vision" };

export const VISION_SIMULATIONS: VisionSimulation[] = [
  BLUR,
  ...MATRICES.map(({ id, label }) => ({ id, label })),
];

const FILTER_PREFIX = "docs-vision-";

/** The CSS `filter` value for a simulation id, or undefined for "no filter". */
export function visionFilterValue(id: string | null): string | undefined {
  return id ? `url(#${FILTER_PREFIX}${id})` : undefined;
}

/**
 * The filter definitions. Rendered once per page that uses a simulation — the
 * ids are global to the document, so mounting this more than once would produce
 * duplicates.
 */
export function VisionFilterDefs() {
  return (
    <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        {MATRICES.map(({ id, matrix }) => (
          <filter id={`${FILTER_PREFIX}${id}`} key={id} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={matrix} />
          </filter>
        ))}
        <filter id={`${FILTER_PREFIX}${BLUR.id}`} colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
    </svg>
  );
}

/** Sentinel for "no simulation" — `Select` needs a real option value. */
const NONE = "none";

export function VisionFilterMenu({
  value,
  onChange,
  className,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  className?: string;
}) {
  return (
    <Select
      className={className}
      size="sm"
      variant="ghost"
      aria-label="Simulate colour vision"
      options={[
        { value: NONE, label: "No vision filter" },
        ...VISION_SIMULATIONS.map((simulation) => ({
          value: simulation.id,
          label: simulation.label,
        })),
      ]}
      value={value ?? NONE}
      onValueChange={(next) => onChange(next === NONE ? null : next)}
    />
  );
}
