import type { ComponentType } from "react";
import { Tooltip as RTooltip } from "@ui-organized/react";
import TooltipFixture from "../fixtures/TooltipFixture.svelte";
import VueTooltipFixture from "../fixtures/vue/TooltipFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Tooltip",
  react: (p) => <RTooltip {...(p as any)}>Hover me</RTooltip>,
  svelte: TooltipFixture as unknown as ComponentType<any>,
  vue: VueTooltipFixture as unknown as ComponentType<any>,
  select: '[data-part="trigger"]',
  cases: [
    { name: "default", props: { content: "Copy" } },
    ...(["top", "right", "bottom", "left"] as const).map((side) => ({
      name: `side/${side}`,
      props: { content: "Copy", side },
    })),
    { name: "delays", props: { content: "Copy", delay: 200, closeDelay: 100 } },
  ],
};

export default spec;
