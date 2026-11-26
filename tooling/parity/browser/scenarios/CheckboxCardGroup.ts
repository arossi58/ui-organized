import { part, CLICKED, staticScenarios, type BrowserScenario } from "./scenario.js";

const EXTRAS = [
  { value: "backups", label: "Backups", description: "Nightly, kept for thirty days." },
  { value: "support", label: "Support", description: "A reply within a working day.", icon: "check" },
  { value: "audit", label: "Audit log", disabled: true },
];

const scenarios: BrowserScenario[] = staticScenarios("CheckboxCardGroup", [
  { name: "default", props: { options: EXTRAS, label: "Extras" } },
  { name: "selected", props: { options: EXTRAS, label: "Extras", defaultValue: ["backups", "support"] } },
  { name: "two columns, small", props: { options: EXTRAS, label: "Extras", columns: 2, size: "sm" } },
  // The message describes the group, and every card is marked invalid.
  { name: "error", props: { options: EXTRAS, label: "Extras", error: "Choose at least one" } },
]);

scenarios.push({
  // Each card is a checkbox's <label>, so a click anywhere on it toggles.
  component: "CheckboxCardGroup",
  name: "checked by clicking a card",
  props: { options: EXTRAS, label: "Extras" },
  steps: [
    { do: "click", target: part("checkbox", "root") },
    { do: "wait", target: `${part("checkbox", "root")}${CLICKED}` },
  ],
  regions: ["#mount"],
});

export default scenarios;
