import { createApp } from "vue";
import "@ui-organized/tokens/variables.css";
import "@ui-organized/vue/styles.css";
import { caseFromUrl, mountPoint, signalReady } from "./harness.js";
import { specFor } from "./specs.js";

const { component, props } = caseFromUrl();
const mount = mountPoint();
createApp(specFor(component).vue as never, props).mount(mount);

/**
 * `mount()` stamps `data-v-app` on the element it took over. That marks the
 * harness's own mount node, not anything a component rendered, so leaving it
 * would report a difference on every single Vue scenario — the one attribute
 * guaranteed never to be the bug.
 */
mount.removeAttribute("data-v-app");

signalReady();
