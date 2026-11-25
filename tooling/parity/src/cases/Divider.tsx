import type { ComponentType } from "react";
import { Divider as RDivider } from "@ui-organized/react";
import DividerFixture from "../fixtures/DividerFixture.svelte";
import VueDividerFixture from "../fixtures/vue/DividerFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Divider",
  // `label` stands for the children: text or a control between two rules.
  react: ({ label, ...p }) => <RDivider {...p}>{label as string | undefined}</RDivider>,
  svelte: DividerFixture as unknown as ComponentType<any>,
  vue: VueDividerFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    { name: "vertical", props: { orientation: "vertical" } },
    ...(["none", "sm", "md", "lg"] as const).map((spacing) => ({
      name: `spacing/${spacing}`,
      props: { spacing },
    })),
    { name: "labelled", props: { label: "or" } },
    ...(["start", "end"] as const).map((labelPosition) => ({
      name: `labelled/${labelPosition}`,
      props: { label: "Today", labelPosition },
    })),
    { name: "labelled spacing", props: { label: "or", spacing: "md" } },
  ],
};

export default spec;
