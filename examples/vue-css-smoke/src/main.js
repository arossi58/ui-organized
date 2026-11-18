import { createApp, h } from "vue";
import { Button, Input } from "@ui-organized/vue";
// The token baseline, and nothing else. No `@ui-organized/vue/styles.css`: that
// is the whole sheet, and leaving it out is the path this app exists to
// measure. Each component module imports its own stylesheet, and the library
// entry imports the typography and base rules they all lean on, so a Button
// and an Input styled from this alone arrived by the per-component route.
import "@ui-organized/tokens/variables.css";

createApp({
  render: () =>
    h("main", [h(Button, { intent: "primary" }, () => "Save"), h(Input, { label: "Email" })]),
}).mount("#root");
