import type { ComponentType } from "react";
import { NavProvider as RNavProvider, NavSubItem as RNavSubItem } from "@ui-organized/react";
import NavSubItemFixture from "../fixtures/NavSubItemFixture.svelte";
import VueNavSubItemFixture from "../fixtures/vue/NavSubItemFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * A sub-page button placed on its own, rather than inside a `NavItem`'s list.
 *
 * `Navigation` already compares the list form, and deliberately cannot reach
 * this one: an item suppresses its whole sub-list on a collapsed rail, so
 * `nav-sub-item--collapsed` and the `title` that stands in for the hidden label
 * are unreachable there in all four libraries. Placed by hand they are not, and
 * they are the two things a port is most likely to drop — nothing else about a
 * collapsed sub-item looks wrong.
 *
 * Wrapped in a provider throughout, because the interesting question is which of
 * the two rails wins: an explicit `collapsed` overrides the surrounding one in
 * both directions, and `??` rather than `||` is what makes an explicit `false`
 * mean something.
 */
const spec: ParitySpec = {
  component: "NavSubItem",
  react: ({ rail, ...p }) => (
    <RNavProvider collapsed={rail}>
      <RNavSubItem label="Weekly" {...p} />
    </RNavProvider>
  ),
  svelte: NavSubItemFixture as unknown as ComponentType<any>,
  vue: VueNavSubItemFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "selected", props: { selected: true } },
    { name: "disabled", props: { disabled: true } },
    { name: "with icon", props: { icon: "check" } },
    { name: "collapsed by the rail", props: { rail: true } },
    { name: "collapsed by itself", props: { collapsed: true } },
    // The case `||` would get wrong: an explicit `false` has to beat the rail.
    { name: "expanded against the rail", props: { rail: true, collapsed: false } },
    { name: "collapsed and selected", props: { rail: true, selected: true, icon: "check" } },
  ],
};

export default spec;
