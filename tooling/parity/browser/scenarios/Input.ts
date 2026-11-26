import { ARK_ERROR_TEXT_SKEW, staticScenarios, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = staticScenarios("Input", [
  { name: "default" },
  { name: "with label", props: { label: "Email" } },
  { name: "required", props: { label: "Email", required: true } },
  { name: "helper text", props: { label: "Email", helperText: "We never share it" } },
  // The error path replaces the helper text and drives [data-invalid] through
  // every part of the field.
  {
    name: "error message",
    props: { label: "Email", error: "Required" },
    skip: ARK_ERROR_TEXT_SKEW,
  },
  { name: "invalid without message", props: { label: "Email", error: true } },
  {
    name: "helper hidden by error",
    props: { label: "E", helperText: "H", error: "Bad" },
    skip: ARK_ERROR_TEXT_SKEW,
  },
  ...(["sm", "md", "lg"] as const).map((size) => ({ name: `size/${size}`, props: { size } })),
  { name: "disabled", props: { label: "Email", disabled: true } },
  { name: "placeholder", props: { placeholder: "you@example.com" } },
  { name: "type=email", props: { type: "email" } },
  { name: "start icon", props: { label: "Search", startIcon: "check" } },
  { name: "both addons", props: { label: "Website", startAddon: "https://", endAddon: ".com" } },
  { name: "addon + icon lg", props: { label: "Amount", startAddon: "USD", endIcon: "check", size: "lg" } },
  // A Button in the end slot joins the shell.
  { name: "button addon", props: { label: "Share link", withButton: true } },
  { name: "addon disabled", props: { label: "Website", endAddon: ".com", disabled: true } },
  // Text add-ons join aria-describedby ahead of the helper text.
  { name: "addons + helper", props: { label: "Website", startAddon: "https://", endAddon: ".com", helperText: "Your site" } },
]);

export default scenarios;
