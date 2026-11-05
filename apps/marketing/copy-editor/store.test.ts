/* eslint-disable no-template-curly-in-string -- `${}` here is the copy under test. */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { indexSource } from "./indexer";
import { createStore } from "./store";

const PAGE = "apps/marketing/src/pages/Page.tsx";
const GUIDE = "tooling/code-connect/src/usage/guides/thing.ts";
const STORY = "apps/storybook/src/stories/Thing.stories.tsx";

let root: string;

const put = (file: string, source: string) => {
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), source);
};
const read = (file: string) => readFileSync(join(root, file), "utf8");

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "copy-editor-"));
  put(GUIDE, 'export const g = { slug: "thing", summary: "Use `intent` for **tone**." };\n');
  put(STORY, 'const m = { title: "Not this one", parameters: { docs: { description: { component: "Does a thing." } } } };\n');
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

const saveByKey = (file: string, key: string, text: string) => {
  const store = createStore(root);
  const entry = store.index().find((e) => e.file === file && e.key === key)!;
  return store.save(file, entry.start, entry.end, entry.raw, text);
};

describe("indexSource", () => {
  const texts = (source: string) => indexSource("x.tsx", source).map((e) => e.text);

  it("finds JSX text, decoded and unwrapped", () => {
    expect(texts(`<p>\n  It&rsquo;s\n  wrapped\n</p>;`)).toEqual(["It’s wrapped"]);
  });

  it("splits text around an inline tag and ignores spacers", () => {
    expect(texts(`<p>Read the <a href="/x">docs</a>{" "}first.</p>;`)).toEqual(["Read the", "docs", "first."]);
  });

  it("finds strings in arrays and copy props", () => {
    expect(texts(`const a = [{ title: "Fast", body: "Really fast." }]; <X heading="Hi there" />;`)).toEqual([
      "Fast", "Really fast.", "Hi there",
    ]);
  });

  it("skips code strings", () => {
    const source = `import a from "./A Thing";
      type T = "Some Type";
      if (x === "Some Value") y();
      console.log("Debug Line");
      const o = { "Key Name": 1, href: "See Here", intent: "Primary" };
      <X className="a b c" to="/About Us" />;`;
    expect(texts(source)).toEqual([]);
  });

  it("skips interpolated templates but keeps static ones", () => {
    expect(texts("const a = `Static copy`; const b = `Has ${x} value`;")).toEqual(["Static copy"]);
  });

  it("indexes markdown strings under their rendered text", () => {
    const [entry] = indexSource(GUIDE, 'const a = { summary: "Use `intent` for **tone**." };', "guide");
    expect(entry.text).toBe("Use `intent` for **tone**.");
    expect(entry.key).toBe("Use intent for tone.");
  });

  it("takes only the description from a story", () => {
    put(PAGE, "");
    expect(createStore(root).index().filter((e) => e.file === STORY).map((e) => e.text)).toEqual(["Does a thing."]);
  });
});

describe("save", () => {
  it("changes only the edited range", () => {
    const before = `export const P = () => <p className="a">Old words</p>; // keep  this\n`;
    put(PAGE, before);
    expect(saveByKey(PAGE, "Old words", "New words").ok).toBe(true);
    expect(read(PAGE)).toBe(before.replace("Old words", "New words"));
  });

  it("keeps the file's entity style and escapes JSX syntax", () => {
    put(PAGE, "const a = <p>It&rsquo;s old</p>;\n");
    saveByKey(PAGE, "It’s old", "It’s {new} <b>");
    expect(read(PAGE)).toBe("const a = <p>It&rsquo;s &#123;new&#125; &lt;b&gt;</p>;\n");
  });

  it("escapes the literal's own quote", () => {
    put(PAGE, `const a = { body: "Old words" };\nconst b = { body: 'Other words' };\n`);
    saveByKey(PAGE, "Old words", 'Say "hi"');
    saveByKey(PAGE, "Other words", "It's");
    expect(read(PAGE)).toBe(`const a = { body: "Say \\"hi\\"" };\nconst b = { body: 'It\\'s' };\n`);
  });

  it("escapes template syntax", () => {
    put(PAGE, "const a = `Old words`;\n");
    saveByKey(PAGE, "Old words", "Costs ${x} `now`");
    expect(indexSource(PAGE, read(PAGE))[0].text).toBe("Costs ${x} `now`");
  });

  it("rewraps multi-line JSX at its indent and leaves neighbours alone", () => {
    put(PAGE, `const a = (\n  <p>\n    Old words\n    <a href="/x">link</a>{" "}\n    after\n  </p>\n);\n`);
    saveByKey(PAGE, "Old words", "word ".repeat(30).trim());
    const out = read(PAGE);
    expect(out.split("\n").every((line) => line.length <= 80)).toBe(true);
    expect(out).toContain(`\n    <a href="/x">link</a>{" "}\n    after\n`);
    expect(indexSource(PAGE, out)[0].text).toBe("word ".repeat(30).trim());
  });

  it("rejects a stale range and leaves the file alone", () => {
    put(PAGE, "const a = <p>Old words</p>;\n");
    const store = createStore(root);
    const entry = store.index().find((e) => e.file === PAGE)!;
    put(PAGE, "const zz = <p>Old words</p>;\n");
    const result = store.save(PAGE, entry.start, entry.end, entry.raw, "New");
    expect(result).toMatchObject({ ok: false, status: 409 });
    expect(read(PAGE)).toBe("const zz = <p>Old words</p>;\n");
  });

  it.each(["package.json", "../outside.tsx", "apps/marketing/src/../../../x.tsx", "apps/marketing/src/a.test.ts"])(
    "refuses %s",
    (file) => {
      expect(createStore(root).save(file, 0, 1, "a", "b")).toMatchObject({ ok: false, status: 403 });
    },
  );

  it("refuses empty text", () => {
    put(PAGE, "const a = <p>Old words</p>;\n");
    expect(saveByKey(PAGE, "Old words", "  ")).toMatchObject({ ok: false, status: 422 });
  });
});

describe("match", () => {
  it("prefers the first candidate with hits and returns every duplicate", () => {
    put(PAGE, "const a = <p>Learn more</p>; const b = <p>Learn more</p>; const c = <p>Whole sentence</p>;\n");
    const store = createStore(root);
    expect(store.match(["No such text", "  Learn   more "])).toHaveLength(2);
    expect(store.match(["Use intent for tone."])[0].file).toBe(GUIDE);
    expect(store.match(["Nope"])).toEqual([]);
  });
});

describe("undo", () => {
  it("restores the original source, even after another save moved it", () => {
    const before = "const a = <p>First words</p>; const b = <p>Second words</p>;\n";
    put(PAGE, before);
    const store = createStore(root);
    const second = store.index().find((e) => e.key === "Second words")!;
    const saved = store.save(PAGE, second.start, second.end, second.raw, "Changed");
    if (!saved.ok) throw new Error(saved.error);
    const first = store.index().find((e) => e.key === "First words")!;
    store.save(PAGE, first.start, first.end, first.raw, "A much longer first string");
    store.undo(PAGE, saved.entry.raw, saved.previousRaw);
    expect(read(PAGE)).toContain("<p>Second words</p>");
    expect(read(PAGE)).toContain("A much longer first string");
  });
});
