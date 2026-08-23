import type { ComponentType } from "react";
import { Splitter as RSplitter } from "@ui-organized/react";
import SplitterFixture from "../fixtures/SplitterFixture.svelte";
import VueSplitterFixture from "../fixtures/vue/SplitterFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * Panel content is plain strings throughout.
 *
 * The same props object reaches all three libraries, and "a node" is spelled
 * three different ways — a ReactNode, a Svelte snippet, a Vue component. A
 * string is the one value all three accept unchanged, so the cases can state it
 * once and still compare the wrapper each library builds around it.
 */
const spec: ParitySpec = {
  component: "Splitter",
  react: (p) => <RSplitter {...(p as any)} />,
  svelte: SplitterFixture as unknown as ComponentType<any>,
  vue: VueSplitterFixture as unknown as ComponentType<any>,
  cases: (() => {
    const two = [
      { id: "a", content: "A" },
      { id: "b", content: "B" },
    ];
    const three = [...two, { id: "c", content: "C" }];
    return [
      { name: "default", props: { panels: two } },
      { name: "three panels", props: { panels: three } },
      // Two panels pinned to the same size is how a handle is made inert —
      // there is no `disabled` prop, and this is the path that produces
      // `data-disabled` on the trigger between them.
      {
        name: "pinned panel disables its handle",
        props: { panels: [{ id: "a", content: "A", minSize: 30, maxSize: 30 }, { id: "b", content: "B" }] },
      },
      { name: "min and max", props: { panels: [{ id: "a", content: "A", minSize: 20, maxSize: 60 }, { id: "b", content: "B" }] } },
      { name: "collapsible", props: { panels: [{ id: "a", content: "A", collapsible: true, collapsedSize: 5 }, { id: "b", content: "B" }] } },
      { name: "default size", props: { panels: three, defaultSize: [20, 50, 30] } },
      // Controlled: the sizes come from the caller rather than the machine's
      // even split, which is where a framework that drops the prop shows up.
      { name: "controlled size", props: { panels: two, size: [70, 30] } },
      { name: "empty content", props: { panels: [{ id: "a" }, { id: "b" }] } },
      ...(["horizontal", "vertical"] as const).map((orientation) => ({
        name: `orientation/${orientation}`,
        props: { panels: two, orientation },
      })),
      ...(["default", "subtle"] as const).map((variant) => ({
        name: `variant/${variant}`,
        props: { panels: two, variant },
      })),
      { name: "custom class", props: { panels: two, className: "mine" } },
    ];
  })(),
  stylesheets: ["Splitter/Splitter.css"],
};

export default spec;
