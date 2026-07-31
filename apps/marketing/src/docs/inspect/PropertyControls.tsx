/**
 * Live controls for a component's props — the docs equivalent of Storybook's
 * Controls panel.
 *
 * The control list comes from `mergeControls` in `@ui-organized/code-connect`,
 * the same function the Storybook Inspector panel uses, so both surfaces offer
 * the same controls in the same order with the same enum options (the manifest's
 * verified unions winning over hand-maintained argTypes).
 *
 * Every control is a design-system component, and each one renders its OWN
 * `label` / `helperText` rather than having a hand-built label stacked above it.
 * That matters beyond consistency: the DS components wire `label` to their input
 * with a real `for`/`id` pair, so clicking a label focuses its field and screen
 * readers announce it. The previous hand-rolled labels were plain text next to
 * an `aria-label`, which looked right and behaved wrong.
 */
import {
  groupControls,
  mergeControls,
  type Control,
  type PropDefinition,
  type StoryArgTypeInput,
} from "@ui-organized/code-connect/browser";
import {
  Button,
  Input,
  NumberField,
  Range,
  Select,
  Switch,
  TextArea,
} from "@ui-organized/react";
import styles from "./inspect.module.css";

interface PropertyControlsProps {
  props: PropDefinition[];
  argTypes: Record<string, StoryArgTypeInput>;
  args: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  onReset: () => void;
}

function ControlRow({
  control,
  value,
  onChange,
}: {
  control: Control;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const label = control.name;
  const helperText = control.description;

  switch (control.kind) {
    case "variant": {
      const options = control.options ?? [];
      return (
        <Select
          size="sm"
          label={label}
          helperText={helperText}
          options={options.map((option) => ({ value: option, label: option }))}
          value={value == null ? "" : String(value)}
          placeholder="—"
          onValueChange={onChange}
        />
      );
    }

    case "boolean":
      return (
        <Switch label={label} checked={Boolean(value)} onCheckedChange={onChange} />
      );

    case "number":
      return (
        <NumberField
          size="sm"
          label={label}
          helperText={helperText}
          value={typeof value === "number" ? value : null}
          onValueChange={onChange}
        />
      );

    case "range":
      return (
        <Range
          size="sm"
          label={label}
          min={control.min ?? 0}
          max={control.max ?? 100}
          step={control.step ?? 1}
          value={typeof value === "number" ? value : (control.min ?? 0)}
          onValueChange={onChange}
        />
      );

    case "color":
      // The one control with no design-system equivalent. Labelled through a
      // real <label> wrapper so it behaves like the others.
      return (
        <label className={styles.colorField}>
          <span className={styles.colorLabel}>{label}</span>
          <input
            type="color"
            className={styles.colorInput}
            value={typeof value === "string" && value.startsWith("#") ? value : "#000000"}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      );

    case "object":
      return (
        <TextArea
          size="sm"
          label={label}
          helperText={helperText}
          rows={3}
          defaultValue={value == null ? "" : JSON.stringify(value, null, 2)}
          // Only commit on blur: re-parsing every keystroke would blow up the
          // preview the moment the JSON is momentarily incomplete.
          onBlur={(event) => {
            try {
              onChange(event.target.value.trim() ? JSON.parse(event.target.value) : undefined);
            } catch {
              /* leave the last valid value in place */
            }
          }}
        />
      );

    default:
      return (
        <Input
          size="sm"
          label={label}
          helperText={helperText}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}

export function PropertyControls({
  props,
  argTypes,
  args,
  onChange,
  onReset,
}: PropertyControlsProps) {
  const controls = mergeControls(props, argTypes);

  if (controls.length === 0) {
    return <p className={styles.empty}>This component has no controllable props.</p>;
  }

  // `groupControls` puts State first, which is what makes an overlay inspectable
  // at all: for a Dialog or a Select, `open` is the switch that brings the rest
  // of the component into existence, not one prop among twenty.
  const sections = groupControls(controls);

  return (
    <div className={styles.controls}>
      {sections.map((section) => (
        <section className={styles.controlSection} key={section.title}>
          <h3 className={styles.controlSectionTitle}>{section.title}</h3>
          {section.controls.map((control) => (
            <div className={styles.controlRow} key={control.name}>
              <ControlRow
                control={control}
                value={args[control.name]}
                onChange={(value) => onChange(control.name, value)}
              />
            </div>
          ))}
        </section>
      ))}
      <Button intent="ghost" size="sm" icon="refresh" onClick={onReset}>
        Reset all
      </Button>
    </div>
  );
}
