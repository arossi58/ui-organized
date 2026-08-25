import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * The stars, and the two attributes that are not the same thing.
 *
 * `data-checked` marks the one star the value names; `data-highlighted` marks
 * every star up to it and is what the fill is drawn from. The SSR gate covers
 * these for the other three; Angular is compared in the browser only, so they
 * are repeated here.
 *
 * ── Why nothing here is clicked ─────────────────────────────────────────────
 *
 * A rating item's only content is the star icon, and the suite's stub icon set
 * deliberately has no `star` — it is the name that covers "this library has no
 * icon for that". So every item renders empty, collapses to zero size, and is
 * not clickable or hoverable in any of the four libraries. Choosing a rating,
 * arrowing between stars and the hover preview are asserted in
 * `rating-group.spec.ts` instead, where a synthetic event needs no layout.
 */
const SIZES = ["sm", "md", "lg"] as const;

const scenarios: BrowserScenario[] = [
  ...staticScenarios("RatingGroup", [
    { name: "default" },
    { name: "with label", props: { label: "Rating" } },
    { name: "required", props: { label: "Rating", required: true } },
    { name: "helper text", props: { label: "Rating", helperText: "Out of five" } },
    { name: "error message", props: { label: "Rating", error: "Pick one" } },
    { name: "invalid without message", props: { label: "Rating", error: true } },
    { name: "helper hidden by error", props: { label: "R", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Rating" } })),
    { name: "variant/warning", props: { variant: "warning" } },
    // The item list comes from the machine rather than from `count` directly,
    // so a wrong count shows up as a missing or extra Item part.
    { name: "count 3", props: { count: 3 } },
    { name: "count 10", props: { count: 10 } },
    { name: "default value", props: { defaultValue: 3 } },
    { name: "controlled value", props: { value: 2 } },
    { name: "allow half", props: { allowHalf: true, defaultValue: 2.5 } },
    /** Read-only keeps one tab stop; disabled has none, and neither reaches the root. */
    { name: "read only", props: { readOnly: true, defaultValue: 4 } },
    { name: "disabled", props: { disabled: true, defaultValue: 4 } },
    { name: "named", props: { name: "score", label: "Rating" } },
  ]),
];

export default scenarios;
