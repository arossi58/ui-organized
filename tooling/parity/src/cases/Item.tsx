import type { ComponentType } from "react";
import { Item as RItem } from "@ui-organized/react";
import ItemFixture from "../fixtures/ItemFixture.svelte";
import VueItemFixture from "../fixtures/vue/ItemFixture.vue";
import type { ParitySpec } from "./spec.js";

const BASE = { title: "Weekly digest", description: "A summary of your activity." };

/**
 * Flags for what JSON props cannot carry, fixed in every library: `media` (a
 * span), `actions` (a button), and `router`, each library's router-link form
 * (React `linkRender`, Vue `linkAs`, Angular `a[uioItemLink]`; Svelte has
 * none, so its fixture passes `href`), all to "/router".
 */
const spec: ParitySpec = {
  component: "Item",
  react: ({ media, actions, router, ...p }) => (
    <RItem
      {...(p as any)}
      media={media ? <span className="parity-media">AB</span> : undefined}
      actions={actions ? <button type="button">Edit</button> : undefined}
      // Item replaces the link's children with the title; this text never renders.
      linkRender={router ? <a href="/router">link</a> : undefined}
    />
  ),
  svelte: ItemFixture as unknown as ComponentType<any>,
  vue: VueItemFixture as unknown as ComponentType<any>,
  stylesheets: ["Item/Item.css"],
  cases: [
    { name: "title", props: { title: "Weekly digest" } },
    { name: "description", props: BASE },
    { name: "icon", props: { ...BASE, icon: "info" } },
    { name: "media overrides icon", props: { ...BASE, icon: "info", media: true } },
    { name: "actions", props: { ...BASE, actions: true } },
    { name: "href", props: { ...BASE, href: "/settings", actions: true } },
    {
      name: "href with target",
      props: { ...BASE, href: "https://example.com", target: "_blank", rel: "noopener" },
    },
    { name: "router link", props: { ...BASE, router: true } },
    { name: "outline", props: { ...BASE, variant: "outline" } },
    { name: "muted sm", props: { ...BASE, variant: "muted", size: "sm", icon: "info" } },
    { name: "heading", props: { ...BASE, headingLevel: 3, href: "/settings" } },
    {
      name: "ids",
      props: { ...BASE, titleId: "digest-title", descriptionId: "digest-description" },
    },
  ],
};

export default spec;
