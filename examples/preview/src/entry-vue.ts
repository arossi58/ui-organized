/**
 * The Vue page.
 *
 * One app per card rather than one app rendering 67 children, for the reason the
 * React entry gives: Vue tears down the whole app on an unhandled error during
 * mount, so a single app would let one bad component blank the page.
 */
import { createApp } from "vue";
import "@ui-organized/tokens/variables.css";
import "@ui-organized/vue/styles.css";
import "./shell.css";
import { registerIconSet } from "@ui-organized/vue";
import { lucideIcons } from "@ui-organized/vue/icons/lucide";
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
 * So a bare `import "@ui-organized/vue/icons/lucide"` is not enough: whether
 * the real set or the stub survives comes down to which import statement is
 * written second, which is exactly the kind of thing a formatter reorders. This
 * registers explicitly, after module initialisation, where the order is stated
 * rather than inferred.
 *
 * Without it every icon on the page is an empty `<svg>` — no chevrons on
 * selects, no glass on search, no eye on the password toggle.
 */
registerIconSet(lucideIcons);

const shipped = CATALOGUE.filter((e) => e.spec.vue).length;
const grid = renderShell("vue", shipped);

for (const entry of CATALOGUE) {
  const fixture = entry.spec.vue;
  if (!fixture) {
    missing(grid, entry, "vue");
    continue;
  }
  const body = card(grid, entry);
  try {
    const { className, ...rest } = entry.props as Record<string, unknown>;
    const props = { ...rest, ...(className ? { class: className } : {}) };
    const app = createApp(fixture as never, props);
    // Without this Vue logs the error and leaves an empty card, which reads as
    // "this component renders nothing" rather than "this component failed".
    app.config.errorHandler = (error) => failed(body, error);
    app.mount(body);
  } catch (error) {
    failed(body, error);
  }
}

for (const { name, reason } of UNPREVIEWABLE) unpreviewable(grid, name, reason);
