import type { ComponentType } from "react";
import { Button as RButton, Calendar as RCalendar } from "@ui-organized/react";
import CalendarFixture from "../fixtures/CalendarFixture.svelte";
import VueCalendarFixture from "../fixtures/vue/CalendarFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * Bounds within 2026 pin the year list and the view, so no case depends on
 * today. Presets are absolute for the same reason: a relative one resolves
 * against the clock, which the harness does not freeze.
 */
const IN_2026 = { min: "2026-01-01", max: "2026-12-31" };
const PRESETS = [
  { label: "Spring break", value: { start: "2026-03-09", end: "2026-03-13" } },
  { label: "Launch day", value: "2026-03-20" },
  // Outside `max`, so disabled.
  { label: "Next year", value: "2027-01-04" },
];

const spec: ParitySpec = {
  component: "Calendar",
  // `withFooter` stands for the footer slot.
  react: ({ withFooter, ...p }) => (
    <RCalendar
      {...(p as any)}
      footer={withFooter ? <RButton intent="primary" size="sm">Apply</RButton> : undefined}
    />
  ),
  svelte: CalendarFixture as unknown as ComponentType<any>,
  vue: VueCalendarFixture as unknown as ComponentType<any>,
  // The year Selects portal their popups into the calendar; only the closed
  // trigger and hidden native control are compared.
  exclude: '[data-scope="select"][data-part="positioner"]',
  allowTextIn: [
    {
      selector: "select option",
      reason:
        "Ark Vue's HiddenSelect renders an option's text through the collection's " +
        "path join. The element is the year Select's hidden native control: " +
        "aria-hidden, visually hidden, and submitted by value. Same allowance as Select's.",
    },
  ],
  cases: [
    { name: "single", props: { defaultValue: "2026-03-18", ...IN_2026 } },
    { name: "range", props: { mode: "range", defaultValue: { start: "2026-03-09", end: "2026-03-13" }, ...IN_2026 } },
    { name: "two months", props: { mode: "range", numMonths: 2, defaultValue: { start: "2026-03-09", end: "2026-04-02" }, ...IN_2026 } },
    // The range matches the first preset, which is pressed; the third is out of bounds.
    {
      name: "presets, card",
      props: { mode: "range", variant: "card", presets: PRESETS, defaultValue: { start: "2026-03-09", end: "2026-03-13" }, ...IN_2026 },
    },
    { name: "single with presets", props: { presets: PRESETS, defaultValue: "2026-03-20", ...IN_2026 } },
    { name: "footer", props: { defaultValue: "2026-03-18", withFooter: true, ...IN_2026 } },
  ],
};

export default spec;
