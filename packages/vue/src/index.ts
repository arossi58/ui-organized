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

export { Card, CardHeader, CardBody, CardFooter } from "./components/Card/index.js";
export type { CardProps } from "./components/Card/index.js";

export { Divider } from "./components/Divider/index.js";
export type { DividerProps } from "./components/Divider/index.js";

export { Skeleton } from "./components/Skeleton/index.js";
export type { SkeletonProps } from "./components/Skeleton/index.js";

export { Tag } from "./components/Tag/index.js";
export type { TagProps } from "./components/Tag/index.js";

export { FieldError } from "./components/FieldError/index.js";
export type { FieldErrorProps } from "./components/FieldError/index.js";

export { Switch } from "./components/Switch/index.js";
export type { SwitchProps } from "./components/Switch/index.js";

export { Avatar } from "./components/Avatar/index.js";
export type { AvatarProps } from "./components/Avatar/index.js";

export { Checkbox } from "./components/Checkbox/index.js";
export type { CheckboxProps } from "./components/Checkbox/index.js";

