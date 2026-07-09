import { useEffect, useMemo, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
import { FieldError } from "@ui-organized/react";
import { DtcgGroupSchema } from "@ui-organized/schema";
import { setSetTokens, useProjectDocument } from "../yjs/store.js";
import { useSelection } from "../state/SelectionContext.js";

/** CodeMirror theme that follows the editor chrome via design-system tokens. */
const cmTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--color-surface-base)",
    color: "var(--color-content-primary)",
    height: "100%",
  },
  ".cm-gutters": {
    backgroundColor: "var(--color-surface-primary)",
    color: "var(--color-content-tertiary)",
    border: "none",
  },
  ".cm-content": { caretColor: "var(--color-content-primary)" },
  "&.cm-focused": { outline: "none" },
  ".cm-activeLine": { backgroundColor: "var(--color-surface-secondary)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--color-surface-secondary)" },
});

export function JsonView() {
  const selection = useSelection();
  const doc = useProjectDocument();
  const set = doc.sets.find((s) => s.name === selection.setName);

  const externalJson = useMemo(
    () => (set ? JSON.stringify(set.tokens, null, 2) : "{}"),
    [set],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const externalRef = useRef(externalJson);
  externalRef.current = externalJson;
  const settingExternally = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [error, setError] = useState<string | null>(null);

  // Create the editor when the active set changes.
  useEffect(() => {
    if (!containerRef.current || !selection.setName) return;
    const setName = selection.setName;

    const commit = (text: string) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setError("Invalid JSON");
        return;
      }
      const result = DtcgGroupSchema.safeParse(parsed);
      if (!result.success) {
        const issue = result.error.issues[0];
        setError(issue ? `${issue.path.join(".") || "(root)"}: ${issue.message}` : "Invalid DTCG");
        return;
      }
      setError(null);
      setSetTokens(setName, result.data);
    };

    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: externalRef.current,
        extensions: [
          basicSetup,
          json(),
          cmTheme,
          EditorView.updateListener.of((update) => {
            if (!update.docChanged || settingExternally.current) return;
            clearTimeout(debounceRef.current);
            const text = update.state.doc.toString();
            debounceRef.current = setTimeout(() => commit(text), 300);
          }),
        ],
      }),
    });
    viewRef.current = view;
    setError(null);

    return () => {
      clearTimeout(debounceRef.current);
      view.destroy();
      viewRef.current = null;
    };
  }, [selection.setName]);

  // Reflect external (list-view) edits into the editor when it isn't focused.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (externalJson !== current && !view.hasFocus) {
      settingExternally.current = true;
      view.dispatch({ changes: { from: 0, to: current.length, insert: externalJson } });
      settingExternally.current = false;
      setError(null);
    }
  }, [externalJson]);

  if (!selection.setName) {
    return <div className="tm-pane__scroll tm-muted">Select a set to view its JSON.</div>;
  }

  return (
    <div className="tm-json">
      <div className="tm-json__editor" ref={containerRef} />
      {error && (
        <div className="tm-json__error">
          <FieldError>{error}</FieldError>
        </div>
      )}
    </div>
  );
}
