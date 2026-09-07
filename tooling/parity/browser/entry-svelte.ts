import { mount } from "svelte";
import "@ui-organized/tokens/variables.css";
import "./harness.css";
import "@ui-organized/svelte/styles.css";
// The table ships its stylesheet separately, the way a consumer imports it:
// tokens, then the component library, then the table. Without this the
// DataTable scenarios were compared *unstyled* — which the DOM gate could not
// notice, since it captures `data-` and `aria-` attributes and not `style`,
// and the virtualizer's spacer heights live in inline styles.
import "@ui-organized/svelte-table/styles";
import { caseFromUrl, mountPoint, signalReady } from "./harness.js";
import { specFor } from "./specs.js";

const { component, props } = caseFromUrl();
const fixture = specFor(component).svelte;
if (!fixture) throw new Error(`parity harness: Svelte has no ${component} — the scenario should skip it`);
mount(fixture as never, { target: mountPoint(), props });
signalReady();
