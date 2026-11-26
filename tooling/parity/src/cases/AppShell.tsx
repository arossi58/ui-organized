import type { ComponentType } from "react";
import {
  AppShell as RAppShell,
  AppHeader as RAppHeader,
  NavItem as RNavItem,
  Sidebar as RSidebar,
} from "@ui-organized/react";
import AppShellFixture from "../fixtures/AppShellFixture.svelte";
import VueAppShellFixture from "../fixtures/vue/AppShellFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * Flags for what JSON cannot carry, fixed in every library: `header` (an
 * AppHeader with `logo`, `nav` and `actions` as set under it), `sidebar` (a
 * Sidebar with two items), and a page paragraph.
 *
 * The server render is what is compared: `auto` is a rail with no
 * `data-layout` there, which is what a hydrating page must match. The sheet's
 * dialog parts are portalled and differ by renderer, so they are excluded, as
 * on the Sheet's own cases.
 */
const spec: ParitySpec = {
  component: "AppShell",
  react: ({ header, sidebar, ...p }) => (
    <RAppShell
      {...(p as any)}
      header={
        header ? (
          <RAppHeader
            logo={header.logo ? <span className="parity-logo">Acme</span> : undefined}
            nav={header.nav ? <span className="parity-nav">Nav</span> : undefined}
            actions={header.actions ? <button type="button">Sign in</button> : undefined}
          />
        ) : undefined
      }
      sidebar={
        sidebar ? (
          <RSidebar>
            <RNavItem label="Reports" />
            <RNavItem label="Settings" />
          </RSidebar>
        ) : undefined
      }
    >
      <p>Page</p>
    </RAppShell>
  ),
  svelte: AppShellFixture as unknown as ComponentType<any>,
  vue: VueAppShellFixture as unknown as ComponentType<any>,
  stylesheets: ["AppShell/AppShell.css"],
  exclude:
    '[data-scope="dialog"][data-part="backdrop"], [data-scope="dialog"][data-part="positioner"]',
  cases: [
    { name: "page only", props: { mainId: "main" } },
    {
      name: "auto, as the server renders it",
      props: { mainId: "main", sidebar: true, header: { logo: true, nav: true, actions: true } },
    },
    {
      name: "rail",
      props: { layout: "rail", mainId: "main", sidebar: true, header: { logo: true, nav: true } },
    },
    {
      name: "sheet",
      props: {
        layout: "sheet",
        mainId: "main",
        sidebar: true,
        header: { logo: true, nav: true, actions: true },
      },
    },
    {
      name: "sheet, no sidebar",
      props: { layout: "sheet", mainId: "main", header: { logo: true } },
    },
    { name: "main scroll", props: { scroll: "main", mainId: "main", sidebar: true } },
    {
      name: "labels",
      props: {
        mainId: "content",
        skipLinkLabel: "Skip to page",
        layout: "sheet",
        sidebar: true,
        header: {},
      },
    },
  ],
};

export default spec;
