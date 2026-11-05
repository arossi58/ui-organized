import { expect, test, type Page } from "@playwright/test";
import { storyTest } from "../shared/interaction";

/**
 * The data table's behaviour, driven the way a keyboard user would drive it.
 *
 * Everything here is a decision that lives in `@ui-organized/table-core` and is
 * unit-tested there as a pure function. What these add is the half core cannot
 * assert: that the adapter wired those decisions to real elements, that focus
 * actually lands where the cursor says it should, and that the virtualizer keeps
 * the DOM flat while the scrollbar tells the truth.
 */

// Every selector is scoped to `.data-table`. Storybook's own preview chrome
// renders a hidden `<table>` of its own, so a bare `thead th` matches that one
// first — which reads as "the header is missing" rather than "the selector is".
const TABLE = ".data-table__table";
const HEAD_CELL = ".data-table__head-cell";
const VIEWPORT = ".data-table__viewport";
const ROW = ".data-table__body .data-table__row";
const CELL = ".data-table [data-cell]";

/** The one cell in the grid that is a tab stop — the roving cursor. */
const focused = `${CELL}[tabindex="0"]`;

// ── Sorting ──────────────────────────────────────────────────────────────────
test.describe("Data Table sorting", () => {
  storyTest(
    "components-data-display-data-table--sorting-and-filtering",
    "sorts on the header button and reports it with aria-sort",
    async (page) => {
      const nameHeader = page.locator(HEAD_CELL).first();
      await expect(nameHeader).toHaveAttribute("aria-sort", "ascending");

      await nameHeader.locator("button.data-table__sort-button").click();
      await expect(nameHeader).toHaveAttribute("aria-sort", "descending");

      // The rows actually reordered — an aria-sort that reports a sort nothing
      // performed is worse than no aria-sort at all.
      const first = await page.locator(`${ROW} th`).first().textContent();
      await nameHeader.locator("button.data-table__sort-button").click();
      await expect(page.locator(`${ROW} th`).first()).not.toHaveText(first ?? "");
    },
  );

  storyTest(
    "components-data-display-data-table--sorting-and-filtering",
    "filters through the global search without losing the header",
    async (page) => {
      const rowsBefore = await page.locator(ROW).count();
      await page.getByRole("searchbox", { name: /search/i }).fill("Ada");
      await expect(page.locator(ROW)).not.toHaveCount(rowsBefore);
      await expect(page.locator(HEAD_CELL).first()).toBeVisible();
    },
  );
});

// ── Grid keyboard ────────────────────────────────────────────────────────────
test.describe("Data Table grid navigation", () => {
  storyTest(
    "components-data-display-data-table--selection",
    "is one tab stop, and the arrows move the cursor inside it",
    async (page) => {
      await expect(page.locator(focused)).toHaveCount(1);
      await page.locator(focused).focus();
      await expect(page.locator(`${focused}:focus`)).toHaveCount(1);

      await page.keyboard.press("ArrowRight");
      await expect(page.locator(focused)).toHaveAttribute("data-cell", "0:1");
      await page.keyboard.press("ArrowDown");
      await expect(page.locator(focused)).toHaveAttribute("data-cell", "1:1");
      // Focus follows the cursor rather than merely being described by it.
      await expect(page.locator(`${focused}:focus`)).toHaveCount(1);
    },
  );

  storyTest(
    "components-data-display-data-table--selection",
    "reaches the header row, where Enter sorts",
    async (page) => {
      await page.locator(focused).focus();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowUp");
      await expect(page.locator(focused)).toHaveAttribute("data-cell", "-1:1");

      const header = page.locator(HEAD_CELL).nth(1);
      await page.keyboard.press("Enter");
      await expect(header).toHaveAttribute("aria-sort", "ascending");
    },
  );

  storyTest(
    "components-data-display-data-table--selection",
    "selects with Space and extends a range with Shift+Arrow",
    async (page) => {
      await page.locator(focused).focus();
      await page.keyboard.press(" ");
      await expect(page.locator(`${ROW}[aria-selected="true"]`)).toHaveCount(1);
      await expect(page.locator(".data-table__selection-count")).toHaveText("1 row selected");

      await page.keyboard.press("Shift+ArrowDown");
      await page.keyboard.press("Shift+ArrowDown");
      await expect(page.locator(".data-table__selection-count")).toHaveText("3 rows selected");

      // The bar is the affordance for undoing all of it in one action.
      await page.getByRole("button", { name: "Clear" }).click();
      await expect(page.locator(".data-table__selection-count")).toHaveCount(0);
    },
  );
});

// ── Virtualization ───────────────────────────────────────────────────────────
test.describe("Data Table virtualization", () => {
  storyTest(
    "components-data-display-data-table--large-dataset",
    "keeps the DOM flat while the scrollbar tells the truth",
    async (page) => {
      const before = await page.locator(ROW).count();
      expect(before).toBeLessThan(60);

      // 100,000 rows at the `md` row height. The scroll height is what a user
      // reads the size of the dataset from, and virtualization is only honest if
      // it is right.
      const scrollHeight = await page.locator(VIEWPORT).evaluate((el) => el.scrollHeight);
      expect(scrollHeight).toBeGreaterThan(4_000_000);
      await expect(page.locator(TABLE)).toHaveAttribute("aria-rowcount", "100001");

      await page.locator(VIEWPORT).evaluate((el) => {
        el.scrollTop = 200_000;
      });
      await expect
        .poll(async () => page.locator(ROW).first().getAttribute("aria-rowindex"))
        .not.toBe("2");

      // Still a bounded window, and position is reported from the dataset rather
      // than from what happens to be rendered.
      expect(await page.locator(ROW).count()).toBeLessThan(60);
      const index = Number(await page.locator(ROW).first().getAttribute("aria-rowindex"));
      expect(index).toBeGreaterThan(4_000);
    },
  );
});

// ── Inline editing ───────────────────────────────────────────────────────────
test.describe("Data Table inline editing", () => {
  storyTest(
    "components-data-display-data-table--inline-editing",
    "opens an editor on Enter, commits it, and reverts on Escape",
    async (page) => {
      const seatsCell = page.locator('.data-table [data-cell="0:5"]');
      await seatsCell.focus();
      const original = (await seatsCell.textContent())?.trim();

      await page.keyboard.press("Enter");
      const editor = page.locator(".data-table__editor input");
      await expect(editor).toBeVisible();

      await editor.fill("42");
      await page.keyboard.press("Enter");
      await expect(page.locator(".data-table__editor")).toHaveCount(0);
      await expect(seatsCell).toHaveText("42");

      // Escape leaves the committed value alone rather than restoring the
      // pre-edit one — it discards the *draft*.
      await seatsCell.focus();
      await page.keyboard.press("Enter");
      await page.locator(".data-table__editor input").fill("7");
      await page.keyboard.press("Escape");
      await expect(seatsCell).toHaveText("42");
      expect(original).not.toBe("42");
    },
  );

  storyTest(
    "components-data-display-data-table--inline-editing",
    "marks editable columns, and opens an editor with one click",
    async (page) => {
      // The pencil is on the editable column's header and no other, and says
      // so in words too: it is part of the header every cell is announced with.
      const seatsHead = page.locator('.data-table thead th[data-column-id="seats"]');
      await expect(seatsHead.locator(".data-table__edit-icon")).toBeVisible();
      await expect(seatsHead).toContainText("editable");
      await expect(page.locator(".data-table thead .data-table__edit-icon")).toHaveCount(1);

      // Hovering draws the cell as the field it becomes; a read-only cell
      // beside it stays as it was.
      const seatsCell = page.locator('.data-table [data-cell="0:5"]');
      const outline = (cell: typeof seatsCell) =>
        cell.evaluate((el) => getComputedStyle(el).outlineStyle);
      await seatsCell.hover();
      expect(await outline(seatsCell)).toBe("solid");
      const nameCell = page.locator('.data-table [data-cell="0:0"]');
      await nameCell.hover();
      expect(await outline(nameCell)).not.toBe("solid");

      // One click, not two: the editor opens with focus in it.
      await seatsCell.click();
      const editor = page.locator(".data-table__editor input");
      await expect(editor).toBeFocused();

      // A click inside the open editor keeps the draft rather than restarting.
      await editor.fill("9");
      await editor.click();
      await expect(editor).toHaveValue("9");
      await page.keyboard.press("Enter");
      await expect(seatsCell).toHaveText("9");
    },
  );
});

// ── Card mode ────────────────────────────────────────────────────────────────
test.describe("Data Table card mode", () => {
  storyTest(
    "components-data-display-data-table--cards",
    "filters and sorts from sheets, counted on their buttons",
    async (page) => {
      // Everything is reached by role. The sheet is modal, so anything it
      // opens that portals outside it is aria-hidden — and `getByRole` skips
      // aria-hidden content, so this would time out on an unreachable menu.
      await page.getByRole("button", { name: /^Filter/ }).click();
      const sheet = page.getByRole("dialog", { name: "Filter" });
      await expect(sheet).toBeVisible();
      // Every filterable field is already there, one collapsed section each,
      // so the whole list fits: nothing to add before choosing a value.
      for (const field of ["Role", "Team", "Status"]) {
        await expect(sheet.getByRole("button", { name: new RegExp(`^${field}`) })).toHaveAttribute(
          "aria-expanded",
          "false",
        );
      }
      const role = sheet.getByRole("button", { name: /^Role/ });
      await role.click();
      await expect(role).toHaveAttribute("aria-expanded", "true");
      await sheet.getByRole("option", { name: /Engineer/ }).click();
      await expect(sheet.getByRole("option", { name: /Engineer/ })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      // Collapsed again, the section keeps saying what it filters by.
      await role.click();
      await expect(role).toHaveAttribute("aria-expanded", "false");
      await expect(role).toContainText("Engineer");
      await sheet.getByRole("button", { name: "Done" }).click();
      await expect(sheet).toBeHidden();

      // Applied filters are a count on the button, not a row of chips.
      const filter = page.getByRole("button", { name: /^Filter/ });
      await expect(filter).toHaveAccessibleName(/1 applied/);
      await expect(page.locator(".data-table__subbar")).toHaveCount(0);
      await expect(page.locator(".data-table__card")).toHaveCount(1);

      await page.getByRole("button", { name: /^Sort/ }).click();
      const sortSheet = page.getByRole("dialog", { name: "Sort" });
      await sortSheet.locator("label").filter({ hasText: /^Name$/ }).click();
      await sortSheet.getByRole("button", { name: "Done" }).click();
      await expect(page.getByRole("button", { name: /^Sort/ })).toHaveAccessibleName(/1 applied/);
    },
  );
});

// ── Row detail ───────────────────────────────────────────────────────────────
test.describe("Data Table row detail", () => {
  storyTest(
    "components-data-display-data-table--row-detail",
    "opens the sheet from the row and steps through the list",
    async (page) => {
      await page.locator(`${ROW} th`).first().click();
      const sheet = page.getByRole("dialog");
      await expect(sheet).toBeVisible();

      const title = await sheet.locator("h2").first().textContent();
      await expect(page.locator(".data-table__detail-position")).toHaveText("1 of 10");

      await page.getByRole("button", { name: "Next row" }).click();
      await expect(page.locator(".data-table__detail-position")).toHaveText("2 of 10");
      await expect(sheet.locator("h2").first()).not.toHaveText(title ?? "");

      // Nothing before the first row: navigation deliberately does not wrap.
      await page.getByRole("button", { name: "Previous row" }).click();
      await expect(page.getByRole("button", { name: "Previous row" })).toBeDisabled();
    },
  );
});

// ── Header ───────────────────────────────────────────────────────────────────
test.describe("Data Table header", () => {
  storyTest(
    "components-data-display-data-table--header-actions",
    "separates the page's actions from the table's chrome with a rule",
    async (page) => {
      const toolbar = page.locator(".data-table__toolbar");
      await expect(toolbar.getByRole("button", { name: "Import" })).toBeVisible();
      await expect(toolbar.getByRole("button", { name: "Invite member" })).toBeVisible();

      // The rule only earns its place when there is something on both sides.
      const divider = toolbar.locator(".data-table__toolbar-divider");
      await expect(divider).toHaveCount(1);
      const [rule, sort] = await Promise.all([
        divider.boundingBox(),
        toolbar.getByRole("button", { name: "Sort" }).boundingBox(),
      ]);
      const invite = await toolbar.getByRole("button", { name: "Invite member" }).boundingBox();
      expect(invite!.x).toBeLessThan(rule!.x);
      expect(sort!.x).toBeGreaterThan(rule!.x);
    },
  );

  storyTest(
    "components-data-display-data-table--filtering",
    "has no rule when the table owns every button in the row",
    async (page) => {
      await expect(page.locator(".data-table__toolbar-divider")).toHaveCount(0);
    },
  );

  storyTest(
    "components-data-display-data-table--cards",
    "sorts from the header in card mode, where there are no column headers",
    async (page) => {
      // The only sort control card mode has. A table that silently loses the
      // ability to sort at 640px is a table that is broken on phones.
      await expect(page.locator(".data-table thead")).toHaveCount(0);
      const first = async () =>
        (await page.locator(".data-table__card-title").first().innerText()).trim();

      // A sheet from a labelled button, rather than the desktop's icon menu.
      // Ark's radios hide their <input>; the label is what a finger hits.
      const sheet = page.getByRole("dialog", { name: "Sort" });
      await page.getByRole("button", { name: /^Sort/ }).click();
      await sheet.locator("label").filter({ hasText: /^Name$/ }).click();
      await expect.poll(first).not.toBe("");
      const ascending = await first();

      await sheet.locator("label").filter({ hasText: "Descending" }).click();
      await expect.poll(first).not.toBe(ascending);
      await sheet.getByRole("button", { name: "Done" }).click();
      await expect(sheet).toBeHidden();
    },
  );
});

// ── Selection at scale ───────────────────────────────────────────────────────
test.describe("Data Table select-all", () => {
  storyTest(
    "components-data-display-data-table--large-dataset",
    "selects only what is on screen, and offers the rest",
    async (page) => {
      // The header checkbox used to enumerate all 100,000 ids on one click,
      // which took minutes of blocking work and read to the user as a crashed
      // tab. It now governs the rendered window, and the selection bar offers
      // the whole set as a flag that costs nothing.
      const rendered = await page.locator(ROW).count();
      expect(rendered).toBeLessThan(200); // virtualized, not 100,000

      const started = Date.now();
      // Ark's checkbox hides its <input>, so the click has to land on the
      // label the input is inside — the same target a user actually hits.
      await page.locator("thead .data-table__select-hit label.checkbox").first().click();
      await expect(page.locator(".data-table__selection-bar")).toBeVisible();
      // Generous: the point is "did not hang", not a benchmark.
      expect(Date.now() - started).toBeLessThan(5_000);

      // Exactly the rendered rows, not the dataset.
      await expect(page.locator(".data-table__selection-count")).toContainText(String(rendered));

      // …and the escape hatch to everything is right there.
      const all = page.getByRole("button", { name: /Select all 100000 matching/ });
      await expect(all).toBeVisible();
      await all.click();
      await expect(page.locator(".data-table__selection-count")).toContainText("100000");
    },
  );
});

// ── Filters ──────────────────────────────────────────────────────────────────
test.describe("Data Table filters", () => {
  const CHIP = ".data-table__filter-chip";
  // The chip is segmented: field, operator and value are each a button that
  // opens the menu for that one part. The `data-*` hooks are on the chip.
  const column = (id: string) => `${CHIP}[data-column-id="${id}"]`;
  const filter = (id: string) => `${CHIP}[data-filter-id="${id}"]`;
  const FIELD = ".chip__segment--label";
  const OPERATOR = ".chip__segment--operator";
  const VALUE = ".chip__segment--value";
  const chipText = async (page: import("@playwright/test").Page, index = 0) =>
    (await page.locator(CHIP).nth(index).innerText()).replace(/\s+/g, " ").trim();
  /** Removal lives in the field segment's menu, which every chip has. */
  const removeChip = async (page: import("@playwright/test").Page, selector: string) => {
    await page.locator(selector).locator(FIELD).click();
    await page.getByRole("menuitem", { name: "Remove filter" }).click();
  };

  storyTest(
    "components-data-display-data-table--filtering",
    "adds a filter from the picker and applies it",
    async (page) => {
      const before = await page.locator(ROW).count();
      await page.getByRole("button", { name: "Add filter" }).click();

      const picker = page.getByRole("menu", { name: "Add filter" });
      await expect(picker).toBeVisible();
      // `email` declares no `meta.filter`, so it is not offered — the opt-in is
      // structural, and the list can never drift from what the engine allows.
      await expect(picker.getByRole("menuitem", { name: /Email/ })).toHaveCount(0);
      await picker.getByRole("menuitem", { name: "Status" }).click();

      // The new chip opens its own editor straight away, so the value is one
      // click rather than a hunt for where the filter went.
      await expect(page.getByRole("dialog", { name: "Status" })).toBeVisible();
      await page
        .getByRole("option", { name: /active/ })
        .first()
        .click();

      await expect(page.locator(CHIP)).toHaveCount(4);
      await expect.poll(async () => page.locator(ROW).count()).not.toBe(before);
    },
  );

  storyTest(
    "components-data-display-data-table--filtering",
    "an incomplete condition is shown but does not filter",
    async (page) => {
      // The third default chip is "Name contains …" with no value.
      const incomplete = page.locator(`${CHIP}.chip--incomplete`);
      await expect(incomplete).toHaveCount(1);
      await expect(incomplete).toContainText("Name");

      // Removing it must not change the rows, because it was never filtering.
      const before = await page.locator(ROW).count();
      await removeChip(page, `${CHIP}.chip--incomplete`);
      await expect(page.locator(CHIP)).toHaveCount(2);
      expect(await page.locator(ROW).count()).toBe(before);
    },
  );

  storyTest(
    "components-data-display-data-table--filtering",
    "edits the operator from its own segment and re-filters",
    async (page) => {
      const before = await page.locator(ROW).count();
      await page.locator(filter("f1")).locator(OPERATOR).click();

      // The chip being changed fills with brand while its menu is open.
      await expect(page.locator(filter("f1"))).toHaveClass(/chip--selected/);
      await page.getByRole("menuitemradio", { name: "is none of" }).click();

      await expect.poll(() => chipText(page, 0)).toContain("is none of");
      await expect.poll(async () => page.locator(ROW).count()).not.toBe(before);
      await expect(page.locator(filter("f1"))).not.toHaveClass(/chip--selected/);
    },
  );

  storyTest(
    "components-data-display-data-table--filtering",
    "moves a condition to another field from its field segment",
    async (page) => {
      // "Role is any of …" moved to Status: both are enums, but one column's
      // option ids mean nothing on another, so the value starts over.
      await page.locator(filter("f1")).locator(FIELD).click();
      await page.getByRole("menuitemradio", { name: "Status" }).click();

      await expect(page.locator(filter("f1"))).toHaveAttribute("data-column-id", "status");
      await expect(page.locator(filter("f1")).locator(FIELD)).toHaveText("Status");
      await expect(page.locator(filter("f1"))).toHaveClass(/chip--incomplete/);
    },
  );

  storyTest(
    "components-data-display-data-table--filtering",
    "carries several conditions on one column, independently removable",
    async (page) => {
      // "Joined is after 2021-01-01" is already applied; add an upper bound so
      // the same column carries two conditions at once.
      await page.getByRole("button", { name: "Add filter" }).click();
      await page
        .getByRole("menu", { name: "Add filter" })
        .getByRole("menuitem", { name: /Joined/ })
        .click();

      // The new chip's value editor opens on its own; the operator is its own
      // segment, so it is changed there.
      const added = page.locator(column("joined")).last();
      await added.locator(OPERATOR).click();
      await page.getByRole("menuitemradio", { name: "is before" }).click();

      // Every chip owns a Popover, so several dialogs share a name; the open
      // one is the only unambiguous handle.
      await added.locator(VALUE).click();
      const editor = page.locator('[role="dialog"][data-state="open"]');
      await editor.locator('input[type="date"]').fill("2021-06-01");
      // Closing by clicking the segment again, not with Escape — Escape reverts
      // the draft by design, which is asserted separately below.
      await added.locator(VALUE).click();

      const joinedChips = page.locator(column("joined"));
      await expect(joinedChips).toHaveCount(2);

      // Both bounds are in force: a window, not a last-one-wins.
      const dates = await page.locator(`${ROW} td:nth-last-child(1)`).allInnerTexts();
      for (const date of dates) {
        expect(date >= "2021-01-01" && date <= "2021-06-01", date).toBe(true);
      }

      await removeChip(page, `${column("joined")} >> nth=0`);
      await expect(joinedChips).toHaveCount(1);
    },
  );

  storyTest(
    "components-data-display-data-table--filtering",
    "puts the cursor in the field so the user can just type",
    async (page) => {
      // The pattern analysis asks for this explicitly, and it is the single
      // most fragile thing here: Ark focuses the popover's first focusable
      // child a frame after mount, which is the operator picker.
      await page.locator(filter("f3")).locator(VALUE).click();
      await expect
        .poll(async () => page.evaluate(() => document.activeElement?.tagName))
        .toBe("INPUT");

      await page.keyboard.type("ada");
      await expect.poll(() => chipText(page, 2)).toContain("ada");
    },
  );

  storyTest(
    "components-data-display-data-table--filtering",
    "Escape abandons an edit rather than committing it",
    async (page) => {
      const before = await chipText(page, 1);
      await page.locator(filter("f2")).locator(VALUE).click();
      await page
        .locator('[role="dialog"][data-state="open"] input[type="date"]')
        .fill("2022-03-03");
      await expect.poll(() => chipText(page, 1)).toContain("2022-03-03");

      await page.keyboard.press("Escape");
      await expect(page.locator('[role="dialog"][data-state="open"]')).toHaveCount(0);
      await expect.poll(() => chipText(page, 1)).toBe(before);
    },
  );

  storyTest(
    "components-data-display-data-table--filtering",
    "names every control, and never nests a button inside a button",
    async (page) => {
      // Each segment is its own button, and they are SIBLINGS: a button inside
      // a button is invalid HTML and an axe `nested-interactive` violation.
      expect(await page.locator(`${CHIP} button button`).count()).toBe(0);
      await expect(page.locator(`${CHIP} > button`).first()).toHaveClass(/chip__segment--label/);
      // The group carries the whole sentence, so each segment is heard in context.
      await expect(page.locator(filter("f1"))).toHaveAttribute("aria-label", /^Filter: Role /);

      // The header's filter button is icon-only, so `aria-label` is its whole
      // name — and, because zag names a menu after its trigger, the menu's too.
      await expect(page.getByRole("button", { name: "Add filter" })).toBeVisible();
    },
  );

  storyTest(
    "components-data-display-data-table--filtering",
    "moves focus somewhere deliberate when a chip is removed",
    async (page) => {
      await removeChip(page, `${CHIP} >> nth=0`);
      // Never dropped to <body>, which would lose a keyboard user entirely.
      await expect
        .poll(async () => page.evaluate(() => document.activeElement?.tagName))
        .toBe("BUTTON");
    },
  );

  storyTest(
    "components-data-display-data-table--filtering",
    "clears everything at once and restores the full set",
    async (page) => {
      const total = 24;
      await page.getByRole("button", { name: "Reset" }).click();
      // The bar is a summary of applied filters, so with none applied it goes.
      await expect(page.locator(CHIP)).toHaveCount(0);
      await expect(page.locator(".data-table__filters")).toHaveCount(0);
      await expect.poll(async () => page.locator(ROW).count()).toBe(total);
    },
  );

  storyTest(
    "components-data-display-data-table--data-types",
    "filters a column that reaches nested data through a dot path",
    async (page) => {
      // `accessorKey: "owner.team"` reaches nested data, but TanStack derives
      // the column *id* as `owner_team`. Deriving it any other way makes the
      // column unfindable, and the failure is silent and total: no values are
      // offered and the filter matches nothing.
      await page.getByRole("button", { name: "Add filter" }).click();
      await page.getByRole("menu").getByRole("menuitem", { name: "Team" }).click();

      const chip = page.locator(".data-table__filter-chip").last();
      await expect(chip).toContainText("Team");
      await expect(chip).not.toContainText("owner");

      const editor = page.locator('[role="dialog"][data-state="open"]');
      await expect(editor.getByRole("option").first()).toContainText("·");
      await editor.getByRole("option").first().click();
      await expect(page.locator(ROW)).toHaveCount(1);
    },
  );

  storyTest(
    "components-data-display-data-table--filtering",
    "spells every relation, with no glyphs",
    async (page) => {
      await expect(page.locator(column("role")).locator(OPERATOR)).toHaveText("is any of");
      await expect(page.locator(column("joined")).locator(OPERATOR)).toHaveText("is after");
      await expect(page.locator(`${CHIP} svg`)).toHaveCount(0);
    },
  );

  storyTest(
    "components-data-display-data-table--filtering",
    "shows how many rows each value would leave",
    async (page) => {
      await page.locator(filter("f1")).locator(VALUE).click();
      const editor = page.getByRole("dialog", { name: /^Role/ });
      // Counts come from TanStack's faceted model, which applies every OTHER
      // filter — so they say what ticking this value would actually do.
      await expect(editor.getByRole("option").first()).toContainText("·");
    },
  );
});

// ── Server mode ──────────────────────────────────────────────────────────────
test.describe("Data Table server mode", () => {
  storyTest(
    "components-data-display-data-table--server-mode",
    "reports the query instead of paginating locally",
    async (page) => {
      // The page holds 10 rows; the count the pager and aria-rowcount report is
      // the server's total, which the client could not have worked out itself.
      await expect(page.locator(ROW)).toHaveCount(10);
      await expect(page.locator(TABLE)).toHaveAttribute("aria-rowcount", "25");
      await expect(page.locator(".data-table__pagination-status")).toHaveText("1–10 of 24");

      const first = await page.locator(`${ROW} th`).first().textContent();
      await page.getByRole("button", { name: "Go to page 2" }).click();
      await expect(page.locator(".data-table__pagination-status")).toHaveText("11–20 of 24");
      await expect(page.locator(`${ROW} th`).first()).not.toHaveText(first ?? "");

      // Searching goes back to the server too — the row count changes, and the
      // page resets rather than stranding the user on an empty page 2.
      await page.getByRole("searchbox", { name: /search/i }).fill("Platform");
      await expect.poll(async () => page.locator(ROW).count()).toBeLessThan(10);
    },
  );
});

// ── Card mode ────────────────────────────────────────────────────────────────
test.describe("Data Table card mode", () => {
  storyTest(
    "components-data-display-data-table--cards",
    "renders one card per row instead of a table, keeping selection",
    async (page) => {
      // The table is replaced, not hidden — the point of measuring rather than
      // using a container query.
      await expect(page.locator(TABLE)).toHaveCount(0);
      await expect(page.locator(".data-table__card")).toHaveCount(6);

      await page.locator(".data-table__card").first().locator("label").click();
      await expect(page.locator(".data-table__card--selected")).toHaveCount(1);
      await expect(page.locator(".data-table__selection-count")).toHaveText("1 row selected");
    },
  );

  storyTest(
    "components-data-display-data-table--selection",
    "swaps modes across the breakpoint without losing the selection",
    async (page) => {
      // Selection is table *state*, not table markup, so it has to survive the
      // tree being replaced. This is the check that says so.
      await page.locator(focused).focus();
      await page.keyboard.press(" ");
      await expect(page.locator(".data-table__selection-count")).toHaveText("1 row selected");

      await page.setViewportSize({ width: 520, height: 800 });
      await expect(page.locator(".data-table__card")).not.toHaveCount(0);
      await expect(page.locator(TABLE)).toHaveCount(0);
      await expect(page.locator(".data-table__card--selected")).toHaveCount(1);
      await expect(page.locator(".data-table__selection-count")).toHaveText("1 row selected");

      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(page.locator(TABLE)).toHaveCount(1);
      await expect(page.locator(".data-table__card")).toHaveCount(0);
      await expect(page.locator(`${ROW}[aria-selected="true"]`)).toHaveCount(1);
    },
  );
});

// ── Pinned columns ───────────────────────────────────────────────────────────
test.describe("Data Table pinned columns", () => {
  storyTest(
    "components-data-display-data-table--pinned-columns",
    "keeps a pinned column opaque while its row is hovered",
    async (page) => {
      // The row's hover tint is a translucent overlay by design, and a pinned
      // cell is painted over the columns scrolling underneath it. Take the tint
      // at face value and the hovered row is the one row you can read the email
      // column through the name column.
      const row = page.locator(`${ROW}`).nth(2);
      await row.hover();
      const alpha = await row
        .locator(".data-table__cell--sticky")
        .first()
        .evaluate((cell) => {
          // Component-count rather than a colour parse: three means opaque, four
          // carries the alpha. Handles `rgb(r, g, b)` and `rgb(r g b / a)` alike.
          const parts =
            getComputedStyle(cell)
              .backgroundColor.match(/[\d.]+/g)
              ?.map(Number) ?? [];
          return parts.length >= 4 ? parts[3] : 1;
        });
      expect(alpha).toBe(1);
    },
  );
});

// ── Horizontal scroll buttons ────────────────────────────────────────────────
test.describe("Data Table horizontal scroll", () => {
  const LEFT = 'button[aria-label="Scroll left"]';
  const RIGHT = 'button[aria-label="Scroll right"]';

  /** The viewport's own scroll offset — the thing the buttons actually move. */
  const scrollLeft = (page: Page) =>
    page.locator(VIEWPORT).evaluate((element) => element.scrollLeft);

  /**
   * Wait for a smooth scroll to finish — two reads in a row that agree.
   *
   * A press issued while the previous animation is still running supersedes it,
   * and WebKit under load can then land short of where the last press aimed. A
   * user notices nothing (the button is still live, and the next press finishes
   * the job); a test that presses as fast as Playwright can click sees a scroll
   * that stopped in the middle.
   *
   * The buttons are read too, not just the offset. Their disabled state comes
   * from a `scroll` listener that calls `setState` (`useHorizontalScroll` in
   * packages/react-table/src/core/useDataTable.ts), so it lands a React commit
   * after the position stops moving — measured at 0–16ms behind it. That window
   * is small, but it is the difference between "the scroll has stopped" and "the
   * control has stopped changing", and only the second one is worth basing an
   * assertion on. It is what the name claimed all along.
   */
  const settled = async (page: Page) => {
    let previous = "";
    await expect
      .poll(async () => {
        const now = [
          await scrollLeft(page),
          await page.locator(LEFT).isDisabled(),
          await page.locator(RIGHT).isDisabled(),
        ].join("/");
        const same = now === previous;
        previous = now;
        return same;
      })
      .toBe(true);
  };

  storyTest(
    "components-data-display-data-table--pinned-columns",
    "offers scroll buttons only while columns are hidden off the edge",
    async (page) => {
      // Wide enough for every column: the spare width is given to a column, so
      // there is nothing off the edge and nothing to offer.
      await page.setViewportSize({ width: 1600, height: 800 });
      await expect(page.locator(RIGHT)).toHaveCount(0);

      // Narrow enough to cut the last columns off, wide enough to stay a table
      // rather than becoming cards.
      await page.setViewportSize({ width: 820, height: 800 });
      await expect(page.locator(RIGHT)).toBeVisible();
      // At the start there is nothing to the left, so that half retires — the
      // same call Pagination makes at page one.
      await expect(page.locator(LEFT)).toBeDisabled();
    },
  );

  storyTest(
    "components-data-display-data-table--pinned-columns",
    "moves the viewport, and retires each button at its own end",
    async (page) => {
      await page.setViewportSize({ width: 820, height: 800 });
      const left = page.locator(LEFT);
      const right = page.locator(RIGHT);
      await expect(right).toBeVisible();

      await right.click();
      // Polled, not read once: the scroll is animated unless the user has asked
      // for less motion.
      await expect.poll(() => scrollLeft(page)).toBeGreaterThan(0);
      await expect(left).toBeEnabled();

      // Pressed until it retires. A button at the end of the scroll that stays
      // enabled and does nothing is the failure this is watching for.
      //
      // `settled` first, before the check — that ordering is the whole fix, and
      // the reason is not obvious. The press above already reaches the end here
      // (one press moves 0.8 of the viewport, which is more than this table has
      // to give), so by the time the loop runs, the button is *going* to retire.
      // The condition used to be read straight after the two assertions above,
      // which pass mid-animation: measured on WebKit, the check landed ~150ms
      // in, with the viewport at ~250 of its 314 maximum. `isEnabled()` was
      // therefore true and correct — there really was scrolling left to do — and
      // the `click()` it authorised then waited out its full 30 seconds while
      // the animation finished and the button retired underneath it.
      //
      // Nothing about that is WebKit-specific; WebKit just loses the race most
      // often. Reading the button only once the scroll has stopped makes the
      // answer a fact about the resting state rather than about a moment in an
      // animation.
      for (let press = 0; press < 6; press += 1) {
        await settled(page);
        if (await right.isDisabled()) break;
        await right.click();
      }
      await settled(page);
      await expect(right).toBeDisabled();

      await left.click();
      await settled(page);
      expect(await scrollLeft(page)).toBe(0);
      await expect(left).toBeDisabled();
      await expect(right).toBeEnabled();
    },
  );

  storyTest(
    "components-data-display-data-table--column-tools",
    "retires the buttons when the columns themselves stop overflowing",
    async (page) => {
      // The case neither a scroll event nor a resize of the viewport reports:
      // the container is the same size and the content inside it shrank.
      await page.setViewportSize({ width: 860, height: 800 });
      await expect(page.locator(RIGHT)).toBeVisible();

      for (const column of ["Email", "Team"]) {
        await page.getByRole("button", { name: "Columns" }).click();
        await page.getByRole("menuitemcheckbox", { name: column }).click();
        await page.keyboard.press("Escape");
      }

      await expect(page.locator(RIGHT)).toHaveCount(0);
    },
  );

  storyTest(
    "components-data-display-data-table--cards",
    "offers nothing in card mode — a list of cards has no columns to reach",
    async (page) => {
      await expect(page.locator(".data-table__card")).not.toHaveCount(0);
      await expect(page.locator(RIGHT)).toHaveCount(0);
    },
  );
});
