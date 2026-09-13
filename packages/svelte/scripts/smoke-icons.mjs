/**
 * Release gate for the icon adapters: `pnpm --filter @ui-organized/svelte test:smoke`.
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
 * **A `svgProps` mapping that no longer lands on the SVG.** Tabler wants
 * `stroke` where Lucide wants `strokeWidth`, and neither errors on a prop it
 * does not recognise — it just draws at its own default weight. So this renders
 * one icon per library at a non-default size and stroke and reads the attributes
 * back off the markup. Nothing short of rendering answers that.
 *
 * **A registration that never ran.** Each `icons/*` subpath registers itself as
 * an import side effect; the assertion here is that importing the built entry
 * really does put the set in the registry.
 *
 * It cannot catch the tree-shaking failure — importing a module is precisely
 * what defeats tree shaking — so `sideEffects` in package.json is still on
 * trust. React covers that with `examples/icon-smoke`; a Svelte equivalent is
 * worth having and is not this.
 *
 * Runs through Vite rather than plain Node because the icon packages ship
 * `.svelte` source: there is no built artifact to import, and the component a
 * consumer gets is whatever their own Svelte compiler produces from it. Vite's
 * SSR loader compiles exactly that way, so this checks the same value they get.
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { CANONICAL_ICON_NAMES } from "@ui-organized/utils";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

/** The global key the registry is stored under. See src/lib/icons/registry.ts. */
const REGISTRY_KEY = Symbol.for("@ui-organized/svelte.iconRegistry");

const ADAPTERS = [
  { library: "lucide", entry: "/dist/icons/entry-lucide.js", pkg: "@lucide/svelte" },
  { library: "tabler", entry: "/dist/icons/entry-tabler.js", pkg: "@tabler/icons-svelte" },
];

/** Size and stroke chosen to match no library's default, so a dropped prop shows. */
const PROBE_SIZE = 33;
const PROBE_STROKE = 1.25;

const problems = [];

const server = await createServer({
  configFile: false,
  root,
  logLevel: "error",
  server: { middlewareMode: true, hmr: false },
  plugins: [svelte({ configFile: false })],
  // The icon packages are `.svelte` source, so Vite has to compile them rather
  // than hand them to Node.
  ssr: { noExternal: ADAPTERS.map((a) => a.pkg) },
});

try {
  // Through Vite, not Node: the compiled components reach Svelte's server
  // runtime through Vite's module graph, and a `render` imported any other way
  // is a second instance of it with its own component context — every render
  // then dies on `lifecycle_outside_component`.
  const { render } = await server.ssrLoadModule("svelte/server");

  for (const { library, entry } of ADAPTERS) {
    await server.ssrLoadModule(entry);

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

    // Does this adapter's svgProps actually reach the SVG? Only worth asking
    // when there is still a component to render — a missing "check" is already
    // reported above, and rendering `undefined` throws over the top of it.
    const props = set.svgProps(PROBE_SIZE, PROBE_STROKE);
    if (typeof set.outline.check === "function") {
      try {
        const { body } = render(set.outline.check, { props });
        if (!body.includes(`width="${PROBE_SIZE}"`)) {
          problems.push(`${library}: svgProps ${JSON.stringify(props)} did not set width`);
        }
        if (!body.includes(`stroke-width="${PROBE_STROKE}"`)) {
          problems.push(`${library}: svgProps ${JSON.stringify(props)} did not set stroke-width`);
        }
      } catch (error) {
        problems.push(`${library}: rendering "check" threw — ${error}`);
      }
    }
  }
} finally {
  await server.close();
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
