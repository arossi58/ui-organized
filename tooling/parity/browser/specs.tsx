import { useState } from "react";
import type { ComponentType, ReactElement } from "react";
import {
  Menu as RMenu,
  MenuTrigger as RMenuTrigger,
  MenuContent as RMenuContent,
  MenuGroup as RMenuGroup,
  MenuGroupLabel as RMenuGroupLabel,
  MenuCheckboxItem as RMenuCheckboxItem,
  MenuRadioGroup as RMenuRadioGroup,
  MenuRadioItem as RMenuRadioItem,
  ToastProvider as RToastProvider,
  useToastManager as useReactToastManager,
  Dialog as RDialog,
  DialogTrigger as RDialogTrigger,
  DialogContent as RDialogContent,
  DialogTitle as RDialogTitle,
  Select as RSelect,
  type ToastOptions as ReactToastOptions,
} from "@ui-organized/react";
import { SPECS } from "../src/cases/index.js";
import ToastFixture from "./fixtures/ToastFixture.svelte";
import VueToastFixture from "./fixtures/vue/ToastFixture.vue";
import SelectInDialogFixture from "./fixtures/SelectInDialogFixture.svelte";
import VueSelectInDialogFixture from "./fixtures/vue/SelectInDialogFixture.vue";
import MenuOptionsFixture from "./fixtures/MenuOptionsFixture.svelte";
import VueMenuOptionsFixture from "./fixtures/vue/MenuOptionsFixture.vue";

/**
 * What the harness pages can mount.
 *
 * Mostly the SSR gate's own specs, reused rather than restated: a browser
 * scenario differs from a static one in what is *done* to the component, not in
 * what is rendered, and keeping two parallel component lists in step by hand is
 * exactly the kind of drift this package exists to catch.
 *
 * The extras below are the states static rendering cannot reach at all.
 */
export interface BrowserSpec {
  react: (props: Record<string, any>) => ReactElement;
  /**
   * Optional, because tier-1 is not the same list in every library. Alert is in
   * React's, Vue's and Angular's and not in Svelte's, so for that one library
   * there is nothing to compare rather than something failing. A scenario for
   * such a component declares the absence with a `skip` entry, which has to
   * state a reason.
   */
  svelte?: ComponentType<any>;
  vue?: ComponentType<any>;
  angular?: unknown;
}

/**
 * A toast exists only once something creates it, so the fixture is a button
 * rather than a component with props — there is no such thing as a statically
 * rendered toast to compare.
 */
function ReactToastFixture({ toasts = [] }: { toasts?: ReactToastOptions[] }) {
  const toast = useReactToastManager();
  return (
    <RToastProvider>
      <button id="fire" onClick={() => toasts.forEach((t) => toast.add(t))}>
        Fire
      </button>
    </RToastProvider>
  );
}

/**
 * A Select inside a Dialog: two portalled surfaces at once, and the pair the
 * shared stylesheet deliberately stacks in a particular order. Ark writes the
 * z-index onto each positioner by reading it off the popup's own rule, so this
 * is the case that proves the reading happened — and the one Angular's CDK
 * overlay container will have to reproduce.
 */
function ReactSelectInDialogFixture({ options = [] }: { options?: any[] }) {
  return (
    <RDialog>
      <RDialogTrigger>Open</RDialogTrigger>
      <RDialogContent>
        <RDialogTitle>Title</RDialogTitle>
        <RSelect options={options} label="Fruit" />
      </RDialogContent>
    </RDialog>
  );
}

/**
 * The parts that make a menu a *view options* or *sort* menu: a named group,
 * checkbox items, and a radio group with a chosen item.
 *
 * Its own key rather than an addition to the `Menu` case, because every existing
 * Menu scenario compares that fixture's markup and folding four more parts into
 * it would rewrite all of them. Angular had none of these until now, which is
 * why the table's toolbar could not be ported.
 */
function ReactMenuOptionsFixture() {
  // Stateful, because React's checkbox item is controlled: without a handler it
  // is pinned to whatever it was given and a click changes nothing. The other
  // three libraries hold this state internally, so the fixtures differ here in
  // exactly the way the libraries do.
  const [columns, setColumns] = useState<Record<string, boolean>>({ name: true, email: false });
  const [direction, setDirection] = useState("asc");
  return (
    <RMenu>
      <RMenuTrigger>Open</RMenuTrigger>
      <RMenuContent>
        <RMenuGroup>
          <RMenuGroupLabel>Columns</RMenuGroupLabel>
          {["name", "email"].map((id) => (
            <RMenuCheckboxItem
              key={id}
              value={id}
              checked={columns[id] ?? false}
              onCheckedChange={(checked) => setColumns((prev) => ({ ...prev, [id]: checked }))}
            >
              {id === "name" ? "Name" : "Email"}
            </RMenuCheckboxItem>
          ))}
        </RMenuGroup>
        <RMenuRadioGroup value={direction} onValueChange={setDirection}>
          <RMenuGroupLabel>Direction</RMenuGroupLabel>
          <RMenuRadioItem value="asc">Ascending</RMenuRadioItem>
          <RMenuRadioItem value="desc">Descending</RMenuRadioItem>
        </RMenuRadioGroup>
      </RMenuContent>
    </RMenu>
  );
}

const EXTRA: Record<string, BrowserSpec> = {
  MenuOptions: {
    react: () => <ReactMenuOptionsFixture />,
    svelte: MenuOptionsFixture as unknown as ComponentType<any>,
    vue: VueMenuOptionsFixture as unknown as ComponentType<any>,
  },
  Toast: {
    react: (p) => <ReactToastFixture {...p} />,
    svelte: ToastFixture as unknown as ComponentType<any>,
    vue: VueToastFixture as unknown as ComponentType<any>,
  },
  SelectInDialog: {
    react: (p) => <ReactSelectInDialogFixture {...p} />,
    svelte: SelectInDialogFixture as unknown as ComponentType<any>,
    vue: VueSelectInDialogFixture as unknown as ComponentType<any>,
  },
};

/**
 * Every SSR spec, whether or not the other libraries have caught up with it.
 *
 * The filter that used to sit here — only specs with a Vue fixture — made the
 * browser harness unable to mount anything React had first, which is the state
 * every component passes through. `BrowserSpec.svelte` and `.vue` are optional
 * for exactly this reason, and the entry pages already throw a message naming
 * the fix ("the scenario should skip it") when a fixture is missing.
 */
export const BROWSER_SPECS: Record<string, BrowserSpec> = {
  ...Object.fromEntries(
    SPECS.map((s) => [
      s.component,
      { react: s.react, svelte: s.svelte, vue: s.vue } satisfies BrowserSpec,
    ]),
  ),
  ...EXTRA,
};

export function specFor(component: string): BrowserSpec {
  const spec = BROWSER_SPECS[component];
  if (!spec) throw new Error(`parity harness: no browser spec named "${component}"`);
  return spec;
}
