import type { ComponentType } from "react";
import { Button as RButton } from "@ui-organized/react";
import ButtonFixture from "../fixtures/ButtonFixture.svelte";
import VueButtonFixture from "../fixtures/vue/ButtonFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Button",
  // `iconOnly` branches outside the component — see ButtonFixture.svelte.
  react: ({ iconOnly, ...p }) =>
    iconOnly ? <RButton {...p} /> : <RButton {...p}>Label</RButton>,
  svelte: ButtonFixture as unknown as ComponentType<any>,
  vue: VueButtonFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    ...(["primary", "secondary", "tertiary", "ghost", "destructive", "destructive-ghost", "link", "link-neutral"] as const).flatMap(
      (intent) => SIZES.map((size) => ({ name: `${intent}/${size}`, props: { intent, size } })),
    ),
    { name: "disabled", props: { disabled: true } },
    { name: "submit", props: { type: "submit" } },
    { name: "custom class", props: { className: "mine" } },
    { name: "aria-label", props: { "aria-label": "Save" } },
    // Busy rather than disabled; the spinner takes the icon's slot, or the lead.
    { name: "loading", props: { loading: true } },
    { name: "loading icon right", props: { loading: true, icon: "check", iconPosition: "right" } },
    { name: "loading icon only", props: { loading: true, icon: "check", iconOnly: true } },
    { name: "href", props: { href: "/docs" } },
    { name: "href target", props: { href: "/docs", target: "_blank", rel: "noreferrer" } },
    { name: "href disabled", props: { href: "/docs", disabled: true } },
    { name: "href loading", props: { href: "/docs", loading: true } },
  ],
};

export default spec;
