import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * Panel content is a plain string throughout, the same fixed point the SSR
 * cases use: "a node" is a ReactNode, a Svelte snippet, a Vue component and an
 * Angular `TemplateRef`, and a string is the one value all four accept
 * unchanged.
 */
const two = [
  { id: "a", content: "A" },
  { id: "b", content: "B" },
];
const three = [...two, { id: "c", content: "C" }];

const scenarios: BrowserScenario[] = [
  ...staticScenarios("Splitter", [
    { name: "default", props: { panels: two } },
    { name: "three panels", props: { panels: three } },
    // Two panels pinned to the same size is how a handle is made inert — there
    // is no `disabled` prop, and this is the path that leaves `aria-valuemin`
    // and `aria-valuemax` equal on the trigger between them.
    {
      name: "pinned panel",
      props: {
        panels: [{ id: "a", content: "A", minSize: 30, maxSize: 30 }, { id: "b", content: "B" }],
      },
    },
    // A handle's range is not its panel's own min and max: it is what the rest
    // of the group leaves free, which is arithmetic each library does for itself.
    {
      name: "min and max",
      props: {
        panels: [{ id: "a", content: "A", minSize: 20, maxSize: 60 }, { id: "b", content: "B" }],
      },
    },
    { name: "default size", props: { panels: three, defaultSize: [20, 50, 30] } },
    // Controlled: the sizes come from the caller rather than from the even
    // split, which is where a library that drops the prop shows up.
    { name: "controlled size", props: { panels: two, size: [70, 30] } },
    ...(["horizontal", "vertical"] as const).map((orientation) => ({
      name: `orientation/${orientation}`,
      props: { panels: two, orientation },
    })),
    { name: "variant/subtle", props: { panels: two, variant: "subtle" } },
  ]),
  {
    component: "Splitter",
    // The whole point of the component, and unreachable without a keypress: the
    // handle reports the new split through `aria-valuenow` and each panel
    // through its own flex basis, so a library whose arithmetic drifts by a
    // percent says so here rather than looking fine and feeling wrong.
    //
    // The click is what focuses the handle — pressed and released in one place,
    // so it starts and ends a drag of zero length and changes nothing.
    name: "resized with the keyboard",
    props: { panels: two },
    steps: [
      { do: "click", target: part("splitter", "resize-trigger") },
      { do: "press", key: "ArrowRight" },
      { do: "wait", target: `${part("splitter", "resize-trigger")}[aria-valuenow="51"]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
