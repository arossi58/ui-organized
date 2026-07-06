/** Figma's numeric field → a stepper: immediate on step, debounced on typed entry
 *  (INSPECTOR.md §4/§5). */
import type { Control } from "../controls.js";
import { RowShell } from "./RowShell.js";
import { useDebouncedField } from "../hooks/useDebouncedField.js";

export function NumberPropertyRow({
  control,
  value,
  drift,
  onChange,
}: {
  control: Control;
  value: unknown;
  drift?: string;
  onChange: (v: number) => void;
}) {
  const field = useDebouncedField(value == null ? "" : String(value), (v) => {
    const n = Number(v);
    if (v !== "" && Number.isFinite(n)) onChange(n);
  });

  const step = (delta: number) => {
    const current = Number(field.value) || 0;
    field.commitNow(String(current + delta));
  };

  return (
    <RowShell label={control.name} description={control.description} defaultValue={control.defaultValue} drift={drift}>
      <div className="fcp-stepper">
        <button type="button" aria-label="decrement" onClick={() => step(-1)}>
          −
        </button>
        <input
          className="fcp-input"
          inputMode="numeric"
          value={field.value}
          onChange={(e) => field.setValue(e.target.value)}
          onBlur={field.flush}
          onKeyDown={(e) => {
            if (e.key === "Enter") field.flush();
          }}
        />
        <button type="button" aria-label="increment" onClick={() => step(1)}>
          +
        </button>
      </div>
    </RowShell>
  );
}
