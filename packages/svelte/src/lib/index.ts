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

export {
  Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose,
} from "./components/Popover/index.js";
export type {
  PopoverProps, PopoverTriggerProps, PopoverContentProps, PopoverTitleProps,
  PopoverDescriptionProps, PopoverCloseProps, PopoverSide, PopoverAlign, PopoverPropsFn,
} from "./components/Popover/index.js";

export {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogFooter,
} from "./components/Dialog/index.js";
export type {
  DialogProps, DialogTriggerProps, DialogContentProps, DialogTitleProps,
  DialogDescriptionProps, DialogCloseProps, DialogFooterProps, DialogPropsFn,
} from "./components/Dialog/index.js";

export { Tooltip, TooltipProvider } from "./components/Tooltip/index.js";
export type {
  TooltipProps, TooltipProviderProps, TooltipSide, TooltipAlign,
} from "./components/Tooltip/index.js";

export { Select } from "./components/Select/index.js";
export type { SelectProps, SelectOption } from "./components/Select/index.js";

export {
  Field, FieldLabel, Label, FieldDescription, FieldControl, FieldErrorMessage,
  Fieldset, FieldsetLegend,
} from "./components/Field/index.js";
export type {
  FieldProps, FieldLabelProps, FieldDescriptionProps, FieldControlProps,
  FieldErrorMessageProps, FieldsetProps, FieldsetLegendProps,
} from "./components/Field/index.js";

export { ToastProvider, useToastManager } from "./components/Toast/index.js";
export type { ToastProviderProps, ToastOptions, ToastStatus } from "./components/Toast/index.js";

export { Combobox } from "./components/Combobox/index.js";
export type { ComboboxProps, ComboboxOption } from "./components/Combobox/index.js";

export {
  Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuGroup, MenuGroupLabel,
  MenuRadioGroup, MenuCheckboxItem, MenuRadioItem,
} from "./components/Menu/index.js";
export type {
  MenuProps, MenuTriggerProps, MenuContentProps, MenuItemProps, MenuSeparatorProps,
  MenuGroupProps, MenuGroupLabelProps, MenuRadioGroupProps, MenuCheckboxItemProps,
  MenuRadioItemProps, MenuSide, MenuAlign, MenuPropsFn,
} from "./components/Menu/index.js";

export {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from "./components/Collapsible/index.js";
export type {
  CollapsibleProps, CollapsibleTriggerProps, CollapsibleContentProps,
  CollapsibleTriggerPropsFn, CollapsibleContentPropsFn,
} from "./components/Collapsible/index.js";

export { Toggle, ToggleGroup } from "./components/Toggle/index.js";
export type { ToggleProps, ToggleGroupProps } from "./components/Toggle/index.js";

export { NumberField } from "./components/NumberField/index.js";
export type { NumberFieldProps } from "./components/NumberField/index.js";

export { PasswordInput } from "./components/PasswordInput/index.js";
export type { PasswordInputProps } from "./components/PasswordInput/index.js";

export { SearchInput } from "./components/SearchInput/index.js";
export type { SearchInputProps } from "./components/SearchInput/index.js";

export { SegmentedControl } from "./components/SegmentedControl/index.js";
export type {
  SegmentedControlProps, SegmentedControlItem,
} from "./components/SegmentedControl/index.js";

export { Clipboard } from "./components/Clipboard/index.js";
export type { ClipboardProps } from "./components/Clipboard/index.js";

export {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogConfirm,
} from "./components/AlertDialog/index.js";
export type {
  AlertDialogProps, AlertDialogTriggerProps, AlertDialogContentProps, AlertDialogTitleProps,
  AlertDialogDescriptionProps, AlertDialogFooterProps, AlertDialogCancelProps,
  AlertDialogConfirmProps, AlertDialogPropsFn,
} from "./components/AlertDialog/index.js";

export {
  Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription, SheetClose, SheetFooter,
} from "./components/Sheet/index.js";
export type {
  SheetProps, SheetTriggerProps, SheetContentProps, SheetTitleProps, SheetDescriptionProps,
  SheetCloseProps, SheetFooterProps, SheetPropsFn, SheetVariants,
} from "./components/Sheet/index.js";

export { HoverCard, HoverCardTrigger, HoverCardContent } from "./components/HoverCard/index.js";
export type {
  HoverCardProps, HoverCardTriggerProps, HoverCardContentProps, HoverCardSide, HoverCardAlign,
  HoverCardPropsFn,
} from "./components/HoverCard/index.js";

export {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator,
  ContextMenuGroup, ContextMenuGroupLabel, ContextMenuRadioGroup, ContextMenuCheckboxItem,
  ContextMenuRadioItem,
} from "./components/ContextMenu/index.js";
export type {
  ContextMenuProps, ContextMenuTriggerProps, ContextMenuContentProps, ContextMenuItemProps,
  ContextMenuSeparatorProps, ContextMenuGroupProps, ContextMenuGroupLabelProps,
  ContextMenuRadioGroupProps, ContextMenuCheckboxItemProps, ContextMenuRadioItemProps,
} from "./components/ContextMenu/index.js";

export { Listbox } from "./components/Listbox/index.js";
export type { ListboxProps, ListboxOption, ListboxVariants } from "./components/Listbox/index.js";

export { ScrollArea } from "./components/ScrollArea/index.js";
export type { ScrollAreaProps, StyleValue } from "./components/ScrollArea/index.js";

export { PinInput } from "./components/PinInput/index.js";
export type { PinInputProps, PinInputVariants } from "./components/PinInput/index.js";

export { TagsInput } from "./components/TagsInput/index.js";
export type { TagsInputProps, TagsInputVariants } from "./components/TagsInput/index.js";

export { RatingGroup } from "./components/RatingGroup/index.js";
export type { RatingGroupProps, RatingGroupVariants } from "./components/RatingGroup/index.js";

export { Editable } from "./components/Editable/index.js";
export type { EditableProps, EditableVariants } from "./components/Editable/index.js";

export { FileUpload } from "./components/FileUpload/index.js";
export type { FileUploadProps, FileUploadVariants } from "./components/FileUpload/index.js";

export { Range } from "./components/Range/index.js";
export type { RangeProps, RangeVariants } from "./components/Range/index.js";

export { AngleSlider } from "./components/AngleSlider/index.js";
export type { AngleSliderProps, AngleSliderVariants } from "./components/AngleSlider/index.js";

export { Alert } from "./components/Alert/index.js";
export type { AlertProps, AlertVariants } from "./components/Alert/index.js";

export { Breadcrumb } from "./components/Breadcrumb/index.js";
export type { BreadcrumbProps, BreadcrumbItem } from "./components/Breadcrumb/index.js";

export { Meter } from "./components/Meter/index.js";
export type { MeterProps, MeterVariants } from "./components/Meter/index.js";

export { Toolbar, ToolbarGroup } from "./components/Toolbar/index.js";
export type { ToolbarProps, ToolbarGroupProps } from "./components/Toolbar/index.js";

export { Menubar } from "./components/Menubar/index.js";
export type { MenubarProps } from "./components/Menubar/index.js";

export { Pagination } from "./components/Pagination/index.js";
export type { PaginationProps } from "./components/Pagination/index.js";

export { NavItem, NavSubItem, Sidebar, NavProvider, useNavContext } from "./components/Navigation/index.js";
export type {
  NavItemProps, NavSubItemProps, SidebarProps, NavProviderProps, NavContextValue,
  NavItemVariants, NavSubItemVariants,
} from "./components/Navigation/index.js";

// The date cluster. `Calendar` and `DateField` are deliberately absent: they are
// the shared internals these four are built from, with no DOM of their own that
// a consumer could style or assert against.
export { DateInput } from "./components/DateInput/index.js";
export type { DateInputProps, DateInputVariants } from "./components/DateInput/index.js";

export { DateTimeInput } from "./components/DateTimeInput/index.js";
export type {
  DateTimeInputProps, DateTimeInputVariants,
} from "./components/DateTimeInput/index.js";

export { DateRangeInput } from "./components/DateRangeInput/index.js";
export type {
  DateRangeInputProps, DateRangeValue, DateRangeInputVariants,
} from "./components/DateRangeInput/index.js";

export { DatePicker } from "./components/DatePicker/index.js";
export type { DatePickerProps, DatePickerVariants } from "./components/DatePicker/index.js";

export { TreeView } from "./components/TreeView/index.js";
export type { TreeViewProps, TreeViewNode, TreeViewVariants } from "./components/TreeView/index.js";

export { Splitter } from "./components/Splitter/index.js";
export type { SplitterProps, SplitterPanelDef, SplitterVariants } from "./components/Splitter/index.js";

// `TreeNode` is deliberately absent: it is TreeView's own recursion, with no
// standalone use and no DOM a consumer could target.
export { Steps } from "./components/Steps/index.js";
export type { StepsProps, StepItem, StepsVariants } from "./components/Steps/index.js";

export { Carousel } from "./components/Carousel/index.js";
export type { CarouselProps, CarouselSlide, CarouselVariants } from "./components/Carousel/index.js";

export { Marquee } from "./components/Marquee/index.js";
export type { MarqueeProps, MarqueeItem, MarqueeVariants } from "./components/Marquee/index.js";

export { Timer } from "./components/Timer/index.js";
export type { TimerProps, TimerPart, TimerVariants } from "./components/Timer/index.js";

// Added on behalf of this wave's other three Svelte components, whose author does
// not edit this file — see the stopgap notes in tooling/parity/src/fixtures for
// why an unexported component takes the whole SSR suite down at collection time
// rather than failing on its own cases. Names taken from each component's own
// index.ts, which is the authoritative list.
export { QRCode } from "./components/QRCode/index.js";
export type { QRCodeProps, QRCodeVariants } from "./components/QRCode/index.js";

export { ImageCropper } from "./components/ImageCropper/index.js";
export type {
  ImageCropperProps, CropRect, ImageCropperVariants,
} from "./components/ImageCropper/index.js";

export { SignaturePad } from "./components/SignaturePad/index.js";
export type { SignaturePadProps, SignaturePadVariants } from "./components/SignaturePad/index.js";

export { ColorPicker } from "./components/ColorPicker/index.js";
export type { ColorPickerProps, ColorPickerVariants } from "./components/ColorPicker/index.js";

export {
  FloatingPanel, FloatingPanelTrigger, FloatingPanelContent, FloatingPanelHeader,
  FloatingPanelTitle, FloatingPanelBody, FloatingPanelClose,
} from "./components/FloatingPanel/index.js";
export type {
  FloatingPanelProps, FloatingPanelTriggerProps, FloatingPanelContentProps,
  FloatingPanelHeaderProps, FloatingPanelTitleProps, FloatingPanelBodyProps,
  FloatingPanelCloseProps, FloatingPanelSize, FloatingPanelPosition, FloatingPanelVariants,
} from "./components/FloatingPanel/index.js";

export { Tour } from "./components/Tour/index.js";
export type { TourProps, TourStep, TourStepAction, TourVariants } from "./components/Tour/index.js";
