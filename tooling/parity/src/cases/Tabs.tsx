import type { ComponentType } from "react";
import { Tabs as RTabs } from "@ui-organized/react";
import TabsFixture from "../fixtures/TabsFixture.svelte";
import VueTabsFixture from "../fixtures/vue/TabsFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Tabs",
  react: (p) => <RTabs {...(p as any)} />,
  svelte: TabsFixture as unknown as ComponentType<any>,
  vue: VueTabsFixture as unknown as ComponentType<any>,
  stylesheets: ["Tabs/Tabs.css"],
  allow: [
    {
      attribute: "data-state",
      reason:
        "@ark-ui/svelte is on 5.24 while @ark-ui/react is on 5.37, and the " +
        "tab panel gained data-state=open|closed in between. Tabs.css styles " +
        "the panel on [hidden] and [data-selected], both of which Svelte does " +
        "emit, so nothing renders differently. Remove this once the Svelte " +
        "package catches up — the assertion below fails the moment Tabs.css " +
        "starts selecting on data-state.",
    },
  ],
  cases: (() => {
    // String labels and content, because React takes ReactNode here and Svelte
    // takes a string-or-snippet union; strings are the shape both accept.
    const tabs = [
      { value: "one", label: "One", content: "First" },
      { value: "two", label: "Two", content: "Second" },
      { value: "three", label: "Three", content: "Third", disabled: true },
    ];
    return [
      { name: "default", props: { tabs } },
      { name: "second selected", props: { tabs, defaultValue: "two" } },
      { name: "vertical", props: { tabs, orientation: "vertical" } },
      { name: "small", props: { tabs, size: "small" } },
      // Numeric values are coerced at the zag boundary in both libraries.
      {
        name: "numeric values",
        props: {
          tabs: [
            { value: 1, label: "One", content: "First" },
            { value: 2, label: "Two", content: "Second" },
          ],
        },
      },
    ];
  })(),
};

export default spec;
