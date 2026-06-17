import { Button } from "@ui-organized/react";
import { ICON_LIBRARIES } from "../constants.js";
import { rewriteSvg } from "../svg.js";
import SvgBox from "./SvgBox.jsx";

export default function WorkspaceRow({ item, activeSizes, getStrokeForSize, onRemove, iconColor }) {
  const { name, lib, svgText, detectedStroke } = item;
  return (
    <div className="is-workspace-row">
      <div className="is-workspace-row-info">
        <div className="is-workspace-row-name">{name}</div>
        <div className="is-workspace-row-meta">
          {ICON_LIBRARIES[lib]?.name ?? lib} · detected: {detectedStroke}
        </div>
      </div>
      <div className="is-workspace-row-previews">
        {activeSizes.map((size) => {
          const sw = getStrokeForSize(size);
          const svg = rewriteSvg(svgText, sw, size);
          return (
            <div key={size} className="is-workspace-row-preview">
              <SvgBox svgString={svg} size={size} color={iconColor} />
              <span className="is-workspace-row-stroke">{sw}</span>
            </div>
          );
        })}
      </div>
      <Button
        intent="ghost"
        size="sm"
        icon="trash"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="is-workspace-row-remove"
      />
    </div>
  );
}
