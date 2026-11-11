// Records whether the user is driving with a pointer or a keyboard, as
// `data-focus-modality="pointer" | "keyboard"` on <html>.
//
// Text fields need it. Browsers match :focus-visible on *every* focus of an
// editable element, mouse included, so CSS alone cannot tell a click from a Tab.
// The field stylesheets key a quieter pointer-focus state off this attribute
// and keep the full ring otherwise.
//
// This is the one DOM-touching module in core, so it lives behind its own
// "./focus-modality" entry and never reaches the recipes in "./index". The
// libraries call it on mount — explicitly, not as an import side effect, which
// `sideEffects` tree-shaking would be free to drop.

export type FocusModality = "pointer" | "keyboard";

// Core compiles without the DOM lib (that is how "./index" is kept DOM-free),
// so the few shapes used here are described structurally.
interface ModalityTarget {
  tagName?: unknown;
  type?: string;
  isContentEditable?: boolean;
}
interface ModalityKeyEvent {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  target: unknown;
}
export interface ModalityDocument {
  documentElement: {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
  };
  addEventListener(type: "pointerdown", listener: () => void, capture: boolean): void;
  addEventListener(type: "keydown", listener: (e: ModalityKeyEvent) => void, capture: boolean): void;
}

export const FOCUS_MODALITY_ATTRIBUTE = "data-focus-modality";

const TEXT_INPUT_TYPES = new Set([
  "",
  "text",
  "search",
  "url",
  "tel",
  "email",
  "password",
  "number",
  "date",
  "datetime-local",
  "month",
  "time",
  "week",
]);

const installed = new WeakSet<ModalityDocument>();

/** True for elements that take typed text, where keystrokes are input, not navigation. */
function isTextEditable(target: unknown): boolean {
  if (!target || typeof (target as ModalityTarget).tagName !== "string") return false;
  const el = target as ModalityTarget;
  if (el.isContentEditable || el.tagName === "TEXTAREA") return true;
  return el.tagName === "INPUT" && TEXT_INPUT_TYPES.has(el.type ?? "");
}

/**
 * Start tracking. Idempotent per document and a no-op outside a browser, so any
 * number of components can call it from their mount hook.
 */
export function trackFocusModality(
  doc: ModalityDocument | undefined = (globalThis as { document?: ModalityDocument }).document,
): void {
  if (!doc || installed.has(doc)) return;
  installed.add(doc);
  const root = doc.documentElement;
  const set = (modality: FocusModality) => {
    if (root.getAttribute(FOCUS_MODALITY_ATTRIBUTE) !== modality) {
      root.setAttribute(FOCUS_MODALITY_ATTRIBUTE, modality);
    }
  };

  doc.addEventListener("pointerdown", () => set("pointer"), true);
  doc.addEventListener(
    "keydown",
    (e) => {
      // Typing into the field you just clicked is still a pointer session: only
      // Tab, or keys pressed outside a text field, mean keyboard navigation.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Tab" || !isTextEditable(e.target)) set("keyboard");
    },
    true,
  );
}
