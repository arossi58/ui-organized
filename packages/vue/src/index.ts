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

export { Input } from "./components/Input/index.js";
export type { InputProps } from "./components/Input/index.js";

export { TextArea } from "./components/TextArea/index.js";
export type { TextAreaProps } from "./components/TextArea/index.js";

export {
  Field, FieldLabel, Label, FieldDescription, FieldControl, FieldErrorMessage,
  Fieldset, FieldsetLegend,
} from "./components/Field/index.js";
export type { FieldProps, FieldErrorMessageProps } from "./components/Field/index.js";

export { Progress } from "./components/Progress/index.js";
export type { ProgressProps } from "./components/Progress/index.js";

export { Tabs } from "./components/Tabs/index.js";
export type { TabsProps, TabItem } from "./components/Tabs/index.js";

export { Accordion } from "./components/Accordion/index.js";
export type { AccordionProps, AccordionItem } from "./components/Accordion/index.js";

export { RadioGroup } from "./components/Radio/index.js";
export type { RadioGroupProps, RadioOption } from "./components/Radio/index.js";

export { Select } from "./components/Select/index.js";
export type { SelectProps, SelectOption } from "./components/Select/index.js";

export { Combobox } from "./components/Combobox/index.js";
export type { ComboboxProps, ComboboxOption } from "./components/Combobox/index.js";

export {
  Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose,
} from "./components/Popover/index.js";
export type {
  PopoverProps, PopoverContentProps, PopoverSide, PopoverAlign,
} from "./components/Popover/index.js";

export {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogFooter,
} from "./components/Dialog/index.js";
export type { DialogProps, DialogContentProps } from "./components/Dialog/index.js";

export { Tooltip, TooltipProvider } from "./components/Tooltip/index.js";
export type {
  TooltipProps, TooltipProviderProps, TooltipSide, TooltipAlign,
} from "./components/Tooltip/index.js";

export {
  Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuGroup, MenuGroupLabel,
  MenuRadioGroup, MenuCheckboxItem, MenuRadioItem,
} from "./components/Menu/index.js";
export type {
  MenuProps, MenuContentProps, MenuItemProps, MenuCheckboxItemProps,
  MenuRadioItemProps, MenuRadioGroupProps, MenuSide, MenuAlign,
} from "./components/Menu/index.js";

export { ToastProvider, useToastManager } from "./components/Toast/index.js";
export type { ToastOptions, ToastStatus } from "./components/Toast/index.js";

