import type { Type } from "@angular/core";
import { AccordionFixture } from "./accordion.fixture.js";
import { AlertFixture } from "./alert.fixture.js";
import { BreadcrumbFixture } from "./breadcrumb.fixture.js";
import { ButtonFixture } from "./button.fixture.js";
import { CardFixture } from "./card.fixture.js";
import { CheckboxFixture } from "./checkbox.fixture.js";
import { DialogFixture } from "./dialog.fixture.js";
import { DividerFixture } from "./divider.fixture.js";
import { FieldFixture } from "./field.fixture.js";
import { FieldErrorFixture } from "./field-error.fixture.js";
import { IconFixture } from "./icon.fixture.js";
import { InputFixture } from "./input.fixture.js";
import { MenuFixture } from "./menu.fixture.js";
import { MenubarFixture } from "./menubar.fixture.js";
import { MeterFixture } from "./meter.fixture.js";
import { NavigationFixture } from "./navigation.fixture.js";
import { PaginationFixture } from "./pagination.fixture.js";
import { PopoverFixture } from "./popover.fixture.js";
import { PopoverInDialogFixture } from "./popover-in-dialog.fixture.js";
import { RadioGroupFixture } from "./radio-group.fixture.js";
import { SwitchFixture } from "./switch.fixture.js";
import { SelectFixture } from "./select.fixture.js";
import { SelectInDialogFixture } from "./select-in-dialog.fixture.js";
import { SkeletonFixture } from "./skeleton.fixture.js";
import { TabsFixture } from "./tabs.fixture.js";
import { TagFixture } from "./tag.fixture.js";
import { TextAreaFixture } from "./text-area.fixture.js";
import { ToastFixture } from "./toast.fixture.js";
import { ToolbarFixture } from "./toolbar.fixture.js";
import { TooltipFixture } from "./tooltip.fixture.js";

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
  Breadcrumb: BreadcrumbFixture,
  Button: ButtonFixture,
  Card: CardFixture,
  Checkbox: CheckboxFixture,
  Dialog: DialogFixture,
  Divider: DividerFixture,
  Field: FieldFixture,
  FieldError: FieldErrorFixture,
  Icon: IconFixture,
  Input: InputFixture,
  Menu: MenuFixture,
  Menubar: MenubarFixture,
  Meter: MeterFixture,
  Navigation: NavigationFixture,
  Pagination: PaginationFixture,
  Popover: PopoverFixture,
  RadioGroup: RadioGroupFixture,
  Switch: SwitchFixture,
  Select: SelectFixture,
  SelectInDialog: SelectInDialogFixture,
  Skeleton: SkeletonFixture,
  Tabs: TabsFixture,
  Tag: TagFixture,
  TextArea: TextAreaFixture,
  Toast: ToastFixture,
  Toolbar: ToolbarFixture,
  Tooltip: TooltipFixture,
  /**
   * Not a component — an *arrangement* of two of them, and the one this port was
   * most likely to get wrong. It has no React counterpart to be compared
   * against; what it proves is asserted directly in the browser spec.
   */
  PopoverInDialog: PopoverInDialogFixture,
};

export function angularFixtureFor(component: string): Type<unknown> {
  const fixture = ANGULAR_FIXTURES[component];
  if (!fixture) throw new Error(`parity harness: no Angular fixture for "${component}"`);
  return fixture;
}
