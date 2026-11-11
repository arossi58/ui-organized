import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, TextArea } from "@ui-organized/react";
import type { CopyEntry } from "../indexer";

interface SessionEdit {
  file: string;
  line: number;
  before: string;
  after: string;
  currentRaw: string;
  previousRaw: string;
}

type Popover =
  | { mode: "edit"; entry: CopyEntry; draft: string; error?: string }
  | { mode: "choose"; entries: CopyEntry[] }
  | { mode: "computed"; text: string };

const SESSION_KEY = "copy-editor:edits";
const HOST = ".copy-editor";
const GUIDE_PATH = "tooling/code-connect/src/usage/guides/";

async function post<T>(path: string, body: unknown = {}): Promise<T> {
  const res = await fetch(`/__copy/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as T;
}

/** Firefox ships caretPositionFromPoint; Chrome and Safari the older caretRangeFromPoint. */
function textNodeAt(x: number, y: number): Text | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const node = doc.caretPositionFromPoint?.(x, y)?.offsetNode ?? doc.caretRangeFromPoint?.(x, y)?.startContainer;
  if (!node || node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) return null;
  // The caret lands on the nearest text, which may be a long way from the pointer.
  const range = document.createRange();
  range.selectNodeContents(node);
  const hit = [...range.getClientRects()].some(
    (r) => x >= r.left - 2 && x <= r.right + 2 && y >= r.top - 2 && y <= r.bottom + 2,
  );
  return hit ? (node as Text) : null;
}

/**
 * The text node alone first, for JSX text beside an inline tag. Then its ancestors,
 * because markdown strings render as several nodes ("Use ", <code>intent</code>, " to").
 */
function candidatesFor(node: Text): string[] {
  const candidates = [node.textContent ?? ""];
  let element = node.parentElement;
  for (let depth = 0; element && depth < 4; depth++, element = element.parentElement) {
    if (element.textContent) candidates.push(element.textContent);
  }
  return candidates;
}

const shortPath = (file: string) => file.replace(/^apps\/marketing\/src\//, "");

export function CopyEditor() {
  const [editing, setEditing] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [entries, setEntries] = useState<CopyEntry[]>([]);
  const [search, setSearch] = useState("");
  const [popover, setPopover] = useState<Popover | null>(null);
  const [hover, setHover] = useState<DOMRect | null>(null);
  const [check, setCheck] = useState<{ ok: boolean; output: string } | "running" | null>(null);
  const [edits, setEdits] = useState<SessionEdit[]>(() =>
    JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "[]"),
  );
  const editingRef = useRef(editing);
  editingRef.current = editing;

  useEffect(() => {
    // Editing a module with no React component triggers a full reload; the list survives it.
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(edits));
  }, [edits]);

  const refresh = useCallback(async () => {
    const res = await fetch("/__copy/index");
    setEntries(((await res.json()) as { entries: CopyEntry[] }).entries);
  }, []);

  useEffect(() => {
    if (drawer) void refresh();
  }, [drawer, refresh]);

  useEffect(() => {
    if (!editing) {
      setHover(null);
      return;
    }
    const inEditor = (target: EventTarget | null) => target instanceof Element && !!target.closest(HOST);

    const onMove = (event: MouseEvent) => {
      if (inEditor(event.target)) return setHover(null);
      const node = textNodeAt(event.clientX, event.clientY);
      if (!node) return setHover(null);
      const range = document.createRange();
      range.selectNodeContents(node);
      setHover(range.getBoundingClientRect());
    };

    const onClick = async (event: MouseEvent) => {
      if (inEditor(event.target)) return;
      // Links and buttons on the page mustn't fire while picking text.
      event.preventDefault();
      event.stopPropagation();
      const node = textNodeAt(event.clientX, event.clientY);
      if (!node) return;
      const { entries: hits } = await post<{ entries: CopyEntry[] }>("match", {
        candidates: candidatesFor(node),
      });
      if (hits.length === 0) setPopover({ mode: "computed", text: node.textContent?.trim() ?? "" });
      else if (hits.length === 1) setPopover({ mode: "edit", entry: hits[0], draft: hits[0].text });
      else setPopover({ mode: "choose", entries: hits });
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick, true);
    };
  }, [editing]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (popover) setPopover(null);
      else if (editingRef.current) setEditing(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [popover]);

  const save = async () => {
    if (popover?.mode !== "edit") return;
    const { entry, draft } = popover;
    if (draft === entry.text) return setPopover(null);
    const result = await post<{ ok: boolean; error?: string; entry?: CopyEntry; previousRaw?: string }>("save", {
      file: entry.file,
      start: entry.start,
      end: entry.end,
      expected: entry.raw,
      text: draft,
    });
    if (!result.ok || !result.entry) return setPopover({ ...popover, error: result.error });
    setEdits((list) => [
      {
        file: entry.file,
        line: entry.line,
        before: entry.text,
        after: draft,
        currentRaw: result.entry!.raw,
        previousRaw: result.previousRaw!,
      },
      ...list,
    ]);
    setPopover(null);
    if (drawer) void refresh();
  };

  const undo = async (edit: SessionEdit) => {
    const result = await post<{ ok: boolean; error?: string }>("undo", edit);
    if (!result.ok) return window.alert(result.error);
    setEdits((list) => list.filter((item) => item !== edit));
    if (drawer) void refresh();
  };

  const runChecks = async () => {
    setCheck("running");
    setCheck(await post<{ ok: boolean; output: string }>("check"));
  };

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = query
      ? entries.filter((e) => e.text.toLowerCase().includes(query) || e.file.toLowerCase().includes(query))
      : entries;
    return list.slice(0, 200);
  }, [entries, search]);

  return (
    <>
      {hover && editing && (
        <div
          className="copy-editor__highlight"
          style={{ top: hover.top - 2, left: hover.left - 2, width: hover.width + 4, height: hover.height + 4 }}
        />
      )}

      <div className="copy-editor__bar" role="toolbar" aria-label="Copy editor">
        <Button
          size="sm"
          intent={editing ? "primary" : "secondary"}
          aria-pressed={editing}
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Click text to edit" : "Edit copy"}
        </Button>
        <Button size="sm" intent="secondary" aria-expanded={drawer} onClick={() => setDrawer(!drawer)}>
          All copy{edits.length ? ` (${edits.length} edited)` : ""}
        </Button>
      </div>

      {drawer && (
        <aside className="copy-editor__drawer" aria-label="All copy">
          <input
            className="copy-editor__search"
            type="search"
            placeholder={`Search ${entries.length} strings`}
            aria-label="Search copy"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {edits.length > 0 && (
            <section>
              <h2>This session</h2>
              {edits.map((edit, i) => (
                <div className="copy-editor__edit" key={i}>
                  <p className="copy-editor__meta">{shortPath(edit.file)}:{edit.line}</p>
                  <p>{edit.after}</p>
                  <Button size="sm" intent="ghost" onClick={() => void undo(edit)}>Undo</Button>
                </div>
              ))}
            </section>
          )}

          <section>
            <h2>Checks</h2>
            <Button size="sm" intent="secondary" disabled={check === "running"} onClick={() => void runChecks()}>
              {check === "running" ? "Running…" : "Run copy checks"}
            </Button>
            {check && check !== "running" && (
              <>
                <p role="status">{check.ok ? "Usage guide checks pass." : "Usage guide checks failed."}</p>
                {!check.ok && <pre className="copy-editor__output">{check.output}</pre>}
              </>
            )}
          </section>

          <section>
            <h2>{results.length === 200 ? "First 200 matches" : `${results.length} matches`}</h2>
            <ul className="copy-editor__list">
              {results.map((entry) => (
                <li key={`${entry.file}:${entry.start}`}>
                  <button type="button" onClick={() => setPopover({ mode: "edit", entry, draft: entry.text })}>
                    <span>{entry.text}</span>
                    <span className="copy-editor__meta">{shortPath(entry.file)}:{entry.line}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      )}

      {popover && (
        <div className="copy-editor__popover" role="dialog" aria-label="Edit copy">
          {popover.mode === "computed" && (
            <>
              <p>This text is computed in code, so it isn&apos;t editable here:</p>
              <p className="copy-editor__quote">{popover.text}</p>
              <Button size="sm" intent="secondary" onClick={() => setPopover(null)}>Close</Button>
            </>
          )}

          {popover.mode === "choose" && (
            <>
              <p>This text appears in {popover.entries.length} places. Choose one:</p>
              <ul className="copy-editor__list">
                {popover.entries.map((entry) => (
                  <li key={`${entry.file}:${entry.start}`}>
                    <button type="button" onClick={() => setPopover({ mode: "edit", entry, draft: entry.text })}>
                      <span className="copy-editor__meta">{shortPath(entry.file)}:{entry.line}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <Button size="sm" intent="secondary" onClick={() => setPopover(null)}>Cancel</Button>
            </>
          )}

          {popover.mode === "edit" && (
            <>
              <p className="copy-editor__meta">{shortPath(popover.entry.file)}:{popover.entry.line}</p>
              <TextArea
                aria-label="Copy text"
                rows={Math.min(12, Math.ceil(popover.draft.length / 50) + 1)}
                // The dialog opened because the user asked to type here.
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                value={popover.draft}
                onChange={(event) => setPopover({ ...popover, draft: event.target.value, error: undefined })}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void save();
                }}
              />
              {popover.entry.file.startsWith(GUIDE_PATH) && popover.draft.includes("—") && (
                <p role="status">Usage guides don&apos;t use em dashes. The copy checks will fail.</p>
              )}
              {popover.error && <p role="alert">{popover.error}</p>}
              <div className="copy-editor__actions">
                <Button size="sm" intent="primary" onClick={() => void save()}>Save</Button>
                <Button size="sm" intent="ghost" onClick={() => setPopover(null)}>Cancel</Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
