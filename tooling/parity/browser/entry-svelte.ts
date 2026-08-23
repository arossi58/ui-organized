import { mount } from "svelte";
import "@ui-organized/tokens/variables.css";
import "@ui-organized/svelte/styles.css";
import { caseFromUrl, mountPoint, signalReady } from "./harness.js";
import { specFor } from "./specs.js";

const { component, props } = caseFromUrl();
mount(specFor(component).svelte as never, { target: mountPoint(), props });
signalReady();
