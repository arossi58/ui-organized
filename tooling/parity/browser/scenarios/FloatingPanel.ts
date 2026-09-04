import { SIZES } from "../../src/cases/spec.js";
import { part, type BrowserScenario, type Step } from "./scenario.js";

/**
 * Everything a FloatingPanel actually is lives inside its portal, so this is
 * where the component is compared at all.
 *
 * The SSR gate can see the trigger and nothing else — `FloatingPanelContent`
 * portals the panel surface, its header, drag handle, title, close button, body
 * and all eight resize triggers, and the three renderers disagree about portals
 * on the server. So `size`, `variant`, the header chrome and the resize strip
 * are pinned here or nowhere.
 *
 * Two regions rather than one, the same split every portalled component in this
 * gate uses: the mount point holds the trigger, the positioner holds the panel.
 * Comparing the whole body instead would compare Angular's CDK overlay container
 * and pane — real elements that no other library renders, because Ark portals
 * its positioner straight into `document.body`.
 */
const surface = part("floating-panel", "positioner");
const content = part("floating-panel", "content");
const CLOSE = part("floating-panel", "close-trigger");

/**
 * The one attribute the four libraries cannot agree on after a panel closes.
 *
 * zag keeps a stack of open panels and reports the top one. In 1.41.2 — the
 * machine `@ark-ui/react` bundles — a panel that closes stays marked
 * `data-topmost`, because nothing recomputes the flag on the way down; in
 * 1.43.3, which `@ark-ui/svelte` and `@ark-ui/vue` bundle, it is popped off the
 * stack and comes back `data-behind`. Both are defensible and the newer one is
 * the better answer; neither is a port's doing, and Angular follows React
 * because React is what it is compared against.
 *
 * Invisible, and the gate re-checks that on every run: `FloatingPanel.css`
 * selects on `[data-dragging]` and nothing else, so no rule reads either
 * attribute. Remove this once Ark React ships the newer machine.
 */
const TOPMOST_SKEW =
  "zag 1.41.2 (Ark React's) leaves data-topmost on a panel that has closed; " +
  "zag 1.43.3 (Ark Svelte's and Ark Vue's) pops it off the panel stack and " +
  "writes data-behind instead. The difference is upstream — no port did this — " +
  "and FloatingPanel.css selects on [data-dragging] alone, so nothing renders " +
  "differently either way. Angular follows React, which is the reference. " +
  "Remove once Ark React ships the newer machine.";

/** Open by clicking, and wait until the panel says it is open. */
const openViaTrigger: Step[] = [
  { do: "click", target: part("floating-panel", "trigger") },
  { do: "wait", target: `${content}[data-state="open"]` },
];

const both = (name: string, props?: Record<string, unknown>): BrowserScenario => ({
  component: "FloatingPanel",
  name,
  props: props ?? {},
  steps: [],
  regions: ["#mount", surface],
});

const scenarios: BrowserScenario[] = [
  both("closed"),
  // Open reaches the trigger's `data-state` *and* the whole portalled panel:
  // `hidden` comes off the content, `data-topmost` replaces `data-behind` on the
  // content and the header both.
  both("default open", { defaultOpen: true }),
  both("controlled open", { open: true }),
  // Worth its own case in Vue's company: an absent Boolean prop casts to `false`
  // there, so "controlled and closed" and "uncontrolled" are one keystroke
  // apart.
  both("controlled closed", { open: false }),
  both("disabled trigger", { triggerProps: { disabled: true } }),
  both("custom trigger class", { triggerClass: "mine" }),
  ...SIZES.map((size) => both(`size/${size}`, { defaultOpen: true, contentProps: { size } })),
  ...(["default", "elevated"] as const).map((variant) =>
    both(`variant/${variant}`, { defaultOpen: true, contentProps: { variant } }),
  ),
  // The placed close button, sitting still: its class, part and label compared
  // against the header's own before anything is clicked.
  both("close button in the body", { defaultOpen: true, bodyClose: true }),
  // Neither prop removes anything: zag keeps the drag handle and all eight
  // resize triggers in the DOM and refuses the gesture instead, so the panel
  // keeps its shape.
  both("not draggable", { defaultOpen: true, draggable: false }),
  both("not resizable", { defaultOpen: true, resizable: false }),
  both("sized and positioned", {
    defaultOpen: true,
    defaultSize: { width: 480, height: 320 },
    minSize: { width: 240, height: 160 },
    maxSize: { width: 720, height: 640 },
    defaultPosition: { x: 120, y: 80 },
  }),
  ...(["absolute", "fixed"] as const).map((strategy) =>
    both(`strategy/${strategy}`, { defaultOpen: true, strategy }),
  ),
  {
    component: "FloatingPanel",
    name: "opened by clicking the trigger",
    steps: openViaTrigger,
    regions: ["#mount", surface],
  },
  {
    component: "FloatingPanel",
    // The close button is inside the drag handle, which is the arrangement most
    // likely to swallow its own click — a pointerdown that starts a drag never
    // becomes one.
    name: "closed with its own button",
    props: { defaultOpen: true },
    steps: [
      { do: "click", target: CLOSE },
      // `[hidden]` as well as the state: Svelte applies the two attributes in
      // separate writes, and waiting on the state alone caught it between them.
      { do: "wait", target: `${content}[data-state="closed"][hidden]` },
    ],
    regions: ["#mount", surface],
    stylesheets: ["FloatingPanel/FloatingPanel.css"],
    allow: [
      {
        attribute: "data-topmost",
        reason: TOPMOST_SKEW,
      },
      {
        attribute: "data-behind",
        reason: TOPMOST_SKEW,
      },
    ],
    /**
     * Not `hidden`: `.floating-panel__content` declares `display: flex`, which
     * overrides the `hidden` attribute the machine puts on it, so a closed panel
     * stays laid out in **every** library. That is a finding about the shared
     * stylesheet rather than about any port, and this gate is not the place to
     * assert it — but the four still have to agree, and an Angular panel that
     * stayed painted where React's did not would fail here.
     */
    visibilityMatches: [content],
  },
  {
    component: "FloatingPanel",
    /**
     * A close button the *caller* placed, in the body rather than the header.
     *
     * The header's own button is rendered by the component in all four
     * libraries; this one is written by hand, which is the whole reason the part
     * is exported separately. Two things are worth pinning: that it is the same
     * button — same class, same part, same `aria-label` — with the caller's
     * label instead of the icon, and that it closes the panel from outside the
     * drag handle, where no pointerdown is competing with it.
     */
    name: "closed with a button in the body",
    props: { defaultOpen: true, bodyClose: true },
    steps: [
      { do: "click", target: `${part("floating-panel", "body")} ${CLOSE}` },
      // `[hidden]` as well as the state — see the header's close case.
      { do: "wait", target: `${content}[data-state="closed"][hidden]` },
    ],
    regions: ["#mount", surface],
    stylesheets: ["FloatingPanel/FloatingPanel.css"],
    allow: [
      { attribute: "data-topmost", reason: TOPMOST_SKEW },
      { attribute: "data-behind", reason: TOPMOST_SKEW },
    ],
    visibilityMatches: [content],
  },
  {
    component: "FloatingPanel",
    /**
     * Escape does **not** close a floating panel, and that is the point of the
     * case.
     *
     * zag guards its ESCAPE transition on `closeOnEsc`, and the facade passes no
     * `closeOnEscape` in any of the four libraries — so a panel stays open, which
     * is the opposite of what every other overlay in this system does and exactly
     * the kind of thing a port "fixes" without noticing. The step list opens the
     * panel, puts focus inside it, presses Escape, and waits for the panel to
     * still be open.
     */
    name: "kept open by Escape",
    props: { defaultOpen: true },
    steps: [
      // The body rather than the content: the content is what takes focus, and
      // clicking a child is how a user reaches it — the header would start a
      // drag instead.
      { do: "click", target: part("floating-panel", "body") },
      { do: "awaitFocus", target: content },
      { do: "press", key: "Escape" },
      { do: "wait", target: `${content}[data-state="open"]` },
    ],
    regions: ["#mount", surface],
    visibilityMatches: [content],
  },
];

export default scenarios;
