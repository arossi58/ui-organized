import type { ComponentType } from "react";
import { Tag as RTag } from "@ui-organized/react";
import TagFixture from "../fixtures/TagFixture.svelte";
import VueTagFixture from "../fixtures/vue/TagFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Tag",
  react: (p) => <RTag {...p}>Label</RTag>,
  svelte: TagFixture as unknown as ComponentType<any>,
  vue: VueTagFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    ...(["success", "info", "info-secondary", "caution", "warning", "error"] as const).map(
      (variant) => ({ name: `variant/${variant}`, props: { variant } }),
    ),
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size } })),
    { name: "subdued", props: { emphasized: false } },
  ],
};

export default spec;
