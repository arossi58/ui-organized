import { mount } from "svelte";
import App from "./App.svelte";
// The documented import order: tokens, then the component library's styles, then
// the table's. Three separate stylesheets, and the third is what this app exists
// to protect — it resolves through @ui-organized/svelte-table's `exports` map to
// a file that physically lives in @ui-organized/table-core's dist.
import "@ui-organized/tokens/variables.css";
import "@ui-organized/svelte/styles";
import "@ui-organized/svelte-table/styles";
// A real consumer registers exactly one icon set; the table's sort affordance is
// the only icon it renders.
import "@ui-organized/svelte/icons/lucide";

mount(App, { target: document.getElementById("root") });
