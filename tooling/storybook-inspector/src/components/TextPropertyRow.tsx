/** Figma's text property → a compact inline input, debounced to avoid re-render
 *  thrash on every keystroke (INSPECTOR.md §4/§5). */
import type { Control } from "../controls.js";
import { RowShell } from "./RowShell.js";
import { useDebouncedField } from "../hooks/useDebouncedField.js";

export function TextPropertyRow({
  control,
  value,
  drift,
  onChange,
}: {
  control: Control;
  value: unknown;
  drift?: string;
  onChange: (v: string) => void;
}) {
  const field = useDebouncedField(value == null ? "" : String(value), onChange);
  return (
    <RowShell label={control.name} description={control.description} defaultValue={control.defaultValue} drift={drift}>
      <input
        className="fcp-input"
        value={field.value}
        placeholder={control.defaultValue ?? ""}
        onChange={(e) => field.setValue(e.target.value)}
        onBlur={field.flush}
        onKeyDown={(e) => {
          if (e.key === "Enter") field.flush();
        }}
      />
    </RowShell>
  );
}
