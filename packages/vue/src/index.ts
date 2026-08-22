// The public surface of @ui-organized/vue.
//
// Component styles are NOT imported here. Each component imports its own
// stylesheet from @ui-organized/core, so an app that uses three components ships
// three stylesheets rather than all sixty-five. Consumers who want the whole
// sheet at once take `@ui-organized/vue/styles`.

export { Icon } from "./components/Icon/index.js";
export type { IconComponent, IconProps } from "./components/Icon/index.js";

export { default as IconProvider } from "./context/IconProvider.vue";
export { provideIconConfig, useIconConfig } from "./context/iconContext.js";
export type { IconConfig, IconConfigRef } from "./context/iconContext.js";

// The registry, not the sets: this entry must not reach any icon library, or the
// optional peers become mandatory again. See ./icons/registry.ts.
export { getIconSet, registeredLibraries, registerIconSet } from "./icons/registry.js";
export type { IconLibrary, IconNameMap, IconSet } from "./icons/registry.js";

export { Button } from "./components/Button/index.js";
export type { ButtonProps } from "./components/Button/index.js";
