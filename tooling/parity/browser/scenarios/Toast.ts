import { part, type BrowserScenario } from "./scenario.js";

const scenarios: BrowserScenario[] = [
  {
    component: "Toast",
    name: "created",
    props: {
      toasts: [
        { title: "Saved", description: "Your changes are live.", type: "success" },
        { title: "Careful", description: "Check the input.", type: "warning" },
      ],
    },
    steps: [
      { do: "click", target: "#fire" },
      { do: "wait", target: `${part("toast", "root")}[data-state="open"]` },
      /**
       * `data-mounted` lands *after* `data-state="open"`, and waiting only for
       * the state left a gap the capture could fall into: on a cold dev server
       * Vue's module graph loads slowly enough that React had been marked
       * mounted and Vue had not, and the case failed on an attribute that was
       * about to appear. All three do emit it — verified — so waiting for the
       * later of the two is deterministic rather than a retry in disguise.
       */
      { do: "wait", target: `${part("toast", "root")}[data-mounted]` },
    ],
    regions: [part("toast", "group")],
  },
];

export default scenarios;
