import { part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * The well, the chips in it, and the three things you can do to one.
 *
 * Each chip is two elements — the preview and a hidden input that replaces it
 * during an edit — so the interactive cases below are the only ones that ever
 * see the second half. The SSR gate covers the static states for the other
 * three; Angular is compared in the browser only, so they are repeated here.
 */
const SIZES = ["sm", "md", "lg"] as const;
const TAGS = ["design", "system"];
const ENTRY = part("tags-input", "input");
const PREVIEW = part("tags-input", "item-preview");
const ITEM_INPUT = part("tags-input", "item-input");
const DELETE = part("tags-input", "item-delete-trigger");

const scenarios: BrowserScenario[] = [
  ...staticScenarios("TagsInput", [
    { name: "default" },
    { name: "with label", props: { label: "Tags" } },
    { name: "required", props: { label: "Tags", required: true } },
    { name: "helper text", props: { label: "Tags", helperText: "Comma separated" } },
    { name: "error message", props: { label: "Tags", error: "Too many" } },
    { name: "invalid without message", props: { label: "Tags", error: true } },
    { name: "helper hidden by error", props: { label: "T", helperText: "H", error: "Bad" } },
    ...SIZES.map((size) => ({ name: `size/${size}`, props: { size, label: "Tags" } })),
    { name: "placeholder", props: { placeholder: "Add a tag" } },
    // The chips are read back from the machine, not mapped from the prop, so
    // a tag list that never reached the machine renders as an empty well.
    { name: "default value", props: { defaultValue: TAGS } },
    { name: "controlled value", props: { value: TAGS } },
    { name: "single tag", props: { defaultValue: ["one"] } },
    { name: "at max", props: { defaultValue: TAGS, max: 2 } },
    { name: "under max", props: { defaultValue: TAGS, max: 5 } },
    { name: "not editable", props: { defaultValue: TAGS, editable: false } },
    { name: "delimiter", props: { delimiter: ";" } },
    { name: "add on paste", props: { addOnPaste: true } },
    { name: "disabled", props: { label: "Tags", defaultValue: TAGS, disabled: true } },
    /**
     * Read-only disables the entry field and puts the tab stop on the control
     * instead, so the chips stay reachable by keyboard with nothing to type
     * into.
     */
    { name: "read only", props: { label: "Tags", defaultValue: TAGS, readOnly: true } },
    { name: "named", props: { name: "tags", defaultValue: TAGS } },
  ]),
  {
    /**
     * Typing and pressing Enter, which is how every tag gets into the list. The
     * new chip is machine state — nothing about the props changed — so this is
     * the case that proves the list is read back rather than mirrored.
     */
    component: "TagsInput",
    name: "tag added",
    props: {},
    steps: [
      { do: "click", target: ENTRY },
      { do: "awaitFocus", target: ENTRY },
      { do: "press", key: "a" },
      { do: "press", key: "b" },
      { do: "press", key: "Enter" },
      { do: "wait", target: `${PREVIEW}[data-value="ab"]` },
    ],
    regions: ["#mount"],
  },
  {
    /**
     * Backspace at the start of an empty field highlights the last chip rather
     * than deleting it. `data-highlighted` is what the stylesheet reads, and one
     * press away from data loss is the whole reason the state exists.
     */
    component: "TagsInput",
    name: "tag highlighted",
    props: { defaultValue: TAGS },
    steps: [
      { do: "click", target: ENTRY },
      { do: "awaitFocus", target: ENTRY },
      { do: "press", key: "Backspace" },
      { do: "wait", target: `${PREVIEW}[data-highlighted]` },
    ],
    regions: ["#mount"],
  },
  {
    /** Clicking a chip's delete trigger, which is the one path with no keyboard. */
    component: "TagsInput",
    name: "tag removed",
    props: { defaultValue: ["only"] },
    steps: [
      { do: "click", target: DELETE },
      { do: "wait", target: `${part("tags-input", "root")}[data-empty]` },
    ],
    regions: ["#mount"],
  },
  {
    /**
     * An edit swaps the chip for its own input: the preview goes `hidden` and
     * the input loses it, in place, without the row remounting.
     *
     * Reached by keyboard rather than by the double-click a pointer would use,
     * because the harness drives clicks one at a time and two of them landing
     * inside the double-click interval is a race rather than a gesture. The
     * keyboard route is the same transition — highlight a chip, then Enter —
     * and it is the one a keyboard user actually has.
     */
    component: "TagsInput",
    name: "tag being edited",
    props: { defaultValue: ["one"] },
    steps: [
      { do: "click", target: ENTRY },
      { do: "awaitFocus", target: ENTRY },
      { do: "press", key: "Backspace" },
      { do: "press", key: "Enter" },
      { do: "wait", target: `${ITEM_INPUT}:not([hidden])` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
