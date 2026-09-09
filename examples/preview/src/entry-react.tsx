/**
 * The React page.
 *
 * React is the only library that ships all 67, so nothing here renders a gap —
 * the `missing` branch stays anyway, because "React is complete" is a fact about
 * today rather than a property of this file.
 */
import { createRoot } from "react-dom/client";
import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles.css";
import "./shell.css";
import { registerIconSet } from "@ui-organized/react";
import { lucideIcons } from "@ui-organized/react/icons/lucide";
import {
  CATALOGUE,
  UNPREVIEWABLE,
  card,
  failed,
  missing,
  renderShell,
  unpreviewable,
} from "./shell.js";

/**
 * A real icon library, registered after the catalogue has loaded.
 *
 * Order is the whole point. Importing the catalogue pulls in every case module,
 * and one of them registers the parity suite's *stub* icon set — a fake library
 * that renders `<svg data-size data-stroke>` and nothing visible, because the
 * gate compares the numbers our adapters compute rather than Lucide's artwork.
 * It claims `library: "lucide"`, and `registerIconSet` is last-write-wins.
 *
 * So a bare `import "@ui-organized/react/icons/lucide"` is not enough: whether
 * the real set or the stub survives comes down to which import statement is
 * written second, which is exactly the kind of thing a formatter reorders. This
 * registers explicitly, after module initialisation, where the order is stated
 * rather than inferred.
 *
 * Without it every icon on the page is an empty `<svg>` — no chevrons on
 * selects, no glass on search, no eye on the password toggle.
 */
registerIconSet(lucideIcons);

const shipped = CATALOGUE.filter((e) => e.spec.react).length;
const grid = renderShell("react", shipped);

for (const entry of CATALOGUE) {
  if (!entry.spec.react) {
    missing(grid, entry, "react");
    continue;
  }
  const body = card(grid, entry);
  try {
    // A root per card, so a component that throws during render takes down its
    // own card and not the page. React unmounts the whole tree on an uncaught
    // render error, which with one shared root would mean one bad component
    // blanking all 67.
    createRoot(body).render(entry.spec.react(entry.props));
  } catch (error) {
    failed(body, error);
  }
}

for (const { name, reason } of UNPREVIEWABLE) unpreviewable(grid, name, reason);
