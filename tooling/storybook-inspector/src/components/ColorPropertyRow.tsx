/** Color control (like Storybook's color picker): swatch + free text value. */
import type { Control } from "../controls.js";
import { RowShell } from "./RowShell.js";

export function ColorPropertyRow({
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
  const v = value == null ? "" : String(value);
  const hex = /^#[0-9a-f]{6}$/i.test(v) ? v : "#000000";
  return (
    <RowShell label={control.name} description={control.description} defaultValue={control.defaultValue} drift={drift}>
      <div className="fcp-color-field">
        <input type="color" className="fcp-color-swatch" value={hex} onChange={(e) => onChange(e.target.value)} />
        <input
          className="fcp-input"
          value={v}
          placeholder={control.defaultValue ?? "#…"}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </RowShell>
  );
}
