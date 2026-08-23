import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Alert is in React's tier-1 and Angular's, and in neither Svelte's nor Vue's
 * — so React is the only side to compare against, and the skip entries say so
 * rather than the scenarios quietly not existing.
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
    skip: [
      { framework: "svelte", reason: "Alert is not in the Svelte package's tier-1." },
      { framework: "vue", reason: "Alert is not in the Vue package's tier-1." },
    ],
  })),
);

export default scenarios;
