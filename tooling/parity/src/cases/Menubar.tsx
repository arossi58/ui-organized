import type { ComponentType } from "react";
import {
  Menu as RMenu,
  MenuContent as RMenuContent,
  MenuItem as RMenuItem,
  MenuTrigger as RMenuTrigger,
  Menubar as RMenubar,
} from "@ui-organized/react";
import SvelteMenubarFixture from "../fixtures/MenubarFixture.svelte";
import VueMenubarFixture from "../fixtures/vue/MenubarFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * Two real menus in the bar, because the part worth pinning is what the bar
 * does *to* them: a `role="menubar"` may only contain menuitems, so each Ark
 * trigger has to stop being a button and start being one. The bar cannot pass
 * that down — the menus are independent machines — so it travels on context,
 * and this spec is what proves it arrived.
 *
 * The roving tabindex is deliberately not visible here: it is applied from an
 * effect in React and from `onMounted` in Vue, so neither renders a `tabindex`
 * on the server and agreeing about its absence is all static markup can say.
 */
const spec: ParitySpec = {
  component: "Menubar",
  react: (p) => (
    <RMenubar {...p}>
      <RMenu>
        <RMenuTrigger className="menubar__trigger">File</RMenuTrigger>
        <RMenuContent><RMenuItem value="new">New</RMenuItem></RMenuContent>
      </RMenu>
      <RMenu>
        <RMenuTrigger className="menubar__trigger">Edit</RMenuTrigger>
        <RMenuContent><RMenuItem value="undo">Undo</RMenuItem></RMenuContent>
      </RMenu>
    </RMenubar>
  ),
  svelte: SvelteMenubarFixture as unknown as ComponentType<any>,
  vue: VueMenubarFixture as unknown as ComponentType<any>,
  // Ark React renders a portalled menu inline under SSR and Ark Vue teleports
  // it away, so the popups are three different things and none of them is what
  // a user gets. Dropping them puts both sides in the same position — see the
  // longer note in Menu.tsx.
  exclude: '[data-scope="menu"][data-part="positioner"]',
  cases: [
    { name: "default" },
    { name: "vertical", props: { orientation: "vertical" } },
  ],
};

export default spec;
