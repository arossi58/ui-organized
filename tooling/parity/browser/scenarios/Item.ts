import { staticScenarios, type BrowserScenario } from "./scenario.js";

const BASE = { title: "Weekly digest", description: "A summary of your activity." };

/** Angular is compared here only; the SSR gate covers the other three. */
const scenarios: BrowserScenario[] = [
  ...staticScenarios("Item", [
    { name: "icon, actions", props: { ...BASE, icon: "info", actions: true } },
    {
      name: "href, media, heading",
      props: { ...BASE, href: "/settings", media: true, headingLevel: 3 },
    },
    { name: "router link", props: { ...BASE, router: true, variant: "outline" } },
    {
      name: "muted sm with target and ids",
      props: {
        ...BASE,
        variant: "muted",
        size: "sm",
        href: "https://example.com",
        target: "_blank",
        rel: "noopener",
        titleId: "digest-title",
        descriptionId: "digest-description",
      },
    },
  ]),
  ...staticScenarios("ItemGroup", [
    { name: "divided", props: {} },
    {
      name: "outline, not divided",
      props: { variant: "outline", divided: false, itemVariant: "outline" },
    },
  ]),
];

export default scenarios;
