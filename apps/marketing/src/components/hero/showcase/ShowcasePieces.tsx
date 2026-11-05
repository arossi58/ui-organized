import { forwardRef, type MutableRefObject } from "react";
import type { PieceSpec } from "./parts";
import { useShowcase } from "./showcaseContext";
import "../pieces.css";

/** Pieces are decoration while they fall: out of the tab order and the a11y
 * tree. The live mockup they hand off to is the real, reachable UI. */
const setInert = (node: HTMLSpanElement | null) => {
  if (node) node.inert = true;
};

/**
 * The hero's physics layer: one positioning shell per piece, which the engine
 * moves. A mirror piece draws its chrome from the shared mockup state; a part
 * piece's shell starts empty, and `PartHost` moves the live component into it
 * while the mockup is in pieces; a snapshot piece's shell is filled with a
 * copy of part of the data table when the mockup comes apart (parts.tsx and
 * snapshot.ts explain the three). `aria-hidden`:
 * the live mockup is the accessible copy of everything here.
 */
export const ShowcasePieces = forwardRef<
  HTMLDivElement,
  { specs: PieceSpec[]; pieceEls: MutableRefObject<Array<HTMLElement | null>> }
>(function ShowcasePieces({ specs, pieceEls }, ref) {
  const state = useShowcase();
  return (
    <div className="piece-layer showcase-pieces" ref={ref} aria-hidden="true">
      {specs.map((spec, i) => (
        <div
          key={spec.id}
          className="physics-piece physics-piece--real"
          ref={(el) => {
            pieceEls.current[i] = el;
          }}
        >
          {spec.kind === "mirror" ? (
            <span className="physics-piece__fit" ref={setInert}>
              {spec.render(state)}
            </span>
          ) : (
            <span
              className="physics-piece__fit"
              ref={(el) => {
                setInert(el);
                state.host.registerShell(spec.id, el);
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
});
