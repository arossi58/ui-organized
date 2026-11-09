/**
 * What the Code view prints for each mockup page. Kept beside the live pages it
 * describes — change one, change the other.
 */

import { bind, type CodeNode, type PageSpec } from "./composeSample";

const el = (element: string, className: string, children: (CodeNode | string)[]): CodeNode => ({
  element,
  className,
  children,
});

const c = (
  component: string,
  args: Record<string, unknown> = {},
  children?: (CodeNode | string)[],
): CodeNode => ({ component, args, ...(children ? { children } : {}) });

/**
 * A toolbar action that opens its options. Svelte and Vue nest a plain
 * `MenuTrigger`; React projects its trigger onto a Button through `render`;
 * Angular puts the trigger on its own button and points it at a separate
 * `<uio-menu>` (the shape documented on `UioMenu` in packages/angular).
 */
const menu = (label: string, icon: string | undefined, items: string[]): CodeNode => {
  const iconAttr = icon ? ` icon="${icon}"` : "";
  const ref = `${label.toLowerCase()}Menu`;
  const content = c("MenuContent", {}, items.map((item) => c("MenuItem", {}, [item])));
  return {
    fallback: c("Menu", {}, [c("MenuTrigger", {}, [label]), content]),
    variants: {
      react: {
        uses: ["Menu", "MenuTrigger", "Button", "MenuContent", "MenuItem"],
        markup: [
          "<Menu>",
          `  <MenuTrigger render={<Button intent="ghost"${iconAttr}>${label}</Button>} />`,
          "  <MenuContent>",
          ...items.map((item) => `    <MenuItem>${item}</MenuItem>`),
          "  </MenuContent>",
          "</Menu>",
        ].join("\n"),
      },
      angular: {
        uses: ["Button", "MenuTrigger", "Menu", "MenuItem"],
        markup: [
          `<button uioButton uioMenuTrigger [menu]="${ref}" intent="ghost"${iconAttr}>${label}</button>`,
          `<uio-menu #${ref}="uioMenu">`,
          ...items.map((item) => `  <div uioMenuItem>${item}</div>`),
          "</uio-menu>",
        ].join("\n"),
      },
    },
  };
};

const stat = (value: string, label: string) =>
  el("div", "stat", [`<strong>${value}</strong>`, `<span>${label}</span>`]);

export const DASHBOARD_SPEC: PageSpec = {
  name: "Dashboard",
  root: el("main", "dashboard", [
    el("section", "stats", [
      stat("60+", "Components"),
      stat("2", "Figma Plugins"),
      stat("Fully", "Themeable"),
      stat("$0", "Open Source"),
    ]),
    el("section", "panel", [
      el("div", "column", [
        c("SegmentedControl", {
          items: [1, 2, 3, 4, 5].map((n) => ({ value: `tab-${n}`, label: "Tab" })),
          defaultValue: "tab-1",
        }),
        c("RadioGroup", {
          label: "Label",
          orientation: "horizontal",
          options: [1, 2, 3, 4].map((n) => ({ value: `radio-${n}`, label: "Radio" })),
        }),
        c("Input", { label: "Input", placeholder: "Data" }),
        c("TextArea", { label: "Text Area", placeholder: "Your input" }),
        c("DateInput", { label: "Date" }),
      ]),
      c("Divider", { orientation: "vertical" }),
      el("div", "column", [
        c("Toolbar", {}, [
          menu("Menu", "menu", ["New file", "Open…", "Export"]),
          menu("Edit", "edit", ["Undo", "Redo", "Duplicate", "Delete"]),
          c("Divider", { orientation: "vertical" }),
          menu("Select", undefined, ["Select all", "Select none", "Invert selection"]),
          c("Input", { placeholder: "Search" }),
        ]),
        el("div", "row", [
          c("Checkbox", { label: "Checkbox" }),
          c("Checkbox", { label: "Checkbox" }),
          c("Checkbox", { label: "Checkbox" }),
        ]),
        c("Meter", { label: "Storage remaining", value: 62 }),
        c("Switch", { label: "Switch" }),
        c("ColorPicker", { label: "Color", defaultValue: "#bc4900" }),
        c("Select", {
          label: "Label",
          placeholder: "Select",
          options: [
            { value: "react", label: "React" },
            { value: "svelte", label: "Svelte" },
            { value: "vue", label: "Vue" },
            { value: "angular", label: "Angular" },
          ],
        }),
        el("div", "row", [
          c("Button", { intent: "primary" }, ["Button"]),
          c("Button", { intent: "secondary" }, ["Dialog"]),
          c("Button", { intent: "tertiary" }, ["Sheet"]),
        ]),
      ]),
    ]),
  ]),
};

const TABLE_SCRIPT = `// Each action's onRun, the Seats editor and the row detail sheet are
// functions you supply; they're left out here to keep the shape readable.
const MEMBERS = [
  { id: "m-0", name: "Tony Soprano", email: "tony.soprano@example.com", role: "Owner", team: "Platform", status: "active", seats: 1, joined: "2020-01-10", location: "London", plan: "Pro", lastActive: "2026-01-01" },
  // …
];

const COLUMNS = [
  { accessorKey: "name", header: "Name", meta: { primary: true, filter: true } },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role", meta: { filter: { type: "enum" } } },
  { accessorKey: "team", header: "Team", meta: { filter: { type: "enum" } } },
  { accessorKey: "status", header: "Status", meta: { filter: { type: "enum" } } },
  { accessorKey: "seats", header: "Seats", meta: { align: "end", filter: true } },
  { accessorKey: "joined", header: "Joined", meta: { filter: true } },
  { accessorKey: "location", header: "Location", meta: { filter: { type: "enum" } } },
  { accessorKey: "plan", header: "Plan", meta: { filter: { type: "enum" } } },
  { accessorKey: "lastActive", header: "Last active", meta: { filter: true } },
];`;

export const TABLE_SPEC: PageSpec = {
  name: "Members",
  script: TABLE_SCRIPT,
  bindings: {
    columns: { expr: "COLUMNS", field: "columns", angularInit: "COLUMNS" },
    data: { expr: "MEMBERS", field: "members", angularInit: "MEMBERS" },
    getRowId: { expr: "(row) => row.id", field: "rowId", angularInit: "(row: { id: string }) => row.id" },
  },
  root: c("DataTable", {
    label: "Team members",
    columns: bind("columns"),
    data: bind("data"),
    getRowId: bind("getRowId"),
    selection: "multiple",
    searchable: true,
    sortMenu: true,
    paginated: true,
    resizable: true,
    reorderable: true,
    hideableColumns: true,
    exportable: true,
    defaultSorting: [{ id: "name", desc: false }],
    actions: [
      { id: "import", label: "Import", intent: "secondary" },
      { id: "invite", label: "Invite member", intent: "primary", icon: "plus" },
    ],
    rowActions: [
      { id: "edit", label: "Edit member", icon: "pencil" },
      { id: "remove", label: "Remove", icon: "trash-2", destructive: true },
    ],
    bulkActions: [
      { id: "export", label: "Export", icon: "download" },
      { id: "archive", label: "Archive", icon: "trash-2", destructive: true },
    ],
  }),
};
