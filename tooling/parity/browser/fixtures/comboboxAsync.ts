/**
 * How long the `ComboboxAsync` fixtures hold their options back, in ms.
 *
 * Each library's fixture mounts a Combobox with its value already set and an
 * empty list, then hands the scenario's options over after this delay — the way
 * a saved form meets a list it fetches. zag works out the input text once, when
 * its machine starts, so for a long time that left an empty box with the
 * placeholder over a perfectly good selection in all three Ark libraries;
 * Angular's own value effect had the same gap for a different reason.
 *
 * Shared so the four fixtures cannot drift apart. Long enough to land well
 * after every framework's first render and Ark's own mount work, short enough
 * that the scenario's wait for the label costs nothing.
 */
export const OPTIONS_ARRIVE_AFTER = 100;
