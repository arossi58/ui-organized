/** Range control → a slider with the live value (like Storybook's range control). */
import type { Control } from "../controls.js";
import { RowShell } from "./RowShell.js";

export function RangePropertyRow({
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
  const min = control.min ?? 0;
  const max = control.max ?? 100;
  const num = typeof value === "number" ? value : Number(value);
  const val = Number.isFinite(num) ? num : min;
  return (
    <RowShell label={control.name} description={control.description} defaultValue={control.defaultValue} drift={drift}>
      <div className="fcp-range-field">
        <input
          type="range"
          min={min}
          max={max}
          step={control.step ?? 1}
          value={val}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="fcp-range-val">{val}</span>
      </div>
    </RowShell>
  );
}
