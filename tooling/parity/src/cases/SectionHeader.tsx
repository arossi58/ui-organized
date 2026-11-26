import type { ComponentType } from "react";
import { SectionHeader as RSectionHeader } from "@ui-organized/react";
import SectionHeaderFixture from "../fixtures/SectionHeaderFixture.svelte";
import VueSectionHeaderFixture from "../fixtures/vue/SectionHeaderFixture.vue";
import type { ParitySpec } from "./spec.js";

/** `withActions` stands for the slot; see PageHeader.tsx. */
const spec: ParitySpec = {
  component: "SectionHeader",
  react: ({ withActions, ...p }) => (
    <RSectionHeader
      {...(p as any)}
      actions={withActions ? <button type="button">View all</button> : undefined}
    />
  ),
  svelte: SectionHeaderFixture as unknown as ComponentType<any>,
  vue: VueSectionHeaderFixture as unknown as ComponentType<any>,
  stylesheets: ["PageHeader/PageHeader.css"],
  cases: [
    { name: "title only", props: { title: "Recent orders" } },
    { name: "description", props: { title: "Recent orders", description: "The last 30 days." } },
    { name: "actions", props: { title: "Recent orders", withActions: true } },
    { name: "sm", props: { title: "Recent orders", size: "sm", description: "The last 30 days." } },
    {
      name: "center",
      props: {
        title: "Pricing",
        description: "One plan for every team.",
        align: "center",
        withActions: true,
      },
    },
    { name: "heading level", props: { title: "Recent orders", headingLevel: 3 } },
    { name: "divided", props: { title: "Recent orders", divided: true } },
  ],
};

export default spec;
