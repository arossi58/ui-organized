import { mount } from "svelte";
import "@ui-organized/tokens/variables.css";
import "@ui-organized/svelte/styles.css";
import { caseFromUrl, mountPoint, signalReady } from "./harness.js";
import { specFor } from "./specs.js";

const { component, props } = caseFromUrl();
const fixture = specFor(component).svelte;
if (!fixture) throw new Error(`parity harness: Svelte has no ${component} — the scenario should skip it`);
mount(fixture as never, { target: mountPoint(), props });
signalReady();
