import { expect, test } from "@playwright/test";
import { expectFocusWithin, expectSettledOpen, storyTest } from "../shared/interaction";

/**
 * Form controls: the state machines behind Select, Combobox, Checkbox, Switch,
 * NumberField and TagsInput.
 *
 * Each test drives the component the way a keyboard user would, because that is
 * the path with no fallback — a mouse user who can't operate a control usually
 * has another way in, and a keyboard user does not.
 */

const part = (scope: string, name: string) => `[data-scope="${scope}"][data-part="${name}"]`;

// ── Select ───────────────────────────────────────────────────────────────────
test.describe("Select", () => {
  const trigger = part("select", "trigger");
  const content = part("select", "content");

  storyTest("components-forms-select--inspect", "opens its listbox", async (page) => {
    await expect(page.locator(content)).toBeHidden();
    await page.click(trigger);
    await expect(page.locator(content)).toBeVisible();
  });

  storyTest(
    "components-forms-select--inspect",
    "picks an option with the keyboard",
    async (page) => {
      const valueText = page.locator(part("select", "value-text"));
      const before = await valueText.textContent();

      await page.focus(trigger);
      await page.keyboard.press("Enter");
      await expectSettledOpen(page, content);
      // Same reason as the Escape test below: arrow keys only reach the machine
      // once focus is actually in the listbox, and Ark moves it a tick after
      // marking the popup open.
      await expectFocusWithin(page, content);
      await page.keyboard.press("ArrowDown");
      // Enter only selects something once an option is actually highlighted.
      // Sending it earlier is a no-op and the listbox stays open — which reads
      // as "keyboard selection is broken" rather than "the test was early".
      await expect(page.locator(`${content} [data-highlighted]`).first()).toBeVisible();
      await page.keyboard.press("Enter");

      await expect(page.locator(content)).toBeHidden();
      await expect(valueText).not.toHaveText(before ?? "");
    },
  );

  storyTest(
    "components-forms-select--inspect",
    "closes on Escape without choosing",
    async (page) => {
      const valueText = page.locator(part("select", "value-text"));
      const before = await valueText.textContent();
      await page.click(trigger);
      await expectSettledOpen(page, content);
      // Ark moves focus into the listbox (it carries tabindex="0") a tick after
      // marking it open. Escape sent in that window lands on <body>, and the
      // listbox stays up — which looks like "Escape doesn't dismiss" rather than
      // "the test got there first". Seen on WebKit, where the gap is widest.
      await expectFocusWithin(page, content);
      await page.keyboard.press("Escape");
      await expect(page.locator(content)).toBeHidden();
      // Escape means "never mind", not "take the highlighted one".
      await expect(valueText).toHaveText(before ?? "");
    },
  );
});

// ── Combobox ─────────────────────────────────────────────────────────────────
test.describe("Combobox", () => {
  const input = part("combobox", "input");
  const content = part("combobox", "content");

  storyTest("components-forms-combobox--inspect", "filters as you type", async (page) => {
    await page.click(input);
    await page.fill(input, "");
    await page.type(input, "a");
    await expect(page.locator(content)).toBeVisible();

    const all = await page.locator(`${content} [data-part="item"]`).count();
    await page.type(input, "pp");
    // Narrowing the query must narrow the list; if it doesn't, the filter is
    // decorative and the component is lying about what it does.
    await expect
      .poll(() => page.locator(`${content} [data-part="item"]`).count())
      .toBeLessThan(all);
  });

  storyTest("components-forms-combobox--inspect", "closes on Escape", async (page) => {
    await page.click(input);
    await page.type(input, "a");
    await expectSettledOpen(page, content);
    // A combobox keeps focus in its input rather than moving it into the
    // listbox, so that is what has to be true before Escape means anything.
    // Without this the key can land on <body> on WebKit and the list stays up.
    await expect(page.locator(input)).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator(content)).toBeHidden();
  });
});

// ── Checkbox ─────────────────────────────────────────────────────────────────
test.describe("Checkbox", () => {
  storyTest("components-forms-checkbox--inspect", "toggles with Space", async (page) => {
    const root = page.locator(part("checkbox", "root"));
    await expect(root).toHaveAttribute("data-state", "unchecked");
    // Focus the input directly rather than tabbing to it. Safari's default Tab
    // order skips checkboxes entirely, and that is the reachability contract's
    // question, not this one — here we are asking whether Space toggles a
    // checkbox that already has focus.
    await page.locator('[data-scope="checkbox"] input').focus();
    await page.keyboard.press("Space");
    await expect(root).toHaveAttribute("data-state", "checked");
    await page.keyboard.press("Space");
    await expect(root).toHaveAttribute("data-state", "unchecked");
  });

  storyTest("components-forms-checkbox--inspect", "toggles by clicking its label", async (page) => {
    const root = page.locator(part("checkbox", "root"));
    await page.click(part("checkbox", "label"));
    await expect(root).toHaveAttribute("data-state", "checked");
  });
});

// ── Switch ───────────────────────────────────────────────────────────────────
test.describe("Switch", () => {
  storyTest("components-forms-switch--inspect", "toggles with Space", async (page) => {
    const root = page.locator(part("switch", "root"));
    await expect(root).toHaveAttribute("data-state", "unchecked");
    // Focused directly — see the Checkbox note above.
    await page.locator('[data-scope="switch"] input').focus();
    await page.keyboard.press("Space");
    await expect(root).toHaveAttribute("data-state", "checked");
  });
});

// ── NumberField ──────────────────────────────────────────────────────────────
test.describe("NumberField", () => {
  const input = part("number-input", "input");

  storyTest("components-forms-numberfield--inspect", "steps with the arrow keys", async (page) => {
    await page.click(input);
    await page.fill(input, "5");
    await page.keyboard.press("ArrowUp");
    await expect(page.locator(input)).toHaveValue("6");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator(input)).toHaveValue("4");
  });

  storyTest("components-forms-numberfield--inspect", "steps from its buttons", async (page) => {
    await page.fill(input, "5");
    await page.click(part("number-input", "increment-trigger"));
    await expect(page.locator(input)).toHaveValue("6");
    await page.click(part("number-input", "decrement-trigger"));
    await expect(page.locator(input)).toHaveValue("5");
  });
});

// ── TagsInput ────────────────────────────────────────────────────────────────
test.describe("TagsInput", () => {
  const input = part("tags-input", "input");
  const item = `${part("tags-input", "item")}:not([data-part="item-input"])`;

  storyTest("components-forms-tagsinput--inspect", "adds a tag on Enter", async (page) => {
    const before = await page.locator(item).count();
    await page.click(input);
    await page.type(input, "playwright");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.locator(item).count()).toBe(before + 1);
  });

  storyTest(
    "components-forms-tagsinput--inspect",
    "removes the last tag on Backspace",
    async (page) => {
      const before = await page.locator(item).count();
      await page.click(input);
      await page.type(input, "temporary");
      await page.keyboard.press("Enter");
      // Both the tag landing and the input clearing must have happened: a
      // Backspace sent while "temporary" is still in the field edits the text
      // instead of reaching the tag, and the test fails for the wrong reason.
      await expect.poll(() => page.locator(item).count()).toBe(before + 1);
      await expect(page.locator(input)).toHaveValue("");
      const withTag = before + 1;
      // Backspace in an empty input targets the previous tag — the behaviour that
      // makes the control usable without reaching for each tag's remove button.
      await page.keyboard.press("Backspace");
      await page.keyboard.press("Backspace");
      await expect.poll(() => page.locator(item).count()).toBeLessThan(withTag);
    },
  );
});
