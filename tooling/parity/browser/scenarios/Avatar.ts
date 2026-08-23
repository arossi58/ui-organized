import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Nothing here is portalled and nothing is interactive, so these duplicate what
 * the SSR gate already covers for the other three — which is the point: Angular
 * is compared in the browser only, and without them the fourth library would go
 * unchecked.
 *
 * The image case is not a race. The harness serves nothing at `/a.png`, so the
 * request fails — and a failed image renders exactly what an unfinished one
 * does: `<img hidden data-state="hidden">` beside a visible fallback. The state
 * before the error and the state after it are the same markup, in all four
 * libraries, so there is no moment at which this can be captured half-done.
 */
const scenarios: BrowserScenario[] = staticScenarios("Avatar", [
  { name: "initials from name", props: { name: "Ada Lovelace" } },
  { name: "single name", props: { name: "Ada" } },
  ...(["xs", "sm", "md", "lg", "xl"] as const).map((size) => ({
    name: `size/${size}`,
    props: { size, name: "Ada Lovelace" },
  })),
  ...(["circle", "rounded", "square"] as const).map((shape) => ({
    name: `shape/${shape}`,
    props: { shape, name: "Ada Lovelace" },
  })),
  { name: "with image", props: { src: "/a.png", name: "Ada Lovelace" } },
]);

export default scenarios;
