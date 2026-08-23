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
];
