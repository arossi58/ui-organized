import type { ComponentType } from "react";
import {
  HoverCard as RHoverCard,
  HoverCardTrigger as RHoverCardTrigger,
  HoverCardContent as RHoverCardContent,
} from "@ui-organized/react";
import HoverCardFixture from "../fixtures/HoverCardFixture.svelte";
import VueHoverCardFixture from "../fixtures/vue/HoverCardFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "HoverCard",
  react: ({ contentProps = {}, ...p }) => (
    <RHoverCard {...p}>
      <RHoverCardTrigger>Profile</RHoverCardTrigger>
      <RHoverCardContent {...contentProps}>Preview</RHoverCardContent>
    </RHoverCard>
  ),
  svelte: HoverCardFixture as unknown as ComponentType<any>,
  vue: VueHoverCardFixture as unknown as ComponentType<any>,
  exclude: '[data-scope="hover-card"][data-part="positioner"]',
  // Trigger only — see `ParitySpec.select` in spec.ts for why the portalled
  // half cannot be compared by static rendering.
  select: '[data-part="trigger"]',
  cases: [
    { name: "closed" },
    { name: "open", props: { defaultOpen: true } },
    { name: "delays", props: { openDelay: 100, closeDelay: 50 } },
    // The positioning bridge: side/align live on Content but Ark configures
    // them on Root, so these exercise the context hand-off in both libraries.
    ...(["top", "right", "bottom", "left"] as const).map((side) => ({
      name: `side/${side}`,
      props: { contentProps: { side } },
    })),
    ...(["start", "center", "end"] as const).map((align) => ({
      name: `align/${align}`,
      props: { contentProps: { align } },
    })),
    { name: "offsets", props: { contentProps: { sideOffset: 16, alignOffset: 4 } } },
  ],
};

export default spec;
