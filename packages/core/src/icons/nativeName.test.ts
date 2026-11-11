import { describe, expect, it } from "vitest";
import { isNativeName, toNativeName } from "./nativeName.js";

/**
 * Representative cases. The catalogue-wide checks, every export each library
 * ships, live in the framework packages that have the libraries installed:
 * `packages/react/src/icons/nativeName.catalog.test.ts`.
 */
describe("toNativeName", () => {
  it.each([
    ["lucide", "X", "x"],
    ["lucide", "ChevronDown", "chevron-down"],
    ["lucide", "ChevronDownIcon", "chevron-down"],
    ["lucide", "LucideChevronDown", "chevron-down"],
    ["lucide", "Grid2x2", "grid-2x2"],
    ["lucide", "Grid2X2", "grid-2x2"],
    ["lucide", "ArrowUpAZ", "arrow-up-a-z"],
    ["lucide", "ALargeSmall", "a-large-small"],
    ["lucide", "Trash2", "trash-2"],
    ["lucide", "Move3d", "move-3d"],
    ["lucide", "Clock10", "clock-10"],
    ["lucide", "lucideCircleAlert", "circle-alert"],
    ["tabler", "IconX", "x"],
    ["tabler", "IconMenu2", "menu-2"],
    ["tabler", "IconAB2", "a-b-2"],
    ["tabler", "IconH1", "h-1"],
    ["tabler", "IconStarFilled", "star-filled"],
    ["tabler", "tablerChevronDown", "chevron-down"],
    ["tabler", "tablerStarFill", "star-filled"],
    ["heroicons", "XMarkIcon", "x-mark"],
    ["heroicons", "Cog6ToothIcon", "cog-6-tooth"],
    ["heroicons", "Bars3BottomLeftIcon", "bars-3-bottom-left"],
    ["heroicons", "Squares2X2Icon", "squares-2x2"],
    ["heroicons", "heroSquares2x2", "squares-2x2"],
    ["heroicons", "heroXMarkSolid", "x-mark"],
  ] as const)("%s %s → %s", (library, exportName, native) => {
    expect(toNativeName(library, exportName)).toBe(native);
  });

  it("passes native names through untouched", () => {
    expect(toNativeName("lucide", "arrow-down-0-1")).toBe("arrow-down-0-1");
    expect(toNativeName("heroicons", "h1")).toBe("h1");
  });

  // Digit runs lose their dashes going native → export, so these can't be
  // recovered. Register them by native name: `{ "arrow-down-0-1": ArrowDown01 }`.
  it.each([
    ["lucide", "ArrowDown01", "arrow-down-0-1"],
    ["tabler", "IconBrandCss3", "brand-css3"],
    ["tabler", "IconCrop169", "crop-16-9"],
    ["heroicons", "H1Icon", "h1"],
  ] as const)("known miss: %s %s is not %s", (library, exportName, native) => {
    expect(toNativeName(library, exportName)).not.toBe(native);
  });
});

describe("isNativeName", () => {
  it.each(["x", "house", "chevron-down", "grid-2x2", "h1"])("%s is native", (name) => {
    expect(isNativeName(name)).toBe(true);
  });
  it.each(["X", "ChevronDown", "chevron--down", "-x", "IconX"])("%s is not", (name) => {
    expect(isNativeName(name)).toBe(false);
  });
});
