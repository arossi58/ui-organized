import { createApp } from "vue";
import "@ui-organized/tokens/variables.css";
import "./harness.css";
import "@ui-organized/vue/styles.css";
// The table ships its stylesheet separately, the way a consumer imports it:
// tokens, then the component library, then the table. Without this the
// DataTable scenarios were compared *unstyled* — which the DOM gate could not
// notice, since it captures `data-` and `aria-` attributes and not `style`,
// and the virtualizer's spacer heights live in inline styles.
import "@ui-organized/vue-table/styles";
import { caseFromUrl, mountPoint, signalReady } from "./harness.js";
import { specFor } from "./specs.js";

const { component, props } = caseFromUrl();
const mount = mountPoint();
const fixture = specFor(component).vue;
if (!fixture) throw new Error(`parity harness: Vue has no ${component} — the scenario should skip it`);
createApp(fixture as never, props).mount(mount);

/**
 * `mount()` stamps `data-v-app` on the element it took over. That marks the
 * harness's own mount node, not anything a component rendered, so leaving it
 * would report a difference on every single Vue scenario — the one attribute
 * guaranteed never to be the bug.
 */
mount.removeAttribute("data-v-app");

signalReady();
