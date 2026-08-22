// The public surface of @ui-organized/svelte.
//
// Component styles are NOT imported here. A Svelte library is not bundled at
// publish time — svelte-package transpiles and copies — so each component's
// `import "@ui-organized/core/components/X/X.css"` is resolved by the consumer's
// bundler, which means an app that uses three components ships three
// stylesheets. Importing them all here would undo that. Consumers who want the
// whole sheet at once take `@ui-organized/svelte/styles`.

export { Icon } from "./components/Icon/index.js";
export type { IconComponent, IconProps } from "./components/Icon/index.js";

export { default as IconProvider } from "./context/IconProvider.svelte";
export { getIconConfig, setIconConfig } from "./context/iconContext.svelte.js";
export type { IconConfig, IconConfigAccessor } from "./context/iconContext.svelte.js";

// The registry, not the sets: this entry must not reach any icon library, or the
// optional peers become mandatory again. See ./icons/registry.ts.
export { getIconSet, registeredLibraries, registerIconSet } from "./icons/registry.js";
export type { IconLibrary, IconNameMap, IconSet } from "./icons/registry.js";

export { Button } from "./components/Button/index.js";
export type { ButtonProps, ButtonPropsFn } from "./components/Button/index.js";
