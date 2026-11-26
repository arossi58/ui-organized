import type { ComponentType } from "react";
import { AvatarLabel as RAvatarLabel } from "@ui-organized/react";
import AvatarLabelFixture from "../fixtures/AvatarLabelFixture.svelte";
import VueAvatarLabelFixture from "../fixtures/vue/AvatarLabelFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "AvatarLabel",
  react: ({ name, ...p }) => <RAvatarLabel name={name as string} {...p} />,
  svelte: AvatarLabelFixture as unknown as ComponentType<any>,
  vue: VueAvatarLabelFixture as unknown as ComponentType<any>,
  cases: [
    { name: "name", props: { name: "Ada Lovelace" } },
    { name: "description", props: { name: "Ada Lovelace", description: "ada@example.com" } },
    ...(["sm", "lg", "xl"] as const).map((size) => ({
      name: `size/${size}`,
      props: { name: "Ada Lovelace", description: "ada@example.com", size },
    })),
    // The hidden avatar's badges are repeated after the name as words.
    { name: "status", props: { name: "Ada Lovelace", status: "online" } },
    { name: "status + verified", props: { name: "Ada Lovelace", status: "away", verified: true } },
    { name: "image", props: { name: "Ada Lovelace", src: "/a.png" } },
  ],
};

export default spec;
