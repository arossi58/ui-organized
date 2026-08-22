import type { ComponentType, ReactElement } from "react";
import {
  Icon as RIcon,
  IconProvider as RIconProvider,
  registerIconSet as registerReactIconSet,
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
  TextArea as RTextArea,
  Progress as RProgress,
  RadioGroup as RRadioGroup,
  Accordion as RAccordion,
  Popover as RPopover,
  PopoverTrigger as RPopoverTrigger,
  PopoverContent as RPopoverContent,
  PopoverTitle as RPopoverTitle,
  PopoverDescription as RPopoverDescription,
  PopoverClose as RPopoverClose,
  Dialog as RDialog,
  DialogTrigger as RDialogTrigger,
  DialogContent as RDialogContent,
  DialogTitle as RDialogTitle,
  DialogDescription as RDialogDescription,
  DialogFooter as RDialogFooter,
  Tooltip as RTooltip,
  Select as RSelect,
  Field as RField,
  FieldLabel as RFieldLabel,
  FieldControl as RFieldControl,
  FieldDescription as RFieldDescription,
  FieldErrorMessage as RFieldErrorMessage,
  Combobox as RCombobox,
  Menu as RMenu,
  MenuTrigger as RMenuTrigger,
  MenuContent as RMenuContent,
  MenuItem as RMenuItem,
  MenuSeparator as RMenuSeparator,
} from "@ui-organized/react";
import { makeStubIconSet } from "./fixtures/stubIconSet.js";
import IconFixture from "./fixtures/IconFixture.svelte";
import VueIconFixture from "./fixtures/vue/IconFixture.vue";
import ButtonFixture from "./fixtures/ButtonFixture.svelte";
import VueButtonFixture from "./fixtures/vue/ButtonFixture.vue";
import VueDividerFixture from "./fixtures/vue/DividerFixture.vue";
import VueSkeletonFixture from "./fixtures/vue/SkeletonFixture.vue";
import VueTagFixture from "./fixtures/vue/TagFixture.vue";
import VueCardFixture from "./fixtures/vue/CardFixture.vue";
import VueFieldErrorFixture from "./fixtures/vue/FieldErrorFixture.vue";
import VueSwitchFixture from "./fixtures/vue/SwitchFixture.vue";
import VueAvatarFixture from "./fixtures/vue/AvatarFixture.vue";
import VueCheckboxFixture from "./fixtures/vue/CheckboxFixture.vue";
import VueInputFixture from "./fixtures/vue/InputFixture.vue";
import VueTextAreaFixture from "./fixtures/vue/TextAreaFixture.vue";
import VueFieldFixture from "./fixtures/vue/FieldFixture.vue";
import VueProgressFixture from "./fixtures/vue/ProgressFixture.vue";
import VueTabsFixture from "./fixtures/vue/TabsFixture.vue";
import VueAccordionFixture from "./fixtures/vue/AccordionFixture.vue";
import VueRadioGroupFixture from "./fixtures/vue/RadioGroupFixture.vue";
import VueSelectFixture from "./fixtures/vue/SelectFixture.vue";
import VueComboboxFixture from "./fixtures/vue/ComboboxFixture.vue";
import VuePopoverFixture from "./fixtures/vue/PopoverFixture.vue";
import VueDialogFixture from "./fixtures/vue/DialogFixture.vue";
import VueTooltipFixture from "./fixtures/vue/TooltipFixture.vue";
import VueMenuFixture from "./fixtures/vue/MenuFixture.vue";
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
import TextAreaFixture from "./fixtures/TextAreaFixture.svelte";
import ProgressFixture from "./fixtures/ProgressFixture.svelte";
import RadioGroupFixture from "./fixtures/RadioGroupFixture.svelte";
import AccordionFixture from "./fixtures/AccordionFixture.svelte";
import PopoverFixture from "./fixtures/PopoverFixture.svelte";
import DialogFixture from "./fixtures/DialogFixture.svelte";
import TooltipFixture from "./fixtures/TooltipFixture.svelte";
import SelectFixture from "./fixtures/SelectFixture.svelte";
import FieldFixture from "./fixtures/FieldFixture.svelte";
import ComboboxFixture from "./fixtures/ComboboxFixture.svelte";
import MenuFixture from "./fixtures/MenuFixture.svelte";

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

/**
 * A *text* difference that cannot reach a user, because the element carrying it
 * is hidden from assistive technology.
 *
 * Held to the same standard as an attribute allowance: the claim is checked, not
 * trusted. Every element the selector matches must carry `aria-hidden="true"` in
 * the reference output, and the assertion fails if one does not. Text a screen
 * reader can read is not covered by this and never should be.
 */
export interface ParityTextAllowance {
  selector: string;
  reason: string;
}

export interface ParitySpec {
  component: string;
  react: (props: Record<string, any>) => ReactElement;
  svelte: ComponentType<any>;
  /**
   * The Vue fixture. Optional while the Vue port is in progress — a spec without
   * one is simply not compared against Vue, rather than failing, so React and
   * Svelte stay covered as Vue catches up.
   */
  vue?: ComponentType<any>;
  cases: ParityCase[];
  /** Stylesheets in @ui-organized/core this component's contract depends on. */
  stylesheets?: string[];
  allow?: ParityAllowance[];
  allowTextIn?: ParityTextAllowance[];
  /**
   * Limit the comparison to one subtree.
   *
   * Only portalled components need this, and they need it for a reason worth
   * writing down: **the two Ark packages disagree about what a Portal does under
   * SSR.** Ark React renders portalled content inline — there is no DOM to
   * portal into on the server — so a closed Popover still emits its positioner,
   * content, title, description and close button. Ark Svelte renders nothing at
   * all.
   *
   * Neither is wrong and neither is visible: the content is `hidden` with
   * `data-state="closed"` either way, and it is created by the client before it
   * can ever be seen. React even warns that its own `useLayoutEffect`
   * positioning does not run on the server, so the placement it renders is not
   * the placement a user gets.
   *
   * Static rendering therefore cannot say anything true about portalled content,
   * and pretending otherwise would mean either a permanently red gate or an
   * allowance broad enough to hide real bugs. What it *can* compare is the part
   * that is not portalled — the trigger, which is where `aria-controls`,
   * `aria-expanded` and `data-state` live. The portalled half belongs to the
   * Playwright harness, which opens the overlay in a real browser.
   */
  select?: string;
  /**
   * Drop a subtree before comparing. The counterpart to `select`, for when the
   * portal sits *inside* the part worth comparing — Select's popup is a
   * descendant of the field that also holds its label, helper text and hidden
   * native control, so selecting the field cannot exclude the popup.
   */
  exclude?: string;
}

/**
 * React's binding of the fake icon library. See `fixtures/stubIconSet.ts` for
 * what it is standing in for and why a real icon library cannot be used.
 */
function ReactStubIcon({ size, strokeWidth }: { size?: number; strokeWidth?: number }) {
  return <svg data-cut="outline" data-size={size} data-stroke={strokeWidth} />;
}
function ReactStubSolidIcon({ size, strokeWidth }: { size?: number; strokeWidth?: number }) {
  return <svg data-cut="solid" data-size={size} data-stroke={strokeWidth} />;
}
const REACT_STUB_SET = makeStubIconSet<ComponentType<any>>(ReactStubIcon, ReactStubSolidIcon);

// Registered globally, as a consumer does by importing `@ui-organized/react/icons/lucide`,
// so the cases that pass no provider exercise the registry lookup rather than the
// explicit `icons` prop. The Svelte and Vue sets register themselves when their
// fixtures are imported above.
registerReactIconSet(REACT_STUB_SET);

const SIZES = ["sm", "md", "lg"] as const;

export const SPECS: ParitySpec[] = [
  {
    component: "Icon",
    /**
     * Everything here happens before the icon component is reached, and all of
     * it is shared code in core that each framework has to call correctly:
     * reading the provider config, resolving the canonical name, choosing the
     * outline or solid cut, and computing the optical stroke. The stub renders
     * the two numbers that come out of it as attributes.
     *
     * The wrapper is load-bearing for one case. `Icon` renders nothing when the
     * name is not in the set, and comparing nothing against nothing is a case
     * that cannot fail — with a wrapper, the absence is asserted against
     * something that is definitely there.
     */
    react: ({ provider, supplied, name, ...rest }) => {
      const icon = <RIcon name={supplied ? ReactStubIcon : name} {...rest} />;
      return (
        <div className="icon-probe">
          {provider ? (
            <RIconProvider
              library="lucide"
              style="outline"
              strokeAdjustment={false}
              icons={REACT_STUB_SET}
              {...provider}
            >
              {icon}
            </RIconProvider>
          ) : (
            icon
          )}
        </div>
      );
    },
    svelte: IconFixture as unknown as ComponentType<any>,
    vue: VueIconFixture as unknown as ComponentType<any>,
    cases: [
      { name: "default", props: { name: "check" } },
      { name: "size", props: { name: "check", size: 16 } },
      // Decorative by default and `role="img"` with a label — the fork that
      // decides whether an icon is announced at all.
      { name: "labelled", props: { name: "check", label: "Done" } },
      { name: "custom class", props: { name: "check", className: "mine" } },
      { name: "unregistered name", props: { name: "star" } },
      // A component handed over directly: no registry lookup, no adapter, and
      // core's own `{ size, strokeWidth }` fallback instead of the set's.
      { name: "supplied component", props: { supplied: true, size: 32 } },
      { name: "provider/default", props: { name: "check", provider: {} } },
      { name: "provider/solid", props: { name: "check", provider: { style: "solid" } } },
      // Lucide ships no solid set, so falling back to the outline cut is the
      // normal path rather than an edge case.
      {
        name: "provider/solid falls back to outline",
        props: { name: "close", provider: { style: "solid" } },
      },
      // The optical stroke curve, which is where a framework reading the config
      // wrongly shows up as a number rather than as a missing attribute.
      {
        name: "provider/stroke adjustment large",
        props: { name: "check", size: 40, provider: { strokeAdjustment: true } },
      },
      {
        name: "provider/stroke adjustment small",
        props: { name: "check", size: 12, provider: { strokeAdjustment: true } },
      },
      {
        name: "provider/stroke adjustment at the reference size",
        props: { name: "check", size: 32, provider: { strokeAdjustment: true, baseSize: 32 } },
      },
      { name: "provider/baseStroke", props: { name: "check", provider: { baseStroke: 1.5 } } },
      // Solid icons have no stroke at all, so the attribute must be dropped
      // rather than printed as "undefined".
      {
        name: "provider/solid has no stroke",
        props: { name: "check", provider: { style: "solid", strokeAdjustment: true } },
      },
    ],
  },
  {
    component: "Button",
    react: (p) => <RButton {...p}>Label</RButton>,
    svelte: ButtonFixture as unknown as ComponentType<any>,
    vue: VueButtonFixture as unknown as ComponentType<any>,
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
    vue: VueDividerFixture as unknown as ComponentType<any>,
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
    vue: VueSkeletonFixture as unknown as ComponentType<any>,
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
    vue: VueCardFixture as unknown as ComponentType<any>,
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
    vue: VueTagFixture as unknown as ComponentType<any>,
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
    vue: VueSwitchFixture as unknown as ComponentType<any>,
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
    vue: VueAvatarFixture as unknown as ComponentType<any>,
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
    vue: VueFieldErrorFixture as unknown as ComponentType<any>,
    cases: [
      { name: "with message", props: { message: "Required" } },
      { name: "empty renders nothing", props: { message: "" } },
    ],
  },
  {
    component: "Input",
    react: (p) => <RInput {...p} />,
    svelte: InputFixture as unknown as ComponentType<any>,
    vue: VueInputFixture as unknown as ComponentType<any>,
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
    vue: VueCheckboxFixture as unknown as ComponentType<any>,
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
    vue: VueTabsFixture as unknown as ComponentType<any>,
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
  {
    component: "TextArea",
    react: (p) => <RTextArea {...p} />,
    svelte: TextAreaFixture as unknown as ComponentType<any>,
    vue: VueTextAreaFixture as unknown as ComponentType<any>,
    cases: [
      { name: "default" },
      { name: "with label", props: { label: "Bio" } },
      { name: "required", props: { label: "Bio", required: true } },
      { name: "helper text", props: { label: "Bio", helperText: "Characters 0/500" } },
      { name: "error message", props: { label: "Bio", error: "Too long" } },
      ...(["none", "vertical", "horizontal", "both"] as const).map((resize) => ({
        name: `resize/${resize}`,
        props: { resize },
      })),
      ...SIZES.map((size) => ({ name: `size/${size}`, props: { size } })),
      { name: "rows", props: { rows: 6 } },
    ],
  },
  {
    component: "Progress",
    react: (p) => <RProgress {...(p as any)} />,
    svelte: ProgressFixture as unknown as ComponentType<any>,
    vue: VueProgressFixture as unknown as ComponentType<any>,
    cases: [
      { name: "indeterminate (default)" },
      { name: "at 40", props: { value: 40 } },
      { name: "custom max", props: { value: 3, max: 5 } },
      { name: "with label", props: { value: 40, label: "Uploading" } },
      { name: "show value", props: { value: 40, showValue: true } },
      { name: "label and value", props: { value: 40, label: "Uploading", showValue: true } },
      // A ring puts the value inside itself rather than in the header.
      { name: "circular", props: { value: 40, shape: "circular" } },
      { name: "circular with value", props: { value: 40, shape: "circular", showValue: true } },
      ...(["default", "success", "warning", "error"] as const).map((variant) => ({
        name: `variant/${variant}`,
        props: { value: 40, variant },
      })),
      ...SIZES.map((size) => ({ name: `size/${size}`, props: { value: 40, size } })),
    ],
  },
  {
    component: "RadioGroup",
    react: (p) => <RRadioGroup {...(p as any)} />,
    svelte: RadioGroupFixture as unknown as ComponentType<any>,
    vue: VueRadioGroupFixture as unknown as ComponentType<any>,
    cases: (() => {
      const options = [
        { value: "a", label: "Apple" },
        { value: "b", label: "Banana" },
        { value: "c", label: "Cherry", disabled: true },
      ];
      return [
        { name: "default", props: { options } },
        // The group label is a sibling of Ark's Root, so its id is handed to
        // Ark explicitly; without a label the reference is dropped instead.
        { name: "with label", props: { options, label: "Fruit" } },
        { name: "no label, aria-label", props: { options, "aria-label": "Fruit" } },
        { name: "selected", props: { options, defaultValue: "b" } },
        { name: "horizontal", props: { options, orientation: "horizontal" } },
        { name: "group disabled", props: { options, disabled: true, label: "Fruit" } },
        { name: "named", props: { options, name: "fruit", label: "Fruit" } },
        {
          name: "option error",
          props: {
            options: [{ value: "a", label: "Apple", error: "Out of stock" }],
            label: "Fruit",
          },
        },
      ];
    })(),
  },
  {
    component: "Accordion",
    react: (p) => <RAccordion {...(p as any)} />,
    svelte: AccordionFixture as unknown as ComponentType<any>,
    vue: VueAccordionFixture as unknown as ComponentType<any>,
    cases: (() => {
      const items = [
        { value: "one", title: "One", content: "First" },
        { value: "two", title: "Two", content: "Second" },
        { value: "three", title: "Three", content: "Third", disabled: true },
      ];
      return [
        { name: "default" , props: { items } },
        { name: "single mode", props: { items, multiple: false } },
        { name: "open by default", props: { items, defaultValue: ["one"] } },
        { name: "two open", props: { items, defaultValue: ["one", "two"] } },
        { name: "all disabled", props: { items, disabled: true } },
        ...(["default", "bordered", "separated"] as const).map((variant) => ({
          name: `variant/${variant}`,
          props: { items, variant },
        })),
        ...SIZES.map((size) => ({ name: `size/${size}`, props: { items, size } })),
        {
          name: "numeric values",
          props: { items: [{ value: 1, title: "One", content: "First" }] },
        },
      ];
    })(),
  },
  {
    component: "Popover",
    react: ({ contentProps = {}, ...p }) => (
      <RPopover {...p}>
        <RPopoverTrigger>Open</RPopoverTrigger>
        <RPopoverContent {...contentProps}>
          <RPopoverTitle>Title</RPopoverTitle>
          <RPopoverDescription>Description</RPopoverDescription>
          <RPopoverClose>Close</RPopoverClose>
        </RPopoverContent>
      </RPopover>
    ),
    svelte: PopoverFixture as unknown as ComponentType<any>,
    vue: VuePopoverFixture as unknown as ComponentType<any>,
    // Trigger only — see `select` above for why the portalled half cannot be
    // compared by static rendering.
    select: '[data-part="trigger"]',
    cases: [
      // Closed is the state that matters most here: the content is unmounted, so
      // Ark's aria-controls on the trigger would name nothing. popupControls
      // drops it, and this is what pins that.
      { name: "closed" },
      { name: "modal", props: { modal: true } },
      // The positioning bridge: side/align live on Content but Ark configures
      // them on Root, so these exercise the context hand-off in both libraries.
      ...(["top", "right", "bottom", "left"] as const).map((side) => ({
        name: `side/${side}`,
        props: { contentProps: { side } },
      })),
      ...(["start", "center", "end"] as const).map((align) => ({
        name: `align/${align}`,
        props: { contentProps: { align } },
      })),
      { name: "offsets", props: { contentProps: { sideOffset: 16, alignOffset: 4 } } },
    ],
  },
  {
    component: "Dialog",
    react: ({ contentProps = {}, ...p }) => (
      <RDialog {...p}>
        <RDialogTrigger>Open</RDialogTrigger>
        <RDialogContent {...contentProps}>
          <RDialogTitle>Title</RDialogTitle>
          <RDialogDescription>Description</RDialogDescription>
          <RDialogFooter>Footer</RDialogFooter>
        </RDialogContent>
      </RDialog>
    ),
    svelte: DialogFixture as unknown as ComponentType<any>,
    vue: VueDialogFixture as unknown as ComponentType<any>,
    // Trigger only — the rest is portalled. See `select` above.
    select: '[data-part="trigger"]',
    cases: [
      { name: "closed" },
      { name: "modal", props: { modal: true } },
      { name: "non-modal", props: { modal: false } },
    ],
  },
  {
    component: "Tooltip",
    react: (p) => <RTooltip {...(p as any)}>Hover me</RTooltip>,
    svelte: TooltipFixture as unknown as ComponentType<any>,
    vue: VueTooltipFixture as unknown as ComponentType<any>,
    select: '[data-part="trigger"]',
    cases: [
      { name: "default", props: { content: "Copy" } },
      ...(["top", "right", "bottom", "left"] as const).map((side) => ({
        name: `side/${side}`,
        props: { content: "Copy", side },
      })),
      { name: "delays", props: { content: "Copy", delay: 200, closeDelay: 100 } },
    ],
  },
  {
    component: "Select",
    react: (p) => <RSelect {...(p as any)} />,
    svelte: SelectFixture as unknown as ComponentType<any>,
    vue: VueSelectFixture as unknown as ComponentType<any>,
    // Everything except the popup: the field chrome, the trigger and the hidden
    // native select are all rendered in place, and all three carry ARIA that
    // OMIT_ARIA is responsible for.
    exclude: '[data-scope="select"][data-part="positioner"]',
    allowTextIn: [
      {
        selector: "select option",
        reason:
          "Ark Vue's HiddenSelect renders an option's text as \"Apple > \" where " +
          "Ark React renders \"Apple\" — it stringifies through the collection's " +
          "path join. The element is the hidden native select, which exists only " +
          "so the value is submitted with a form: it is aria-hidden and visually " +
          "hidden, the submitted value is the option's `value` rather than its " +
          "text, and no user or screen reader ever encounters the difference. " +
          "The assertion below fails if that element ever stops being aria-hidden.",
      },
    ],
    cases: (() => {
      const options = [
        { value: "a", label: "Apple" },
        { value: "b", label: "Banana" },
        { value: "c", label: "Cherry", disabled: true },
      ];
      return [
        { name: "default", props: { options } },
        { name: "with label", props: { options, label: "Fruit" } },
        // No Label part exists without a label, so Ark's aria-labelledby on the
        // trigger, listbox and hidden select would all dangle. OMIT_ARIA sheds
        // them; this is what pins that across three separate elements.
        { name: "no label", props: { options, placeholder: "Pick one" } },
        { name: "required", props: { options, label: "Fruit", required: true } },
        { name: "helper text", props: { options, label: "Fruit", helperText: "Choose" } },
        { name: "error", props: { options, label: "Fruit", error: "Required" } },
        { name: "selected", props: { options, defaultValue: "b", label: "Fruit" } },
        { name: "disabled", props: { options, label: "Fruit", disabled: true } },
        // Ghost hides the label but still renders it, because three separate
        // ARIA references point at the Label part.
        { name: "ghost", props: { options, label: "Fruit", variant: "ghost" } },
        ...SIZES.map((size) => ({ name: `size/${size}`, props: { options, size, label: "F" } })),
      ];
    })(),
  },
  {
    component: "Field",
    react: ({ errorMessage, ...p }) => (
      <RField {...p}>
        <RFieldLabel>Email</RFieldLabel>
        <RFieldControl />
        <RFieldDescription>Helper</RFieldDescription>
        {errorMessage ? <RFieldErrorMessage>{errorMessage}</RFieldErrorMessage> : null}
      </RField>
    ),
    svelte: FieldFixture as unknown as ComponentType<any>,
    vue: VueFieldFixture as unknown as ComponentType<any>,
    cases: [
      { name: "default" },
      { name: "stacked", props: { layout: "stacked" } },
      { name: "inline", props: { layout: "inline" } },
      // Validity flows to every part through aria-describedby and [data-invalid],
      // which is the whole reason the parts go through Ark rather than plain tags.
      { name: "invalid", props: { invalid: true } },
      { name: "invalid with message", props: { invalid: true, errorMessage: "Required" } },
      { name: "error hidden when valid", props: { errorMessage: "Required" } },
      { name: "disabled", props: { disabled: true } },
      { name: "required", props: { required: true } },
      { name: "readOnly", props: { readOnly: true } },
    ],
  },
  {
    component: "Combobox",
    react: (p) => <RCombobox {...(p as any)} />,
    svelte: ComboboxFixture as unknown as ComponentType<any>,
    vue: VueComboboxFixture as unknown as ComponentType<any>,
    exclude: '[data-scope="combobox"][data-part="positioner"]',
    cases: (() => {
      const options = [
        { value: "a", label: "Apple" },
        { value: "b", label: "Banana" },
        { value: "c", label: "Cherry", disabled: true },
      ];
      return [
        { name: "default", props: { options } },
        { name: "with label", props: { options, label: "Fruit" } },
        { name: "placeholder", props: { options, placeholder: "Search" } },
        { name: "required", props: { options, label: "Fruit", required: true } },
        { name: "helper text", props: { options, label: "Fruit", helperText: "Type to filter" } },
        { name: "error", props: { options, label: "Fruit", error: "Required" } },
        { name: "selected", props: { options, defaultValue: "b", label: "Fruit" } },
        { name: "disabled", props: { options, label: "Fruit", disabled: true } },
        ...SIZES.map((size) => ({ name: `size/${size}`, props: { options, size, label: "F" } })),
      ];
    })(),
  },
  {
    component: "Menu",
    react: ({ contentProps = {}, ...p }) => (
      <RMenu {...p}>
        <RMenuTrigger>Open</RMenuTrigger>
        <RMenuContent {...contentProps}>
          <RMenuItem value="a">Cut</RMenuItem>
          <RMenuSeparator />
          <RMenuItem value="b" destructive>Delete</RMenuItem>
        </RMenuContent>
      </RMenu>
    ),
    svelte: MenuFixture as unknown as ComponentType<any>,
    vue: VueMenuFixture as unknown as ComponentType<any>,
    // Both, and the combination matters. `select` narrows to the trigger, but
    // Ark stamps `data-controls` on it pointing at the menu content — which
    // React renders inline under SSR and Svelte does not. Without `exclude` that
    // id normalises to a positional placeholder on one side and stays a machine
    // reference on the other, on markup that is otherwise identical. Dropping
    // the portalled subtree first puts both sides in the same position: no
    // content element, so both fall back to the machine-id normalisation and
    // agree.
    exclude: '[data-scope="menu"][data-part="positioner"]',
    select: '[data-part="trigger"]',
    cases: [
      { name: "closed" },
      ...(["top", "right", "bottom", "left"] as const).map((side) => ({
        name: `side/${side}`,
        props: { contentProps: { side } },
      })),
      { name: "offsets", props: { contentProps: { sideOffset: 12, alignOffset: 2 } } },
    ],
  },
];
