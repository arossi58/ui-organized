import type { ComponentType } from "react";
import { SectionFooter as RSectionFooter } from "@ui-organized/react";
import SectionFooterFixture from "../fixtures/SectionFooterFixture.svelte";
import VueSectionFooterFixture from "../fixtures/vue/SectionFooterFixture.vue";
import type { ParitySpec } from "./spec.js";

/** `text` stands for the status line and `withActions` for the slot; see PageHeader.tsx. */
const spec: ParitySpec = {
  component: "SectionFooter",
  react: ({ text, withActions, ...p }) => (
    <RSectionFooter
      {...(p as any)}
      actions={withActions ? <button type="button">Next</button> : undefined}
    >
      {text}
    </RSectionFooter>
  ),
  svelte: SectionFooterFixture as unknown as ComponentType<any>,
  vue: VueSectionFooterFixture as unknown as ComponentType<any>,
  stylesheets: ["PageHeader/PageHeader.css"],
  cases: [
    { name: "status line", props: { text: "Showing 1 to 10 of 48" } },
    { name: "actions", props: { withActions: true } },
    { name: "both", props: { text: "Showing 1 to 10 of 48", withActions: true } },
    { name: "divided", props: { text: "Showing 1 to 10 of 48", withActions: true, divided: true } },
  ],
};

export default spec;
