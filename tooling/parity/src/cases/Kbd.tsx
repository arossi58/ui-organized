import type { ComponentType } from "react";
import { Kbd as RKbd } from "@ui-organized/react";
import KbdFixture from "../fixtures/KbdFixture.svelte";
import VueKbdFixture from "../fixtures/vue/KbdFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
  component: "Kbd",
  // `text` stands for the children, which JSON props cannot carry to the
  // browser gate. Angular projects it.
  react: ({ text, ...p }) => <RKbd {...(p as any)}>{text}</RKbd>,
  svelte: KbdFixture as unknown as ComponentType<any>,
  vue: VueKbdFixture as unknown as ComponentType<any>,
  // `platform` is pinned in every case but one: `auto` follows the machine the
  // gate runs on, and is only `other` before mounting, which is all SSR sees.
  cases: [
    { name: "shortcut, mac", props: { keys: ["mod", "k"], platform: "mac" } },
    { name: "shortcut, other", props: { keys: ["mod", "k"], platform: "other" } },
    { name: "auto before mounting", props: { keys: ["mod", "shift", "p"] } },
    { name: "symbols", props: { keys: ["shift", "enter"], platform: "mac" } },
    { name: "sm", props: { keys: ["esc"], size: "sm", platform: "other" } },
    { name: "written key", props: { text: "F5" } },
  ],
};

export default spec;
