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
  Checkbox as RCheckbox,
  Tabs as RTabs,
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
import CheckboxFixture from "./fixtures/CheckboxFixture.svelte";
import TabsFixture from "./fixtures/TabsFixture.svelte";

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

/**
 * An attribute that legitimately differs between libraries, and why.
 *
 * These are not suppressions. Each one is checked against the component's own
 * stylesheet, and an allowance for an attribute the CSS actually selects on is
 * itself a failure — so an allowance can never hide the bug this suite exists to
 * catch. The rule is: if the stylesheet does not read it, the difference is
 * invisible and can wait; if it does, it is a real defect however plausible the
 * explanation.
 */
export interface ParityAllowance {
  attribute: string;
  reason: string;
}

export interface ParitySpec {
  component: string;
  react: (props: Record<string, any>) => ReactElement;
  svelte: ComponentType<any>;
  cases: ParityCase[];
  /** Stylesheets in @ui-organized/core this component's contract depends on. */
  stylesheets?: string[];
  allow?: ParityAllowance[];
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
  {
    component: "Checkbox",
    react: (p) => <RCheckbox {...p} />,
    svelte: CheckboxFixture as unknown as ComponentType<any>,
    cases: [
      { name: "default" },
      { name: "with label", props: { label: "Accept" } },
      // Same dangling-aria-labelledby case OMIT_ARIA guards on Switch.
      { name: "no label, aria-label", props: { "aria-label": "Accept" } },
      { name: "checked", props: { defaultChecked: true, label: "Accept" } },
      // Ark folds indeterminate into the checked value; the facade keeps it a
      // separate boolean, and the indicator swaps to a dash.
      { name: "indeterminate", props: { indeterminate: true, label: "Accept" } },
      { name: "disabled", props: { disabled: true, label: "Accept" } },
      { name: "required", props: { required: true, label: "Accept" } },
      { name: "named", props: { name: "accept", label: "Accept" } },
    ],
  },
  {
    component: "Tabs",
    react: (p) => <RTabs {...(p as any)} />,
    svelte: TabsFixture as unknown as ComponentType<any>,
    stylesheets: ["Tabs/Tabs.css"],
    allow: [
      {
        attribute: "data-state",
        reason:
          "@ark-ui/svelte is on 5.24 while @ark-ui/react is on 5.37, and the " +
          "tab panel gained data-state=open|closed in between. Tabs.css styles " +
          "the panel on [hidden] and [data-selected], both of which Svelte does " +
          "emit, so nothing renders differently. Remove this once the Svelte " +
          "package catches up — the assertion below fails the moment Tabs.css " +
          "starts selecting on data-state.",
      },
    ],
    cases: (() => {
      // String labels and content, because React takes ReactNode here and Svelte
      // takes a string-or-snippet union; strings are the shape both accept.
      const tabs = [
        { value: "one", label: "One", content: "First" },
        { value: "two", label: "Two", content: "Second" },
        { value: "three", label: "Three", content: "Third", disabled: true },
      ];
      return [
        { name: "default", props: { tabs } },
        { name: "second selected", props: { tabs, defaultValue: "two" } },
        { name: "vertical", props: { tabs, orientation: "vertical" } },
        { name: "small", props: { tabs, size: "small" } },
        // Numeric values are coerced at the zag boundary in both libraries.
        {
          name: "numeric values",
          props: {
            tabs: [
              { value: 1, label: "One", content: "First" },
              { value: 2, label: "Two", content: "Second" },
            ],
          },
        },
      ];
    })(),
  },
];
