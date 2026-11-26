import type { ComponentType } from "react";
import {
  Drawer as RDrawer,
  DrawerTrigger as RDrawerTrigger,
  DrawerContent as RDrawerContent,
  DrawerTitle as RDrawerTitle,
  DrawerDescription as RDrawerDescription,
  DrawerClose as RDrawerClose,
  DrawerFooter as RDrawerFooter,
} from "@ui-organized/react";
import DrawerFixture from "../fixtures/DrawerFixture.svelte";
import VueDrawerFixture from "../fixtures/vue/DrawerFixture.vue";
import type { ParitySpec } from "./spec.js";

/** The trigger only, as for Sheet: the panel is portalled, and the browser gate compares it. */
const spec: ParitySpec = {
  component: "Drawer",
  react: ({ contentProps = {}, ...p }) => (
    <RDrawer {...p}>
      <RDrawerTrigger>Open</RDrawerTrigger>
      <RDrawerContent {...contentProps}>
        <RDrawerTitle>Title</RDrawerTitle>
        <RDrawerDescription>Description</RDrawerDescription>
        <RDrawerFooter>
          <RDrawerClose>Close</RDrawerClose>
        </RDrawerFooter>
      </RDrawerContent>
    </RDrawer>
  ),
  svelte: DrawerFixture as unknown as ComponentType<any>,
  vue: VueDrawerFixture as unknown as ComponentType<any>,
  exclude:
    '[data-scope="drawer"][data-part="backdrop"], [data-scope="drawer"][data-part="positioner"]',
  select: '[data-part="trigger"]',
  cases: [
    { name: "closed" },
    { name: "open", props: { defaultOpen: true } },
    { name: "modal", props: { modal: true } },
    { name: "non-modal", props: { modal: false } },
  ],
};

export default spec;
