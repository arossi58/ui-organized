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

export { Card, CardHeader, CardBody, CardFooter } from "./components/Card/index.js";
export type {
  CardProps, CardHeaderProps, CardBodyProps, CardFooterProps,
} from "./components/Card/index.js";

export { Divider } from "./components/Divider/index.js";
export type { DividerProps } from "./components/Divider/index.js";

export { Skeleton } from "./components/Skeleton/index.js";
export type { SkeletonProps } from "./components/Skeleton/index.js";

export { Tag } from "./components/Tag/index.js";
export type { TagProps } from "./components/Tag/index.js";

export { Switch } from "./components/Switch/index.js";
export type { SwitchProps } from "./components/Switch/index.js";

export { Avatar } from "./components/Avatar/index.js";
export type { AvatarProps } from "./components/Avatar/index.js";

export { FieldError } from "./components/FieldError/index.js";
export type { FieldErrorProps } from "./components/FieldError/index.js";

export { Input } from "./components/Input/index.js";
export type { InputProps } from "./components/Input/index.js";

export { Checkbox } from "./components/Checkbox/index.js";
export type { CheckboxProps } from "./components/Checkbox/index.js";

export { Tabs } from "./components/Tabs/index.js";
export type { TabsProps, TabItem } from "./components/Tabs/index.js";

export { TextArea } from "./components/TextArea/index.js";
export type { TextAreaProps } from "./components/TextArea/index.js";

export { Progress } from "./components/Progress/index.js";
export type { ProgressProps } from "./components/Progress/index.js";

export { RadioGroup } from "./components/Radio/index.js";
export type { RadioGroupProps, RadioOption } from "./components/Radio/index.js";

export { Accordion } from "./components/Accordion/index.js";
export type { AccordionProps, AccordionItem } from "./components/Accordion/index.js";

