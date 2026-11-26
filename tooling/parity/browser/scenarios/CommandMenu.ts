import { part, type BrowserScenario } from "./scenario.js";

const COMMANDS = [
  { value: "new", label: "New file", group: "File", shortcut: ["mod", "n"] },
  { value: "open", label: "Open file", group: "File", shortcut: ["mod", "o"] },
  { value: "settings", label: "Settings", group: "General", keywords: ["preferences"] },
  { value: "theme", label: "Toggle theme", group: "General", disabled: true },
  { value: "help", label: "Help" },
];

const OPEN = { items: COMMANDS, defaultOpen: true, platform: "mac" };
const list = ".command-menu__list";
const row = (value: string) => `${part("listbox", "item")}[data-value="${value}"]`;
const REGIONS = [part("dialog", "positioner"), "#mount"];

/**
 * Open, focused, and the first command highlighted. zag draws the highlight
 * once its search box has had focus, and Ark Svelte and Vue focus it a tick
 * after React; the modal also hides the page a tick apart. All three are
 * waited on, and all three are in the compared regions.
 */
const opened = [
  { do: "wait", target: `${part("dialog", "content")}[data-state="open"]` },
  { do: "awaitFocus", target: part("listbox", "input") },
  { do: "wait", target: `${row("new")}[data-highlighted]` },
  { do: "wait", target: '#mount[aria-hidden="true"]' },
] as const;

const type = (text: string) => [...text].map((key) => ({ do: "press", key }) as const);

const scenarios: BrowserScenario[] = [
  {
    component: "CommandMenu",
    name: "open",
    props: OPEN,
    steps: [...opened],
    regions: REGIONS,
  },
  {
    component: "CommandMenu",
    // Typing narrows by label, drops the group left empty, and moves the
    // highlight to the first match.
    name: "typing filters",
    props: OPEN,
    steps: [...opened, ...type("open"), { do: "wait", target: `${list}:not(:has(${row("new")}))` }],
    regions: REGIONS,
  },
  {
    component: "CommandMenu",
    name: "a keyword finds a command",
    props: OPEN,
    steps: [
      ...opened,
      ...type("prefer"),
      { do: "wait", target: `${row("settings")}[data-highlighted]` },
    ],
    regions: REGIONS,
  },
  {
    component: "CommandMenu",
    // A disabled option stands in for the empty list, which a listbox may not be.
    name: "nothing matches",
    props: OPEN,
    steps: [...opened, ...type("zz"), { do: "wait", target: ".command-menu__empty" }],
    regions: REGIONS,
  },
  {
    component: "CommandMenu",
    name: "arrows move the highlight",
    props: OPEN,
    steps: [
      ...opened,
      { do: "press", key: "ArrowDown" },
      { do: "wait", target: `${row("open")}[data-highlighted]` },
    ],
    regions: REGIONS,
  },
  {
    component: "CommandMenu",
    // loopFocus: up from the first command wraps to the last, skipping the
    // disabled one on the way.
    name: "arrows wrap at the ends",
    props: OPEN,
    steps: [
      ...opened,
      { do: "press", key: "ArrowUp" },
      { do: "wait", target: `${row("help")}[data-highlighted]` },
    ],
    regions: REGIONS,
  },
  {
    component: "CommandMenu",
    name: "Enter runs the command and closes",
    props: OPEN,
    steps: [
      ...opened,
      { do: "press", key: "Enter" },
      { do: "awaitHidden", target: part("dialog", "content") },
    ],
    regions: ["#mount"],
  },
  {
    component: "CommandMenu",
    name: "Escape closes",
    props: OPEN,
    steps: [
      ...opened,
      { do: "press", key: "Escape" },
      { do: "awaitHidden", target: part("dialog", "content") },
    ],
    regions: ["#mount"],
  },
  {
    component: "CommandMenu",
    /**
     * `ctrl+k`, not `mod+k`. The gate's Desktop Chrome device reports a
     * Windows user agent over the host's `navigator.platform`, and Playwright
     * resolves ControlOrMeta from the former while the menu reads the latter,
     * so on a Mac host the two disagree about what `mod` is. `mod` itself is
     * pinned by core's unit tests; this is about the listener.
     */
    name: "the hotkey opens it",
    props: { items: COMMANDS, hotkey: "ctrl+k", platform: "mac" },
    steps: [{ do: "press", key: "Control+k" }, ...opened],
    regions: REGIONS,
  },
];

export default scenarios;
