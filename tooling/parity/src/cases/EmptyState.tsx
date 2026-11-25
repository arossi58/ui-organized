import type { ComponentType } from "react";
import { Button as RButton, EmptyState as REmptyState } from "@ui-organized/react";
import EmptyStateFixture from "../fixtures/EmptyStateFixture.svelte";
import VueEmptyStateFixture from "../fixtures/vue/EmptyStateFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "EmptyState",
  // `withActions` stands for the slot every library fills its own way.
  react: ({ withActions, title, ...p }) => (
    <REmptyState
      title={title as string}
      {...p}
      actions={withActions ? <RButton>Clear filters</RButton> : undefined}
    />
  ),
  svelte: EmptyStateFixture as unknown as ComponentType<any>,
  vue: VueEmptyStateFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default", props: { title: "No results" } },
    { name: "description", props: { title: "No results", description: "Try a different filter." } },
    { name: "icon", props: { title: "No results", icon: "check" } },
    ...(["sm", "md", "lg"] as const).map((size) => ({
      name: `size/${size}`,
      props: { title: "No results", icon: "check", description: "Try a different filter.", size },
    })),
    { name: "heading level", props: { title: "No results", headingLevel: 3 } },
    { name: "actions", props: { title: "No results", withActions: true } },
    { name: "custom class", props: { title: "No results", className: "mine" } },
  ],
};

export default spec;
