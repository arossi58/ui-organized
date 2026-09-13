import { staticScenarios, type BrowserScenario } from "./scenario.js";

const value = "https://ui-organized.dev";

/**
 * The idle state only, deliberately.
 *
 * Copying is the interesting half and it cannot be driven here: a headless page
 * has no clipboard permission, `navigator.clipboard.writeText` rejects, and Ark
 * React leaves that rejection unhandled — so a scenario that clicked the trigger
 * would fail this gate's "no page errors" assertion on *React*, before any port
 * was compared. The copied state is asserted directly in the Angular library's
 * own `clipboard.spec.ts`.
 */
const scenarios: BrowserScenario[] = staticScenarios("Clipboard", [
  { name: "default", props: { value } },
  { name: "with label", props: { value, label: "Share link" } },
  { name: "helper text", props: { value, helperText: "Anyone with the link" } },
  // The button variant drops the value box; the trigger is the whole control.
  { name: "variant/button", props: { value, variant: "button" } },
  { name: "variant/input", props: { value, variant: "input" } },
  ...(["sm", "md", "lg"] as const).map((size) => ({ name: `size/${size}`, props: { value, size } })),
  { name: "custom labels", props: { value, copyLabel: "Copy URL", copiedLabel: "Done" } },
]);

export default scenarios;
