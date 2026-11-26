import type { ComponentType } from "react";
import { Avatar as RAvatar } from "@ui-organized/react";
import AvatarFixture from "../fixtures/AvatarFixture.svelte";
import VueAvatarFixture from "../fixtures/vue/AvatarFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Avatar",
  react: (p) => <RAvatar {...p} />,
  svelte: AvatarFixture as unknown as ComponentType<any>,
  vue: VueAvatarFixture as unknown as ComponentType<any>,
  cases: [
    { name: "initials from name", props: { name: "Ada Lovelace" } },
    { name: "single name", props: { name: "Ada" } },
    ...(["xs", "sm", "md", "lg", "xl"] as const).map((size) => ({
      name: `size/${size}`,
      props: { size, name: "Ada Lovelace" },
    })),
    ...(["circle", "rounded", "square"] as const).map((shape) => ({
      name: `shape/${shape}`,
      props: { shape, name: "Ada Lovelace" },
    })),
    { name: "with image", props: { src: "/a.png", name: "Ada Lovelace" } },
    ...(["online", "away", "busy", "offline"] as const).map((status) => ({
      name: `status/${status}`,
      props: { name: "Ada Lovelace", status },
    })),
    { name: "status label", props: { name: "Ada Lovelace", status: "busy", statusLabel: "In a meeting" } },
    { name: "verified", props: { name: "Ada Lovelace", verified: true } },
    { name: "status + verified", props: { name: "Ada Lovelace", size: "lg", status: "online", verified: true } },
  ],
};

export default spec;
