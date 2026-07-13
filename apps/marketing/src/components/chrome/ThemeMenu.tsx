import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { ThemeControls } from "./ThemeControls";
import "./theme-menu.css";

/**
 * The nav's theme control (Branding mockup): a circular swatch trigger that
 * opens a popover with a dark-mode toggle and the brand-colour list. Picking a
 * colour or flipping the toggle re-themes the whole site via `useTheme`.
 *
 * The swatch shows the live brand primary so the control reads as a colour
 * picker; the panel matches the mockup (DS Switch + a single-select colour
 * list, shared with the mobile menu via ThemeControls) and is wired for
 * keyboard use — Escape and outside-click close it.
 */
export function ThemeMenu() {
  const { mode, brand, brandHex } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="theme-menu" ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="theme-menu__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Theme settings — ${brand}, ${mode} mode`}
        onClick={() => setOpen((o) => !o)}
        style={{ "--theme-menu-swatch": brandHex } as React.CSSProperties}
      >
        <span className="theme-menu__trigger-dot" />
      </button>

      {open && (
        <div className="theme-menu__panel" role="dialog" aria-label="Theme settings">
          <ThemeControls />
        </div>
      )}
    </div>
  );
}
