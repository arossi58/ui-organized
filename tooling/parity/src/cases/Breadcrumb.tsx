import type { ComponentType } from "react";
import { Breadcrumb as RBreadcrumb } from "@ui-organized/react";
import VueBreadcrumbFixture from "../fixtures/vue/BreadcrumbFixture.vue";
import type { ParitySpec } from "./spec.js";

const TRAIL = [
  { label: "Home", href: "/" },
  { label: "Library", href: "/library" },
  { label: "Data" },
];

const spec: ParitySpec = {
  component: "Breadcrumb",
  // `items` is destructured rather than defaulted here: both libraries are
  // handed the *same* props object, so a default applied on this side only
  // would leave the other rendering an empty `<ol>`. Every case passes its own.
  react: ({ items, ...p }) => <RBreadcrumb items={items} {...p} />,
  vue: VueBreadcrumbFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default", props: { items: TRAIL } },
    // The last crumb is the current page even when it has an href, so it must
    // still render as text — the one branch where the two conditions disagree.
    {
      name: "last crumb keeps its href but stays text",
      props: { items: [...TRAIL.slice(0, 2), { label: "Data", href: "/data" }] },
    },
    // A crumb with no href in the middle of the trail: not a link, and not the
    // current page either, so it carries no aria-current.
    {
      name: "unlinked middle crumb",
      props: { items: [TRAIL[0], { label: "Library" }, TRAIL[2]] },
    },
    { name: "single crumb", props: { items: [{ label: "Home" }] } },
    {
      name: "with icons",
      props: {
        items: [
          { label: "Home", href: "/", icon: "check" },
          { label: "Data", icon: "close" },
        ],
      },
    },
    { name: "custom separator", props: { items: TRAIL, separator: "/" } },
  ],
};

export default spec;
