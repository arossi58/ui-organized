import type { ComponentType } from "react";
import { Item as RItem, ItemGroup as RItemGroup } from "@ui-organized/react";
import ItemGroupFixture from "../fixtures/ItemGroupFixture.svelte";
import VueItemGroupFixture from "../fixtures/vue/ItemGroupFixture.vue";
import type { ParitySpec } from "./spec.js";

/** Two fixed rows in every library; `itemVariant` is passed to both. */
const spec: ParitySpec = {
  component: "ItemGroup",
  react: ({ itemVariant, ...p }) => (
    <RItemGroup {...(p as any)}>
      <RItem variant={itemVariant} title="Product updates" description="News about releases." />
      <RItem variant={itemVariant} title="Weekly digest" href="/digest" />
    </RItemGroup>
  ),
  svelte: ItemGroupFixture as unknown as ComponentType<any>,
  vue: VueItemGroupFixture as unknown as ComponentType<any>,
  stylesheets: ["Item/Item.css"],
  cases: [
    { name: "divided", props: {} },
    { name: "not divided", props: { divided: false } },
    { name: "outline", props: { variant: "outline", itemVariant: "outline" } },
    { name: "outline, not divided", props: { variant: "outline", divided: false } },
  ],
};

export default spec;
