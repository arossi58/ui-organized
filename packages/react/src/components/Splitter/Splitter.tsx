import { useMemo, Fragment } from "react";
import { Splitter as ArkSplitter } from "@ark-ui/react";
import { clsx } from "clsx";
import { splitterStyles } from "./Splitter.styles.js";
import type { SplitterProps } from "./Splitter.types.js";
import "./Splitter.css";

export function Splitter({
  panels,
  size,
  defaultSize,
  onResize,
  onResizeEnd,
  orientation = "horizontal",
  variant,
  className,
}: SplitterProps) {
  /* The machine takes its own panel descriptors, not our render data — strip
     `content` so a changed React node never looks like a changed constraint. */
  const panelData = useMemo(
    () =>
      panels.map(({ id, minSize, maxSize, collapsible, collapsedSize }) => ({
        id,
        minSize,
        maxSize,
        collapsible,
        collapsedSize,
      })),
    [panels],
  );

  return (
    <ArkSplitter.Root
      className={clsx(splitterStyles({ orientation, variant }), className)}
      panels={panelData}
      size={size}
      defaultSize={defaultSize}
      onResize={onResize && ((details) => onResize(details.size))}
      onResizeEnd={onResizeEnd && ((details) => onResizeEnd(details.size))}
      orientation={orientation}
    >
      {panels.map((panel, index) => (
        <Fragment key={panel.id}>
          <ArkSplitter.Panel id={panel.id} className="splitter__panel">
            {panel.content}
          </ArkSplitter.Panel>
          {/* A handle sits between adjacent panels, so the last panel has none.
              zag identifies it by the literal "before:after" pair of ids. */}
          {index < panels.length - 1 && (
            <ArkSplitter.ResizeTrigger
              id={`${panel.id}:${panels[index + 1]!.id}`}
              className="splitter__trigger"
              // The handle is a <button role="separator"> whose only child is a
              // decorative grip, so it had no accessible name — a keyboard user
              // landed on an unnamed control with arrow keys that did something
              // unexplained. Naming it after the two panels it sits between says
              // what moving it will do.
              aria-label={`Resize ${panel.label ?? panel.id} and ${
                panels[index + 1]!.label ?? panels[index + 1]!.id
              }`}
            >
              <span className="splitter__grip" aria-hidden="true" />
            </ArkSplitter.ResizeTrigger>
          )}
        </Fragment>
      ))}
    </ArkSplitter.Root>
  );
}
