import { mount } from "svelte";
import App from "./App.svelte";
// The token baseline, and nothing else. No `@ui-organized/svelte/styles.css`:
// that is the whole sheet, and leaving it out is the path this app exists to
// measure. Each component imports its own stylesheet, and the library entry
// imports the typography and base rules they all lean on, so a Button styled
// from this alone is a Button whose CSS arrived by the per-component route.
import "@ui-organized/tokens/variables.css";

mount(App, { target: document.getElementById("root") });
