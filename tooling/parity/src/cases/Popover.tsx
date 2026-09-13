import type { ComponentType } from "react";
import {
  Popover as RPopover,
  PopoverTrigger as RPopoverTrigger,
  PopoverContent as RPopoverContent,
  PopoverTitle as RPopoverTitle,
  PopoverDescription as RPopoverDescription,
  PopoverClose as RPopoverClose,
} from "@ui-organized/react";
import PopoverFixture from "../fixtures/PopoverFixture.svelte";
import VuePopoverFixture from "../fixtures/vue/PopoverFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Popover",
  react: ({ contentProps = {}, ...p }) => (
    <RPopover {...p}>
      <RPopoverTrigger>Open</RPopoverTrigger>
      <RPopoverContent {...contentProps}>
        <RPopoverTitle>Title</RPopoverTitle>
        <RPopoverDescription>Description</RPopoverDescription>
        <RPopoverClose>Close</RPopoverClose>
      </RPopoverContent>
    </RPopover>
  ),
  svelte: PopoverFixture as unknown as ComponentType<any>,
  vue: VuePopoverFixture as unknown as ComponentType<any>,
  // Trigger only — see `ParitySpec.select` in spec.ts for why the portalled
  // half cannot be compared by static rendering.
  select: '[data-part="trigger"]',
  cases: [
    // Closed is the state that matters most here: the content is unmounted, so
    // Ark's aria-controls on the trigger would name nothing. popupControls
    // drops it, and this is what pins that.
    { name: "closed" },
    { name: "modal", props: { modal: true } },
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
