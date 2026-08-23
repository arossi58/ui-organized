import type { ComponentType } from "react";
import {
  NavItem as RNavItem,
  NavSubItem as RNavSubItem,
  Sidebar as RSidebar,
} from "@ui-organized/react";
import VueNavigationFixture from "../fixtures/vue/NavigationFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * A whole sidebar rather than an item on its own, because the thing most likely
 * to drift is what the container tells its descendants: `collapsed` travels on
 * context, and an item that ignored it would render a full-width label inside a
 * 56px rail with nothing else wrong.
 *
 * The tree is fixed and the cases vary the container, so every case exercises
 * both a plain item and an expandable one with sub-items.
 */
const spec: ParitySpec = {
  component: "Navigation",
  // React takes the logo and footer as nodes; Vue takes them as slots, and the
  // fixture translates. Same job the gate already does for `className`.
  react: ({ logo, footer, itemProps = {}, ...p }) => (
    <RSidebar logo={logo} footer={footer} {...p}>
      <RNavItem label="Home" icon="check" selected />
      <RNavItem label="Reports" icon="check" {...itemProps}>
        <RNavSubItem label="Weekly" />
        <RNavSubItem label="Monthly" selected />
      </RNavItem>
    </RSidebar>
  ),
  vue: VueNavigationFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "with logo", props: { logo: "Acme" } },
    { name: "with footer", props: { footer: "v1.2.0" } },
    // `collapsible` conjures a footer of its own, so the region appears with no
    // footer content at all.
    { name: "collapsible", props: { collapsible: true } },
    { name: "collapsible with footer", props: { collapsible: true, footer: "v1.2.0" } },
    // Uncontrolled: the initial state both libraries hold in their own local
    // state, and the one an SSR render can still see.
    { name: "default collapsed", props: { collapsible: true, defaultCollapsed: true } },
    // Controlled, which is the case Vue's Boolean-prop cast would break: an
    // absent `collapsed` cast to `false` reads as "controlled and expanded".
    { name: "controlled collapsed", props: { collapsible: true, collapsed: true, logo: "Acme" } },
    { name: "controlled expanded", props: { collapsible: true, collapsed: false } },
    // A collapsed rail has no room for an inline sub-list, so the expandable
    // item loses its caret and its panel.
    {
      name: "collapsed suppresses the sub-list",
      props: { defaultCollapsed: true, itemProps: { defaultExpanded: true } },
    },
    { name: "expanded item", props: { itemProps: { defaultExpanded: true } } },
    { name: "disabled item", props: { itemProps: { disabled: true } } },
    { name: "nav label", props: { navLabel: "Sections" } },
  ],
};

export default spec;
