import { staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * The PageHeader family, one file so `QUALITY_COMPONENTS=page-header` runs all
 * three. Angular is compared here only; the SSR gate covers the other three.
 */
const scenarios: BrowserScenario[] = [
  ...staticScenarios("PageHeader", [
    {
      name: "description",
      props: { title: "Billing", description: "Plans, invoices and payment methods." },
    },
    {
      name: "everything",
      props: {
        title: "Billing",
        description: "Plans and invoices.",
        withBreadcrumbs: true,
        withActions: true,
        withTabs: true,
      },
    },
    {
      name: "lg, heading level, divided",
      props: { title: "Notifications", size: "lg", headingLevel: 2, divided: true },
    },
  ]),
  ...staticScenarios("SectionHeader", [
    {
      name: "description and actions",
      props: { title: "Recent orders", description: "The last 30 days.", withActions: true },
    },
    {
      name: "sm, center, heading level, divided",
      props: { title: "Pricing", size: "sm", align: "center", headingLevel: 3, divided: true },
    },
  ]),
  ...staticScenarios("SectionFooter", [
    { name: "both", props: { text: "Showing 1 to 10 of 48", withActions: true } },
    { name: "divided", props: { text: "Showing 1 to 10 of 48", divided: true } },
  ]),
];

export default scenarios;
