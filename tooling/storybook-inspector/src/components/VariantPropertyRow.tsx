/** Figma's variant property → a segmented pill group. Click → live arg update (§4). */
import type { Control } from "../controls.js";
import { RowShell } from "./RowShell.js";

export function VariantPropertyRow({
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
  return (
    <RowShell label={control.name} description={control.description} defaultValue={control.defaultValue} drift={drift}>
      <div className="fcp-pills" role="radiogroup" aria-label={control.name}>
        {control.options?.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            className="fcp-pill"
            data-active={String(value === opt)}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </RowShell>
  );
}
