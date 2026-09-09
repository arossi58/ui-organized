import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * A group of fields under one legend.
 *
 * Every case here is one the SSR gate already runs for the other three — the
 * duplication is what buys Angular a comparison at all, since it is compared in
 * the browser only.
 *
 * The browser is also the only place the `disabled` case says anything
 * interesting: `<fieldset disabled>` disables its descendant controls through
 * the *form owner*, not through any attribute, so the inner input's rendered
 * markup has to be identical in all four libraries while the control itself is
 * genuinely dead. A port that reached down and wrote `disabled` on the input
 * would fail here and nowhere else.
 */
const scenarios: BrowserScenario[] = staticScenarios("Fieldset", [
  { name: "default" },
  { name: "disabled", props: { disabled: true } },
  { name: "invalid", props: { invalid: true } },
  { name: "disabled and invalid", props: { disabled: true, invalid: true } },
]);

export default scenarios;
