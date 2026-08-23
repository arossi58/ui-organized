import type { ComponentType } from "react";
import {
  ContextMenu as RContextMenu,
  ContextMenuTrigger as RContextMenuTrigger,
  ContextMenuContent as RContextMenuContent,
  ContextMenuItem as RContextMenuItem,
  ContextMenuSeparator as RContextMenuSeparator,
} from "@ui-organized/react";
import VueContextMenuFixture from "../fixtures/vue/ContextMenuFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "ContextMenu",
  react: ({ contentProps = {}, ...p }) => (
    <RContextMenu {...p}>
      <RContextMenuTrigger>Right-click here</RContextMenuTrigger>
      <RContextMenuContent {...contentProps}>
        <RContextMenuItem value="a">Cut</RContextMenuItem>
        <RContextMenuSeparator />
        <RContextMenuItem value="b" destructive>Delete</RContextMenuItem>
      </RContextMenuContent>
    </RContextMenu>
  ),
  // No Svelte fixture: ContextMenu is not in that package yet.
  vue: VueContextMenuFixture as unknown as ComponentType<any>,
  // Same pairing as Menu.tsx, and for the same reason: dropping the portalled
  // subtree first puts both sides in the same position before the ids are
  // numbered.
  exclude: '[data-scope="menu"][data-part="positioner"]',
  // The trigger here is the right-click *area*, not a button — Ark's own
  // ContextTrigger renders one, and both libraries project it onto a plain div.
  select: '[data-part="context-trigger"]',
  stylesheets: ["ContextMenu/ContextMenu.css"],
  allow: [
    {
      attribute: "data-ownedby",
      reason:
        "The framework-generated machine id, which the contract normalises " +
        "everywhere else. It cannot here: the normaliser recovers a machine id " +
        "by stripping `<scope>:` and `:<part>` off an element's own id, and " +
        "zag spells this element's id `menu:<machine>:ctx-trigger` while its " +
        "part is `context-trigger`. The two ends do not match, so the id is " +
        "left as React's `:R0:` against Vue's `v-0` — a difference that is " +
        "only ever the renderer's id scheme. Nothing selects on it; the " +
        "assertion below is what keeps that true.",
    },
  ],
  cases: [
    { name: "closed" },
    { name: "open", props: { defaultOpen: true } },
    { name: "offsets", props: { contentProps: { sideOffset: 12, alignOffset: 2 } } },
  ],
};

export default spec;
