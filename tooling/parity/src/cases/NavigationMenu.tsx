import type { ComponentType } from "react";
import {
  NavigationMenu as RNavigationMenu,
  NavigationMenuItem as RNavigationMenuItem,
  NavigationMenuLink as RNavigationMenuLink,
} from "@ui-organized/react";
import NavigationMenuFixture from "../fixtures/NavigationMenuFixture.svelte";
import VueNavigationMenuFixture from "../fixtures/vue/NavigationMenuFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * A menu is a tree, so the cases describe it as data and each fixture builds
 * it: `items`, each either a trigger with `links` for its panel, a link in the
 * bar (`href`), or `router`, an item whose only child is a NavigationMenuLink
 * in each library's router form (React `render`, Vue `as`; Svelte has none and
 * passes `href`), all to "/router".
 */
export interface ParityNavLink {
  href: string;
  title: string;
  icon?: string;
  description?: string;
  current?: boolean;
}
export interface ParityNavItem {
  value: string;
  label?: string;
  href?: string;
  current?: boolean;
  disabled?: boolean;
  columns?: 1 | 2 | 3;
  links?: ParityNavLink[];
  router?: boolean;
}

const PRODUCT: ParityNavItem = {
  value: "product",
  label: "Product",
  links: [
    { href: "/reports", title: "Reports", icon: "info", description: "Charts of every metric." },
    { href: "/alerts", title: "Alerts", description: "Hear about changes as they happen." },
  ],
};
const PRICING: ParityNavItem = { value: "pricing", label: "Pricing", href: "/pricing" };

const spec: ParitySpec = {
  component: "NavigationMenu",
  react: ({ items, ...root }) => (
    <RNavigationMenu {...(root as any)}>
      {(items as ParityNavItem[]).map(({ links, router, ...item }) =>
        router ? (
          <RNavigationMenuItem key={item.value} value={item.value}>
            {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- the link's
                children are projected into it; text here would replace them. */}
            <RNavigationMenuLink render={<a href="/router" />}>{item.label}</RNavigationMenuLink>
          </RNavigationMenuItem>
        ) : (
          <RNavigationMenuItem key={item.value} {...item}>
            {links?.map(({ title, ...link }) => (
              <RNavigationMenuLink key={link.href} {...link}>
                {title}
              </RNavigationMenuLink>
            ))}
          </RNavigationMenuItem>
        ),
      )}
    </RNavigationMenu>
  ),
  svelte: NavigationMenuFixture as unknown as ComponentType<any>,
  vue: VueNavigationMenuFixture as unknown as ComponentType<any>,
  stylesheets: ["NavigationMenu/NavigationMenu.css"],
  cases: [
    { name: "trigger and link", props: { "aria-label": "Main", items: [PRODUCT, PRICING] } },
    {
      name: "current page",
      props: {
        items: [
          {
            ...PRODUCT,
            links: [{ ...PRODUCT.links![0]!, current: true }, PRODUCT.links![1]!],
          },
          { ...PRICING, current: true },
        ],
      },
    },
    { name: "columns", props: { items: [{ ...PRODUCT, columns: 2 }] } },
    { name: "disabled trigger", props: { items: [{ ...PRODUCT, disabled: true }, PRICING] } },
    { name: "open by default", props: { defaultValue: "product", items: [PRODUCT, PRICING] } },
    {
      name: "router link",
      props: { items: [PRODUCT, { value: "docs", label: "Docs", router: true }] },
    },
  ],
};

export default spec;
