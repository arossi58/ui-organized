/** Object/array control → a JSON editor (like Storybook's object control). Commits
 *  on blur; invalid JSON is flagged and not applied. */
import { useEffect, useState } from "react";
import type { Control } from "../controls.js";
import { RowShell } from "./RowShell.js";

function stringify(v: unknown): string {
  try {
    return v === undefined ? "" : JSON.stringify(v, null, 2);
  } catch {
    return "";
  }
}

export function ObjectPropertyRow({
  control,
  value,
  drift,
  onChange,
}: {
  control: Control;
  value: unknown;
  drift?: string;
  onChange: (v: unknown) => void;
}) {
  const [text, setText] = useState(() => stringify(value));
  const [err, setErr] = useState(false);

  // Adopt external changes (e.g. Reset) — safe since edits commit on blur.
  useEffect(() => {
    setText(stringify(value));
    setErr(false);
  }, [value]);

  const commit = () => {
    if (text.trim() === "") return;
    try {
      onChange(JSON.parse(text));
      setErr(false);
    } catch {
      setErr(true);
    }
  };

  return (
    <RowShell label={control.name} description={control.description} defaultValue={control.defaultValue} drift={drift}>
      <textarea
        className={`fcp-input fcp-json${err ? " fcp-json-err" : ""}`}
        value={text}
        rows={3}
        spellCheck={false}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
      />
    </RowShell>
  );
}
