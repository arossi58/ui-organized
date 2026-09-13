import { createRoot } from "react-dom/client";
import "@ui-organized/tokens/variables.css";
import "./harness.css";
// Each page loads its *own* package's stylesheet rather than a shared one, so a
// package that fails to emit one is a failing gate rather than a silent
// fallback onto another framework's copy.
import "@ui-organized/react/styles";
// The table ships its stylesheet separately, the way a consumer imports it:
// tokens, then the component library, then the table. Without this the
// DataTable scenarios were compared *unstyled* — which the DOM gate could not
// notice, since it captures `data-` and `aria-` attributes and not `style`,
// and the virtualizer's spacer heights live in inline styles.
import "@ui-organized/react-table/styles";
import { caseFromUrl, mountPoint, signalReady } from "./harness.js";
import { specFor } from "./specs.js";

const { component, props } = caseFromUrl();
createRoot(mountPoint()).render(specFor(component).react(props));
signalReady();
