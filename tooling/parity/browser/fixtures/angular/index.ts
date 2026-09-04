import type { Type } from "@angular/core";
import { AccordionFixture } from "./accordion.fixture.js";
import { AlertDialogFixture } from "./alert-dialog.fixture.js";
import { AlertFixture } from "./alert.fixture.js";
import { AngleSliderFixture } from "./angle-slider.fixture.js";
import { AvatarFixture } from "./avatar.fixture.js";
import { BreadcrumbFixture } from "./breadcrumb.fixture.js";
import { ButtonFixture } from "./button.fixture.js";
import { CardFixture } from "./card.fixture.js";
import { CheckboxFixture } from "./checkbox.fixture.js";
import { ClipboardFixture } from "./clipboard.fixture.js";
import { CollapsibleFixture } from "./collapsible.fixture.js";
import { ComboboxFixture } from "./combobox.fixture.js";
import { ContextMenuFixture } from "./context-menu.fixture.js";
import { DialogFixture } from "./dialog.fixture.js";
import { DividerFixture } from "./divider.fixture.js";
import { EditableFixture } from "./editable.fixture.js";
import { FieldFixture } from "./field.fixture.js";
import { FieldErrorFixture } from "./field-error.fixture.js";
import { FieldsetFixture } from "./fieldset.fixture.js";
import { FileUploadFixture } from "./file-upload.fixture.js";
import { HoverCardFixture } from "./hover-card.fixture.js";
import { IconFixture } from "./icon.fixture.js";
import { InputFixture } from "./input.fixture.js";
import { ListboxFixture } from "./listbox.fixture.js";
import { MenuFixture } from "./menu.fixture.js";
import { MenuOptionsFixture } from "./menu-options.fixture.js";
import { MenubarFixture } from "./menubar.fixture.js";
import { MeterFixture } from "./meter.fixture.js";
import { NavigationFixture } from "./navigation.fixture.js";
import { NavSubItemFixture } from "./nav-sub-item.fixture.js";
import { NumberFieldFixture } from "./number-field.fixture.js";
import { PaginationFixture } from "./pagination.fixture.js";
import { PasswordInputFixture } from "./password-input.fixture.js";
import { PinInputFixture } from "./pin-input.fixture.js";
import { PopoverFixture } from "./popover.fixture.js";
import { PopoverInDialogFixture } from "./popover-in-dialog.fixture.js";
import { ProgressFixture } from "./progress.fixture.js";
import { QRCodeFixture } from "./qr-code.fixture.js";
import { RadioGroupFixture } from "./radio-group.fixture.js";
import { RangeFixture } from "./range.fixture.js";
import { RatingGroupFixture } from "./rating-group.fixture.js";
import { ScrollAreaFixture } from "./scroll-area.fixture.js";
import { SearchInputFixture } from "./search-input.fixture.js";
import { SegmentedControlFixture } from "./segmented-control.fixture.js";
import { SwitchFixture } from "./switch.fixture.js";
import { SelectFixture } from "./select.fixture.js";
import { SelectInDialogFixture } from "./select-in-dialog.fixture.js";
import { SheetFixture } from "./sheet.fixture.js";
import { SkeletonFixture } from "./skeleton.fixture.js";
import { SplitterFixture } from "./splitter.fixture.js";
import { StepsFixture } from "./steps.fixture.js";
import { TabsFixture } from "./tabs.fixture.js";
import { ChipFixture } from "./chip.fixture.js";
import { TagFixture } from "./tag.fixture.js";
import { TagsInputFixture } from "./tags-input.fixture.js";
import { TextAreaFixture } from "./text-area.fixture.js";
import { TimerFixture } from "./timer.fixture.js";
import { TreeViewFixture } from "./tree-view.fixture.js";
import { ToastFixture } from "./toast.fixture.js";
import { ToggleFixture } from "./toggle.fixture.js";
import { ToolbarFixture } from "./toolbar.fixture.js";
import { TooltipFixture } from "./tooltip.fixture.js";
import { DateInputFixture } from "./date-input.fixture.js";
import { DatePickerFixture } from "./date-picker.fixture.js";
import { DateRangeInputFixture } from "./date-range-input.fixture.js";
import { DateTimeInputFixture } from "./date-time-input.fixture.js";
import { CarouselFixture } from "./carousel.fixture.js";
import { ColorPickerFixture } from "./color-picker.fixture.js";
import { FloatingPanelFixture } from "./floating-panel.fixture.js";
import { ImageCropperFixture } from "./image-cropper.fixture.js";
import { MarqueeFixture } from "./marquee.fixture.js";
import { SignaturePadFixture } from "./signature-pad.fixture.js";
import { TourFixture } from "./tour.fixture.js";

/**
 * Which components the Angular library implements, as far as this gate is
 * concerned.
 *
 * Angular is compared in the browser only. The SSR half of the gate renders
 * React, Svelte and Vue on the server, and putting Angular there would mean
 * `@angular/platform-server` and a second rendering path that no consumer of
 * this library uses — while the browser half already exercises exactly what
 * matters, in the engine the CSS is written for.
 */
export const ANGULAR_FIXTURES: Record<string, Type<unknown>> = {
  Accordion: AccordionFixture,
  Alert: AlertFixture,
  AlertDialog: AlertDialogFixture,
  AngleSlider: AngleSliderFixture,
  Avatar: AvatarFixture,
  Breadcrumb: BreadcrumbFixture,
  Button: ButtonFixture,
  Card: CardFixture,
  Checkbox: CheckboxFixture,
  Clipboard: ClipboardFixture,
  Collapsible: CollapsibleFixture,
  Combobox: ComboboxFixture,
  ContextMenu: ContextMenuFixture,
  Dialog: DialogFixture,
  Divider: DividerFixture,
  Editable: EditableFixture,
  Field: FieldFixture,
  FieldError: FieldErrorFixture,
  Fieldset: FieldsetFixture,
  FileUpload: FileUploadFixture,
  HoverCard: HoverCardFixture,
  Icon: IconFixture,
  Input: InputFixture,
  Listbox: ListboxFixture,
  Menu: MenuFixture,
  MenuOptions: MenuOptionsFixture,
  Menubar: MenubarFixture,
  Meter: MeterFixture,
  Navigation: NavigationFixture,
  NavSubItem: NavSubItemFixture,
  NumberField: NumberFieldFixture,
  Pagination: PaginationFixture,
  PasswordInput: PasswordInputFixture,
  PinInput: PinInputFixture,
  Popover: PopoverFixture,
  Progress: ProgressFixture,
  QRCode: QRCodeFixture,
  RadioGroup: RadioGroupFixture,
  Range: RangeFixture,
  RatingGroup: RatingGroupFixture,
  ScrollArea: ScrollAreaFixture,
  SearchInput: SearchInputFixture,
  SegmentedControl: SegmentedControlFixture,
  Switch: SwitchFixture,
  Select: SelectFixture,
  SelectInDialog: SelectInDialogFixture,
  Sheet: SheetFixture,
  Skeleton: SkeletonFixture,
  Splitter: SplitterFixture,
  Steps: StepsFixture,
  Tabs: TabsFixture,
  Tag: TagFixture,
  Chip: ChipFixture,
  TagsInput: TagsInputFixture,
  TextArea: TextAreaFixture,
  Timer: TimerFixture,
  Toast: ToastFixture,
  Toggle: ToggleFixture,
  Toolbar: ToolbarFixture,
  TreeView: TreeViewFixture,
  Tooltip: TooltipFixture,
  /**
   * Not a component — an *arrangement* of two of them, and the one this port was
   * most likely to get wrong. It has no React counterpart to be compared
   * against; what it proves is asserted directly in the browser spec.
   */
  PopoverInDialog: PopoverInDialogFixture,
  DateInput: DateInputFixture,
  DatePicker: DatePickerFixture,
  DateRangeInput: DateRangeInputFixture,
  DateTimeInput: DateTimeInputFixture,
  Carousel: CarouselFixture,
  ColorPicker: ColorPickerFixture,
  FloatingPanel: FloatingPanelFixture,
  ImageCropper: ImageCropperFixture,
  Marquee: MarqueeFixture,
  SignaturePad: SignaturePadFixture,
  Tour: TourFixture,
};

export function angularFixtureFor(component: string): Type<unknown> {
  const fixture = ANGULAR_FIXTURES[component];
  if (!fixture) throw new Error(`parity harness: no Angular fixture for "${component}"`);
  return fixture;
}
