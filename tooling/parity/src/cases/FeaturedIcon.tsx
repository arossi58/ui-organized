import type { ComponentType } from "react";
import { FeaturedIcon as RFeaturedIcon } from "@ui-organized/react";
import FeaturedIconFixture from "../fixtures/FeaturedIconFixture.svelte";
import VueFeaturedIconFixture from "../fixtures/vue/FeaturedIconFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "FeaturedIcon",
  react: (p) => <RFeaturedIcon icon="check" {...p} />,
  svelte: FeaturedIconFixture as unknown as ComponentType<any>,
  vue: VueFeaturedIconFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default", props: { icon: "check" } },
    ...(["brand", "neutral", "success", "info", "caution", "error"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { icon: "check", variant },
    })),
    ...(["subtle", "solid", "outline"] as const).map((appearance) => ({
      name: `appearance/${appearance}`,
      props: { icon: "check", appearance },
    })),
    ...(["sm", "md", "lg", "xl"] as const).map((size) => ({
      name: `size/${size}`,
      props: { icon: "check", size },
    })),
    { name: "square", props: { icon: "check", shape: "square" } },
    { name: "labelled", props: { icon: "check", label: "Verified" } },
    { name: "custom class", props: { icon: "check", className: "mine" } },
  ],
};

export default spec;
