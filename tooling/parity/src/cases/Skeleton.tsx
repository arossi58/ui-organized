import type { ComponentType } from "react";
import { Skeleton as RSkeleton } from "@ui-organized/react";
import SkeletonFixture from "../fixtures/SkeletonFixture.svelte";
import VueSkeletonFixture from "../fixtures/vue/SkeletonFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Skeleton",
  react: (p) => <RSkeleton {...p} />,
  svelte: SkeletonFixture as unknown as ComponentType<any>,
  vue: VueSkeletonFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    ...(["text", "circle", "rect", "rounded"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { variant },
    })),
    { name: "not animated", props: { animated: false } },
    { name: "sized (number)", props: { width: 120, height: 16 } },
    { name: "sized (string)", props: { width: "50%", height: "1rem" } },
    { name: "multi-line", props: { lines: 3 } },
    { name: "multi-line sized", props: { lines: 4, width: 200 } },
  ],
};

export default spec;
