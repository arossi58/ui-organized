import type { ComponentType } from "react";
import { Icon as RIcon, IconProvider as RIconProvider } from "@ui-organized/react";
import { REACT_STUB_SET, ReactStubIcon } from "../fixtures/reactIcons.js";
import IconFixture from "../fixtures/IconFixture.svelte";
import VueIconFixture from "../fixtures/vue/IconFixture.vue";
import type { ParitySpec } from "./spec.js";

const spec: ParitySpec = {
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
};

export default spec;
