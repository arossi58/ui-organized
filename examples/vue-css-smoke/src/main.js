import { createApp, h } from "vue";
import { Button } from "@ui-organized/vue";
// The token baseline, and nothing else. No `@ui-organized/vue/styles.css`: that
// is the whole sheet, and leaving it out is the path this app exists to
// measure. Each component module imports its own stylesheet, and the library
// entry imports the typography and base rules they all lean on, so a Button
// styled from this alone is a Button whose CSS arrived by the per-component
// route.
import "@ui-organized/tokens/variables.css";

createApp({
  render: () => h("main", [h(Button, { intent: "primary" }, () => "Save")]),
}).mount("#root");
