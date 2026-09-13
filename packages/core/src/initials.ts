/**
 * Up-to-two-letter initials from a full name: first letter of the first word,
 * first letter of the last. Used by Avatar's fallback.
 */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]![0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]![0] : "";
  return (first + last).toUpperCase();
}
