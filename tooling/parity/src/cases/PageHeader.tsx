import type { ComponentType } from "react";
import { PageHeader as RPageHeader } from "@ui-organized/react";
import PageHeaderFixture from "../fixtures/PageHeaderFixture.svelte";
import VuePageHeaderFixture from "../fixtures/vue/PageHeaderFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * `withBreadcrumbs`, `withActions` and `withTabs` stand for the slots, which JSON
 * props cannot carry. Each renders the same fixed markup in every library: the
 * case is about PageHeader's structure, not about what goes in a slot.
 */
const spec: ParitySpec = {
  component: "PageHeader",
  react: ({ withBreadcrumbs, withActions, withTabs, ...p }) => (
    <RPageHeader
      {...(p as any)}
      breadcrumbs={withBreadcrumbs ? <a href="/">Home</a> : undefined}
      actions={withActions ? <button type="button">Edit</button> : undefined}
      tabs={withTabs ? <div>Overview</div> : undefined}
    />
  ),
  svelte: PageHeaderFixture as unknown as ComponentType<any>,
  vue: VuePageHeaderFixture as unknown as ComponentType<any>,
  stylesheets: ["PageHeader/PageHeader.css"],
  cases: [
    { name: "title only", props: { title: "Billing" } },
    {
      name: "description",
      props: { title: "Billing", description: "Plans, invoices and payment methods." },
    },
    { name: "actions", props: { title: "Billing", withActions: true } },
    { name: "breadcrumbs", props: { title: "Billing", withBreadcrumbs: true } },
    { name: "tabs", props: { title: "Billing", withTabs: true, divided: true } },
    { name: "lg", props: { title: "Billing", description: "Plans and invoices.", size: "lg" } },
    { name: "heading level", props: { title: "Notifications", headingLevel: 2 } },
    { name: "divided", props: { title: "Billing", divided: true } },
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
  ],
};

export default spec;
