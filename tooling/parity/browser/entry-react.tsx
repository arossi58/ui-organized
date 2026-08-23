import { createRoot } from "react-dom/client";
import "@ui-organized/tokens/variables.css";
// Each page loads its *own* package's stylesheet rather than a shared one, so a
// package that fails to emit one is a failing gate rather than a silent
// fallback onto another framework's copy.
import "@ui-organized/react/styles";
import { caseFromUrl, mountPoint, signalReady } from "./harness.js";
import { specFor } from "./specs.js";

const { component, props } = caseFromUrl();
createRoot(mountPoint()).render(specFor(component).react(props));
signalReady();
