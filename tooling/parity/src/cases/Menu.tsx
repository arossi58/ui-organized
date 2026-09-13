import type { ComponentType } from "react";
import {
  Menu as RMenu,
  MenuTrigger as RMenuTrigger,
  MenuContent as RMenuContent,
  MenuItem as RMenuItem,
  MenuSeparator as RMenuSeparator,
} from "@ui-organized/react";
import MenuFixture from "../fixtures/MenuFixture.svelte";
import VueMenuFixture from "../fixtures/vue/MenuFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Menu",
  react: ({ contentProps = {}, ...p }) => (
    <RMenu {...p}>
      <RMenuTrigger>Open</RMenuTrigger>
      <RMenuContent {...contentProps}>
        <RMenuItem value="a">Cut</RMenuItem>
        <RMenuSeparator />
        <RMenuItem value="b" destructive>Delete</RMenuItem>
      </RMenuContent>
    </RMenu>
  ),
  svelte: MenuFixture as unknown as ComponentType<any>,
  vue: VueMenuFixture as unknown as ComponentType<any>,
  // Both, and the combination matters. `select` narrows to the trigger, but
  // Ark stamps `data-controls` on it pointing at the menu content — which
  // React renders inline under SSR and Svelte does not. Without `exclude` that
  // id normalises to a positional placeholder on one side and stays a machine
  // reference on the other, on markup that is otherwise identical. Dropping
  // the portalled subtree first puts both sides in the same position: no
  // content element, so both fall back to the machine-id normalisation and
  // agree.
  exclude: '[data-scope="menu"][data-part="positioner"]',
  select: '[data-part="trigger"]',
  cases: [
    { name: "closed" },
    ...(["top", "right", "bottom", "left"] as const).map((side) => ({
      name: `side/${side}`,
      props: { contentProps: { side } },
    })),
    { name: "offsets", props: { contentProps: { sideOffset: 12, alignOffset: 2 } } },
  ],
};

export default spec;
