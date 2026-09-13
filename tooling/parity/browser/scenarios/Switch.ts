import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Switch", [
  { name: "default" },
  { name: "with label", props: { label: "Wifi" } },
  // The case OMIT_ARIA exists for in the other three: with no label part
  // there is nothing for aria-labelledby to name, and a dangling IDREF
  // outranks aria-label.
  { name: "no label, aria-label", props: { "aria-label": "Wifi" } },
  { name: "checked", props: { defaultChecked: true } },
  { name: "disabled", props: { disabled: true, label: "Wifi" } },
  { name: "required", props: { required: true, label: "Wifi" } },
  { name: "named", props: { name: "wifi", label: "Wifi" } },
]);

/**
 * A switch that has actually been touched.
 *
 * The same gap the Checkbox had, and found the same way: every case above is
 * static, so nothing compared a switch after a pointer or a key had reached it.
 * `Switch.css` draws its focus ring from `[data-focus-visible]`, which Angular
 * emitted nowhere — so an Angular switch had no keyboard focus indication at
 * all. See `UioInteractionState`.
 */
scenarios.push(
  {
    component: "Switch",
    name: "toggled by clicking its label",
    props: { label: "Wifi" },
    steps: [
      { do: "click", target: "label.switch" },
      { do: "wait", target: `${part("switch", "root")}[data-state="checked"]` },
    ],
    regions: ["#mount"],
  },
  {
    component: "Switch",
    // The case the focus ring exists for: focus arriving from the keyboard,
    // where `:focus-visible` matches and a ring has to be drawn.
    name: "focused from the keyboard",
    props: { label: "Wifi" },
    steps: [
      { do: "press", key: "Tab" },
      { do: "awaitFocus", target: "input" },
      // Waiting on the attribute, not just on focus. `awaitFocus` resolves the
      // instant focus lands, which in a zoneless Angular app is before change
      // detection has written anything — so the capture read a switch that was
      // focused and had not yet said so.
      { do: "wait", target: `${part("switch", "control")}[data-focus-visible]` },
    ],
    regions: ["#mount"],
  },
);

export default scenarios;
