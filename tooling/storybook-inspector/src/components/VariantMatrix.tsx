/**
 * Displays ALL variants of the current component — every value of each variant axis
 * (sizes, intents, …) and each boolean state (disabled, loading, …) — as a grid of
 * LIVE Storybook preview iframes. Each thumbnail renders the real component with one
 * arg overridden, via Storybook's args-in-URL feature (`buildArgsParam`), so it's
 * pixel-accurate and needs no re-implementation of the component.
 */
import { useArgTypes, useStorybookApi } from "storybook/manager-api";
import { buildArgsParam } from "storybook/internal/router";
import { controlFromArgType, type Control, type StoryArgTypeInput } from "../controls.js";

/** The preview `iframe.html` base, read from the live preview iframe's src. */
function previewBase(): string | null {
  const iframe = document.getElementById("storybook-preview-iframe") as HTMLIFrameElement | null;
  if (!iframe?.src) return null;
  const u = new URL(iframe.src);
  return `${u.origin}${u.pathname}`;
}

function Thumb({ base, storyId, args, label }: { base: string; storyId: string; args: Record<string, unknown>; label: string }) {
  const src = `${base}?id=${encodeURIComponent(storyId)}&viewMode=story&args=${buildArgsParam({}, args)}`;
  return (
    <figure className="fcp-variant">
      <div className="fcp-variant-frame-wrap">
        <iframe className="fcp-variant-frame" src={src} loading="lazy" title={label} tabIndex={-1} />
      </div>
      <figcaption title={label}>{label}</figcaption>
    </figure>
  );
}

export function VariantMatrix() {
  const argTypes = (useArgTypes() ?? {}) as Record<string, StoryArgTypeInput>;
  const api = useStorybookApi();
  const storyId = api.getCurrentStoryData()?.id;
  const base = previewBase();

  if (!storyId || !base) return <p className="fcp-empty">No story to preview.</p>;

  const controls = Object.entries(argTypes)
    .map(([name, at]) => controlFromArgType(name, at))
    .filter((c): c is Control => c !== null);
  const axes = controls.filter((c) => c.kind === "variant" && (c.options?.length ?? 0) > 0);
  const states = controls.filter((c) => c.kind === "boolean");

  if (axes.length === 0 && states.length === 0) {
    return <p className="fcp-empty">This component exposes no variant or state controls.</p>;
  }

  return (
    <div className="fcp-variants">
      {axes.map((axis) => (
        <div key={axis.name}>
          <div className="fcp-section-header">{axis.name}</div>
          <div className="fcp-variant-strip">
            {axis.options!
              .filter((opt) => opt && opt !== "undefined" && opt !== "null")
              .map((opt) => (
                <Thumb key={opt} base={base} storyId={storyId} args={{ [axis.name]: opt }} label={opt} />
              ))}
          </div>
        </div>
      ))}
      {states.length > 0 && (
        <div>
          <div className="fcp-section-header">States</div>
          <div className="fcp-variant-strip">
            {states.map((s) => (
              <Thumb key={s.name} base={base} storyId={storyId} args={{ [s.name]: true }} label={s.name} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
