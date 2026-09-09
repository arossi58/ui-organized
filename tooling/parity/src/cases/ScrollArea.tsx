import type { ComponentType } from "react";
import { ScrollArea as RScrollArea } from "@ui-organized/react";
import ScrollAreaFixture from "../fixtures/ScrollAreaFixture.svelte";
import VueScrollAreaFixture from "../fixtures/vue/ScrollAreaFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "ScrollArea",
  react: (p) => (
    <RScrollArea {...(p as any)}>
      <p>One</p>
      <p>Two</p>
      <p>Three</p>
      <p>Four</p>
      <p>Five</p>
    </RScrollArea>
  ),
  svelte: ScrollAreaFixture as unknown as ComponentType<any>,
  vue: VueScrollAreaFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    ...(["vertical", "horizontal", "both"] as const).map((orientation) => ({
      name: `orientation/${orientation}`,
      props: { orientation },
    })),
    // The bounded height reaches each library differently and lands on the same
    // element: React takes a `style` prop, Vue cannot declare one so it arrives
    // as an ordinary fallthrough attribute, and Svelte declares a `style` that
    // accepts React's record as well as the string the DOM attribute takes.
    // See ScrollArea.vue and ScrollArea.svelte for each.
    { name: "bounded height", props: { style: { height: "80px" } } },
  ],
};

export default spec;
