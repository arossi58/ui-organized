import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],

  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-docs")
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  // addon-docs sets the MDX provider via `import.meta.resolve(...)`, which on
  // Node 20+ returns a `file://` URL. Rollup can't resolve a `file://` import
  // (it's how MDX pages pull in the react shim), so the preview build fails.
  // This pre-resolver rewrites any `file://` import id back to a real path.
  viteFinal(config) {
    config.plugins ??= [];
    config.plugins.push({
      name: "resolve-file-url-imports",
      enforce: "pre",
      resolveId(source: string) {
        return source.startsWith("file://") ? fileURLToPath(source) : null;
      },
    });

    // The Docs "Code" panel serialises each story's live React element with
    // react-element-to-jsx-string, which prints the component's *runtime*
    // function name. The production build minifies those names (`Button` → `o1t`),
    // so args-only stories rendered as `<o1t …>` instead of `<Button …>`.
    // `keepNames` makes esbuild's minifier preserve `fn.name`, so the snippets
    // show the real component tags. (Dev is unminified, so this only affects
    // `storybook build` / the deployed docs.)
    config.esbuild = {
      ...(config.esbuild || {}),
      keepNames: true,
    };

    return config;
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
