/**
 * Shared prop-type helpers.
 *
 * Vue's own attribute types are looser than Ark's part props in the same two
 * places Svelte's are, so components that forward attributes into an Ark part
 * narrow them here rather than each restating the fix.
 */
export type ArkForwardable<T> = Omit<T, "id"> & { id?: string };
