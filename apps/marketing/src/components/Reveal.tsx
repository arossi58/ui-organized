import type { ReactNode } from "react";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

interface RevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps content in the shared `.reveal` treatment (layout.css), driven by one
 * IntersectionObserver. Under reduced motion the `.reveal` class is inert, so
 * content is visible immediately — no special-casing needed here.
 */
export function Reveal({ children, className }: RevealProps) {
  const ref = useRevealOnScroll<HTMLDivElement>();
  return (
    <div ref={ref} className={["reveal", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
