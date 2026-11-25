import type { ComponentType } from "react";
import { TagGroup as RTagGroup } from "@ui-organized/react";
import TagGroupFixture from "../fixtures/TagGroupFixture.svelte";
import VueTagGroupFixture from "../fixtures/vue/TagGroupFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "TagGroup",
  react: ({ tag, ...p }) => (
    <RTagGroup tag={tag as string} {...p}>
      Message
    </RTagGroup>
  ),
  svelte: TagGroupFixture as unknown as ComponentType<any>,
  vue: VueTagGroupFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default", props: { tag: "New" } },
    ...(["brand", "neutral", "success", "info", "info-secondary", "caution", "error"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { tag: "New", variant },
    })),
    { name: "size/lg", props: { tag: "New", size: "lg" } },
    { name: "trailing", props: { tag: "New", tagPosition: "trailing" } },
    { name: "href", props: { tag: "New", href: "/changelog" } },
    { name: "href trailing lg", props: { tag: "New", href: "/changelog", tagPosition: "trailing", size: "lg" } },
    { name: "icon", props: { tag: "New", icon: "check" } },
    { name: "custom class", props: { tag: "New", className: "mine" } },
  ],
};

export default spec;
