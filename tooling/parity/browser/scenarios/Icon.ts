import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Mirrors the SSR gate's Icon spec, because Angular is compared in the browser
 * only and would otherwise not be compared at all. Everything these assert
 * happens before an icon is drawn — reading the provider config, resolving the
 * canonical name, choosing the outline or solid cut, computing the optical
 * stroke — and all of it is shared code in core that each library has to call
 * correctly.
 */
const scenarios: BrowserScenario[] = staticScenarios("Icon", [
  { name: "default", props: { name: "check" } },
  { name: "size", props: { name: "check", size: 16 } },
  { name: "labelled", props: { name: "check", label: "Done" } },
  { name: "custom class", props: { name: "check", className: "mine" } },
  { name: "unregistered name", props: { name: "star" } },
  {
    name: "supplied directly",
    props: { supplied: true, size: 32 },
    skip: [
      {
        framework: "angular",
        reason:
          "React, Svelte and Vue hand Icon a stub *component*, which maps " +
          "core's { size, strokeWidth } fallback onto data-size/data-stroke in " +
          "its own template. An Angular icon is markup, so there is no " +
          "component to do that and Icon applies width/height/stroke-width " +
          "directly. Both are the no-adapter path and neither is wrong; they " +
          "cannot render the same attributes by construction.",
      },
    ],
  },
  { name: "provider/default", props: { name: "check", provider: {} } },
  { name: "provider/solid", props: { name: "check", provider: { style: "solid" } } },
  {
    name: "provider/solid falls back to outline",
    props: { name: "close", provider: { style: "solid" } },
  },
  // The optical stroke curve. Expected data-stroke, from the shared math:
  // 40 -> 1.5, 12 -> 3, 32 at baseSize 32 -> 1.5 (not 2 — the conversion is
  // always to the fixed 24 viewBox), baseStroke 1.5 -> 1.5, solid -> absent.
  {
    name: "provider/stroke adjustment large",
    props: { name: "check", size: 40, provider: { strokeAdjustment: true } },
  },
  {
    name: "provider/stroke adjustment small",
    props: { name: "check", size: 12, provider: { strokeAdjustment: true } },
  },
  {
    name: "provider/stroke adjustment at the reference size",
    props: { name: "check", size: 32, provider: { strokeAdjustment: true, baseSize: 32 } },
  },
  { name: "provider/baseStroke", props: { name: "check", provider: { baseStroke: 1.5 } } },
  {
    name: "provider/solid has no stroke",
    props: { name: "check", provider: { style: "solid", strokeAdjustment: true } },
  },
]);

export default scenarios;
