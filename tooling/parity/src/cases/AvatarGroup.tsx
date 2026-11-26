import type { ComponentType } from "react";
import { AvatarGroup as RAvatarGroup } from "@ui-organized/react";
import AvatarGroupFixture from "../fixtures/AvatarGroupFixture.svelte";
import VueAvatarGroupFixture from "../fixtures/vue/AvatarGroupFixture.vue";
import type { ParitySpec } from "./spec.js";

const MEMBERS = [{ name: "Ada Lovelace" }, { name: "Grace Hopper" }, { name: "Alan Turing" }, { name: "Katherine Johnson" }, { name: "Edsger Dijkstra" }];

const spec: ParitySpec = {
  component: "AvatarGroup",
  react: ({ items, ...p }) => <RAvatarGroup items={items as typeof MEMBERS} {...p} />,
  svelte: AvatarGroupFixture as unknown as ComponentType<any>,
  vue: VueAvatarGroupFixture as unknown as ComponentType<any>,
  cases: [
    { name: "all", props: { items: MEMBERS } },
    { name: "max", props: { items: MEMBERS, max: 3 } },
    { name: "max equals count", props: { items: MEMBERS, max: 5 } },
    { name: "labelled", props: { items: MEMBERS, max: 4, label: "Project members" } },
    ...(["xs", "sm", "lg", "xl"] as const).map((size) => ({ name: `size/${size}`, props: { items: MEMBERS, max: 3, size } })),
    { name: "rounded", props: { items: MEMBERS, shape: "rounded", max: 3 } },
    { name: "fallback text", props: { items: [{ name: "Ada Lovelace", fallback: "AL" }, { name: "Team" }] } },
  ],
};

export default spec;
