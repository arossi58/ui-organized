import type { Type } from "@angular/core";
import { AlertFixture } from "./alert.fixture.js";
import { ButtonFixture } from "./button.fixture.js";
import { CardFixture } from "./card.fixture.js";
import { CheckboxFixture } from "./checkbox.fixture.js";
import { DividerFixture } from "./divider.fixture.js";
import { FieldFixture } from "./field.fixture.js";
import { FieldErrorFixture } from "./field-error.fixture.js";
import { IconFixture } from "./icon.fixture.js";
import { InputFixture } from "./input.fixture.js";
import { RadioGroupFixture } from "./radio-group.fixture.js";
import { SwitchFixture } from "./switch.fixture.js";
import { SkeletonFixture } from "./skeleton.fixture.js";
import { TagFixture } from "./tag.fixture.js";
import { TextAreaFixture } from "./text-area.fixture.js";
import { PopoverInDialogFixture } from "./popover-in-dialog.fixture.js";

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
  Alert: AlertFixture,
  Button: ButtonFixture,
  Card: CardFixture,
  Checkbox: CheckboxFixture,
  Divider: DividerFixture,
  Field: FieldFixture,
  FieldError: FieldErrorFixture,
  Icon: IconFixture,
  Input: InputFixture,
  RadioGroup: RadioGroupFixture,
  Switch: SwitchFixture,
  Skeleton: SkeletonFixture,
  Tag: TagFixture,
  TextArea: TextAreaFixture,
  // Not a component in the library yet — see the fixture for what it proves.
  PopoverInDialog: PopoverInDialogFixture,
};

export function angularFixtureFor(component: string): Type<unknown> {
  const fixture = ANGULAR_FIXTURES[component];
  if (!fixture) throw new Error(`parity harness: no Angular fixture for "${component}"`);
  return fixture;
}
