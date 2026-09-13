import type { ComponentType } from "react";
import { Accordion as RAccordion } from "@ui-organized/react";
import AccordionFixture from "../fixtures/AccordionFixture.svelte";
import VueAccordionFixture from "../fixtures/vue/AccordionFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Accordion",
  react: (p) => <RAccordion {...(p as any)} />,
  svelte: AccordionFixture as unknown as ComponentType<any>,
  vue: VueAccordionFixture as unknown as ComponentType<any>,
  cases: (() => {
    const items = [
      { value: "one", title: "One", content: "First" },
      { value: "two", title: "Two", content: "Second" },
      { value: "three", title: "Three", content: "Third", disabled: true },
    ];
    return [
      { name: "default" , props: { items } },
      { name: "single mode", props: { items, multiple: false } },
      { name: "open by default", props: { items, defaultValue: ["one"] } },
      { name: "two open", props: { items, defaultValue: ["one", "two"] } },
      { name: "all disabled", props: { items, disabled: true } },
      ...(["default", "bordered", "separated"] as const).map((variant) => ({
        name: `variant/${variant}`,
        props: { items, variant },
      })),
      ...SIZES.map((size) => ({ name: `size/${size}`, props: { items, size } })),
      {
        name: "numeric values",
        props: { items: [{ value: 1, title: "One", content: "First" }] },
      },
    ];
  })(),
};

export default spec;
