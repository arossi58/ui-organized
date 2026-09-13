import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Alert is now in all four libraries' tier-1, so there is nothing left to skip.
 *
 * The spec these mount is not hand-written: `src/cases/Alert.tsx` gives the
 * component an SSR spec, and `BROWSER_SPECS` derives from `SPECS`, so every
 * library arrives here for free.
 */
const scenarios: BrowserScenario[] = staticScenarios("Alert", [
  { name: "default", props: {} },
  { name: "variant/success", props: { variant: "success" } },
  { name: "variant/warning", props: { variant: "warning" } },
  { name: "variant/error", props: { variant: "error" } },
  { name: "with title", props: { variant: "error", title: "Upload failed" } },
  { name: "dismissible", props: { onDismiss: true } },
]);

export default scenarios;
