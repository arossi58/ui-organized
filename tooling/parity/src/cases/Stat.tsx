import type { ComponentType } from "react";
import { Stat as RStat } from "@ui-organized/react";
import StatFixture from "../fixtures/StatFixture.svelte";
import VueStatFixture from "../fixtures/vue/StatFixture.vue";
import type { ParitySpec } from "./spec.js";

const BASE = { label: "Revenue", value: "$48,260" };
const DELTA = { ...BASE, delta: "+12.4%", description: "vs last month" };

/**
 * `chart` stands for the chart slot, which JSON props cannot carry: one fixed
 * span in every library.
 */
const spec: ParitySpec = {
  component: "Stat",
  react: ({ chart, ...p }) => (
    <RStat
      {...(p as any)}
      chart={chart ? <span className="parity-chart">Chart</span> : undefined}
    />
  ),
  svelte: StatFixture as unknown as ComponentType<any>,
  vue: VueStatFixture as unknown as ComponentType<any>,
  stylesheets: ["Card/Card.css", "Tag/Tag.css", "Stat/Stat.css"],
  cases: [
    { name: "label and value", props: BASE },
    { name: "up", props: { ...DELTA, trend: "up" } },
    { name: "down", props: { ...DELTA, delta: "-3.1%", trend: "down" } },
    { name: "flat", props: { ...DELTA, delta: "0%", trend: "flat" } },
    { name: "up but negative", props: { ...DELTA, trend: "up", sentiment: "negative" } },
    { name: "delta without trend", props: { ...BASE, delta: "+4" } },
    { name: "description only", props: { ...BASE, description: "Updated hourly" } },
    { name: "trend label", props: { ...DELTA, trend: "up", trendLabel: "Up" } },
    { name: "plain", props: { ...DELTA, trend: "up", variant: "plain" } },
    { name: "sm", props: { ...DELTA, trend: "down", size: "sm" } },
    { name: "lg", props: { ...DELTA, trend: "up", size: "lg" } },
    { name: "chart", props: { ...DELTA, trend: "up", chart: true } },
  ],
};

export default spec;
