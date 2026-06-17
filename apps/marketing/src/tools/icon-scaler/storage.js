export const STORAGE_KEY = "ui-organized:icon-scaler";

export function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
  catch { return {}; }
}
