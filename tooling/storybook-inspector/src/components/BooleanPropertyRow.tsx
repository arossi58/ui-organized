/** Figma's boolean property → a right-aligned toggle switch. Flip → live update (§4). */
import type { Control } from "../controls.js";
import { RowShell } from "./RowShell.js";

export function BooleanPropertyRow({
  control,
  value,
  drift,
  onChange,
}: {
  control: Control;
  value: unknown;
  drift?: string;
  onChange: (v: boolean) => void;
}) {
  const on = value === true;
  return (
    <RowShell label={control.name} description={control.description} defaultValue={control.defaultValue} drift={drift}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={control.name}
        className="fcp-switch"
        data-on={String(on)}
        onClick={() => onChange(!on)}
      />
    </RowShell>
  );
}
