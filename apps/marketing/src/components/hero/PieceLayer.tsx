import { forwardRef, type MutableRefObject } from "react";
import type { PieceDef } from "../../lib/pieceManifest";
import { PhysicsPiece } from "./PhysicsPiece";

interface PieceLayerProps {
  /** The active manifest's pieces (desktop dashboard or mobile phone screen). */
  pieces: PieceDef[];
  /** Filled with each piece's element, index-aligned to `pieces`, for the engine. */
  pieceEls: MutableRefObject<Array<HTMLElement | null>>;
}

/**
 * Renders the hero pieces (SITE.md §5) and collects their elements for the engine.
 * The real heading/CTA content lives in HeroTitle and EndCaption. The layer is
 * NOT blanket `aria-hidden`: every piece is a real `@ui-organized/react` component that is
 * `inert` decoration until organized, then goes live (so it must not sit inside
 * an aria-hidden subtree). The layer ref carries the `is-frozen`/`is-arrangeable`
 * classes the engine toggles.
 */
export const PieceLayer = forwardRef<HTMLDivElement, PieceLayerProps>(
  function PieceLayer({ pieces, pieceEls }, ref) {
    return (
      <div className="piece-layer" ref={ref}>
        {pieces.map((def, i) => (
          <PhysicsPiece
            key={def.id}
            def={def}
            assignRef={(el) => {
              pieceEls.current[i] = el;
            }}
          />
        ))}
      </div>
    );
  },
);
