import type { ComponentType } from "react";
import { Tag as RTag } from "@ui-organized/react";
import TagFixture from "../fixtures/TagFixture.svelte";
import VueTagFixture from "../fixtures/vue/TagFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Tag",
  // `removable` stands for the remove handler each library spells its own way
  // (React `onRemove`, Svelte `onremove`, Vue `removable` + `@remove`).
  react: ({ removable, ...p }) => (
    <RTag {...p} onRemove={removable ? () => {} : undefined}>
      Label
    </RTag>
  ),
  svelte: TagFixture as unknown as ComponentType<any>,
  vue: VueTagFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    ...(["success", "info", "info-secondary", "caution", "warning", "error", "brand", "neutral"] as const).map(
      (variant) => ({ name: `variant/${variant}`, props: { variant } }),
    ),
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size } })),
    { name: "subdued", props: { emphasized: false } },
    ...(["solid", "subtle", "outline"] as const).map((appearance) => ({
      name: `appearance/${appearance}`,
      props: { appearance },
    })),
    { name: "appearance beats emphasized", props: { appearance: "outline", emphasized: true } },
    { name: "pill", props: { shape: "pill" } },
    { name: "pill sm", props: { shape: "pill", size: "sm" } },
    { name: "dot", props: { dot: true } },
    { name: "removable", props: { removable: true, removeLabel: "Remove Label" } },
  ],
};

export default spec;
