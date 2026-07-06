/**
 * Minimal plugin UI (plain DOM): paste a project document, build a plan, apply.
 * A richer UI (design-system components, GitHub load, per-token diff + confidence)
 * is a follow-up; this exercises the push end to end.
 */

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

const docInput = el<HTMLTextAreaElement>("doc");
const out = el<HTMLPreElement>("out");
const applyBtn = el<HTMLButtonElement>("apply");
let lastDoc: unknown = null;

function readDoc(): unknown | null {
  try {
    return JSON.parse(docInput.value);
  } catch {
    out.textContent = "Invalid JSON.";
    return null;
  }
}

el<HTMLButtonElement>("plan").onclick = () => {
  const doc = readDoc();
  if (!doc) return;
  lastDoc = doc;
  out.textContent = "Building plan…";
  parent.postMessage({ pluginMessage: { type: "plan", doc } }, "*");
};

applyBtn.onclick = () => {
  if (!lastDoc) return;
  out.textContent = "Applying…";
  parent.postMessage({ pluginMessage: { type: "apply", doc: lastDoc } }, "*");
};

window.addEventListener("message", (event: MessageEvent) => {
  const msg = (event.data as { pluginMessage?: Record<string, unknown> }).pluginMessage;
  if (!msg) return;
  if (msg.type === "plan-result") {
    out.textContent = JSON.stringify(msg.summary, null, 2);
    applyBtn.disabled = false;
  } else if (msg.type === "applied") {
    out.textContent = "Applied:\n" + JSON.stringify(msg.summary, null, 2);
  } else if (msg.type === "error") {
    out.textContent = "Error: " + String(msg.message);
  }
});
