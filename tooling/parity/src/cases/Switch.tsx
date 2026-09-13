import type { ComponentType } from "react";
import { Switch as RSwitch } from "@ui-organized/react";
import SwitchFixture from "../fixtures/SwitchFixture.svelte";
import VueSwitchFixture from "../fixtures/vue/SwitchFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
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
};

export default spec;
