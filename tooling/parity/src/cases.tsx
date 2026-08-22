import type { ComponentType, ReactElement } from "react";
import {
  Button as RButton,
  Card as RCard,
  CardHeader as RCardHeader,
  CardBody as RCardBody,
  CardFooter as RCardFooter,
  Divider as RDivider,
  Skeleton as RSkeleton,
  Switch as RSwitch,
  Tag as RTag,
  Avatar as RAvatar,
  Input as RInput,
  FieldError as RFieldError,
} from "@ui-organized/react";
import ButtonFixture from "./fixtures/ButtonFixture.svelte";
import CardFixture from "./fixtures/CardFixture.svelte";
import DividerFixture from "./fixtures/DividerFixture.svelte";
import SkeletonFixture from "./fixtures/SkeletonFixture.svelte";
import TagFixture from "./fixtures/TagFixture.svelte";
import SwitchFixture from "./fixtures/SwitchFixture.svelte";
import AvatarFixture from "./fixtures/AvatarFixture.svelte";
import InputFixture from "./fixtures/InputFixture.svelte";
import FieldErrorFixture from "./fixtures/FieldErrorFixture.svelte";

/**
 * One entry per component, one row per state worth pinning.
 *
 * `react` builds the element; `svelte` is a fixture component that renders the
 * Svelte equivalent with the same children. Fixtures exist because snippets
 * cannot be written by hand outside a component — which is fine, since a fixture
 * is also exactly what a consumer writes.
 *
 * `props` are passed to both. The two libraries spell the class prop
 * differently, so `className` is rewritten to `class` for the Svelte side rather
 * than being listed twice in every case.
 */
export interface ParityCase {
  name: string;
  props?: Record<string, unknown>;
}

export interface ParitySpec {
  component: string;
  react: (props: Record<string, any>) => ReactElement;
  svelte: ComponentType<any>;
  cases: ParityCase[];
}

const SIZES = ["sm", "md", "lg"] as const;

export const SPECS: ParitySpec[] = [
  {
    component: "Button",
    react: (p) => <RButton {...p}>Label</RButton>,
    svelte: ButtonFixture as unknown as ComponentType<any>,
    cases: [
      { name: "default" },
      ...(["primary", "secondary", "tertiary", "ghost", "destructive", "destructive-ghost"] as const).flatMap(
        (intent) => SIZES.map((size) => ({ name: `${intent}/${size}`, props: { intent, size } })),
      ),
      { name: "disabled", props: { disabled: true } },
      { name: "submit", props: { type: "submit" } },
      { name: "custom class", props: { className: "mine" } },
      { name: "aria-label", props: { "aria-label": "Save" } },
    ],
  },
  {
    component: "Divider",
    react: (p) => <RDivider {...p} />,
    svelte: DividerFixture as unknown as ComponentType<any>,
    cases: [
      { name: "default" },
      { name: "vertical", props: { orientation: "vertical" } },
      ...(["none", "sm", "md", "lg"] as const).map((spacing) => ({
        name: `spacing/${spacing}`,
        props: { spacing },
      })),
    ],
  },
  {
    component: "Skeleton",
    react: (p) => <RSkeleton {...p} />,
    svelte: SkeletonFixture as unknown as ComponentType<any>,
    cases: [
      { name: "default" },
      ...(["text", "circle", "rect", "rounded"] as const).map((variant) => ({
        name: `variant/${variant}`,
        props: { variant },
      })),
      { name: "not animated", props: { animated: false } },
      { name: "sized (number)", props: { width: 120, height: 16 } },
      { name: "sized (string)", props: { width: "50%", height: "1rem" } },
      { name: "multi-line", props: { lines: 3 } },
      { name: "multi-line sized", props: { lines: 4, width: 200 } },
    ],
  },
  {
    component: "Card",
    react: (p) => (
      <RCard {...p}>
        <RCardHeader>Header</RCardHeader>
        <RCardBody>Body</RCardBody>
        <RCardFooter>Footer</RCardFooter>
      </RCard>
    ),
    svelte: CardFixture as unknown as ComponentType<any>,
    cases: [
      { name: "default" },
      { name: "elevated", props: { variant: "elevated" } },
      ...(["none", "sm", "md", "lg"] as const).map((padding) => ({
        name: `padding/${padding}`,
        props: { padding },
      })),
    ],
  },
  {
    component: "Tag",
    react: (p) => <RTag {...p}>Label</RTag>,
    svelte: TagFixture as unknown as ComponentType<any>,
    cases: [
      { name: "default" },
      ...(["success", "info", "info-secondary", "caution", "warning", "error"] as const).map(
        (variant) => ({ name: `variant/${variant}`, props: { variant } }),
      ),
      ...SIZES.map((size) => ({ name: `size/${size}`, props: { size } })),
      { name: "subdued", props: { emphasized: false } },
    ],
  },
  {
    component: "Switch",
    react: (p) => <RSwitch {...p} />,
    svelte: SwitchFixture as unknown as ComponentType<any>,
    cases: [
      { name: "default" },
      { name: "with label", props: { label: "Wifi" } },
      // The case OMIT_ARIA exists for: no Label part is rendered, so Ark's
      // aria-labelledby would name an element that does not exist.
      { name: "no label, aria-label", props: { "aria-label": "Wifi" } },
      { name: "checked", props: { defaultChecked: true } },
      { name: "disabled", props: { disabled: true, label: "Wifi" } },
      { name: "required", props: { required: true, label: "Wifi" } },
      { name: "named", props: { name: "wifi", label: "Wifi" } },
    ],
  },
  {
    component: "Avatar",
    react: (p) => <RAvatar {...p} />,
    svelte: AvatarFixture as unknown as ComponentType<any>,
    cases: [
      { name: "initials from name", props: { name: "Ada Lovelace" } },
      { name: "single name", props: { name: "Ada" } },
      ...(["xs", "sm", "md", "lg", "xl"] as const).map((size) => ({
        name: `size/${size}`,
        props: { size, name: "Ada Lovelace" },
      })),
      ...(["circle", "rounded", "square"] as const).map((shape) => ({
        name: `shape/${shape}`,
        props: { shape, name: "Ada Lovelace" },
      })),
      { name: "with image", props: { src: "/a.png", name: "Ada Lovelace" } },
    ],
  },
  {
    component: "FieldError",
    // React takes the message as children; Svelte takes it as `message`,
    // because a snippet is opaque and cannot be tested for emptiness.
    react: ({ message, ...p }) => <RFieldError {...p}>{message}</RFieldError>,
    svelte: FieldErrorFixture as unknown as ComponentType<any>,
    cases: [
      { name: "with message", props: { message: "Required" } },
      { name: "empty renders nothing", props: { message: "" } },
    ],
  },
  {
    component: "Input",
    react: (p) => <RInput {...p} />,
    svelte: InputFixture as unknown as ComponentType<any>,
    cases: [
      { name: "default" },
      { name: "with label", props: { label: "Email" } },
      { name: "required", props: { label: "Email", required: true } },
      { name: "helper text", props: { label: "Email", helperText: "We never share it" } },
      // The error path replaces the helper text and drives [data-invalid]
      // through every part of the field.
      { name: "error message", props: { label: "Email", error: "Required" } },
      { name: "invalid without message", props: { label: "Email", error: true } },
      { name: "helper hidden by error", props: { label: "E", helperText: "H", error: "Bad" } },
      ...(["sm", "md", "lg"] as const).map((size) => ({ name: `size/${size}`, props: { size } })),
      { name: "disabled", props: { label: "Email", disabled: true } },
      { name: "placeholder", props: { placeholder: "you@example.com" } },
      { name: "type=email", props: { type: "email" } },
    ],
  },
];
