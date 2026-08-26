/**
 * The Svelte page.
 *
 * `spec.svelte` is a fixture component rather than the library component itself.
 * That is not a shortcut: several components take children, and a snippet cannot
 * be written by hand outside a component — so a fixture is what a consumer
 * writes too. It is also what both gates render, which is the point.
 */
import { mount } from "svelte";
import "@ui-organized/tokens/variables.css";
import "@ui-organized/svelte/styles.css";
import "./shell.css";
import { registerIconSet } from "@ui-organized/svelte";
import { lucideIcons } from "@ui-organized/svelte/icons/lucide";
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
 * So a bare `import "@ui-organized/svelte/icons/lucide"` is not enough: whether
 * the real set or the stub survives comes down to which import statement is
 * written second, which is exactly the kind of thing a formatter reorders. This
 * registers explicitly, after module initialisation, where the order is stated
 * rather than inferred.
 *
 * Without it every icon on the page is an empty `<svg>` — no chevrons on
 * selects, no glass on search, no eye on the password toggle.
 */
registerIconSet(lucideIcons);

const shipped = CATALOGUE.filter((e) => e.spec.svelte).length;
const grid = renderShell("svelte", shipped);

for (const entry of CATALOGUE) {
  const fixture = entry.spec.svelte;
  if (!fixture) {
    missing(grid, entry, "svelte");
    continue;
  }
  const body = card(grid, entry);
  try {
    // The gate rewrites `className` to `class` for every non-React library, and
    // the fixtures are written expecting that. Doing it here too keeps a card
    // from rendering unclassed where the gate's version is styled.
    const { className, ...rest } = entry.props as Record<string, unknown>;
    const props = { ...rest, ...(className ? { class: className } : {}) };
    mount(fixture as never, { target: body, props });
  } catch (error) {
    failed(body, error);
  }
}

for (const { name, reason } of UNPREVIEWABLE) unpreviewable(grid, name, reason);
