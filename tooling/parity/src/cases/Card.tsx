import type { ComponentType } from "react";
import {
  Card as RCard,
  CardHeader as RCardHeader,
  CardBody as RCardBody,
  CardFooter as RCardFooter,
} from "@ui-organized/react";
import CardFixture from "../fixtures/CardFixture.svelte";
import VueCardFixture from "../fixtures/vue/CardFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Card",
  react: (p) => (
    <RCard {...p}>
      <RCardHeader>Header</RCardHeader>
      <RCardBody>Body</RCardBody>
      <RCardFooter>Footer</RCardFooter>
    </RCard>
  ),
  svelte: CardFixture as unknown as ComponentType<any>,
  vue: VueCardFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "elevated", props: { variant: "elevated" } },
    ...(["none", "sm", "md", "lg"] as const).map((padding) => ({
      name: `padding/${padding}`,
      props: { padding },
    })),
  ],
};

export default spec;
