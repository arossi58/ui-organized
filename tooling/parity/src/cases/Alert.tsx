import type { ComponentType } from "react";
import { Alert as RAlert } from "@ui-organized/react";
import SvelteAlertFixture from "../fixtures/AlertFixture.svelte";
import VueAlertFixture from "../fixtures/vue/AlertFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Alert",
  /**
   * `onDismiss` cannot travel as a function — the browser harness encodes props
   * into a URL as JSON, and the SSR gate hands both sides the same object — so
   * the case sends a boolean and each side turns it into a callback. React,
   * Svelte and Vue all render the dismiss button on the *presence* of one; only
   * Angular needed a separate `dismissible` input, because an Angular output
   * exists whether or not anyone subscribed.
   */
  react: ({ children = "Something happened", onDismiss, ...p }) => (
    <RAlert {...p} onDismiss={onDismiss ? () => {} : undefined}>
      {children}
    </RAlert>
  ),
  svelte: SvelteAlertFixture as unknown as ComponentType<any>,
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
