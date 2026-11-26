/**
 * A locale-aware "does this text contain that query", for filtering a list as
 * someone types. The comparison is a `search`-usage `Intl.Collator` at base
 * sensitivity, so "cafe" finds "Café" and "APPLE" finds "Apple" in every
 * locale, which `toLowerCase().includes()` does in none of them. It is zag's
 * `useFilter().contains`, which Ark's Combobox uses, so a CommandMenu and a
 * Combobox in any library narrow a list the same way.
 *
 * Build it once and reuse it: constructing the collator is the expensive part.
 */
export function createContains(locale?: string): (text: string, query: string) => boolean {
  const collator = new Intl.Collator(locale, { usage: "search", sensitivity: "base" });
  return (text, query) => {
    const needle = query.normalize("NFC");
    if (!needle.length) return true;
    const haystack = text.normalize("NFC");
    for (let start = 0; start + needle.length <= haystack.length; start++) {
      if (collator.compare(needle, haystack.slice(start, start + needle.length)) === 0) return true;
    }
    return false;
  };
}
