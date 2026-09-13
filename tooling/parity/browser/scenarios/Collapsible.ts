import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

const TRIGGER = part("collapsible", "trigger");
const PANEL = part("collapsible", "content");

/**
 * The settled-open panel, which is the state a `wait` cannot name directly.
 *
 * A collapsible that has just been opened carries `data-state="open"` for
 * exactly as long as its enter animation runs — that attribute is what the
 * keyframes select on — and then Zag takes it off again. So "open" is
 * `:not([data-state])`, and waiting on the presence of `data-state="open"`
 * instead would capture the four libraries at whatever point of a 200ms
 * animation they each happened to reach.
 */
const SETTLED_OPEN = `${PANEL}:not([data-state])`;

const scenarios: BrowserScenario[] = [
  ...staticScenarios("Collapsible", [
    /**
     * Closed is the interesting resting state: the panel is still rendered, and
     * it is `hidden` + `data-state="closed"` that keeps it out of the page —
     * along with `data-collapsible`, which is on it either way.
     */
    { name: "default" },
    /**
     * Open on mount, and the case that pins the absent attribute down. `initial`
     * is false until something *transitions* the panel, so a collapsible that
     * starts open reports no `data-state` and runs no animation. Emitting a
     * helpful `data-state="open"` here is the natural thing for a port to do,
     * and would restart the animation on every render.
     */
    { name: "open by default", props: { defaultOpen: true } },
    { name: "controlled open", props: { open: true } },
    { name: "controlled closed", props: { open: false } },
    /**
     * A disabled collapsible's trigger keeps `data-disabled` and gains no native
     * `disabled`: Zag refuses the click in its handler instead, so the button
     * stays in the tab order. A port that reached for the native attribute would
     * look like it was being helpful.
     */
    { name: "disabled", props: { disabled: true } },
    { name: "extra class", props: { className: "custom" } },
  ]),
  {
    component: "Collapsible",
    name: "opened",
    props: {},
    steps: [
      { do: "click", target: TRIGGER },
      { do: "wait", target: `${TRIGGER}[data-state="open"]` },
      { do: "wait", target: SETTLED_OPEN },
    ],
    regions: ["#mount"],
  },
  {
    component: "Collapsible",
    name: "closed again",
    props: { defaultOpen: true },
    /**
     * The exit animation is the half a static render cannot reach at all: the
     * panel stays in the DOM, unhidden, with `data-state="closed"` on it for the
     * whole of it — which is what `collapsible-up` needs to interpolate from.
     * `[hidden]` is therefore the end of the animation, not the click.
     */
    steps: [
      { do: "click", target: TRIGGER },
      { do: "wait", target: `${TRIGGER}[data-state="closed"]` },
      { do: "wait", target: `${PANEL}[hidden]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
