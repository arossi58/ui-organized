import type { ComponentType } from "react";
import {
  DescriptionList as RDescriptionList,
  DescriptionListItem as RDescriptionListItem,
} from "@ui-organized/react";
import DescriptionListFixture from "../fixtures/DescriptionListFixture.svelte";
import VueDescriptionListFixture from "../fixtures/vue/DescriptionListFixture.vue";
import type { ParitySpec } from "./spec.js";

const ITEMS = [
  { term: "Plan", details: "Pro" },
  { term: "Renews", details: "1 March 2027" },
];

/**
 * `composed` stands for DescriptionListItem children, which JSON props cannot
 * carry: two fixed items in every library, after any `items`.
 */
const spec: ParitySpec = {
  component: "DescriptionList",
  react: ({ composed, ...p }) => (
    <RDescriptionList {...(p as any)}>
      {composed ? (
        <>
          <RDescriptionListItem term="Owner">Ada Lovelace</RDescriptionListItem>
          <RDescriptionListItem term="Region">Europe (west)</RDescriptionListItem>
        </>
      ) : null}
    </RDescriptionList>
  ),
  svelte: DescriptionListFixture as unknown as ComponentType<any>,
  vue: VueDescriptionListFixture as unknown as ComponentType<any>,
  stylesheets: ["DescriptionList/DescriptionList.css"],
  cases: [
    { name: "items", props: { items: ITEMS } },
    { name: "composed", props: { composed: true } },
    { name: "items then composed", props: { items: ITEMS, composed: true } },
    { name: "stacked", props: { items: ITEMS, layout: "stacked" } },
    { name: "sm", props: { items: ITEMS, size: "sm" } },
    { name: "divided", props: { items: ITEMS, divided: true } },
    {
      name: "sm, stacked, divided",
      props: { items: ITEMS, size: "sm", layout: "stacked", divided: true, composed: true },
    },
  ],
};

export default spec;
