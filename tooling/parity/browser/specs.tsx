import type { ComponentType, ReactElement } from "react";
import {
  ToastProvider as RToastProvider,
  useToastManager as useReactToastManager,
  Alert as RAlert,
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
   * React's and Angular's and in neither Svelte's nor Vue's, so there is nothing
   * to compare rather than something failing. A scenario for such a component
   * declares the absence with a `skip` entry, which has to state a reason.
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

const EXTRA: Record<string, BrowserSpec> = {
  // Not in the Svelte or Vue tier-1 lists, so React is the only side to compare
  // Angular against.
  Alert: {
    // `onDismiss` cannot travel through a URL as a function, so the scenario
    // sends a boolean and the fixture supplies the callback. React renders the
    // dismiss button on the *presence* of the prop; Angular takes an explicit
    // `dismissible` input, because an Angular output exists whether or not
    // anyone subscribed.
    react: ({ children = "Something happened", onDismiss, ...p }) => (
      <RAlert {...p} onDismiss={onDismiss ? () => {} : undefined}>
        {children}
      </RAlert>
    ),
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

export const BROWSER_SPECS: Record<string, BrowserSpec> = {
  ...Object.fromEntries(
    SPECS.filter((s) => s.vue).map((s) => [
      s.component,
      { react: s.react, svelte: s.svelte, vue: s.vue! } satisfies BrowserSpec,
    ]),
  ),
  ...EXTRA,
};

export function specFor(component: string): BrowserSpec {
  const spec = BROWSER_SPECS[component];
  if (!spec) throw new Error(`parity harness: no browser spec named "${component}"`);
  return spec;
}
