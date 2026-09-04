/**
 * Root ESLint config for the whole monorepo.
 *
 * Flat config resolves from the directory ESLint is invoked in and walks *up*,
 * so a single root config covers every workspace package — the ten packages
 * whose `"lint": "eslint src/"` script previously died on a missing config now
 * all resolve to this file.
 *
 * `.mjs` rather than `.js` because the root package.json has no `"type":
 * "module"`, which would make a bare `eslint.config.js` CommonJS.
 */
import react from "@ui-organized/eslint-config/react";

export default [
  ...react,

  {
    // Storybook CSF files carry one hard constraint: they must stay importable
    // as plain React modules, because apps/marketing/src/docs/registry.ts globs
    // them with `import.meta.glob(..., { eager: true })` to build the docs site.
    // The only Storybook import allowed is the type-only `Meta`/`StoryObj`,
    // which erases at compile time. A value import (`storybook/test`,
    // `storybook/preview-api`) would be bundled into the marketing app's
    // production output — which is why interaction tests live in
    // apps/storybook/interaction/ as Playwright specs instead of `play:`
    // functions. This rule makes that constraint enforceable rather than
    // folklore.
    files: ["apps/storybook/src/**/*.stories.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "storybook/test",
              message:
                "Story files must stay free of Storybook runtime imports — apps/marketing globs them as plain React modules, so this would ship in the marketing bundle. Write the interaction test in apps/storybook/interaction/ instead.",
            },
            {
              name: "storybook/preview-api",
              message:
                "Story files must stay free of Storybook runtime imports (see apps/marketing/src/docs/registry.ts).",
            },
            {
              name: "@storybook/test",
              message:
                "Story files must stay free of Storybook runtime imports. Write the interaction test in apps/storybook/interaction/ instead.",
            },
          ],
        },
      ],
    },
  },

  {
    // The framework boundary, enforced rather than merely intended.
    //
    // `@ui-organized/table-core` is what makes a Vue or Svelte data table a new
    // adapter rather than a fork: it owns the column model, the prop builders,
    // every behaviour and the entire stylesheet, and none of that may reach a
    // framework. The moment one `useState` lands in here the portability claim
    // is gone and nobody notices until the second adapter is attempted.
    //
    // `packages/table-core/src/*.test.ts` is covered too — a test that renders
    // with React would pull React into the package's devDependencies and make
    // the boundary a matter of trust again.
    files: ["packages/table-core/src/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              message:
                "table-core is framework-free: it is the half a Vue/Svelte adapter reuses. Put anything that needs React in packages/react-table.",
            },
            {
              name: "react-dom",
              message:
                "table-core is framework-free. Put anything that needs React in packages/react-table.",
            },
            {
              name: "@ui-organized/react",
              message:
                "table-core must not depend on a framework's component library — composing with Button/Checkbox/Menu is the adapter's job.",
            },
            {
              name: "@tanstack/react-table",
              message:
                "Core pairs with @tanstack/table-core; each adapter pairs with its own TanStack adapter.",
            },
            {
              name: "@tanstack/react-virtual",
              message:
                "Core pairs with @tanstack/virtual-core; each adapter pairs with its own TanStack adapter.",
            },
            // Named once a Vue adapter existed. The list is not "React things"
            // — it is every framework with an adapter, and leaving Vue off it
            // after `@ui-organized/vue-table` landed would make the rule read as
            // "no React" rather than "no framework".
            {
              name: "vue",
              message:
                "table-core is framework-free: it is the half every adapter reuses. Put anything that needs Vue in packages/vue-table.",
            },
            {
              name: "@ui-organized/vue",
              message:
                "table-core must not depend on a framework's component library — composing with Button/Checkbox/Menu is the adapter's job.",
            },
            {
              name: "@tanstack/vue-table",
              message:
                "Core pairs with @tanstack/table-core; each adapter pairs with its own TanStack adapter.",
            },
            {
              name: "@tanstack/vue-virtual",
              message:
                "Core pairs with @tanstack/virtual-core; each adapter pairs with its own TanStack adapter.",
            },
          ],
          patterns: [
            {
              group: ["react/*", "react-dom/*", "@ui-organized/react/*", "@ui-organized/vue/*"],
              message: "table-core is framework-free: it is the half every adapter reuses.",
            },
          ],
        },
      ],
    },
  },
];
