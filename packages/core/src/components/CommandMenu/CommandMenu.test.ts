import { describe, expect, it } from "vitest";
import { createContains } from "../../contains.js";
import {
  filterCommandItems,
  firstCommand,
  groupCommandItems,
  orderCommandItems,
} from "./CommandMenu.styles.js";

const contains = createContains("en");
const ITEMS = [
  { value: "new", label: "New file", group: "File" },
  { value: "settings", label: "Settings", group: "General", keywords: ["preferences"] },
  { value: "open", label: "Open file", group: "File" },
  { value: "theme", label: "Toggle theme", group: "General", disabled: true },
  { value: "help", label: "Help" },
];

describe("filterCommandItems", () => {
  it("keeps everything for an empty or blank query", () => {
    expect(filterCommandItems(ITEMS, "", contains)).toHaveLength(5);
    expect(filterCommandItems(ITEMS, "   ", contains)).toHaveLength(5);
  });

  it("matches on the label or any keyword, ignoring case", () => {
    expect(filterCommandItems(ITEMS, "FILE", contains).map((i) => i.value)).toEqual([
      "new",
      "open",
    ]);
    expect(filterCommandItems(ITEMS, "prefer", contains).map((i) => i.value)).toEqual(["settings"]);
    expect(filterCommandItems(ITEMS, "zzz", contains)).toEqual([]);
  });
});

describe("groupCommandItems and orderCommandItems", () => {
  it("buckets by group in first-appearance order, ungrouped in a null bucket", () => {
    expect(
      groupCommandItems(ITEMS).map(([group, items]) => [group, items.map((i) => i.value)]),
    ).toEqual([
      ["File", ["new", "open"]],
      ["General", ["settings", "theme"]],
      [null, ["help"]],
    ]);
  });

  it("puts the commands in drawn order, which is what the arrow keys walk", () => {
    expect(orderCommandItems(ITEMS).map((i) => i.value)).toEqual([
      "new",
      "open",
      "settings",
      "theme",
      "help",
    ]);
  });

  it("drops a group whose commands were all filtered out", () => {
    const groups = groupCommandItems(filterCommandItems(ITEMS, "help", contains));
    expect(groups.map(([group]) => group)).toEqual([null]);
  });
});

describe("firstCommand", () => {
  it("is the first command on screen that can run", () => {
    expect(firstCommand(ITEMS)).toBe("new");
    expect(firstCommand(filterCommandItems(ITEMS, "theme", contains))).toBeNull();
    expect(firstCommand([])).toBeNull();
  });
});
