import type { ComponentType } from "react";
import { ScrollArea as RScrollArea } from "@ui-organized/react";
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
  // No Svelte fixture: ScrollArea is not in that package yet.
  vue: VueScrollAreaFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    ...(["vertical", "horizontal", "both"] as const).map((orientation) => ({
      name: `orientation/${orientation}`,
      props: { orientation },
    })),
    // React takes the bounded height as a `style` prop; Vue cannot declare one,
    // so it arrives as an ordinary fallthrough attribute. Same element either
    // way — see packages/vue/src/components/ScrollArea/ScrollArea.vue.
    { name: "bounded height", props: { style: { height: "80px" } } },
  ],
};

export default spec;
