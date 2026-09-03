// Global typography utilities (`.text-{weight}-{step}`) — the single source of
// truth for text styles. Imported first so component CSS can override on source
// order where needed. See ./typography.css.
import "@ui-organized/core/typography.css";
// Restores `[hidden] { display: none }`, which component-level `display` rules
// beat by accident. See ./base.css — this is a correctness rule, not styling.
import "./base.css";

export { Icon } from "./components/Icon/index.js";
export type { IconProps } from "./components/Icon/index.js";

export { IconProvider } from "./context/IconContext.js";
export type { IconConfig, IconProviderProps } from "./context/IconContext.js";
// The registry, not the sets: this entry must not reach any icon library, or the
// optional peers become mandatory again. See ./icons/registry.ts.
export { registerIconSet, getIconSet, registeredLibraries } from "./icons/registry.js";
export type { IconLibrary, IconSet, IconNameMap } from "./icons/registry.js";

export { Button } from "./components/Button/index.js";
export type { ButtonProps, ButtonVariants } from "./components/Button/index.js";

export { Input } from "./components/Input/index.js";
export type { InputProps, InputVariants } from "./components/Input/index.js";

export { TextArea } from "./components/TextArea/index.js";
export type { TextAreaProps, TextAreaVariants } from "./components/TextArea/index.js";

export { SearchInput } from "./components/SearchInput/index.js";
export type { SearchInputProps, SearchInputVariants } from "./components/SearchInput/index.js";

export { PasswordInput } from "./components/PasswordInput/index.js";
export type {
  PasswordInputProps,
  PasswordInputVariants,
} from "./components/PasswordInput/index.js";

export { DateInput } from "./components/DateInput/index.js";
export type { DateInputProps, DateInputVariants } from "./components/DateInput/index.js";

export { DateTimeInput } from "./components/DateTimeInput/index.js";
export type {
  DateTimeInputProps,
  DateTimeInputVariants,
} from "./components/DateTimeInput/index.js";

export { DateRangeInput } from "./components/DateRangeInput/index.js";
export type {
  DateRangeInputProps,
  DateRangeValue,
  DateRangeInputVariants,
} from "./components/DateRangeInput/index.js";

export { PinInput } from "./components/PinInput/index.js";
export type { PinInputProps, PinInputVariants } from "./components/PinInput/index.js";

export { TagsInput } from "./components/TagsInput/index.js";
export type { TagsInputProps, TagsInputVariants } from "./components/TagsInput/index.js";

export { Editable } from "./components/Editable/index.js";
export type { EditableProps, EditableVariants } from "./components/Editable/index.js";

export { AngleSlider } from "./components/AngleSlider/index.js";
export type { AngleSliderProps, AngleSliderVariants } from "./components/AngleSlider/index.js";

export { RatingGroup } from "./components/RatingGroup/index.js";
export type { RatingGroupProps, RatingGroupVariants } from "./components/RatingGroup/index.js";

export { Clipboard } from "./components/Clipboard/index.js";
export type { ClipboardProps, ClipboardVariants } from "./components/Clipboard/index.js";

export { FieldError } from "./components/FieldError/index.js";
export type { FieldErrorProps } from "./components/FieldError/index.js";

export { Select } from "./components/Select/index.js";
export type { SelectProps, SelectOption, SelectVariants } from "./components/Select/index.js";

export { Checkbox } from "./components/Checkbox/index.js";
export type { CheckboxProps } from "./components/Checkbox/index.js";

export { RadioGroup } from "./components/Radio/index.js";
export type { RadioGroupProps, RadioOption, RadioGroupVariants } from "./components/Radio/index.js";

export { Switch } from "./components/Switch/index.js";
export type { SwitchProps } from "./components/Switch/index.js";

export { Range } from "./components/Range/index.js";
export type { RangeProps, RangeVariants } from "./components/Range/index.js";

export { Card, CardHeader, CardBody, CardFooter } from "./components/Card/index.js";
export type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardVariants,
} from "./components/Card/index.js";

export { Tag } from "./components/Tag/index.js";
export type { TagProps, TagVariants } from "./components/Tag/index.js";

export { Chip } from "./components/Chip/index.js";
export type { ChipProps, ChipVariants, ComparisonIconName } from "./components/Chip/index.js";

export { Alert } from "./components/Alert/index.js";
export type { AlertProps, AlertVariants } from "./components/Alert/index.js";

export { Tabs } from "./components/Tabs/index.js";
export type { TabsProps, TabItem, TabsVariants } from "./components/Tabs/index.js";

export { SegmentedControl } from "./components/SegmentedControl/index.js";
export type {
  SegmentedControlProps,
  SegmentedControlItem,
  SegmentedControlVariants,
} from "./components/SegmentedControl/index.js";

export {
  NavItem,
  NavSubItem,
  Sidebar,
  NavProvider,
  useNavContext,
} from "./components/Navigation/index.js";
export type {
  NavItemProps,
  NavSubItemProps,
  SidebarProps,
  NavProviderProps,
  NavContextValue,
  NavItemVariants,
  NavSubItemVariants,
} from "./components/Navigation/index.js";

export { Divider } from "./components/Divider/index.js";
export type { DividerProps, DividerVariants } from "./components/Divider/index.js";

export { Skeleton } from "./components/Skeleton/index.js";
export type { SkeletonProps, SkeletonVariants } from "./components/Skeleton/index.js";

export { Avatar } from "./components/Avatar/index.js";
export type { AvatarProps, AvatarVariants } from "./components/Avatar/index.js";

export { Progress } from "./components/Progress/index.js";
export type { ProgressProps, ProgressVariants } from "./components/Progress/index.js";

export {
  Field,
  FieldLabel,
  Label,
  FieldDescription,
  FieldControl,
  FieldErrorMessage,
  Fieldset,
  FieldsetLegend,
} from "./components/Field/index.js";
export type {
  FieldProps,
  FieldLabelProps,
  FieldDescriptionProps,
  FieldControlProps,
  FieldErrorMessageProps,
  FieldsetProps,
  FieldsetLegendProps,
  FieldVariants,
} from "./components/Field/index.js";

export { Accordion } from "./components/Accordion/index.js";
export type {
  AccordionProps,
  AccordionItem,
  AccordionVariants,
} from "./components/Accordion/index.js";

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from "./components/Popover/index.js";
export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
  PopoverCloseProps,
} from "./components/Popover/index.js";

export { Tooltip, TooltipProvider } from "./components/Tooltip/index.js";
export type { TooltipProps, TooltipProviderProps } from "./components/Tooltip/index.js";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "./components/Dialog/index.js";
export type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
  DialogFooterProps,
  DialogVariants,
} from "./components/Dialog/index.js";

export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuGroup,
  MenuGroupLabel,
  MenuRadioGroup,
  MenuCheckboxItem,
  MenuRadioItem,
} from "./components/Menu/index.js";
export type {
  MenuProps,
  MenuTriggerProps,
  MenuContentProps,
  MenuItemProps,
  MenuSeparatorProps,
  MenuGroupProps,
  MenuGroupLabelProps,
  MenuRadioGroupProps,
  MenuCheckboxItemProps,
  MenuRadioItemProps,
} from "./components/Menu/index.js";

export { ToastProvider, useToastManager } from "./components/Toast/index.js";
// `ToastOptions` is the argument to `toast.add()` — the whole imperative API —
// and was the one part of it a consumer could not name. The Svelte and Vue
// packages have always exported it.
export type {
  ToastProviderProps,
  ToastOptions,
  ToastStatus,
  ToastVariants,
} from "./components/Toast/index.js";

export { Combobox } from "./components/Combobox/index.js";
export type {
  ComboboxProps,
  ComboboxOption,
  ComboboxVariants,
} from "./components/Combobox/index.js";

export { NumberField } from "./components/NumberField/index.js";
export type { NumberFieldProps, NumberFieldVariants } from "./components/NumberField/index.js";

export { Toggle, ToggleGroup } from "./components/Toggle/index.js";
export type { ToggleProps, ToggleGroupProps, ToggleVariants } from "./components/Toggle/index.js";

export { Meter } from "./components/Meter/index.js";
export type { MeterProps, MeterVariants } from "./components/Meter/index.js";

export { ScrollArea } from "./components/ScrollArea/index.js";
export type { ScrollAreaProps } from "./components/ScrollArea/index.js";

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./components/Collapsible/index.js";
export type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
} from "./components/Collapsible/index.js";

export { Breadcrumb } from "./components/Breadcrumb/index.js";
export type { BreadcrumbProps, BreadcrumbItem } from "./components/Breadcrumb/index.js";

export { Pagination } from "./components/Pagination/index.js";
export type { PaginationProps } from "./components/Pagination/index.js";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuRadioGroup,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
} from "./components/ContextMenu/index.js";
export type {
  ContextMenuProps,
  ContextMenuTriggerProps,
  ContextMenuContentProps,
  ContextMenuItemProps,
  ContextMenuSeparatorProps,
  ContextMenuGroupProps,
  ContextMenuGroupLabelProps,
  ContextMenuRadioGroupProps,
  ContextMenuCheckboxItemProps,
  ContextMenuRadioItemProps,
} from "./components/ContextMenu/index.js";

export { Menubar } from "./components/Menubar/index.js";
export type { MenubarProps } from "./components/Menubar/index.js";

export { Toolbar, ToolbarGroup } from "./components/Toolbar/index.js";
export type { ToolbarProps, ToolbarGroupProps } from "./components/Toolbar/index.js";

export { HoverCard, HoverCardTrigger, HoverCardContent } from "./components/HoverCard/index.js";
export type {
  HoverCardProps,
  HoverCardTriggerProps,
  HoverCardContentProps,
} from "./components/HoverCard/index.js";

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogConfirm,
} from "./components/AlertDialog/index.js";
export type {
  AlertDialogProps,
  AlertDialogTriggerProps,
  AlertDialogContentProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
  AlertDialogFooterProps,
  AlertDialogCancelProps,
  AlertDialogConfirmProps,
} from "./components/AlertDialog/index.js";

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetFooter,
} from "./components/Sheet/index.js";
export type {
  SheetProps,
  SheetTriggerProps,
  SheetContentProps,
  SheetTitleProps,
  SheetDescriptionProps,
  SheetCloseProps,
  SheetFooterProps,
  SheetVariants,
} from "./components/Sheet/index.js";

export { Listbox } from "./components/Listbox/index.js";
export type { ListboxProps, ListboxOption, ListboxVariants } from "./components/Listbox/index.js";

export { TreeView } from "./components/TreeView/index.js";
export type { TreeViewProps, TreeViewNode, TreeViewVariants } from "./components/TreeView/index.js";

export { Steps } from "./components/Steps/index.js";
export type { StepsProps, StepItem, StepsVariants } from "./components/Steps/index.js";

export { Splitter } from "./components/Splitter/index.js";
export type {
  SplitterProps,
  SplitterPanelDef,
  SplitterVariants,
} from "./components/Splitter/index.js";

export { Carousel } from "./components/Carousel/index.js";
export type {
  CarouselProps,
  CarouselSlide,
  CarouselVariants,
} from "./components/Carousel/index.js";

export { Marquee } from "./components/Marquee/index.js";
export type { MarqueeProps, MarqueeItem, MarqueeVariants } from "./components/Marquee/index.js";

export { Timer } from "./components/Timer/index.js";
export type { TimerProps, TimerPart, TimerVariants } from "./components/Timer/index.js";

export { ColorPicker } from "./components/ColorPicker/index.js";
export type { ColorPickerProps, ColorPickerVariants } from "./components/ColorPicker/index.js";

export { DatePicker } from "./components/DatePicker/index.js";
export type { DatePickerProps, DatePickerVariants } from "./components/DatePicker/index.js";

export {
  FloatingPanel,
  FloatingPanelTrigger,
  FloatingPanelContent,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelBody,
  FloatingPanelClose,
} from "./components/FloatingPanel/index.js";
export type {
  FloatingPanelProps,
  FloatingPanelTriggerProps,
  FloatingPanelContentProps,
  FloatingPanelHeaderProps,
  FloatingPanelTitleProps,
  FloatingPanelBodyProps,
  FloatingPanelCloseProps,
  FloatingPanelVariants,
} from "./components/FloatingPanel/index.js";

export { Tour } from "./components/Tour/index.js";
export type { TourProps, TourStep, TourStepAction, TourVariants } from "./components/Tour/index.js";

export { FileUpload } from "./components/FileUpload/index.js";
export type { FileUploadProps, FileUploadVariants } from "./components/FileUpload/index.js";

export { ImageCropper } from "./components/ImageCropper/index.js";
export type {
  ImageCropperProps,
  CropRect,
  ImageCropperVariants,
} from "./components/ImageCropper/index.js";

export { SignaturePad } from "./components/SignaturePad/index.js";
export type { SignaturePadProps, SignaturePadVariants } from "./components/SignaturePad/index.js";

export { QRCode } from "./components/QRCode/index.js";
export type { QRCodeProps, QRCodeVariants } from "./components/QRCode/index.js";
