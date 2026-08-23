import type { ComponentType } from "react";
import { Alert as RAlert } from "@ui-organized/react";
import VueAlertFixture from "../fixtures/vue/AlertFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * React and Vue only — the Svelte package has no Alert yet, and a spec without
 * a fixture is simply not compared against that library rather than failing.
 *
 * Angular has one, and it is compared in the browser: see
 * `browser/scenarios/Alert.ts`, which now skips Svelte alone.
 */
const spec: ParitySpec = {
  component: "Alert",
  /**
   * `onDismiss` cannot travel as a function — the browser harness encodes props
   * into a URL as JSON, and the SSR gate hands both sides the same object — so
   * the case sends a boolean and each side turns it into a callback. React and
   * Vue both render the dismiss button on the *presence* of one; only Angular
   * needed a separate `dismissible` input, because an Angular output exists
   * whether or not anyone subscribed.
   */
  react: ({ children = "Something happened", onDismiss, ...p }) => (
    <RAlert {...p} onDismiss={onDismiss ? () => {} : undefined}>
      {children}
    </RAlert>
  ),
  vue: VueAlertFixture as unknown as ComponentType<any>,
  cases: [
    { name: "default" },
    ...(["info", "success", "warning", "error"] as const).map((variant) => ({
      name: `variant/${variant}`,
      props: { variant },
    })),
    { name: "with title", props: { variant: "error", title: "Upload failed" } },
    { name: "dismissible", props: { onDismiss: true } },
    { name: "dismissible with title", props: { title: "Heads up", onDismiss: true } },
  ],
};

export default spec;
