import { SignaturePad as ArkSignaturePad } from "@ark-ui/react";
import { clsx } from "clsx";
import { Button } from "../Button/index.js";
import { FieldError } from "../FieldError/index.js";
import { signaturePadStyles } from "./SignaturePad.styles.js";
import type { SignaturePadProps } from "./SignaturePad.types.js";
import "@ui-organized/core/components/SignaturePad/SignaturePad.css";

const DEFAULT_STROKE_WIDTH = 2;

export function SignaturePad({
  label,
  helperText,
  error,
  paths,
  defaultPaths,
  onDraw,
  onDrawEnd,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  showGuide = true,
  showClear = true,
  clearLabel = "Clear",
  size = "md",
  variant,
  required,
  disabled,
  readOnly,
  name,
  className,
}: SignaturePadProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <ArkSignaturePad.Root
      className={clsx(signaturePadStyles({ size, variant }), className)}
      paths={paths}
      defaultPaths={defaultPaths}
      onDraw={onDraw && ((details) => onDraw(details.paths))}
      onDrawEnd={onDrawEnd && ((details) => onDrawEnd(details.paths, details.getDataUrl))}
      /* The ink is a canvas stroke in device pixels, so its width is a prop
         rather than CSS. Its colour is themed — see SignaturePad.css. */
      drawing={{ size: strokeWidth }}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
    >
      {label && (
        <ArkSignaturePad.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </ArkSignaturePad.Label>
      )}

      <ArkSignaturePad.Control className="signature-pad__control">
        {/* Each committed stroke is its own path element; zag supplies the data
            and re-renders the set as drawing progresses. */}
        <ArkSignaturePad.Context>
          {(api) =>
            api.paths.map((path, index) => (
              <ArkSignaturePad.Segment
                key={index}
                path={path}
                className="signature-pad__segment"
              />
            ))
          }
        </ArkSignaturePad.Context>
        {showGuide && <ArkSignaturePad.Guide className="signature-pad__guide" />}
      </ArkSignaturePad.Control>

      {showClear && (
        <ArkSignaturePad.ClearTrigger asChild>
          <Button intent="ghost" size={size} type="button" icon="refresh">
            {clearLabel}
          </Button>
        </ArkSignaturePad.ClearTrigger>
      )}

      {helperText && !isInvalid && (
        <span className="field__description">{helperText}</span>
      )}
      {isInvalid && errorMessage && <FieldError>{errorMessage}</FieldError>}
      {/* The hidden input requires an explicit value, and the machine offers two
          forms: the stroke paths, and a rasterised data URL from
          `getDataUrl` — which is async and so cannot feed a render-time prop.
          The paths are submitted instead: they are lossless, resolution
          independent, and deterministic. Reach for the PNG via `onDrawEnd`,
          whose details carry `getDataUrl`, when a raster is what the server
          wants. */}
      <ArkSignaturePad.Context>
        {(api) => <ArkSignaturePad.HiddenInput value={api.paths.join(" ")} />}
      </ArkSignaturePad.Context>
    </ArkSignaturePad.Root>
  );
}
