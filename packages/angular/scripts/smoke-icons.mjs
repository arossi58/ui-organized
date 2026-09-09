/**
 * Release gate for the icon adapters: `pnpm --filter @ui-organized/angular test:smoke`.
 *
 * Two failures this catches that nothing else does.
 *
 * **A renamed upstream export.** The adapters name ~55 constants each out of
 * catalogues of thousands, and `@ng-icons` renames one now and then to follow
 * its upstream. A build against the installed version catches that — but a
 * consumer resolving a *different* minor gets ESM live bindings, where a missing
 * export is `undefined` rather than an error. `Icon` then renders nothing, for
 * one icon, silently.
 *
 * **An entry that is not markup.** `resolveIconComponent` picks the solid cut
 * with `solid ?? outline`, and `??` passes an empty string straight through. A
 * blank entry would render an empty `<svg>` rather than falling back.
 *
 * It cannot catch the tree-shaking failure — importing a module is precisely
 * what defeats tree-shaking — so `sideEffects` in package.json is still on
 * trust. React covers that with `examples/icon-smoke`; an Angular equivalent is
 * worth having and is not this.
 */
// ng-packagr emits partially-compiled output, which plain Node cannot evaluate
// without either the Angular Linker or the JIT compiler. Importing the compiler
// is what a JIT consumer does, and it has to come before the package.
import "@angular/compiler";
import { CANONICAL_ICON_NAMES } from "@ui-organized/utils";
import { getIconSet, registeredLibraries } from "../dist/fesm2022/ui-organized-angular.mjs";

const ADAPTERS = [
  { library: "lucide", entry: "../dist/fesm2022/ui-organized-angular-icons-lucide.mjs" },
  { library: "tabler", entry: "../dist/fesm2022/ui-organized-angular-icons-tabler.mjs" },
  { library: "heroicons", entry: "../dist/fesm2022/ui-organized-angular-icons-heroicons.mjs" },
];

const problems = [];

for (const { library, entry } of ADAPTERS) {
  await import(entry);
  const set = getIconSet(library);
  if (!set) {
    problems.push(`${library}: importing ${entry} registered nothing`);
    continue;
  }

  for (const name of CANONICAL_ICON_NAMES) {
    const markup = set.outline[name];
    if (typeof markup !== "string" || !markup.trimStart().startsWith("<svg")) {
      problems.push(`${library}: outline "${name}" is ${JSON.stringify(markup)?.slice(0, 40)}`);
    }
  }

  for (const [name, markup] of Object.entries(set.solid ?? {})) {
    if (typeof markup !== "string" || !markup.trimStart().startsWith("<svg")) {
      problems.push(`${library}: solid "${name}" is ${JSON.stringify(markup)?.slice(0, 40)}`);
    }
  }

  // The one custom property the whole shared `svgProps` rests on. If a pack ever
  // stops emitting it, stroke scaling goes silently dead — every icon renders at
  // the pack's own default weight and nothing errors.
  const sample = set.outline.check;
  if (typeof sample === "string" && !sample.includes("--ng-icon__stroke-width")) {
    problems.push(`${library}: markup no longer reads --ng-icon__stroke-width`);
  }
}

if (problems.length) {
  console.error(`\nx icon adapters: ${problems.length} problem(s)\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

const solid = ADAPTERS.map(({ library }) => {
  const count = Object.keys(getIconSet(library).solid ?? {}).length;
  return `${library} ${CANONICAL_ICON_NAMES.length}${count ? `+${count} solid` : ""}`;
}).join(", ");
console.log(`✓ icon adapters register real markup: ${solid}`);
console.log(`  registered: ${registeredLibraries().join(", ")}`);
