/**
 * Release gate for the icon adapters: `pnpm --filter @ui-organized/vue test:smoke`.
 *
 * Three failures this catches that nothing else does.
 *
 * **A renamed upstream export.** The adapters name 55 constants each out of
 * catalogues of thousands, and Lucide in particular renames icons between major
 * versions — seven of ours moved in v1 alone. A build against the installed
 * version catches that, but a consumer resolving a *different* minor gets ESM
 * live bindings, where a missing export is `undefined` rather than an error.
 * `Icon` then renders nothing, for one icon, silently.
 *
 * **A `svgProps` mapping that no longer lands on the SVG.** The three libraries
 * disagree — `size`/`strokeWidth`, `size`/`stroke`, `width`/`height`/`stroke-width`
 * — and none of them errors on a prop it does not recognise; it just draws at
 * its own default weight. Heroicons is the sharp edge: its components declare no
 * props at all, so every value arrives as a fallthrough attribute written to the
 * SVG verbatim, and `strokeWidth` would be silently ignored where `stroke-width`
 * works. So this renders one icon per library at a non-default size and stroke
 * and reads the attributes back off the markup.
 *
 * **A registration that never ran.** Each `icons/*` subpath registers itself as
 * an import side effect; the assertion here is that importing the built entry
 * really does put the set in the registry.
 *
 * It cannot catch the tree-shaking failure — importing a module is precisely
 * what defeats tree shaking — so `sideEffects` in package.json is still on
 * trust. React covers that with `examples/icon-smoke`; a Vue equivalent is worth
 * having and is not this.
 *
 * Reads the registry off its global key rather than through the package's main
 * entry, because `dist/index.js` imports the component stylesheets from
 * @ui-organized/core and plain Node cannot evaluate a `.css` import. The global
 * key is the registry's real storage either way — see src/icons/registry.ts.
 */

import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { CANONICAL_ICON_NAMES } from "@ui-organized/utils";

/** The global key the registry is stored under. See src/icons/registry.ts. */
const REGISTRY_KEY = Symbol.for("@ui-organized/vue.iconRegistry");

const ADAPTERS = [
  { library: "lucide", entry: "../dist/icons/entry-lucide.js" },
  { library: "tabler", entry: "../dist/icons/entry-tabler.js" },
  { library: "heroicons", entry: "../dist/icons/entry-heroicons.js" },
];

/** Size and stroke chosen to match no library's default, so a dropped prop shows. */
const PROBE_SIZE = 33;
const PROBE_STROKE = 1.25;

/**
 * Did `value` reach the SVG as the property `name`?
 *
 * Two spellings because the libraries take two routes: Lucide and Tabler write
 * SVG attributes, Heroicons can only be reached through `style` (see
 * entry-heroicons.ts). Either counts; neither means the prop was dropped.
 */
function applied(markup, name, value) {
  return markup.includes(`${name}="${value}"`) || markup.includes(`${name}:${value}`);
}

const problems = [];

for (const { library, entry } of ADAPTERS) {
  await import(entry);

  const set = globalThis[REGISTRY_KEY]?.get(library);
  if (!set) {
    problems.push(`${library}: importing ${entry} registered nothing`);
    continue;
  }

  for (const name of CANONICAL_ICON_NAMES) {
    if (typeof set.outline[name] !== "function") {
      problems.push(`${library}: outline "${name}" is ${String(set.outline[name])}`);
    }
  }
  for (const [name, component] of Object.entries(set.solid ?? {})) {
    if (typeof component !== "function") {
      problems.push(`${library}: solid "${name}" is ${String(component)}`);
    }
  }

  // Does this adapter's svgProps actually reach the SVG? Only worth asking when
  // there is still a component to render — a missing "check" is already reported
  // above, and rendering `undefined` throws over the top of it.
  const props = set.svgProps(PROBE_SIZE, PROBE_STROKE);
  if (typeof set.outline.check === "function") {
    try {
      const markup = await renderToString(
        createSSRApp({ render: () => h(set.outline.check, props) }),
      );
      if (!applied(markup, "width", PROBE_SIZE)) {
        problems.push(`${library}: svgProps ${JSON.stringify(props)} did not set width`);
      }
      if (!applied(markup, "stroke-width", PROBE_STROKE)) {
        problems.push(`${library}: svgProps ${JSON.stringify(props)} did not set stroke-width`);
      }
    } catch (error) {
      problems.push(`${library}: rendering "check" threw — ${error}`);
    }
  }
}

if (problems.length) {
  console.error(`\nx icon adapters: ${problems.length} problem(s)\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

const summary = ADAPTERS.map(({ library }) => {
  const solid = Object.keys(globalThis[REGISTRY_KEY].get(library).solid ?? {}).length;
  return `${library} ${CANONICAL_ICON_NAMES.length}${solid ? `+${solid} solid` : ""}`;
}).join(", ");
console.log(`✓ icon adapters register real components: ${summary}`);
console.log(`  registered: ${[...globalThis[REGISTRY_KEY].keys()].join(", ")}`);
