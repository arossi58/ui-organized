import { useEffect, useRef, useState } from "react";
import { Switch } from "@ui-organized/react";
import { useTheme } from "../../theme/ThemeProvider";
import "./theme-menu.css";

/**
 * The nav's theme control (Branding mockup): a circular swatch trigger that
 * opens a popover with a dark-mode toggle and the brand-colour list. Picking a
 * colour or flipping the toggle re-themes the whole site via `useTheme`.
 *
 * The swatch shows the live brand primary so the control reads as a colour
 * picker; the panel matches the mockup (DS Switch + a single-select colour
 * list) and is wired for keyboard use — Escape and outside-click close it.
 */
export function ThemeMenu() {
  const { mode, brand, brandHex, options, setMode, setBrand } = useTheme();
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
          <div className="theme-menu__switch-row">
            <Switch
              label="Dark Mode"
              checked={mode === "dark"}
              onCheckedChange={(checked) => setMode(checked ? "dark" : "light")}
            />
          </div>

          <div className="theme-menu__list" role="radiogroup" aria-label="Brand colour">
            {options.map((option) => {
              const selected = option.name === brand;
              return (
                <button
                  key={option.name}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className="theme-menu__item"
                  onClick={() => setBrand(option.name)}
                >
                  <span
                    className="theme-menu__swatch"
                    style={{ background: option.hex }}
                    aria-hidden="true"
                  />
                  <span className="theme-menu__item-label">{option.label}</span>
                  {selected && (
                    <svg
                      className="theme-menu__check"
                      viewBox="0 0 20 20"
                      width="18"
                      height="18"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 10.5l3.4 3.4L15 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
