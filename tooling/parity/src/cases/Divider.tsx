import type { ComponentType } from "react";
import { Divider as RDivider } from "@ui-organized/react";
import DividerFixture from "../fixtures/DividerFixture.svelte";
import VueDividerFixture from "../fixtures/vue/DividerFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Divider",
  react: (p) => <RDivider {...p} />,
  svelte: DividerFixture as unknown as ComponentType<any>,
  vue: VueDividerFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "vertical", props: { orientation: "vertical" } },
    ...(["none", "sm", "md", "lg"] as const).map((spacing) => ({
      name: `spacing/${spacing}`,
      props: { spacing },
    })),
  ],
};

export default spec;
