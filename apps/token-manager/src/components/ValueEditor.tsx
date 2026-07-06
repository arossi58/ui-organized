import { Combobox, Input, NumberField, Select } from "@ui-organized/react";
import { asPureReference } from "@ui-organized/resolver";
import type { DtcgType } from "@ui-organized/schema";
import { editTokenValue as setTokenValue } from "../yjs/store.js";

interface ValueEditorProps {
  setName: string;
  path: string;
  type: DtcgType | undefined;
  value: unknown;
  /** Other token paths, for the reference picker. */
  paths: string[];
  /** Resolved hex for the color swatch, if the value resolved to a color. */
  resolvedHex?: string;
}

const DIMENSION_UNITS = ["px", "rem", "em", "%", "vh", "vw"];
const DURATION_UNITS = ["ms", "s"];
const NUMERIC_LITERAL = /^([+-]?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/i;

/** Inline editor dispatched by token type. Object/composite values edit in JSON. */
export function ValueEditor({ setName, path, type, value, paths, resolvedHex }: ValueEditorProps) {
  // Composite and other structured values are edited in the JSON view.
  if (value !== null && typeof value === "object") {
    return <span className="tm-muted">composite · edit in JSON</span>;
  }

  // A pure alias → token picker (typeahead over existing paths).
  if (asPureReference(value) != null) {
    return <ReferenceEditor setName={setName} path={path} value={String(value)} paths={paths} />;
  }

  if (type === "color") {
    return <ColorEditor setName={setName} path={path} value={String(value)} resolvedHex={resolvedHex} />;
  }
  if (type === "dimension" || type === "duration") {
    return <DimensionEditor setName={setName} path={path} value={String(value)} kind={type} />;
  }
  if (type === "number" || type === "fontWeight") {
    return <NumberEditor setName={setName} path={path} value={value} />;
  }
  return <TextEditor setName={setName} path={path} value={String(value)} />;
}

function ReferenceEditor({
  setName,
  path,
  value,
  paths,
}: {
  setName: string;
  path: string;
  value: string;
  paths: string[];
}) {
  const current = value.trim().replace(/^\{|\}$/g, "");
  const options = paths.filter((p) => p !== path).map((p) => ({ value: p, label: p }));
  return (
    <Combobox
      size="sm"
      options={options}
      value={current}
      onValueChange={(p) => p && setTokenValue(setName, path, `{${p}}`)}
      placeholder="Reference a token…"
      aria-label={`Reference for ${path}`}
    />
  );
}

function ColorEditor({
  setName,
  path,
  value,
  resolvedHex,
}: {
  setName: string;
  path: string;
  value: string;
  resolvedHex?: string;
}) {
  return (
    <div className="tm-editor__color">
      <span className="tm-swatch" style={{ background: resolvedHex ?? "transparent" }} aria-hidden="true" />
      <Input
        size="sm"
        value={value}
        onChange={(e) => setTokenValue(setName, path, e.target.value)}
        aria-label={`Color value for ${path}`}
        spellCheck={false}
      />
    </div>
  );
}

function DimensionEditor({
  setName,
  path,
  value,
  kind,
}: {
  setName: string;
  path: string;
  value: string;
  kind: "dimension" | "duration";
}) {
  const match = NUMERIC_LITERAL.exec(value.trim());
  if (!match) {
    // Expression or non-literal (e.g. "{spacing.base} * 2") — edit as text.
    return <TextEditor setName={setName} path={path} value={value} />;
  }
  const num = parseFloat(match[1]!);
  const unit = match[2] || (kind === "duration" ? "ms" : "px");
  const units = kind === "duration" ? DURATION_UNITS : DIMENSION_UNITS;

  return (
    <div className="tm-editor">
      <NumberField
        size="sm"
        value={num}
        onValueChange={(n) => setTokenValue(setName, path, `${n ?? 0}${unit}`)}
        aria-label={`${path} value`}
      />
      <Select
        size="sm"
        options={units.map((u) => ({ value: u, label: u }))}
        value={unit}
        onValueChange={(u) => setTokenValue(setName, path, `${num}${u}`)}
        aria-label={`${path} unit`}
      />
    </div>
  );
}

function NumberEditor({ setName, path, value }: { setName: string; path: string; value: unknown }) {
  if (typeof value !== "number") {
    return <TextEditor setName={setName} path={path} value={String(value)} />;
  }
  return (
    <NumberField
      size="sm"
      value={value}
      onValueChange={(n) => setTokenValue(setName, path, n ?? 0)}
      aria-label={`${path} value`}
    />
  );
}

function TextEditor({ setName, path, value }: { setName: string; path: string; value: string }) {
  return (
    <Input
      size="sm"
      value={value}
      onChange={(e) => setTokenValue(setName, path, e.target.value)}
      aria-label={`${path} value`}
      spellCheck={false}
    />
  );
}
