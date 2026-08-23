import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Alert is in React's tier-1, Angular's and now Vue's, and still not in
 * Svelte's — so the skip entry names that one absence rather than the scenarios
 * quietly not existing.
 *
 * The spec these mount is no longer hand-written: `src/cases/Alert.tsx` gives
 * the component an SSR spec, and `BROWSER_SPECS` derives from `SPECS`, so React
 * and Vue arrive here for free.
 */
const scenarios: BrowserScenario[] = staticScenarios(
  "Alert",
  (
    [
      { name: "default", props: {} },
      { name: "variant/success", props: { variant: "success" } },
      { name: "variant/warning", props: { variant: "warning" } },
      { name: "variant/error", props: { variant: "error" } },
      { name: "with title", props: { variant: "error", title: "Upload failed" } },
      { name: "dismissible", props: { onDismiss: true } },
    ] as const
  ).map(({ name, props }) => ({
    name,
    props: props as Record<string, unknown>,
    skip: [{ framework: "svelte", reason: "Alert is not in the Svelte package's tier-1." }],
  })),
);

export default scenarios;
