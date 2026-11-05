/**
 * Every component's live do/don't pairs, keyed by docs slug.
 *
 * Explicit imports for the same reason the guides use them: a glob would key
 * this map by file path, and the thing worth catching is a slug that doesn't
 * name a real component.
 */
import type { UsageExampleSet } from "./types";
import { buttonExamples } from "./button";
import { meterExamples } from "./meter";
import { tagExamples } from "./tag";
import { toggleExamples } from "./toggle";
import { toolbarExamples } from "./toolbar";
import { alertExamples } from "./alert";
import { progressExamples } from "./progress";
import { skeletonExamples } from "./skeleton";
import { checkboxExamples } from "./checkbox";
import { radioGroupExamples } from "./radio-group";
import { switchExamples } from "./switch";
import { segmentedControlExamples } from "./segmented-control";
import { selectExamples } from "./select";
import { comboboxExamples } from "./combobox";
import { inputExamples } from "./input";
import { searchInputExamples } from "./search-input";
import { passwordInputExamples } from "./password-input";
import { textAreaExamples } from "./text-area";
import { numberFieldExamples } from "./number-field";
import { rangeExamples } from "./range";
import { fieldErrorExamples } from "./field-error";
import { dateInputExamples } from "./date-input";
import { dateRangeInputExamples } from "./date-range-input";
import { dateTimeInputExamples } from "./date-time-input";
import { dialogExamples } from "./dialog";
import { alertDialogExamples } from "./alert-dialog";
import { sheetExamples } from "./sheet";
import { popoverExamples } from "./popover";
import { tooltipExamples } from "./tooltip";
import { hoverCardExamples } from "./hover-card";
import { menuExamples } from "./menu";
import { contextMenuExamples } from "./context-menu";
import { menubarExamples } from "./menubar";
import { accordionExamples } from "./accordion";
import { collapsibleExamples } from "./collapsible";
import { tabsExamples } from "./tabs";
import { breadcrumbExamples } from "./breadcrumb";
import { paginationExamples } from "./pagination";
import { navigationExamples } from "./navigation";
import { cardExamples } from "./card";
import { dividerExamples } from "./divider";
import { scrollAreaExamples } from "./scroll-area";
import { avatarExamples } from "./avatar";
import { iconExamples } from "./icon";
import { pinInputExamples } from "./pin-input";
import { tagsInputExamples } from "./tags-input";
import { editableExamples } from "./editable";
import { ratingGroupExamples } from "./rating-group";
import { angleSliderExamples } from "./angle-slider";
import { colorPickerExamples } from "./color-picker";
import { signaturePadExamples } from "./signature-pad";
import { listboxExamples } from "./listbox";
import { treeViewExamples } from "./tree-view";
import { dataTableExamples } from "./data-table";
import { stepsExamples } from "./steps";
import { carouselExamples } from "./carousel";
import { chipExamples } from "./chip";
import { clipboardExamples } from "./clipboard";
import { qrCodeExamples } from "./qr-code";
import { timerExamples } from "./timer";
import { marqueeExamples } from "./marquee";
import { fileUploadExamples } from "./file-upload";
import { imageCropperExamples } from "./image-cropper";
import { floatingPanelExamples } from "./floating-panel";
import { splitterExamples } from "./splitter";
import { tourExamples } from "./tour";

const EXAMPLES: Record<string, UsageExampleSet> = {
  button: buttonExamples,
  meter: meterExamples,
  tag: tagExamples,
  toggle: toggleExamples,
  toolbar: toolbarExamples,
  alert: alertExamples,
  progress: progressExamples,
  skeleton: skeletonExamples,
  checkbox: checkboxExamples,
  "radio-group": radioGroupExamples,
  switch: switchExamples,
  "segmented-control": segmentedControlExamples,
  select: selectExamples,
  combobox: comboboxExamples,
  input: inputExamples,
  "search-input": searchInputExamples,
  "password-input": passwordInputExamples,
  "text-area": textAreaExamples,
  "number-field": numberFieldExamples,
  range: rangeExamples,
  "field-error": fieldErrorExamples,
  "date-input": dateInputExamples,
  "date-range-input": dateRangeInputExamples,
  "date-time-input": dateTimeInputExamples,
  dialog: dialogExamples,
  "alert-dialog": alertDialogExamples,
  sheet: sheetExamples,
  popover: popoverExamples,
  tooltip: tooltipExamples,
  "hover-card": hoverCardExamples,
  menu: menuExamples,
  "context-menu": contextMenuExamples,
  menubar: menubarExamples,
  accordion: accordionExamples,
  collapsible: collapsibleExamples,
  tabs: tabsExamples,
  breadcrumb: breadcrumbExamples,
  pagination: paginationExamples,
  navigation: navigationExamples,
  card: cardExamples,
  divider: dividerExamples,
  "scroll-area": scrollAreaExamples,
  avatar: avatarExamples,
  icon: iconExamples,
  "pin-input": pinInputExamples,
  "tags-input": tagsInputExamples,
  editable: editableExamples,
  "rating-group": ratingGroupExamples,
  "angle-slider": angleSliderExamples,
  "color-picker": colorPickerExamples,
  "signature-pad": signaturePadExamples,
  listbox: listboxExamples,
  "tree-view": treeViewExamples,
  "data-table": dataTableExamples,
  steps: stepsExamples,
  carousel: carouselExamples,
  chip: chipExamples,
  clipboard: clipboardExamples,
  "qr-code": qrCodeExamples,
  timer: timerExamples,
  marquee: marqueeExamples,
  "file-upload": fileUploadExamples,
  "image-cropper": imageCropperExamples,
  "floating-panel": floatingPanelExamples,
  splitter: splitterExamples,
  tour: tourExamples,
};

/** Empty for a component whose guidance is all text pairs. */
export function usageExamplesFor(slug: string): UsageExampleSet {
  return EXAMPLES[slug] ?? {};
}

export { EXAMPLES as USAGE_EXAMPLES };
export type { UsageExamplePair, UsageExampleSet } from "./types";
