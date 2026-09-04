export { default as Chip } from "./Chip.svelte";
export type { ChipProps } from "./Chip.types.js";
// Re-exported from core, the way React's Chip barrel does: a filter chip's
// `operator` is one of these, and a table adapter cannot name the prop's type
// without it.
export type { ChipVariants, ComparisonIconName } from "@ui-organized/core";
