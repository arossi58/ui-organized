import { openViaTrigger, part, type BrowserScenario } from "./scenario.js";

const content = part("drawer", "content");
const grabber = part("drawer", "grabber");

/**
 * Open and at rest: the slide-in done, and measured. `data-expanded` is zag's
 * "resting at its snap point", which it knows only once it has measured the
 * panel, so it is waited on rather than raced.
 */
const openAtRest = [
  ...openViaTrigger("drawer"),
  { do: "wait" as const, target: `${content}[data-expanded]` },
];

const scenarios: BrowserScenario[] = [
  {
    component: "Drawer",
    name: "open",
    steps: [...openAtRest, { do: "wait", target: '#mount[aria-hidden="true"]' }],
    regions: [part("drawer", "backdrop"), part("drawer", "positioner"), "#mount"],
  },
  {
    component: "Drawer",
    name: "open without the grabber or the close button",
    props: { contentProps: { showGrabber: false, showClose: false } },
    steps: openAtRest,
    regions: [part("drawer", "positioner")],
  },
  {
    component: "Drawer",
    // As for Sheet: no aria-modal on the panel and no aria-hidden marks behind
    // it, so #mount is compared rather than waited on.
    name: "open and non-modal",
    props: { modal: false },
    steps: openAtRest,
    regions: [part("drawer", "positioner"), "#mount"],
  },
  {
    component: "Drawer",
    // Focus is awaited before and after Escape, for the reasons the Sheet
    // scenario gives; the panel then finishes sliding out before the capture.
    name: "dismissed with Escape",
    steps: [
      ...openAtRest,
      { do: "awaitFocus", target: content },
      { do: "press", key: "Escape" },
      { do: "awaitFocus", target: part("drawer", "trigger") },
      { do: "awaitHidden", target: content },
    ],
    regions: ["#mount"],
    visibilityMatches: [content],
  },
  {
    component: "Drawer",
    // Most of the way down a ~175px panel, without a fling (the step holds
    // before letting go): closed by distance alone in every library. Kept
    // inside the viewport, as a real swipe is.
    name: "dismissed by dragging the grabber down",
    steps: [
      ...openAtRest,
      { do: "awaitFocus", target: content },
      { do: "drag", target: grabber, dy: 150 },
      { do: "awaitFocus", target: part("drawer", "trigger") },
      { do: "awaitHidden", target: content },
    ],
    regions: ["#mount"],
    visibilityMatches: [content],
  },
  {
    component: "Drawer",
    // A short drag springs back: still open, and no longer marked as swiping.
    name: "a short drag springs back",
    steps: [
      ...openAtRest,
      { do: "awaitFocus", target: content },
      { do: "drag", target: grabber, dy: 30 },
      { do: "wait", target: `${content}[data-state="open"]:not([data-swiping])` },
    ],
    regions: [part("drawer", "positioner")],
  },
];

export default scenarios;
